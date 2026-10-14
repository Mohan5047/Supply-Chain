import json
import copy
import threading
from typing import Dict, List, Optional, Any
from datetime import datetime
from src.core.config import SEED_DATA_PATH
from src.models.supply_chain import (
    Supplier, SKU, WarehouseInventory, InboundShipment, CustomerOrder,
    ShipmentLineItem, OrderLineItem, Warehouse, Disruption, Recommendation,
    Notification, User
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
            self.warehouses: Dict[str, Warehouse] = {
                w["warehouse_id"]: Warehouse(**w) for w in raw_data.get("warehouses", [
                    {"warehouse_id": "WH-MAIN", "warehouse_name": "Central Logistics Hub - Chicago", "city": "Chicago, IL"}
                ])
            }
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
            self.disruptions: Dict[str, Disruption] = {
                d["disruption_id"]: Disruption(**d) for d in raw_data.get("disruptions", [])
            }
            self.recommendations: Dict[str, Recommendation] = {
                r["recommendation_id"]: Recommendation(**r) for r in raw_data.get("recommendations", [])
            }
            self.notifications: List[Notification] = [
                Notification(**n) for n in raw_data.get("notifications", [])
            ]
            self.users: Dict[str, User] = {
                u["username"]: User(**u) for u in raw_data.get("users", [
                    {"user_id": "USR-001", "username": "admin", "email": "admin@chainsolve.io", "full_name": "Operations Controller", "role": "Admin"}
                ])
            }
            
            self.audit_log.append({
                "timestamp": datetime.now().isoformat(),
                "event": "DATABASE_RESET",
                "detail": "Repository reset to pristine seed state."
            })

    # =========================================================================
    # Warehouses
    # =========================================================================
    def get_warehouse(self, warehouse_id: str) -> Optional[Warehouse]:
        with self.lock:
            return self.warehouses.get(warehouse_id)

    def get_all_warehouses(self) -> List[Warehouse]:
        with self.lock:
            return list(self.warehouses.values())

    # =========================================================================
    # Suppliers
    # =========================================================================
    def get_supplier(self, supplier_id: str) -> Optional[Supplier]:
        with self.lock:
            return self.suppliers.get(supplier_id)

    def get_all_suppliers(self) -> List[Supplier]:
        with self.lock:
            return list(self.suppliers.values())

    def create_supplier(self, supplier_data: Dict[str, Any]) -> Supplier:
        with self.lock:
            sup_id = supplier_data.get("supplier_id") or f"SUP-{len(self.suppliers)+1:03d}"
            supplier_data["supplier_id"] = sup_id
            sup = Supplier(**supplier_data)
            self.suppliers[sup_id] = sup
            self.audit_log.append({
                "timestamp": datetime.now().isoformat(),
                "event": "SUPPLIER_CREATED",
                "supplier_id": sup_id,
                "name": sup.name
            })
            return sup

    def update_supplier(self, supplier_id: str, updates: Dict[str, Any]) -> Optional[Supplier]:
        with self.lock:
            sup = self.suppliers.get(supplier_id)
            if not sup:
                return None
            sup_dict = sup.model_dump()
            sup_dict.update(updates)
            updated_sup = Supplier(**sup_dict)
            self.suppliers[supplier_id] = updated_sup
            self.audit_log.append({
                "timestamp": datetime.now().isoformat(),
                "event": "SUPPLIER_UPDATED",
                "supplier_id": supplier_id
            })
            return updated_sup

    # =========================================================================
    # SKUs / Catalog Products
    # =========================================================================
    def get_sku(self, sku_id: str) -> Optional[SKU]:
        with self.lock:
            return self.skus.get(sku_id)

    def get_all_skus(self) -> List[SKU]:
        with self.lock:
            return list(self.skus.values())

    # =========================================================================
    # Inventory
    # =========================================================================
    def get_inventory_item(self, warehouse_id: str, sku_id: str) -> Optional[WarehouseInventory]:
        with self.lock:
            return self.inventory.get(f"{warehouse_id}_{sku_id}")

    def get_all_inventory(self) -> List[WarehouseInventory]:
        with self.lock:
            return list(self.inventory.values())

    def update_inventory_stock(self, warehouse_id: str, sku_id: str, on_hand: Optional[int] = None, allocated: Optional[int] = None) -> Optional[WarehouseInventory]:
        with self.lock:
            key = f"{warehouse_id}_{sku_id}"
            item = self.inventory.get(key)
            if not item:
                return None
            new_on_hand = on_hand if on_hand is not None else item.on_hand
            new_allocated = allocated if allocated is not None else item.allocated
            new_available = max(0, new_on_hand - new_allocated - item.reserved_safety)
            updated = WarehouseInventory(
                warehouse_id=item.warehouse_id,
                warehouse_name=item.warehouse_name,
                sku_id=item.sku_id,
                on_hand=new_on_hand,
                allocated=new_allocated,
                reserved_safety=item.reserved_safety,
                available=new_available,
                location_bin=item.location_bin
            )
            self.inventory[key] = updated
            return updated

    # =========================================================================
    # Inbound Shipments
    # =========================================================================
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

    # =========================================================================
    # Customer Orders
    # =========================================================================
    def get_customer_order(self, order_id: str) -> Optional[CustomerOrder]:
        with self.lock:
            return self.customer_orders.get(order_id)

    def get_all_customer_orders(self) -> List[CustomerOrder]:
        with self.lock:
            return list(self.customer_orders.values())

    # =========================================================================
    # Disruptions Management
    # =========================================================================
    def get_all_disruptions(self) -> List[Disruption]:
        with self.lock:
            return list(self.disruptions.values())

    def get_disruption(self, disruption_id: str) -> Optional[Disruption]:
        with self.lock:
            return self.disruptions.get(disruption_id)

    def create_disruption(self, disruption_data: Dict[str, Any]) -> Disruption:
        with self.lock:
            disr_id = disruption_data.get("disruption_id") or f"DISR-{datetime.now().strftime('%Y')}-{len(self.disruptions)+1:03d}"
            disruption_data["disruption_id"] = disr_id
            if not disruption_data.get("reported_at"):
                disruption_data["reported_at"] = datetime.now().isoformat()
            
            disr = Disruption(**disruption_data)
            self.disruptions[disr_id] = disr

            # Add activity log
            self.audit_log.append({
                "timestamp": datetime.now().isoformat(),
                "event": "DISRUPTION_REPORTED",
                "disruption_id": disr_id,
                "title": disr.title,
                "severity": disr.severity
            })

            # Add notification
            notif = Notification(
                notification_id=f"NOTIF-{len(self.notifications)+1:03d}",
                title=f"New Disruption: {disr.title}",
                message=f"Reported {disr.disruption_type} ({disr.severity} severity). Expected delay: {disr.delay_days} days.",
                severity=disr.severity if disr.severity in ["Critical", "High"] else "Medium",
                timestamp=datetime.now().isoformat(),
                is_read=False,
                link_type="disruption",
                link_id=disr_id
            )
            self.notifications.insert(0, notif)
            return disr

    def update_disruption(self, disruption_id: str, updates: Dict[str, Any]) -> Optional[Disruption]:
        with self.lock:
            disr = self.disruptions.get(disruption_id)
            if not disr:
                return None
            data = disr.model_dump()
            data.update(updates)
            updated = Disruption(**data)
            self.disruptions[disruption_id] = updated
            self.audit_log.append({
                "timestamp": datetime.now().isoformat(),
                "event": "DISRUPTION_UPDATED",
                "disruption_id": disruption_id,
                "updates": list(updates.keys())
            })
            return updated

    def resolve_disruption(self, disruption_id: str, resolution_method: str, resolution_notes: str) -> Optional[Disruption]:
        with self.lock:
            disr = self.disruptions.get(disruption_id)
            if not disr:
                return None
            disr.status = "Resolved"
            disr.resolved_at = datetime.now().isoformat()
            disr.resolution_method = resolution_method
            disr.resolution_notes = resolution_notes

            self.audit_log.append({
                "timestamp": disr.resolved_at,
                "event": "DISRUPTION_RESOLVED",
                "disruption_id": disruption_id,
                "method": resolution_method,
                "notes": resolution_notes
            })

            # Notification
            self.notifications.insert(0, Notification(
                notification_id=f"NOTIF-{len(self.notifications)+1:03d}",
                title=f"Resolved: {disr.title}",
                message=f"Incident resolved via {resolution_method}. {resolution_notes}",
                severity="Success",
                timestamp=datetime.now().isoformat(),
                is_read=False,
                link_type="disruption",
                link_id=disruption_id
            ))
            return disr

    # =========================================================================
    # Action Recommendations
    # =========================================================================
    def get_all_recommendations(self) -> List[Recommendation]:
        with self.lock:
            return list(self.recommendations.values())

    def get_recommendations_for_disruption(self, disruption_id: str) -> List[Recommendation]:
        with self.lock:
            return [r for r in self.recommendations.values() if r.disruption_id == disruption_id]

    def update_recommendation(self, recommendation_id: str, updates: Dict[str, Any]) -> Optional[Recommendation]:
        with self.lock:
            rec = self.recommendations.get(recommendation_id)
            if not rec:
                return None
            rec_dict = rec.model_dump()
            rec_dict.update(updates)
            updated_rec = Recommendation(**rec_dict)
            self.recommendations[recommendation_id] = updated_rec

            self.audit_log.append({
                "timestamp": datetime.now().isoformat(),
                "event": "RECOMMENDATION_UPDATED",
                "recommendation_id": recommendation_id,
                "status": updated_rec.status
            })
            return updated_rec

    # =========================================================================
    # Notifications
    # =========================================================================
    def get_notifications(self) -> List[Notification]:
        with self.lock:
            return list(self.notifications)

    def mark_notification_read(self, notification_id: str) -> bool:
        with self.lock:
            for n in self.notifications:
                if n.notification_id == notification_id:
                    n.is_read = True
                    return True
            return False

    def mark_all_notifications_read(self):
        with self.lock:
            for n in self.notifications:
                n.is_read = True

    # =========================================================================
    # Users & Auth
    # =========================================================================
    def get_user_by_username(self, username: str) -> Optional[User]:
        with self.lock:
            return self.users.get(username)

    def get_all_users(self) -> List[User]:
        with self.lock:
            return list(self.users.values())

    def update_user_role(self, username: str, new_role: str) -> Optional[User]:
        with self.lock:
            user = self.users.get(username)
            if not user:
                return None
            user.role = new_role
            return user

    # =========================================================================
    # Disruption updates (Preserved Legacy & Grounded Assessments)
    # =========================================================================
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
                for ship in self.inbound_shipments.values():
                    if ship.expedite_air_available:
                        ship.status = "expedited_air"
                        if ship.expedite_air_lead_time_days:
                            ship.revised_arrival_date = f"2026-09-0{5 + ship.expedite_air_lead_time_days}"
                order.status = "scheduled_for_expedited_delivery"
                action_summary = f"Inbound air express authorized. Order {order_id} prioritized for immediate arrival."

            elif option_type == "REALLOCATE_STOCK":
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
