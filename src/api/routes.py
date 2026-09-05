import json
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from src.core.config import TEST_NOTICES_PATH
from src.db.repository import DataRepository
from src.engine.extractor import NoticeExtractor
from src.engine.grounding import GroundingEngine
from src.engine.impact_analyzer import ImpactAnalyzer
from src.engine.recommender import ActionPlanRecommender
from src.engine.explainer import GroundedExplainer
from src.models.disruption import (
    DisruptionImpactAssessment, OperatorDecision, ResolutionOptionType,
    StructuredDisruptionRequest, ExtractedEntities, GroundingResult
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

# Dependency injection for repository and engines
def get_repo() -> DataRepository:
    return DataRepository()

def get_extractor() -> NoticeExtractor:
    return NoticeExtractor()

def get_grounding(repo: DataRepository = Depends(get_repo)) -> GroundingEngine:
    return GroundingEngine(repo)

def get_analyzer(repo: DataRepository = Depends(get_repo)) -> ImpactAnalyzer:
    return ImpactAnalyzer(repo)

def get_recommender(repo: DataRepository = Depends(get_repo)) -> ActionPlanRecommender:
    return ActionPlanRecommender(repo)

def get_explainer() -> GroundedExplainer:
    return GroundedExplainer()

class DisruptionAnalysisPayload(BaseModel):
    disruption_type: Optional[str] = Field(None, description="Disruption type dropdown selection")
    supplier_id: Optional[str] = Field(None, description="Supplier ID")
    po_number: Optional[str] = Field(None, description="PO Number")
    shipment_id: Optional[str] = Field(None, description="Inbound Shipment ID")
    sku_id: Optional[str] = Field(None, description="SKU ID")
    disruption_date: Optional[str] = Field(None, description="Disruption Date YYYY-MM-DD")
    delay_days: Optional[int] = Field(None, description="Expected Delay in days")
    affected_location: Optional[str] = Field(None, description="Affected facility or location")
    quantity_affected: Optional[int] = Field(None, description="Quantity of units damaged or halted")
    reason: Optional[str] = Field("", description="Contextual note / reason")
    severity: Optional[str] = Field("Medium", description="Severity: Low, Medium, High, Critical")
    notice_text: Optional[str] = Field(None, description="Optional raw text or summary")

class EmailDraftRequest(BaseModel):
    assessment_id: str
    order_id: str
    option_id: str

class SupplierEscalationRequest(BaseModel):
    assessment_id: str

@router.get("/reference-data")
def get_reference_data(repo: DataRepository = Depends(get_repo)):
    """Retrieve structured reference data for cascading form dropdowns."""
    suppliers = repo.get_all_suppliers()
    shipments = repo.get_all_inbound_shipments()
    skus = repo.get_all_skus()
    inventory = repo.get_all_inventory()

    # Build PO list
    po_list = []
    seen_pos = set()
    for sh in shipments:
        if sh.po_number and sh.po_number not in seen_pos:
            seen_pos.add(sh.po_number)
            po_list.append({
                "po_number": sh.po_number,
                "supplier_id": sh.supplier_id,
                "shipment_id": sh.shipment_id,
                "sku_ids": [it.sku_id for it in sh.items]
            })

    # Build Shipment details
    shipment_list = []
    for sh in shipments:
        shipment_list.append({
            "shipment_id": sh.shipment_id,
            "po_number": sh.po_number,
            "supplier_id": sh.supplier_id,
            "carrier_name": sh.carrier_name,
            "tracking_number": sh.tracking_number,
            "origin": sh.origin,
            "destination_warehouse": sh.destination_warehouse,
            "scheduled_arrival_date": sh.scheduled_arrival_date,
            "sku_ids": [it.sku_id for it in sh.items]
        })

    # Locations
    locations = [
        {"id": "WH-MAIN", "name": "Central Logistics Hub - Chicago (WH-MAIN)"},
        {"id": "Fremont, CA", "name": "Apex Fremont Facility (Fremont, CA)"},
        {"id": "Port of Long Beach", "name": "Port of Long Beach Marine Terminal (CA)"},
        {"id": "Kaohsiung Port, Taiwan", "name": "Kaohsiung Port (Taiwan)"},
        {"id": "Taipei, Taiwan", "name": "Foxconn Logistics Hub (Taipei, Taiwan)"},
        {"id": "Oslo, Norway", "name": "Nordic Power Distribution (Oslo, Norway)"},
        {"id": "Denver, CO", "name": "Acme Regional Freight Hub (Denver, CO)"}
    ]

    return {
        "system_current_date": repo.system_current_date,
        "disruption_types": [
            "Supplier Production Halt",
            "Carrier/Shipment Delay",
            "Warehouse Incident",
            "Other"
        ],
        "severities": [
            "Low",
            "Medium",
            "High",
            "Critical"
        ],
        "suppliers": [
            {
                "supplier_id": s.supplier_id,
                "name": s.name,
                "location": s.location,
                "reliability_score": s.reliability_score,
                "expedite_available": s.expedite_available
            }
            for s in suppliers
        ],
        "purchase_orders": po_list,
        "shipments": shipment_list,
        "skus": [
            {
                "sku_id": sku.sku_id,
                "name": sku.name,
                "category": sku.category,
                "unit_cost": sku.unit_cost,
                "unit_price": sku.unit_price,
                "preferred_supplier_id": sku.preferred_supplier_id
            }
            for sku in skus
        ],
        "locations": locations
    }

@router.post("/disruption/analyze", response_model=DisruptionImpactAssessment)
def analyze_disruption(
    payload: DisruptionAnalysisPayload,
    repo: DataRepository = Depends(get_repo),
    extractor: NoticeExtractor = Depends(get_extractor),
    grounding_engine: GroundingEngine = Depends(get_grounding),
    impact_analyzer: ImpactAnalyzer = Depends(get_analyzer),
    recommender: ActionPlanRecommender = Depends(get_recommender)
):
    """Deterministic disruption analysis pipeline.
    
    Validates structured input, resolves records against the supply chain database,
    and runs deterministic inventory simulation and action plan recommendation.
    """
    is_structured = bool(payload.disruption_type or payload.supplier_id or payload.shipment_id or payload.delay_days)

    try:
        if is_structured:
            # Structured validation and direct grounding
            if not payload.disruption_type:
                raise ValueError("Disruption Type is required.")
            if not payload.disruption_date:
                payload.disruption_date = repo.system_current_date
            if payload.delay_days is None or payload.delay_days <= 0:
                raise ValueError("Expected Delay (Days) must be greater than 0.")

            structured_req = StructuredDisruptionRequest(
                disruption_type=payload.disruption_type,
                supplier_id=payload.supplier_id,
                po_number=payload.po_number,
                shipment_id=payload.shipment_id,
                sku_id=payload.sku_id,
                disruption_date=payload.disruption_date,
                delay_days=payload.delay_days,
                affected_location=payload.affected_location,
                quantity_affected=payload.quantity_affected,
                reason=payload.reason or "",
                severity=payload.severity or "Medium",
                notice_text=payload.notice_text
            )

            # Step 1 & 2: Validate relationships & ground directly against DB
            extracted, grounding = grounding_engine.validate_and_ground_structured(structured_req)
            notice_summary = payload.notice_text or extracted.raw_summary

            # Step 3: Pure Deterministic Impact Propagation
            assessment = impact_analyzer.analyze(notice_summary, extracted, grounding)

            # Step 4: Multi-option Trade-off Recommendation Engine
            final_assessment = recommender.generate_options(assessment)
            return final_assessment

        else:
            # Legacy free-text parsing fallback
            if not payload.notice_text or not payload.notice_text.strip():
                raise HTTPException(status_code=400, detail="Notice text or structured fields cannot be empty.")

            extracted = extractor.extract(payload.notice_text)
            grounding = grounding_engine.ground(extracted)
            assessment = impact_analyzer.analyze(payload.notice_text, extracted, grounding)
            final_assessment = recommender.generate_options(assessment)
            return final_assessment

    except ValueError as ve:
        logger.warning(f"Validation error in disruption analysis: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error analyzing disruption notice")
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

@router.post("/disruption/apply-decision")
def apply_operator_decision(
    decision: OperatorDecision,
    repo: DataRepository = Depends(get_repo)
):
    """Human Operator commits a chosen resolution option to the system state."""
    try:
        result = repo.apply_operator_decision(decision.model_dump())
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.exception("Error applying operator decision")
        raise HTTPException(status_code=500, detail=f"Failed to commit decision: {str(e)}")

@router.post("/disruption/draft-email")
def draft_customer_email(
    payload: EmailDraftRequest,
    repo: DataRepository = Depends(get_repo),
    explainer: GroundedExplainer = Depends(get_explainer)
):
    """Generate a customer notification email draft based on grounded assessment and selected option."""
    assessment_dict = repo.get_assessment(payload.assessment_id)
    if not assessment_dict:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    assessment = DisruptionImpactAssessment(**assessment_dict)
    order_impact = next((o for o in assessment.affected_orders if o.order_id == payload.order_id), None)
    if not order_impact:
        raise HTTPException(status_code=404, detail="Impacted order not found in this assessment.")

    option = next((opt for opt in order_impact.options if opt.option_id == payload.option_id), None)
    if not option:
        raise HTTPException(status_code=404, detail="Option not found for this order.")

    draft = explainer.generate_customer_email(assessment, order_impact, option)
    return {
        "order_id": payload.order_id,
        "customer_name": order_impact.customer_name,
        "option_id": payload.option_id,
        "email_draft": draft
    }

@router.post("/disruption/draft-supplier-escalation")
def draft_supplier_escalation(
    payload: SupplierEscalationRequest,
    repo: DataRepository = Depends(get_repo),
    explainer: GroundedExplainer = Depends(get_explainer)
):
    """Generate a formal supplier escalation draft based on grounded impact assessment."""
    assessment_dict = repo.get_assessment(payload.assessment_id)
    if not assessment_dict:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    assessment = DisruptionImpactAssessment(**assessment_dict)
    draft = explainer.generate_supplier_escalation(assessment)
    return {
        "assessment_id": payload.assessment_id,
        "supplier_escalation_draft": draft
    }

@router.get("/scenarios")
def get_scenarios():
    """Retrieve preloaded benchmark disruption notices."""
    try:
        with open(TEST_NOTICES_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load scenarios: {str(e)}")

@router.get("/system/state")
def get_system_state(repo: DataRepository = Depends(get_repo)):
    """Retrieve current live inventory, inbound shipments, and customer orders."""
    return {
        "system_current_date": repo.system_current_date,
        "suppliers": [s.model_dump() for s in repo.get_all_suppliers()],
        "skus": [s.model_dump() for s in repo.get_all_skus()],
        "inventory": [inv.model_dump() for inv in repo.get_all_inventory()],
        "inbound_shipments": [ship.model_dump() for ship in repo.get_all_inbound_shipments()],
        "customer_orders": [ord.model_dump() for ord in repo.get_all_customer_orders()]
    }

@router.post("/system/reset")
def reset_system_state(repo: DataRepository = Depends(get_repo)):
    """Reset the repository to the pristine seed state."""
    repo.reset_to_seed()
    return {"status": "success", "message": "Supply chain database successfully reset to pristine seed data."}

@router.get("/system/audit")
def get_system_audit(repo: DataRepository = Depends(get_repo)):
    """Retrieve full audit log of system disruptions and human operator actions."""
    return {
        "audit_entries": repo.get_audit_log()
    }

@router.get("/profiles")
def get_profiles(repo: DataRepository = Depends(get_repo)):
    """Retrieve available persona profiles for login: Operator, Suppliers, Customers."""
    suppliers = repo.get_all_suppliers()
    orders = repo.get_all_customer_orders()
    shipments = repo.get_all_inbound_shipments()

    # Distinct customers grouped with their orders
    customers_map = {}
    for o in orders:
        if o.customer_name not in customers_map:
            customers_map[o.customer_name] = {
                "customer_name": o.customer_name,
                "customer_tier": o.customer_tier,
                "destination_city": o.destination_city,
                "orders": []
            }
        customers_map[o.customer_name]["orders"].append({
            "order_id": o.order_id,
            "promise_date": o.promise_date,
            "sla_penalty_per_day": o.sla_penalty_per_day,
            "status": o.status,
            "items": [it.model_dump() for it in o.items]
        })

    # Suppliers grouped with their active shipments
    supplier_list = []
    for s in suppliers:
        s_shipments = [sh.model_dump() for sh in shipments if sh.supplier_id == s.supplier_id]
        supplier_list.append({
            "supplier_id": s.supplier_id,
            "name": s.name,
            "location": s.location,
            "contact_email": s.contact_email,
            "reliability_score": s.reliability_score,
            "expedite_available": s.expedite_available,
            "active_shipments": s_shipments
        })

    return {
        "operator": {
            "id": "OPERATOR-01",
            "name": "Username",
            "title": "Operations Controller (Distributor Admin)",
            "facility": "Central Logistics Hub - Chicago (WH-MAIN)",
            "role": "admin"
        },
        "suppliers": supplier_list,
        "customers": list(customers_map.values())
    }

@router.get("/live/stream")
def get_live_stream(repo: DataRepository = Depends(get_repo)):
    """Retrieve simulated real-time telemetry events and live logistics stream."""
    from datetime import datetime, timezone
    
    audit_entries = repo.get_audit_log()
    
    # Baseline telemetry events
    telemetry = [
        {
            "id": "tel-1",
            "timestamp": "2026-09-05T08:50:12Z",
            "category": "TELEMETRY",
            "source": "AIS Marine Vessel Track",
            "message": "Vessel MSC VALERIA (Maersk Voyage 402W) speed 14.2 kts approaching Long Beach anchorage.",
            "icon": "🚢",
            "severity": "info"
        },
        {
            "id": "tel-2",
            "timestamp": "2026-09-05T08:50:35Z",
            "category": "WAREHOUSE",
            "source": "WH-MAIN Chicago RFID",
            "message": "Automated dock cross-check verified 30 units SKU-3150 in clean Bay C-11 staging zone.",
            "icon": "📦",
            "severity": "normal"
        },
        {
            "id": "tel-3",
            "timestamp": "2026-09-05T08:50:58Z",
            "category": "SLA_MONITOR",
            "source": "Contractual SLA Watcher",
            "message": "Tesla Energy Solutions Order ORD-501: Promise clock active (5 days to delivery threshold).",
            "icon": "⏱️",
            "severity": "warning"
        },
        {
            "id": "tel-4",
            "timestamp": "2026-09-05T08:51:20Z",
            "category": "SUPPLIER_LINK",
            "source": "EDI Telemetry Bridge",
            "message": "Apex Dynamics Fremont Line 3 hydraulic telemetry feed: offline status detected.",
            "icon": "⚡",
            "severity": "alert"
        },
        {
            "id": "tel-5",
            "timestamp": "2026-09-05T08:51:45Z",
            "category": "AIR_EXPRESS",
            "source": "FedEx Cargo Logistics",
            "message": "Air charter flight FX-8921 pre-alert generated for emergency routing option.",
            "icon": "✈️",
            "severity": "info"
        }
    ]

    # Convert recent audit entries to live stream events if any
    for i, a in enumerate(reversed(audit_entries[-4:])):
        telemetry.insert(0, {
            "id": f"audit-{i}",
            "timestamp": a.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "category": "OPERATOR_ACTION",
            "source": "System Audit Trail",
            "message": f"Operator Decision: {a.get('event')} - {a.get('action_summary') or a.get('detail') or 'Committed'}",
            "icon": "✓",
            "severity": "success"
        })

    return {"events": telemetry}
