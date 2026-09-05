import json
import copy
import threading
from typing import Dict, List, Optional, Any
from datetime import datetime
from src.core.config import SEED_DATA_PATH
from src.models.supply_chain import (
    Supplier, SKU, WarehouseInventory, InboundShipment, CustomerOrder, ShipmentLineItem, OrderLineItem
)

class DataRepository:
    """Thread-safe in-memory supply chain database with persistence and reset capabilities."""
    
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(DataRepository, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self, seed_file_path: Optional[str] = None):
        if getattr(self, "_initialized", False):
            return
        self.seed_file_path = seed_file_path or str(SEED_DATA_PATH)
        self.lock = threading.RLock()
        self.audit_log: List[Dict[str, Any]] = []
        self.assessments_store: Dict[str, Any] = {}
        self.reset_to_seed()
        self._initialized = True

    def reset_to_seed(self):
        """Reload pristine seed data into active state."""
        with self.lock:
            with open(self.seed_file_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)

            self.system_current_date = raw_data.get("system_current_date", "2026-09-05")
            self.suppliers: Dict[str, Supplier] = {
                s["supplier_id"]: Supplier(**s) for s in raw_data.get("suppliers", [])
            }
            self.skus: Dict[str, SKU] = {
                item["sku_id"]: SKU(**item) for item in raw_data.get("skus", [])
            }
            self.inventory: Dict[str, WarehouseInventory] = {
                f"{inv['warehouse_id']}_{inv['sku_id']}": WarehouseInventory(**inv)
                for inv in raw_data.get("inventory", [])
            }
            self.inbound_shipments: Dict[str, InboundShipment] = {
                ship["shipment_id"]: InboundShipment(**ship)
                for ship in raw_data.get("inbound_shipments", [])
            }
            self.customer_orders: Dict[str, CustomerOrder] = {
                ord["order_id"]: CustomerOrder(**ord)
                for ord in raw_data.get("customer_orders", [])
            }
            
            self.audit_log.append({
                "timestamp": datetime.now().isoformat(),
                "event": "DATABASE_RESET",
                "detail": "Repository reset to pristine seed state."
            })

    # Query Helpers
    def get_supplier(self, supplier_id: str) -> Optional[Supplier]:
        with self.lock:
            return self.suppliers.get(supplier_id)

    def get_all_suppliers(self) -> List[Supplier]:
        with self.lock:
            return list(self.suppliers.values())

    def get_sku(self, sku_id: str) -> Optional[SKU]:
        with self.lock:
            return self.skus.get(sku_id)

    def get_all_skus(self) -> List[SKU]:
        with self.lock:
            return list(self.skus.values())

    def get_inventory_item(self, warehouse_id: str, sku_id: str) -> Optional[WarehouseInventory]:
        with self.lock:
            return self.inventory.get(f"{warehouse_id}_{sku_id}")

    def get_all_inventory(self) -> List[WarehouseInventory]:
        with self.lock:
            return list(self.inventory.values())

    def get_inbound_shipment(self, shipment_id: str) -> Optional[InboundShipment]:
        with self.lock:
            return self.inbound_shipments.get(shipment_id)

    def get_shipment_by_po(self, po_number: str) -> Optional[InboundShipment]:
        with self.lock:
            for s in self.inbound_shipments.values():
                if s.po_number.upper() == po_number.upper():
                    return s
            return None

    def get_all_inbound_shipments(self) -> List[InboundShipment]:
        with self.lock:
            return list(self.inbound_shipments.values())

    def get_customer_order(self, order_id: str) -> Optional[CustomerOrder]:
        with self.lock:
            return self.customer_orders.get(order_id)

    def get_all_customer_orders(self) -> List[CustomerOrder]:
        with self.lock:
            return list(self.customer_orders.values())

    # Disruption updates
    def record_assessment(self, assessment: Dict[str, Any]):
        with self.lock:
            self.assessments_store[assessment["assessment_id"]] = assessment
            self.audit_log.append({
                "timestamp": datetime.now().isoformat(),
                "event": "ASSESSMENT_RECORDED",
                "assessment_id": assessment["assessment_id"],
                "has_system_impact": assessment.get("has_system_impact", False),
                "orders_affected": assessment.get("total_orders_impacted", 0)
            })

    def get_assessment(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            return self.assessments_store.get(assessment_id)

    def apply_operator_decision(self, decision_data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply the human operator's selected action to the active database state."""
        with self.lock:
            order_id = decision_data.get("order_id")
            option_type = decision_data.get("chosen_option_type")
            option_id = decision_data.get("chosen_option_id")
            assessment_id = decision_data.get("assessment_id")
            notes = decision_data.get("operator_notes", "")
            operator = decision_data.get("approved_by", "Human Operator")

            order = self.customer_orders.get(order_id)
            if not order:
                raise ValueError(f"Order {order_id} not found in repository.")

            assessment = self.assessments_store.get(assessment_id)
            action_summary = ""

            if option_type == "EXPEDITE_AIR":
                # Find the corresponding inbound shipment and mark it as expedited
                for ship in self.inbound_shipments.values():
                    if ship.expedite_air_available:
                        ship.status = "expedited_air"
                        if ship.expedite_air_lead_time_days:
                            # Advance ETA
                            ship.revised_arrival_date = f"2026-09-0{5 + ship.expedite_air_lead_time_days}"
                order.status = "scheduled_for_expedited_delivery"
                action_summary = f"Inbound air express authorized. Order {order_id} prioritized for immediate arrival."

            elif option_type == "REALLOCATE_STOCK":
                # Reallocate stock from a lower tier / downstream order
                order.status = "allocated_via_reallocation"
                for item in order.items:
                    item.quantity_allocated = item.quantity_demanded
                action_summary = f"Stock reallocated to VIP order {order_id}. Marked ready for dispatch."

            elif option_type == "PART_SHIP":
                order.status = "part_shipped"
                action_summary = f"Partial dispatch authorized for {order_id}. Remaining balance backordered."

            elif option_type == "RESCHEDULE_INFORM":
                order.status = "rescheduled_customer_notified"
                action_summary = f"Customer notification dispatched for {order_id}. Revised delivery date locked."

            else:
                order.status = f"action_{option_type.lower()}"
                action_summary = f"Custom action applied: {option_type}"

            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "event": "OPERATOR_DECISION_COMMITTED",
                "assessment_id": assessment_id,
                "order_id": order_id,
                "option_type": option_type,
                "option_id": option_id,
                "operator": operator,
                "notes": notes,
                "action_summary": action_summary,
                "order_new_status": order.status
            }
            self.audit_log.append(log_entry)

            return {
                "status": "success",
                "order_id": order_id,
                "new_order_status": order.status,
                "message": action_summary,
                "timestamp": log_entry["timestamp"]
            }

    def get_audit_log(self) -> List[Dict[str, Any]]:
        with self.lock:
            return list(self.audit_log)
