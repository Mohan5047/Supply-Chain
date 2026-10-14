import pytest
from fastapi.testclient import TestClient
from app import app
from src.db.repository import DataRepository

@pytest.fixture
def repo():
    r = DataRepository()
    r.reset_to_seed()
    return r

@pytest.fixture
def client():
    return TestClient(app)

# 1. Auth Tests
def test_auth_login_and_me(client, repo):
    res = client.post("/api/auth/login", json={"username": "admin", "password": "password123"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["user"]["role"] == "Admin"

    res_me = client.get("/api/auth/me?username=admin")
    assert res_me.status_code == 200
    assert res_me.json()["username"] == "admin"

def test_auth_register(client, repo):
    res = client.post("/api/auth/register", json={
        "username": "new_analyst",
        "email": "analyst2@chainsolve.io",
        "password": "securepassword",
        "full_name": "New Analyst",
        "role": "Analyst"
    })
    assert res.status_code == 200
    assert res.json()["user"]["username"] == "new_analyst"

# 2. Dashboard Tests
def test_dashboard_summary_and_analytics(client, repo):
    res_sum = client.get("/api/dashboard/summary")
    assert res_sum.status_code == 200
    sum_data = res_sum.json()
    assert "active_disruptions_count" in sum_data
    assert sum_data["total_suppliers_count"] == 8
    assert sum_data["total_catalog_products"] == 20
    assert sum_data["total_warehouses"] == 4

    res_ana = client.get("/api/dashboard/analytics")
    assert res_ana.status_code == 200
    ana_data = res_ana.json()
    assert len(ana_data["severity_distribution"]) > 0
    assert len(ana_data["supplier_risk_overview"]) == 8

# 3. Disruption CRUD & Lifecycle Tests
def test_disruption_crud_and_lifecycle(client, repo):
    # GET disruptions
    res = client.get("/api/disruptions")
    assert res.status_code == 200
    disruptions = res.json()
    assert len(disruptions) >= 5

    # Filter by severity
    res_crit = client.get("/api/disruptions?severity=Critical")
    assert res_crit.status_code == 200
    assert all(d["severity"] == "Critical" for d in res_crit.json())

    # POST create disruption
    res_create = client.post("/api/disruptions", json={
        "title": "Port of Long Beach Crane Malfunction",
        "disruption_type": "Carrier/Shipment Delay",
        "description": "Crane power outage slows container discharge by 4 days.",
        "supplier_id": "SUP-002",
        "shipment_id": "SH-7714",
        "location": "Port of Long Beach, CA",
        "severity": "Medium",
        "delay_days": 4
    })
    assert res_create.status_code == 200
    new_d = res_create.json()["disruption"]
    new_id = new_d["disruption_id"]

    # PATCH update disruption
    res_patch = client.patch(f"/api/disruptions/{new_id}", json={
        "severity": "High",
        "delay_days": 6
    })
    assert res_patch.status_code == 200
    assert res_patch.json()["disruption"]["severity"] == "High"

    # POST resolve disruption
    res_resolve = client.post(f"/api/disruptions/{new_id}/resolve", json={
        "resolution_method": "Expedited Alternate Carrier",
        "resolution_notes": "Emergency off-dock drayage authorized to bypass terminal crane queue."
    })
    assert res_resolve.status_code == 200
    assert res_resolve.json()["disruption"]["status"] == "Resolved"

# 4. Impact & Recommendations Tests
def test_disruption_impact_and_recommendations(client, repo):
    disruptions = client.get("/api/disruptions").json()
    first_id = disruptions[0]["disruption_id"]

    # GET impact
    res_impact = client.get(f"/api/disruptions/{first_id}/impact")
    assert res_impact.status_code == 200
    impact = res_impact.json()
    assert "summary" in impact
    assert "supplier_impact" in impact
    assert "inventory_impact" in impact

    # Recommendations
    recs = client.get(f"/api/disruptions/{first_id}/recommendations").json()
    assert len(recs) >= 1
    rec_id = recs[0]["recommendation_id"]

    # PATCH recommendation (accept)
    res_accept = client.patch(f"/api/recommendations/{rec_id}", json={
        "status": "Accepted",
        "assigned_to": "Elena Rostova",
        "notes": "Action authorized by ops."
    })
    assert res_accept.status_code == 200
    assert res_accept.json()["recommendation"]["status"] == "Accepted"

# 5. Suppliers Tests
def test_suppliers_endpoints(client, repo):
    res = client.get("/api/suppliers")
    assert res.status_code == 200
    suppliers = res.json()
    assert len(suppliers) == 8

    # Detail
    sup_id = suppliers[0]["supplier_id"]
    res_detail = client.get(f"/api/suppliers/{sup_id}")
    assert res_detail.status_code == 200
    assert "supplier" in res_detail.json()
    assert "active_shipments" in res_detail.json()

# 6. Inventory Tests
def test_inventory_endpoints(client, repo):
    res = client.get("/api/inventory")
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 80  # 20 SKUs across 4 warehouses
    # Verify calculated available stock is not negative
    assert all(i["available"] >= 0 for i in items)

# 7. Shipments Tests
def test_shipments_endpoints(client, repo):
    res = client.get("/api/shipments")
    assert res.status_code == 200
    shipments = res.json()
    assert len(shipments) == 25

    # Detail
    ship_id = shipments[0]["shipment_id"]
    res_detail = client.get(f"/api/shipments/{ship_id}")
    assert res_detail.status_code == 200
    assert "timeline" in res_detail.json()

# 8. Orders Tests
def test_customer_orders_endpoints(client, repo):
    res = client.get("/api/orders")
    assert res.status_code == 200
    orders = res.json()
    assert len(orders) == 30

# 9. Reports & CSV Export Tests
def test_reports_and_export(client, repo):
    res_sum = client.get("/api/reports/summary")
    assert res_sum.status_code == 200
    assert "total_disruptions" in res_sum.json()

    res_csv = client.get("/api/reports/export")
    assert res_csv.status_code == 200
    assert res_csv.headers["content-type"].startswith("text/csv")
    assert "Disruption ID" in res_csv.text

# 10. Notifications Tests
def test_notifications_endpoints(client, repo):
    res = client.get("/api/notifications")
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) >= 5

    notif_id = notifs[0]["notification_id"]
    res_read = client.patch(f"/api/notifications/{notif_id}/read")
    assert res_read.status_code == 200
    assert res_read.json()["status"] == "success"

# 11. Users & Roles Tests
def test_users_endpoints(client, repo):
    res = client.get("/api/users")
    assert res.status_code == 200
    assert len(res.json()) >= 4

    res_role = client.patch("/api/users/analyst/role?role=Supply Chain Manager")
    assert res_role.status_code == 200
    assert res_role.json()["role"] == "Supply Chain Manager"
