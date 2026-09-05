import pytest
from fastapi.testclient import TestClient
from app import app
from src.db.repository import DataRepository
from src.engine.grounding import GroundingEngine
from src.engine.impact_analyzer import ImpactAnalyzer
from src.engine.recommender import ActionPlanRecommender
from src.models.disruption import StructuredDisruptionRequest
from src.core.types import CustomerTier, UrgencyLevel, ResolutionOptionType

@pytest.fixture
def repo():
    r = DataRepository()
    r.reset_to_seed()
    return r

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def pipeline(repo):
    grounding = GroundingEngine(repo)
    analyzer = ImpactAnalyzer(repo)
    recommender = ActionPlanRecommender(repo)
    return grounding, analyzer, recommender

# ============================================================================
# 1. Structured Core Workflow Tests
# ============================================================================
# 1. Structured Core Workflow Tests
# ============================================================================

def test_structured_apex_supplier_halt(pipeline):
    grounding_engine, analyzer, recommender = pipeline
    req = StructuredDisruptionRequest(
        disruption_type="Supplier Production Halt",
        supplier_id="SUP-001",
        po_number="PO-4482",
        shipment_id="SH-8921",
        sku_id="SKU-1049",
        disruption_date="2026-09-05",
        delay_days=14,
        affected_location="Fremont, CA",
        reason="Hydraulic pump failure on Line 3.",
        severity="Critical"
    )

    extracted, grounding = grounding_engine.validate_and_ground_structured(req)
    assert grounding.has_active_matches is True
    assert grounding.resolved_supplier_id == "SUP-001"
    assert grounding.resolved_shipment_id == "SH-8921"
    assert grounding.resolved_sku_id == "SKU-1049"

    assessment = recommender.generate_options(analyzer.analyze("Structured Apex Disruption", extracted, grounding))
    assert assessment.has_system_impact is True
    assert assessment.total_orders_impacted >= 2
    assert assessment.total_sla_penalty_risk > 0

    top_order = assessment.affected_orders[0]
    assert top_order.customer_tier == CustomerTier.PLATINUM
    assert top_order.ranking == 1
    assert len(top_order.options) >= 3
    rec_opt = next((o for o in top_order.options if o.is_recommended), None)
    assert rec_opt is not None

def test_structured_carrier_delay(pipeline):
    grounding_engine, analyzer, recommender = pipeline
    req = StructuredDisruptionRequest(
        disruption_type="Carrier/Shipment Delay",
        supplier_id="SUP-002",
        po_number="PO-3910",
        shipment_id="SH-7714",
        sku_id="SKU-2088",
        disruption_date="2026-09-05",
        delay_days=10,
        affected_location="Port of Long Beach",
        reason="Port congestion at Long Beach.",
        severity="High"
    )

    extracted, grounding = grounding_engine.validate_and_ground_structured(req)
    assert grounding.has_active_matches is True
    assert grounding.resolved_shipment_id == "SH-7714"
    assert grounding.resolved_sku_id == "SKU-2088"

    assessment = recommender.generate_options(analyzer.analyze("Structured Carrier Delay", extracted, grounding))
    assert assessment.has_system_impact is True
    assert any(o.order_id == "ORD-503" for o in assessment.affected_orders)

def test_structured_warehouse_incident(pipeline):
    grounding_engine, analyzer, recommender = pipeline
    req = StructuredDisruptionRequest(
        disruption_type="Warehouse Incident",
        supplier_id=None,
        po_number=None,
        shipment_id=None,
        sku_id="SKU-3150",
        disruption_date="2026-09-05",
        delay_days=18,
        affected_location="WH-MAIN",
        quantity_affected=150,
        reason="Forklift collision destroyed 150 battery packs.",
        severity="Critical"
    )

    extracted, grounding = grounding_engine.validate_and_ground_structured(req)
    assert grounding.has_active_matches is True
    assert grounding.resolved_sku_id == "SKU-3150"

    assessment = recommender.generate_options(analyzer.analyze("Structured Warehouse Incident", extracted, grounding))
    assert assessment.has_system_impact is True
    assert len(assessment.disrupted_inventory) == 1
    assert assessment.disrupted_inventory[0]["scrapped_units"] == 150
    assert assessment.disrupted_inventory[0]["new_on_hand"] == 30

def test_structured_false_alarm_discipline_to_refuse(pipeline):
    grounding_engine, analyzer, recommender = pipeline
    req = StructuredDisruptionRequest(
        disruption_type="Other",
        supplier_id="SUP-006",
        po_number=None,
        shipment_id=None,
        sku_id=None,
        disruption_date="2026-09-05",
        delay_days=5,
        affected_location="Denver, CO",
        reason="Route 9 road closure near Denver.",
        severity="Low"
    )

    extracted, grounding = grounding_engine.validate_and_ground_structured(req)
    assert grounding.has_active_matches is False
    assert "no active" in grounding.reasoning.lower()

    assessment = recommender.generate_options(analyzer.analyze("Structured False Alarm", extracted, grounding))
    assert assessment.has_system_impact is False
    assert assessment.total_orders_impacted == 0
    assert assessment.total_revenue_at_risk == 0.0
    assert assessment.total_sla_penalty_risk == 0.0

# ============================================================================
# 2. Relationship Validation Integrity Tests
# ============================================================================

