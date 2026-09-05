import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from src.core.types import UrgencyLevel, DisruptionCategory, CustomerTier
from src.db.repository import DataRepository
from src.models.disruption import (
    ExtractedEntities, GroundingResult, DisruptionImpactAssessment, OrderImpactDetail
)

class ImpactAnalyzer:
    """Pure deterministic mathematical supply chain simulation engine.
    
    Computes inventory stockouts, downstream order slips, SLA penalties,
    and multi-factor urgency rankings strictly from database state.
    """

    def __init__(self, repository: DataRepository):
        self.repo = repository

    def analyze(
        self,
        notice_text: str,
        extracted: ExtractedEntities,
        grounding: GroundingResult
    ) -> DisruptionImpactAssessment:
        assessment_id = f"ASM-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.now().isoformat()
        citations: List[str] = []

        # 1. Edge Case: False Alarm / Zero Active Impact
        if not grounding.has_active_matches:
            citations.append("Data Check: Verified zero active purchase orders, shipments, or stock allocations linked to mentioned entities.")
            assessment = DisruptionImpactAssessment(
                assessment_id=assessment_id,
                timestamp=timestamp,
                notice_text=notice_text,
                category=DisruptionCategory.TRAFFIC_ADVISORY if "traffic" in extracted.incident_type else DisruptionCategory.UNKNOWN,
                has_system_impact=False,
                summary_headline="Verified No Operational Impact (False Alarm / Inactive Entity)",
                executive_briefing=(
                    "Disruption notice evaluated against active inventory, pending purchase orders, and scheduled shipments. "
                    "Although entities or routes were mentioned, our system has NO active dependencies, orders, or stock commitments "
                    "relying on them. No customer orders will slip and no operator intervention is required."
                ),
                grounding=grounding,
                affected_orders=[],
                total_orders_impacted=0,
                total_revenue_at_risk=0.0,
                total_sla_penalty_risk=0.0,
                disrupted_shipments=[],
                disrupted_inventory=[],
                citations=citations
            )
            self.repo.record_assessment(assessment.model_dump())
            return assessment

        # 2. Edge Case: Ambiguous Entity Disruption
        if grounding.is_ambiguous:
            citations.append("Ambiguity Flag: Multiple active suppliers match the regional description.")
            for match in grounding.matches:
                if match.is_ambiguous:
                    for cand in match.candidate_matches:
                        citations.append(f"Candidate: {cand['name']} ({cand['supplier_id']}), Active Shipments: {cand['pending_shipments']}")
            
            assessment = DisruptionImpactAssessment(
                assessment_id=assessment_id,
                timestamp=timestamp,
                notice_text=notice_text,
                category=DisruptionCategory.WEATHER_FORCE_MAJEURE,
                has_system_impact=True,
                summary_headline="Action Required: Disruption Ambiguity Detected Across Regional Suppliers",
                executive_briefing=(
                    f"Notice mentions '{extracted.raw_summary}'. Multiple active supply chain partners operate in this region. "
                    "The system requires operator confirmation to disambiguate which supplier or shipment is affected before executing reallocation."
                ),
                grounding=grounding,
                affected_orders=[],
                total_orders_impacted=0,
                total_revenue_at_risk=0.0,
                total_sla_penalty_risk=0.0,
                disrupted_shipments=[],
                disrupted_inventory=[],
                citations=citations
            )
            self.repo.record_assessment(assessment.model_dump())
            return assessment

        # 3. Active Impact Simulation
        disrupted_shipments_data = []
        disrupted_inventory_data = []
        impacted_orders: List[OrderImpactDetail] = []
        
        delay_days = extracted.delay_days or 7
        target_sku_id = grounding.resolved_sku_id

        # Determine revised dates and disrupted inbound shipments
        revised_eta_str = None
        if grounding.resolved_shipment_id:
            shipment = self.repo.get_inbound_shipment(grounding.resolved_shipment_id)
            if shipment:
                orig_eta = datetime.strptime(shipment.scheduled_arrival_date, "%Y-%m-%d")
                revised_eta = orig_eta + timedelta(days=delay_days)
                revised_eta_str = revised_eta.strftime("%Y-%m-%d")
                shipment.revised_arrival_date = revised_eta_str
                
                disrupted_shipments_data.append({
                    "shipment_id": shipment.shipment_id,
                    "po_number": shipment.po_number,
                    "supplier_id": shipment.supplier_id,
                    "carrier": shipment.carrier_name,
                    "scheduled_arrival_date": shipment.scheduled_arrival_date,
                    "revised_arrival_date": revised_eta_str,
                    "delay_days": delay_days,
                    "items": [item.model_dump() for item in shipment.items]
                })
                citations.append(
                    f"Shipment [{shipment.shipment_id}]: Original ETA {shipment.scheduled_arrival_date} -> Revised ETA {revised_eta_str} (+{delay_days} days delay)."
                )

        # Determine physical stock loss if warehouse incident
        is_warehouse_incident = (extracted.incident_type == "warehouse_damage")
        qty_scrapped = extracted.quantity_affected or 0
        if is_warehouse_incident and target_sku_id:
            inv = self.repo.get_inventory_item("WH-MAIN", target_sku_id)
            if inv:
                previous_on_hand = inv.on_hand
                inv.on_hand = max(0, inv.on_hand - qty_scrapped)
                inv.available = max(0, inv.on_hand - inv.allocated - inv.reserved_safety)
                disrupted_inventory_data.append({
                    "warehouse_id": inv.warehouse_id,
                    "sku_id": inv.sku_id,
                    "previous_on_hand": previous_on_hand,
                    "new_on_hand": inv.on_hand,
                    "scrapped_units": qty_scrapped
                })
                citations.append(
                    f"Warehouse Inventory [{inv.warehouse_id} / {inv.sku_id}]: Destroyed {qty_scrapped} units. On-hand dropped from {previous_on_hand} to {inv.on_hand}."
                )

        # Check affected SKUs & customer orders
        sku = self.repo.get_sku(target_sku_id) if target_sku_id else None
        sku_name = sku.name if sku else "Specified Component"
        unit_price = sku.unit_price if sku else 200.0

        all_orders = self.repo.get_all_customer_orders()
        for order in all_orders:
            # Check if order demands the disrupted SKU
            order_line = next((item for item in order.items if item.sku_id == target_sku_id), None)
            if not order_line:
                continue

            promise_date = datetime.strptime(order.promise_date, "%Y-%m-%d")
            
            # Scenario A: Warehouse Stock Loss
            if is_warehouse_incident:
                # If total demand across orders exceeds newly reduced on-hand stock
                deficit = max(0, order_line.quantity_demanded - order_line.quantity_allocated)
                if order.status != "allocated" or order_line.quantity_demanded > (inv.on_hand if inv else 0):
                    # Order is delayed until next supplier replenishment cycle
                    lead_time = sku.lead_time_days if sku else 14
                    sys_date = datetime.strptime(self.repo.system_current_date, "%Y-%m-%d")
                    projected_new_delivery = sys_date + timedelta(days=lead_time)
                    projected_new_delivery_str = projected_new_delivery.strftime("%Y-%m-%d")
                    slip_days = max(0, (projected_new_delivery - promise_date).days)
                    
                    sla_risk = slip_days * order.sla_penalty_per_day
                    urgency_score = self._calc_urgency(order.customer_tier, slip_days, sla_risk, order_line.quantity_demanded * unit_price)
                    urgency_level = self._classify_urgency(urgency_score, order.customer_tier, slip_days)

                    impacted_orders.append(OrderImpactDetail(
                        order_id=order.order_id,
                        customer_name=order.customer_name,
                        customer_tier=order.customer_tier,
                        priority=order.priority,
                        promise_date=order.promise_date,
                        sku_id=target_sku_id,
                        sku_name=sku_name,
                        quantity_demanded=order_line.quantity_demanded,
                        quantity_allocated_before=order_line.quantity_allocated,
                        deficit_quantity=order_line.quantity_demanded,
                        projected_slip_days=slip_days,
                        projected_new_delivery_date=projected_new_delivery_str,
                        sla_daily_penalty=order.sla_penalty_per_day,
                        total_sla_risk=sla_risk,
                        urgency_level=urgency_level,
                        urgency_score=urgency_score,
                        ranking=1,
                        data_citations=[
                            f"Order [{order.order_id}] for {order.customer_name} ({order.customer_tier.value}): Promised {order.promise_date}.",
                            f"Demands {order_line.quantity_demanded} units of {target_sku_id}. Physical stock scrapped in WH-MAIN incident.",
                            f"Emergency replenishment lead time: {lead_time} days -> Projected delivery {projected_new_delivery_str} (+{slip_days} days late).",
                            f"Contractual SLA risk: {slip_days} days * ${order.sla_penalty_per_day}/day = ${sla_risk:,.2f}."
                        ]
                    ))

            # Scenario B: Inbound Shipment Delay
            elif revised_eta_str:
                # Add 1 business day for warehouse intake & staging
                available_for_shipping_date = datetime.strptime(revised_eta_str, "%Y-%m-%d") + timedelta(days=1)
                
                # If promise date is before the shipment arrives and clears intake
                if promise_date < available_for_shipping_date:
                    slip_days = (available_for_shipping_date - promise_date).days
                    deficit = max(0, order_line.quantity_demanded - order_line.quantity_allocated)
                    sla_risk = slip_days * order.sla_penalty_per_day
                    urgency_score = self._calc_urgency(order.customer_tier, slip_days, sla_risk, order_line.quantity_demanded * unit_price)
                    urgency_level = self._classify_urgency(urgency_score, order.customer_tier, slip_days)

                    impacted_orders.append(OrderImpactDetail(
                        order_id=order.order_id,
                        customer_name=order.customer_name,
                        customer_tier=order.customer_tier,
                        priority=order.priority,
                        promise_date=order.promise_date,
                        sku_id=target_sku_id,
                        sku_name=sku_name,
                        quantity_demanded=order_line.quantity_demanded,
                        quantity_allocated_before=order_line.quantity_allocated,
                        deficit_quantity=deficit,
                        projected_slip_days=slip_days,
                        projected_new_delivery_date=available_for_shipping_date.strftime("%Y-%m-%d"),
                        sla_daily_penalty=order.sla_penalty_per_day,
                        total_sla_risk=sla_risk,
                        urgency_level=urgency_level,
                        urgency_score=urgency_score,
                        ranking=1,
                        data_citations=[
                            f"Order [{order.order_id}] for {order.customer_name} ({order.customer_tier.value}): Promised {order.promise_date}.",
                            f"Requires {order_line.quantity_demanded} units of {target_sku_id}. On-hand stock covers {order_line.quantity_allocated}; deficit is {deficit} units.",
                            f"Awaiting Inbound Shipment [{grounding.resolved_shipment_id}]: Delayed to {revised_eta_str} (+1d intake = {available_for_shipping_date.strftime('%Y-%m-%d')}).",
                            f"Projected delay: {slip_days} calendar days past promise date.",
                            f"SLA penalty exposure: {slip_days} days * ${order.sla_penalty_per_day}/day = ${sla_risk:,.2f}."
                        ]
                    ))

        # Rank impacted orders strictly by urgency score descending
        impacted_orders.sort(key=lambda o: o.urgency_score, reverse=True)
        for rank_idx, order_item in enumerate(impacted_orders, start=1):
            order_item.ranking = rank_idx

        total_rev_at_risk = sum(o.quantity_demanded * unit_price for o in impacted_orders)
        total_sla_risk = sum(o.total_sla_risk for o in impacted_orders)

        # Categorize
        cat = DisruptionCategory.SUPPLIER_HALT
        if "carrier" in extracted.incident_type or "port" in extracted.incident_type:
            cat = DisruptionCategory.PORT_CONGESTION if "port" in extracted.incident_type else DisruptionCategory.CARRIER_DELAY
        elif is_warehouse_incident:
            cat = DisruptionCategory.WAREHOUSE_INCIDENT

        summary_headline = (
            f"{len(impacted_orders)} Customer Orders Impacted ({impacted_orders[0].customer_tier.value} / {impacted_orders[0].urgency_level.value} Urgency)"
            if impacted_orders else "No Customer Order Shortages Detected"
        )

        executive_briefing = (
            f"Notice evaluated against database state. Disruption maps to SKU [{target_sku_id or 'N/A'}] "
            f"affecting {len(impacted_orders)} committed customer orders. "
            f"Total contractual SLA penalty exposure is ${total_sla_risk:,.2f} with ${total_rev_at_risk:,.2f} in gross merchandise revenue at risk. "
            f"Highest priority impacted customer is {impacted_orders[0].customer_name} ({impacted_orders[0].customer_tier.value}) with projected slip of {impacted_orders[0].projected_slip_days} days."
            if impacted_orders else "Disruption does not create order slips."
        )

        assessment = DisruptionImpactAssessment(
            assessment_id=assessment_id,
            timestamp=timestamp,
            notice_text=notice_text,
            category=cat,
            has_system_impact=len(impacted_orders) > 0,
            summary_headline=summary_headline,
            executive_briefing=executive_briefing,
            grounding=grounding,
            affected_orders=impacted_orders,
            total_orders_impacted=len(impacted_orders),
            total_revenue_at_risk=total_rev_at_risk,
            total_sla_penalty_risk=total_sla_risk,
            disrupted_shipments=disrupted_shipments_data,
            disrupted_inventory=disrupted_inventory_data,
            citations=citations
        )
        self.repo.record_assessment(assessment.model_dump())
        return assessment

    def _calc_urgency(self, tier: CustomerTier, slip_days: int, sla_risk: float, order_value: float) -> float:
        tier_weights = {
            CustomerTier.PLATINUM: 50.0,
            CustomerTier.GOLD: 32.0,
            CustomerTier.STANDARD: 15.0
        }
        base_tier = tier_weights.get(tier, 15.0)
        slip_weight = min(slip_days * 3.5, 35.0)
        sla_weight = min(sla_risk / 200.0, 15.0)
        val_weight = min(order_value / 5000.0, 10.0)
        return round(base_tier + slip_weight + sla_weight + val_weight, 2)

    def _classify_urgency(self, score: float, tier: CustomerTier, slip_days: int) -> UrgencyLevel:
        if tier == CustomerTier.PLATINUM and slip_days >= 3:
            return UrgencyLevel.CRITICAL
        if score >= 70.0:
            return UrgencyLevel.CRITICAL
        if score >= 48.0:
            return UrgencyLevel.HIGH
        if score >= 25.0:
            return UrgencyLevel.MEDIUM
        return UrgencyLevel.LOW
