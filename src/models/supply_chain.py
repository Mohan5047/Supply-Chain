from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from src.core.types import CustomerTier

class Warehouse(BaseModel):
    warehouse_id: str
    warehouse_name: str
    city: str
    capacity_pallets: int = 10000
    manager: Optional[str] = "Operations Lead"
    status: str = "Operational"

class Supplier(BaseModel):
    supplier_id: str
    name: str
    aliases: List[str] = Field(default_factory=list)
    contact_email: str
    location: str
    reliability_score: float = 0.90
    expedite_available: bool = False
    expedite_cost_multiplier: float = 1.0
    status: str = "Active"

class SKU(BaseModel):
    sku_id: str
    name: str
    aliases: List[str] = Field(default_factory=list)
    category: str
    unit_cost: float
    unit_price: float
    lead_time_days: int
    safety_stock_threshold: int
    preferred_supplier_id: Optional[str] = None

class WarehouseInventory(BaseModel):
    warehouse_id: str
    warehouse_name: str
    sku_id: str
    on_hand: int
    allocated: int
    reserved_safety: int
    available: int
    location_bin: str

class ShipmentLineItem(BaseModel):
    sku_id: str
    quantity_ordered: int
    quantity_shipped: int

class InboundShipment(BaseModel):
    shipment_id: str
    po_number: str
    supplier_id: str
    carrier_name: str
    tracking_number: str
    origin: str
    destination_warehouse: str
    status: str
    scheduled_arrival_date: str
    revised_arrival_date: Optional[str] = None
    delay_days: int = 0
    items: List[ShipmentLineItem] = Field(default_factory=list)
    expedite_air_available: bool = False
    expedite_air_lead_time_days: Optional[int] = None
    expedite_air_cost: float = 0.0

class OrderLineItem(BaseModel):
    sku_id: str
    quantity_demanded: int
    quantity_allocated: int = 0

class CustomerOrder(BaseModel):
    order_id: str
    customer_name: str
    customer_tier: CustomerTier
    priority: int
    order_date: str
    promise_date: str
    sla_penalty_per_day: float = 0.0
    destination_city: str
    status: str
    items: List[OrderLineItem] = Field(default_factory=list)
    notes: Optional[str] = None

class Disruption(BaseModel):
    disruption_id: str
    title: str
    disruption_type: str
    supplier_id: Optional[str] = None
    shipment_id: Optional[str] = None
    po_number: Optional[str] = None
    sku_id: Optional[str] = None
    warehouse_id: Optional[str] = None
    location: Optional[str] = None
    severity: str = "Medium"
    status: str = "Reported"  # Reported, Under Analysis, Action Required, In Progress, Resolved
    delay_days: int = 0
    quantity_affected: Optional[int] = 0
    reported_at: str
    description: str
    evidence: Optional[str] = None
    affected_orders_count: int = 0
    estimated_financial_impact: float = 0.0
    resolved_at: Optional[str] = None
    resolution_method: Optional[str] = None
    resolution_notes: Optional[str] = None

class Recommendation(BaseModel):
    recommendation_id: str
    disruption_id: str
    priority: int
    action: str
    reason: str
    evidence: str
    expected_benefit: str
    responsible_role: str
    status: str = "Pending"  # Pending, Accepted, Rejected, In Progress, Completed
    rejection_reason: Optional[str] = None
    deadline: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

class Notification(BaseModel):
    notification_id: str
    title: str
    message: str
    severity: str = "Info"
    timestamp: str
    is_read: bool = False
    link_type: Optional[str] = None
    link_id: Optional[str] = None

class User(BaseModel):
    user_id: str
    username: str
    email: str
    full_name: str
    role: str  # Admin, Supply Chain Manager, Analyst, Viewer
    department: Optional[str] = None
    hashed_password: Optional[str] = None
