import pytest
from src.db.repository import DataRepository
from src.engine.extractor import NoticeExtractor
from src.engine.grounding import GroundingEngine
from src.engine.impact_analyzer import ImpactAnalyzer
from src.core.types import CustomerTier, UrgencyLevel

@pytest.fixture
def repo():
    r = DataRepository()
    r.reset_to_seed()
    return r

@pytest.fixture
def pipeline(repo):
    extractor = NoticeExtractor()
    grounding = GroundingEngine(repo)
    analyzer = ImpactAnalyzer(repo)
    return extractor, grounding, analyzer

def test_impact_apex_supplier_halt(pipeline):
    extractor, grounding_engine, analyzer = pipeline
    notice = "Notice from Apex Dynamics: PO-4482 / SH-8921 delayed by 14 days."
    extracted = extractor.extract(notice)
    grounding = grounding_engine.ground(extracted)
    assessment = analyzer.analyze(notice, extracted, grounding)

    assert assessment.has_system_impact is True
    assert assessment.total_orders_impacted >= 2
    assert assessment.total_sla_penalty_risk > 0

    # Verify urgency ranking: Platinum orders must be ranked first
    top_order = assessment.affected_orders[0]
    assert top_order.customer_tier == CustomerTier.PLATINUM
    assert top_order.ranking == 1
    assert top_order.urgency_level in [UrgencyLevel.CRITICAL, UrgencyLevel.HIGH]
    assert len(top_order.data_citations) >= 3

def test_impact_false_alarm_returns_zero_impact(pipeline):
    extractor, grounding_engine, analyzer = pipeline
    notice = "Traffic Advisory: Acme Logistics Route 9 Denver closed for 5 days."
    extracted = extractor.extract(notice)
    grounding = grounding_engine.ground(extracted)
    assessment = analyzer.analyze(notice, extracted, grounding)

    assert assessment.has_system_impact is False
    assert assessment.total_orders_impacted == 0
    assert assessment.total_revenue_at_risk == 0.0
    assert assessment.total_sla_penalty_risk == 0.0
    assert "no operational impact" in assessment.summary_headline.lower()

def test_impact_warehouse_physical_incident(pipeline):
    extractor, grounding_engine, analyzer = pipeline
    notice = (
        "Warehouse incident report: Bay C-12 in WH-MAIN forklift crushed 150 units of "
        "battery pack BAT-4400 (SKU-3150). Scrapped immediately."
    )
    extracted = extractor.extract(notice)
    grounding = grounding_engine.ground(extracted)
    assessment = analyzer.analyze(notice, extracted, grounding)

    assert assessment.has_system_impact is True
    assert len(assessment.disrupted_inventory) == 1
    inv_disruption = assessment.disrupted_inventory[0]
    assert inv_disruption["scrapped_units"] == 150
    assert inv_disruption["new_on_hand"] == 30