def test_validation_delay_days_invalid(pipeline):
    grounding_engine, _, _ = pipeline
    with pytest.raises((ValueError, Exception), match="greater than"):
        req = StructuredDisruptionRequest(
            disruption_type="Carrier/Shipment Delay",
            supplier_id="SUP-001",
            delay_days=0,
            reason="Zero delay"
        )
        grounding_engine.validate_and_ground_structured(req)

def test_validation_nonexistent_supplier(pipeline):
    grounding_engine, _, _ = pipeline
    with pytest.raises(ValueError, match="Supplier ID 'SUP-999' does not exist"):
        req = StructuredDisruptionRequest(
            disruption_type="Supplier Production Halt",
            supplier_id="SUP-999",
            disruption_date="2026-09-05",
            delay_days=10
        )
        grounding_engine.validate_and_ground_structured(req)

def test_validation_nonexistent_shipment(pipeline):
    grounding_engine, _, _ = pipeline
    with pytest.raises(ValueError, match="Inbound Shipment ID 'SH-9999' does not exist"):
        req = StructuredDisruptionRequest(
            disruption_type="Carrier/Shipment Delay",
            supplier_id="SUP-001",
            shipment_id="SH-9999",
            disruption_date="2026-09-05",
            delay_days=10
        )
        grounding_engine.validate_and_ground_structured(req)

def test_validation_nonexistent_sku(pipeline):
    grounding_engine, _, _ = pipeline
    with pytest.raises(ValueError, match="Product SKU ID 'SKU-9999' does not exist"):
        req = StructuredDisruptionRequest(
            disruption_type="Warehouse Incident",
            sku_id="SKU-9999",
            disruption_date="2026-09-05",
            delay_days=10
        )
        grounding_engine.validate_and_ground_structured(req)

def test_validation_supplier_shipment_mismatch(pipeline):
    grounding_engine, _, _ = pipeline
    # SH-8921 belongs to SUP-001 (Apex), not SUP-002 (TSMC)
    with pytest.raises(ValueError, match="belongs to Supplier 'SUP-001'"):
        req = StructuredDisruptionRequest(
            disruption_type="Carrier/Shipment Delay",
            supplier_id="SUP-002",
            shipment_id="SH-8921",
            disruption_date="2026-09-05",
            delay_days=10
        )
        grounding_engine.validate_and_ground_structured(req)

def test_validation_shipment_sku_mismatch(pipeline):
    grounding_engine, _, _ = pipeline
    # SH-8921 carries SKU-1049, NOT SKU-3150
    with pytest.raises(ValueError, match="not part of Shipment 'SH-8921'"):
        req = StructuredDisruptionRequest(
            disruption_type="Supplier Production Halt",
            supplier_id="SUP-001",
            shipment_id="SH-8921",
            sku_id="SKU-3150",
            disruption_date="2026-09-05",
            delay_days=10
        )
        grounding_engine.validate_and_ground_structured(req)

def test_validation_warehouse_missing_sku(pipeline):
    grounding_engine, _, _ = pipeline
    with pytest.raises(ValueError, match="SKU must be selected"):
        req = StructuredDisruptionRequest(
            disruption_type="Warehouse Incident",
            sku_id=None,
            disruption_date="2026-09-05",
            delay_days=10
        )
        grounding_engine.validate_and_ground_structured(req)

def test_validation_empty_entity_selection(pipeline):
    grounding_engine, _, _ = pipeline
    with pytest.raises(ValueError, match="select at least a Supplier, Shipment, or SKU"):
        req = StructuredDisruptionRequest(
            disruption_type="Other",
            supplier_id=None,
            po_number=None,
            shipment_id=None,
            sku_id=None,
            disruption_date="2026-09-05",
            delay_days=5
        )
        grounding_engine.validate_and_ground_structured(req)

# ============================================================================
# 3. HTTP API End-to-End Tests
# ============================================================================

def test_api_reference_data(client, repo):
    response = client.get("/api/reference-data")
    assert response.status_code == 200
    data = response.json()
    assert len(data["suppliers"]) >= 5
    assert len(data["purchase_orders"]) >= 4
    assert len(data["shipments"]) >= 4
    assert len(data["skus"]) >= 5
    assert len(data["disruption_types"]) == 4

def test_api_structured_analyze_valid(client, repo):
    payload = {
        "disruption_type": "Supplier Production Halt",
        "supplier_id": "SUP-001",
        "po_number": "PO-4482",
        "shipment_id": "SH-8921",
        "sku_id": "SKU-1049",
        "disruption_date": "2026-09-05",
        "delay_days": 14,
        "affected_location": "Fremont, CA",
        "reason": "Apex pump failure on Line 3",
        "severity": "Critical"
    }
    response = client.post("/api/disruption/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["has_system_impact"] is True
    assert data["total_orders_impacted"] >= 2
    assert len(data["affected_orders"][0]["options"]) >= 3

def test_api_structured_analyze_invalid_relationship(client, repo):
    payload = {
        "disruption_type": "Carrier/Shipment Delay",
        "supplier_id": "SUP-002",
        "shipment_id": "SH-8921",
        "delay_days": 10
    }
    response = client.post("/api/disruption/analyze", json=payload)
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert "belongs to Supplier 'SUP-001'" in detail
