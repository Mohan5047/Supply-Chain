from typing import List, Optional
from pydantic import BaseModel, Field
from src.core.types import CustomerTier

class Supplier(BaseModel):
    supplier_id: str
    name: str
    aliases: List[str] = Field(default_factory=list)
    contact_email: str
    location: str
    reliability_score: float = 0.90
    expedite_available: bool = False
    expedite_cost_multiplier: float = 1.0

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
