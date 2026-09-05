from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from src.core.types import CustomerTier, UrgencyLevel, DisruptionCategory, ResolutionOptionType, MatchConfidence

class ExtractedEntities(BaseModel):
    mentioned_suppliers: List[str] = Field(default_factory=list)
    mentioned_carriers: List[str] = Field(default_factory=list)
    mentioned_skus: List[str] = Field(default_factory=list)
    mentioned_pos: List[str] = Field(default_factory=list)
    mentioned_shipments: List[str] = Field(default_factory=list)
    mentioned_warehouses: List[str] = Field(default_factory=list)
    delay_days: Optional[int] = None
    new_date: Optional[str] = None
    quantity_affected: Optional[int] = None
    incident_type: str = "general_delay"
    severity_stated: str = "moderate"
    raw_summary: str = ""

class StructuredDisruptionRequest(BaseModel):
    disruption_type: str = Field(..., description="Disruption Type: 'Supplier Production Halt', 'Carrier/Shipment Delay', 'Warehouse Incident', or 'Other'")
    supplier_id: Optional[str] = Field(None, description="Selected Supplier ID (e.g. SUP-001)")
    po_number: Optional[str] = Field(None, description="Selected Purchase Order Number (e.g. PO-4482)")
    shipment_id: Optional[str] = Field(None, description="Selected Inbound Shipment ID (e.g. SH-8921)")
    sku_id: Optional[str] = Field(None, description="Selected SKU ID (e.g. SKU-1049)")
    disruption_date: str = Field(..., description="Disruption Date (YYYY-MM-DD)")
    delay_days: int = Field(..., ge=1, description="Expected Delay in calendar days (must be > 0)")
    affected_location: Optional[str] = Field(None, description="Affected facility or location (e.g. WH-MAIN Chicago, Port of Long Beach)")
    quantity_affected: Optional[int] = Field(None, ge=0, description="Quantity of units damaged/halted (for warehouse or scrap incidents)")
    reason: Optional[str] = Field("", description="Optional short contextual notes/reason")
    severity: str = Field("Medium", description="Stated severity: 'Low', 'Medium', 'High', 'Critical'")
    notice_text: Optional[str] = Field(None, description="Optional raw text or generated overview context")

class GroundedEntityMatch(BaseModel):
    entity_type: str  # "supplier", "shipment", "sku", "warehouse", "po"
    raw_mention: str
    matched_id: Optional[str] = None
    matched_name: Optional[str] = None
    confidence: MatchConfidence
    confidence_score: float = 0.0
    evidence: str
    is_ambiguous: bool = False
    candidate_matches: List[Dict[str, Any]] = Field(default_factory=list)

class GroundingResult(BaseModel):
    has_active_matches: bool
    is_ambiguous: bool = False
    ambiguity_reason: Optional[str] = None
    resolved_supplier_id: Optional[str] = None
    resolved_shipment_id: Optional[str] = None
    resolved_sku_id: Optional[str] = None
    resolved_warehouse_id: Optional[str] = None
    matches: List[GroundedEntityMatch] = Field(default_factory=list)
    reasoning: str
    unmatched_mentions: List[str] = Field(default_factory=list)

class ResolutionOption(BaseModel):
    option_id: str
    option_type: ResolutionOptionType
    title: str
    description: str
    cost: float
    new_delivery_date: str
    sla_penalty_incurred: float
    net_financial_impact: float
    customer_impact_summary: str
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)
    is_recommended: bool = False
    recommendation_rationale: Optional[str] = None
    reallocated_from_order_id: Optional[str] = None
    units_shipped_now: Optional[int] = None
    units_backordered: Optional[int] = None

class OrderImpactDetail(BaseModel):
    order_id: str
    customer_name: str
    customer_tier: CustomerTier
    priority: int
    promise_date: str
    sku_id: str
    sku_name: str
    quantity_demanded: int
    quantity_allocated_before: int
    deficit_quantity: int
    projected_slip_days: int
    projected_new_delivery_date: str
    sla_daily_penalty: float
    total_sla_risk: float
    urgency_level: UrgencyLevel
    urgency_score: float
    ranking: int
    data_citations: List[str] = Field(default_factory=list)
    options: List[ResolutionOption] = Field(default_factory=list)
    selected_option_id: Optional[str] = None

class DisruptionImpactAssessment(BaseModel):
    assessment_id: str
    timestamp: str
    notice_text: str
    category: DisruptionCategory
    has_system_impact: bool
    summary_headline: str
    executive_briefing: str
    grounding: GroundingResult
    affected_orders: List[OrderImpactDetail] = Field(default_factory=list)
    total_orders_impacted: int = 0
    total_revenue_at_risk: float = 0.0
    total_sla_penalty_risk: float = 0.0
    disrupted_shipments: List[Dict[str, Any]] = Field(default_factory=list)
    disrupted_inventory: List[Dict[str, Any]] = Field(default_factory=list)
    citations: List[str] = Field(default_factory=list)

class OperatorDecision(BaseModel):
    assessment_id: str
    order_id: str
    chosen_option_type: ResolutionOptionType
    chosen_option_id: str
    operator_notes: Optional[str] = None
    approved_by: str = "Human Operator"
