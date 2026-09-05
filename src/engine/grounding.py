from typing import List, Optional, Dict, Any, Tuple
from src.core.types import MatchConfidence
from src.db.repository import DataRepository
from src.models.disruption import ExtractedEntities, GroundedEntityMatch, GroundingResult, StructuredDisruptionRequest

class GroundingEngine:
    """Grounds structured disruption requests and raw notice mentions against the distributor's operational database."""

    def __init__(self, repository: DataRepository):
        self.repo = repository

    def validate_and_ground_structured(self, request: StructuredDisruptionRequest) -> Tuple[ExtractedEntities, GroundingResult]:
        """Validates structured form inputs against active supply chain data and builds grounded entity relations."""
        if request.delay_days is None or request.delay_days <= 0:
            raise ValueError("Expected delay days must be greater than 0.")

        matches: List[GroundedEntityMatch] = []
        supplier = None
        shipment = None
        sku = None
        po_number = request.po_number

        # 1. Validate Supplier if provided
        if request.supplier_id:
            supplier = self.repo.get_supplier(request.supplier_id)
            if not supplier:
                raise ValueError(f"Supplier ID '{request.supplier_id}' does not exist in the database.")

        # 2. Validate Purchase Order if provided
        if po_number:
            po_shipment = self.repo.get_shipment_by_po(po_number)
            if not po_shipment:
                raise ValueError(f"Purchase Order '{po_number}' does not exist or has no linked shipment.")
            if supplier and po_shipment.supplier_id != supplier.supplier_id:
                raise ValueError(
                    f"Purchase Order '{po_number}' belongs to supplier '{po_shipment.supplier_id}', "
                    f"not selected supplier '{supplier.supplier_id}' ({supplier.name})."
                )
            if not request.shipment_id:
                shipment = po_shipment

        # 3. Validate Shipment if provided
        if request.shipment_id:
            shipment = self.repo.get_inbound_shipment(request.shipment_id)
            if not shipment:
                raise ValueError(f"Inbound Shipment ID '{request.shipment_id}' does not exist in the database.")
            
            # Cross-validate shipment with supplier
            if supplier and shipment.supplier_id != supplier.supplier_id:
                raise ValueError(
                    f"Inbound Shipment '{request.shipment_id}' belongs to Supplier '{shipment.supplier_id}', "
                    f"not selected Supplier '{supplier.supplier_id}' ({supplier.name})."
                )
            if not supplier:
                supplier = self.repo.get_supplier(shipment.supplier_id)

            # Cross-validate shipment with PO
            if po_number and shipment.po_number.upper() != po_number.upper():
                raise ValueError(
                    f"Inbound Shipment '{request.shipment_id}' is linked to PO '{shipment.po_number}', "
                    f"not selected PO '{po_number}'."
                )
            if not po_number:
                po_number = shipment.po_number

        # 4. Validate SKU
        if request.sku_id:
            sku = self.repo.get_sku(request.sku_id)
            if not sku:
                raise ValueError(f"Product SKU ID '{request.sku_id}' does not exist in the catalog.")
            
            # Cross-validate SKU with Shipment line items if shipment is present
            if shipment and not any(item.sku_id == sku.sku_id for item in shipment.items):
                valid_skus = ", ".join(item.sku_id for item in shipment.items)
                raise ValueError(
                    f"SKU '{request.sku_id}' is not part of Shipment '{shipment.shipment_id}'. "
                    f"Valid SKUs for this shipment: [{valid_skus}]."
                )
        elif shipment and shipment.items:
            # Auto-infer SKU from shipment if not explicitly chosen
            sku = self.repo.get_sku(shipment.items[0].sku_id)
        elif supplier and not shipment:
            # Check if supplier has pending shipments with SKUs
            pending_ships = [
                sh for sh in self.repo.get_all_inbound_shipments() if sh.supplier_id == supplier.supplier_id
            ]
            if pending_ships and pending_ships[0].items:
                shipment = pending_ships[0]
                sku = self.repo.get_sku(shipment.items[0].sku_id)
                if not po_number:
                    po_number = shipment.po_number

        # If SKU was chosen without shipment/supplier, auto-resolve preferred supplier & active shipment
        if sku and not shipment and not supplier:
            if sku.preferred_supplier_id:
                supplier = self.repo.get_supplier(sku.preferred_supplier_id)
            for sh in self.repo.get_all_inbound_shipments():
                if any(it.sku_id == sku.sku_id for it in sh.items):
                    shipment = sh
                    if not supplier:
                        supplier = self.repo.get_supplier(sh.supplier_id)
                    if not po_number:
                        po_number = sh.po_number
                    break

        # 5. Type-specific validations
        is_warehouse_incident = (
            request.disruption_type == "Warehouse Incident" or 
            (request.quantity_affected is not None and request.quantity_affected > 0 and not shipment)
        )

        if is_warehouse_incident:
            if not sku:
                raise ValueError("A valid SKU must be selected for Warehouse Incidents.")
            if request.quantity_affected is not None and request.quantity_affected <= 0:
                raise ValueError("Quantity affected for warehouse damage must be greater than 0.")
        else:
            if not supplier and not shipment and not sku:
                raise ValueError("Please select at least a Supplier, Shipment, or SKU.")

        # 6. Build Grounded Matches
        resolved_supplier_id = supplier.supplier_id if supplier else (shipment.supplier_id if shipment else None)
        resolved_shipment_id = shipment.shipment_id if shipment else None
        resolved_sku_id = sku.sku_id if sku else None
        resolved_warehouse_id = request.affected_location or (shipment.destination_warehouse if shipment else "WH-MAIN")

        if supplier:
            pending_shipments = [
                sh for sh in self.repo.get_all_inbound_shipments() if sh.supplier_id == supplier.supplier_id
            ]
            has_active = len(pending_shipments) > 0
            evidence = (
                f"Structured Match: Supplier '{supplier.name}' ({supplier.supplier_id}). "
                f"Active scheduled shipments: {len(pending_shipments)}."
            )
            if not has_active:
                evidence += " NOTE: No pending purchase orders or scheduled inbound shipments exist for this supplier."
            matches.append(GroundedEntityMatch(
                entity_type="supplier",
                raw_mention=supplier.name,
                matched_id=supplier.supplier_id,
                matched_name=supplier.name,
                confidence=MatchConfidence.EXACT,
                confidence_score=1.0,
                evidence=evidence
            ))

        if po_number:
            matches.append(GroundedEntityMatch(
                entity_type="po",
                raw_mention=po_number,
                matched_id=po_number,
                matched_name=f"Purchase Order {po_number}",
                confidence=MatchConfidence.EXACT,
                confidence_score=1.0,
                evidence=f"Structured Match: Verified active Purchase Order {po_number}."
            ))

        if shipment:
            matches.append(GroundedEntityMatch(
                entity_type="shipment",
                raw_mention=shipment.shipment_id,
                matched_id=shipment.shipment_id,
                matched_name=f"Inbound Shipment {shipment.shipment_id}",
                confidence=MatchConfidence.EXACT,
                confidence_score=1.0,
                evidence=f"Structured Match: Shipment {shipment.shipment_id} (Carrier: {shipment.carrier_name}, Tracking: {shipment.tracking_number}, ETA: {shipment.scheduled_arrival_date})."
            ))

        if sku:
            matches.append(GroundedEntityMatch(
                entity_type="sku",
                raw_mention=sku.sku_id,
                matched_id=sku.sku_id,
                matched_name=sku.name,
                confidence=MatchConfidence.EXACT,
                confidence_score=1.0,
                evidence=f"Structured Match: Product catalog SKU {sku.sku_id} ({sku.name}, Category: {sku.category})."
            ))

        if request.affected_location:
            matches.append(GroundedEntityMatch(
                entity_type="warehouse",
                raw_mention=request.affected_location,
                matched_id=request.affected_location,
                matched_name=request.affected_location,
                confidence=MatchConfidence.EXACT,
                confidence_score=1.0,
                evidence=f"Structured Match: Facility location confirmed ({request.affected_location})."
            ))

        # Check for active operational impact
        active_shipments = []
        if resolved_shipment_id:
            active_shipments.append(self.repo.get_inbound_shipment(resolved_shipment_id))
        elif resolved_supplier_id:
            active_shipments.extend([
                sh for sh in self.repo.get_all_inbound_shipments() if sh.supplier_id == resolved_supplier_id
            ])

        if active_shipments or (is_warehouse_incident and resolved_sku_id):
            has_active_matches = True
        else:
            has_active_matches = False

        if not has_active_matches:
            reasoning = (
                f"Selected entities verified, but NO active pending purchase orders, scheduled shipments, "
                f"or compromised stock allocations exist in the system for supplier '{resolved_supplier_id or 'N/A'}'. "
                f"Discipline to refuse confirmed: System reports VERIFIED NO IMPACT."
            )
        else:
            reasoning = (
                f"Structured input validated against database state: "
                f"Supplier: {resolved_supplier_id or 'N/A'}, PO: {po_number or 'N/A'}, "
                f"Shipment: {resolved_shipment_id or 'N/A'}, SKU: {resolved_sku_id or 'N/A'}, "
                f"Delay: {request.delay_days} days."
            )

        grounding_res = GroundingResult(
            has_active_matches=has_active_matches,
            is_ambiguous=False,
            ambiguity_reason=None,
            resolved_supplier_id=resolved_supplier_id,
            resolved_shipment_id=resolved_shipment_id,
            resolved_sku_id=resolved_sku_id,
            resolved_warehouse_id=resolved_warehouse_id,
            matches=matches,
            reasoning=reasoning,
            unmatched_mentions=[]
        )

        # 7. Map to incident type for ImpactAnalyzer
        if request.disruption_type == "Supplier Production Halt":
            incident_type = "production_halt"
        elif request.disruption_type == "Carrier/Shipment Delay":
            incident_type = "carrier_delay"
        elif request.disruption_type == "Warehouse Incident" or is_warehouse_incident:
            incident_type = "warehouse_damage"
        else:
            incident_type = "general_delay"

        raw_summary = request.reason.strip() if request.reason and request.reason.strip() else (
            f"{request.disruption_type}: {request.delay_days}-day delay affecting {resolved_supplier_id or resolved_sku_id or 'inbound logistics'}"
        )

        extracted = ExtractedEntities(
            mentioned_suppliers=[supplier.name] if supplier else [],
            mentioned_carriers=[shipment.carrier_name] if shipment else [],
            mentioned_skus=[sku.sku_id] if sku else [],
            mentioned_pos=[po_number] if po_number else [],
            mentioned_shipments=[shipment.shipment_id] if shipment else [],
            mentioned_warehouses=[resolved_warehouse_id],
            delay_days=request.delay_days,
            new_date=None,
            quantity_affected=request.quantity_affected if is_warehouse_incident else None,
            incident_type=incident_type,
            severity_stated=request.severity.lower(),
            raw_summary=raw_summary
        )

        return extracted, grounding_res

    def ground(self, extracted: ExtractedEntities) -> GroundingResult:
        matches: List[GroundedEntityMatch] = []
        unmatched: List[str] = []

        resolved_supplier_id = None
        resolved_shipment_id = None
        resolved_sku_id = None
        resolved_warehouse_id = None

        is_ambiguous = False
        ambiguity_reason = None
        has_active_matches = False

        # 1. Match Purchase Orders
        for po_mention in extracted.mentioned_pos:
            shipment = self.repo.get_shipment_by_po(po_mention)
            if shipment:
                resolved_shipment_id = shipment.shipment_id
                resolved_supplier_id = shipment.supplier_id
                matches.append(GroundedEntityMatch(
                    entity_type="po",
                    raw_mention=po_mention,
                    matched_id=shipment.po_number,
                    matched_name=f"Inbound PO {shipment.po_number} (Shipment {shipment.shipment_id})",
                    confidence=MatchConfidence.EXACT,
                    confidence_score=1.0,
                    evidence=f"Exact match to active purchase order {shipment.po_number} linked to shipment {shipment.shipment_id}."
                ))
            else:
                unmatched.append(po_mention)

        # 2. Match Shipments / Containers
        for ship_mention in extracted.mentioned_shipments:
            matched_ship = None
            for ship in self.repo.get_all_inbound_shipments():
                if ship.shipment_id.lower() == ship_mention.lower() or ship.tracking_number.lower() == ship_mention.lower():
                    matched_ship = ship
                    break
            
            if matched_ship:
                resolved_shipment_id = matched_ship.shipment_id
                resolved_supplier_id = matched_ship.supplier_id
                matches.append(GroundedEntityMatch(
                    entity_type="shipment",
                    raw_mention=ship_mention,
                    matched_id=matched_ship.shipment_id,
                    matched_name=f"Inbound Shipment {matched_ship.shipment_id}",
                    confidence=MatchConfidence.EXACT,
                    confidence_score=1.0,
                    evidence=f"Matched shipment {matched_ship.shipment_id} (Tracking: {matched_ship.tracking_number}, ETA: {matched_ship.scheduled_arrival_date})."
                ))
            else:
                unmatched.append(ship_mention)

        # 3. Match Suppliers & check for Ambiguity
        candidate_suppliers = []
        for sup_mention in extracted.mentioned_suppliers:
            sup_mention_lower = sup_mention.lower()
            
            # Special case: regional generic Taiwan notice
            if "taiwan" in sup_mention_lower and not any(s in sup_mention_lower for s in ["tsmc", "foxconn"]):
                taiwan_suppliers = [
                    s for s in self.repo.get_all_suppliers()
                    if "taiwan" in s.location.lower()
                ]
                if len(taiwan_suppliers) > 1:
                    is_ambiguous = True
                    ambiguity_reason = (
                        f"Disruption notice refers loosely to 'Taiwan suppliers', which matches {len(taiwan_suppliers)} active system suppliers: "
                        f"{', '.join(s.name for s in taiwan_suppliers)}. Operator verification required."
                    )
                    matches.append(GroundedEntityMatch(
                        entity_type="supplier",
                        raw_mention=sup_mention,
                        confidence=MatchConfidence.AMBIGUOUS,
                        confidence_score=0.5,
                        evidence=ambiguity_reason,
                        is_ambiguous=True,
                        candidate_matches=[
                            {
                                "supplier_id": s.supplier_id,
                                "name": s.name,
                                "location": s.location,
                                "pending_shipments": [
                                    sh.shipment_id for sh in self.repo.get_all_inbound_shipments() if sh.supplier_id == s.supplier_id
                                ]
                            }
                            for s in taiwan_suppliers
                        ]
                    ))
                    continue

            # Standard supplier matching by name or aliases
            found_supplier = None
            for s in self.repo.get_all_suppliers():
                if s.name.lower() == sup_mention_lower or any(alias.lower() in sup_mention_lower or sup_mention_lower in alias.lower() for alias in s.aliases):
                    found_supplier = s
                    break
            
            if found_supplier:
                resolved_supplier_id = resolved_supplier_id or found_supplier.supplier_id
                # Check if supplier has any pending shipments or orders
                pending_shipments = [
                    sh for sh in self.repo.get_all_inbound_shipments() if sh.supplier_id == found_supplier.supplier_id
                ]
                has_active = len(pending_shipments) > 0
                
                evidence = (
                    f"Matched supplier '{found_supplier.name}' ({found_supplier.supplier_id}). "
                    f"Active pending shipments: {len(pending_shipments)}."
                )
                if not has_active:
                    evidence += " NOTE: No pending purchase orders or scheduled inbound shipments exist for this supplier."

                matches.append(GroundedEntityMatch(
                    entity_type="supplier",
                    raw_mention=sup_mention,
                    matched_id=found_supplier.supplier_id,
                    matched_name=found_supplier.name,
                    confidence=MatchConfidence.HIGH,
                    confidence_score=0.95,
                    evidence=evidence
                ))
            else:
                unmatched.append(sup_mention)

        # 4. Match SKUs / Products
        for sku_mention in extracted.mentioned_skus:
            sku_mention_lower = sku_mention.lower()
            found_sku = None
            for sku in self.repo.get_all_skus():
                if sku.sku_id.lower() in sku_mention_lower or any(alias.lower() in sku_mention_lower for alias in sku.aliases):
                    found_sku = sku
                    break
            
            if found_sku:
                resolved_sku_id = resolved_sku_id or found_sku.sku_id
                matches.append(GroundedEntityMatch(
                    entity_type="sku",
                    raw_mention=sku_mention,
                    matched_id=found_sku.sku_id,
                    matched_name=found_sku.name,
                    confidence=MatchConfidence.HIGH,
                    confidence_score=0.95,
                    evidence=f"Matched product catalog SKU {found_sku.sku_id} ({found_sku.name}, Category: {found_sku.category})."
                ))
            else:
                unmatched.append(sku_mention)

        # 5. Match Warehouses
        for wh_mention in extracted.mentioned_warehouses:
            wh_mention_lower = wh_mention.lower()
            if "wh-main" in wh_mention_lower or "chicago" in wh_mention_lower:
                resolved_warehouse_id = "WH-MAIN"
                matches.append(GroundedEntityMatch(
                    entity_type="warehouse",
                    raw_mention=wh_mention,
                    matched_id="WH-MAIN",
                    matched_name="Central Logistics Hub - Chicago",
                    confidence=MatchConfidence.EXACT,
                    confidence_score=1.0,
                    evidence="Matched primary distribution center WH-MAIN (Chicago Hub)."
                ))
            else:
                unmatched.append(wh_mention)

        # Cross-reference resolved supplier with active shipment and SKU if not explicitly given
        if resolved_supplier_id and not resolved_shipment_id:
            supplier_shipments = [
                sh for sh in self.repo.get_all_inbound_shipments() if sh.supplier_id == resolved_supplier_id
            ]
            if supplier_shipments:
                resolved_shipment_id = supplier_shipments[0].shipment_id
                if not resolved_sku_id and supplier_shipments[0].items:
                    resolved_sku_id = supplier_shipments[0].items[0].sku_id

        # Cross-reference resolved shipment with SKU if needed
        if resolved_shipment_id and not resolved_sku_id:
            shipment = self.repo.get_inbound_shipment(resolved_shipment_id)
            if shipment and shipment.items:
                resolved_sku_id = shipment.items[0].sku_id

        # Determine if there are active system impacts
        active_shipments = []
        if resolved_shipment_id:
            active_shipments.append(self.repo.get_inbound_shipment(resolved_shipment_id))
        elif resolved_supplier_id:
            active_shipments.extend([
                sh for sh in self.repo.get_all_inbound_shipments() if sh.supplier_id == resolved_supplier_id
            ])

        if active_shipments or (extracted.incident_type == "warehouse_damage" and resolved_sku_id):
            has_active_matches = True
        else:
            has_active_matches = False

        # Build comprehensive grounding reasoning
        if is_ambiguous:
            reasoning = (
                f"Notice mapped to ambiguous regional entities ({ambiguity_reason}). "
                "System escalated to human operator for disambiguation."
            )
        elif not matches:
            reasoning = "Notice mentions no recognized suppliers, SKUs, shipments, or facilities in distributor database."
        elif not has_active_matches:
            reasoning = (
                f"Entities recognized ({', '.join(m.matched_name or m.raw_mention for m in matches)}), "
                f"but NO active pending purchase orders, scheduled shipments, or stock allocations exist in the system. "
                "Discipline to refuse confirmed: System reports VERIFIED NO IMPACT."
            )
        else:
            reasoning = (
                f"Successfully grounded disruption to active supply chain assets: "
                f"Supplier: {resolved_supplier_id or 'N/A'}, Shipment: {resolved_shipment_id or 'N/A'}, "
                f"SKU: {resolved_sku_id or 'N/A'}."
            )

        return GroundingResult(
            has_active_matches=has_active_matches,
            is_ambiguous=is_ambiguous,
            ambiguity_reason=ambiguity_reason,
            resolved_supplier_id=resolved_supplier_id,
            resolved_shipment_id=resolved_shipment_id,
            resolved_sku_id=resolved_sku_id,
            resolved_warehouse_id=resolved_warehouse_id or "WH-MAIN",
            matches=matches,
            reasoning=reasoning,
            unmatched_mentions=unmatched
        )
