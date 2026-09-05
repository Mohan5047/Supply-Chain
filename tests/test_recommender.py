import pytest
from src.db.repository import DataRepository
from src.engine.extractor import NoticeExtractor
from src.engine.grounding import GroundingEngine
from src.engine.impact_analyzer import ImpactAnalyzer
from src.engine.recommender import ActionPlanRecommender
from src.core.types import ResolutionOptionType

@pytest.fixture
def repo():
    r = DataRepository()
    r.reset_to_seed()
    return r

@pytest.fixture
def full_engine(repo):
    extractor = NoticeExtractor()
    grounding = GroundingEngine(repo)
    analyzer = ImpactAnalyzer(repo)
    recommender = ActionPlanRecommender(repo)
    return extractor, grounding, analyzer, recommender

def test_recommender_generates_options_with_tradeoffs(full_engine):
    extractor, grounding_engine, analyzer, recommender = full_engine
    notice = "Notice from Apex Dynamics: PO-4482 / SH-8921 delayed by 14 days."
    extracted = extractor.extract(notice)
    grounding = grounding_engine.ground(extracted)
    assessment = analyzer.analyze(notice, extracted, grounding)
    final_assessment = recommender.generate_options(assessment)

    assert final_assessment.has_system_impact is True
    assert len(final_assessment.affected_orders) > 0

    top_order = final_assessment.affected_orders[0]
    assert len(top_order.options) >= 3  # Expedite, Reallocate, Part-Ship, Reschedule

    # Verify each option has transparent pros, cons, and financial figures
    for opt in top_order.options:
        assert len(opt.pros) > 0
        assert len(opt.cons) > 0
        assert opt.new_delivery_date is not None

    # Verify at least one option is marked recommended with plain rationale
    rec_opt = next((o for o in top_order.options if o.is_recommended), None)
    assert rec_opt is not None
    assert rec_opt.recommendation_rationale is not None

def test_operator_commits_decision(repo, full_engine):
    extractor, grounding_engine, analyzer, recommender = full_engine
    notice = "Notice from Apex Dynamics: PO-4482 / SH-8921 delayed by 14 days."
    extracted = extractor.extract(notice)
    grounding = grounding_engine.ground(extracted)
    assessment = recommender.generate_options(analyzer.analyze(notice, extracted, grounding))

    top_order = assessment.affected_orders[0]
    rec_opt = next(o for o in top_order.options if o.is_recommended)

    decision_payload = {
        "assessment_id": assessment.assessment_id,
        "order_id": top_order.order_id,
        "chosen_option_type": rec_opt.option_type.value,
        "chosen_option_id": rec_opt.option_id,
        "operator_notes": "Approved priority handling per recommendation.",
        "approved_by": "Senior Operations Lead"
    }

    result = repo.apply_operator_decision(decision_payload)
    assert result["status"] == "success"
    assert result["order_id"] == top_order.order_id

    # Verify updated order state in DB
    updated_order = repo.get_customer_order(top_order.order_id)
    assert updated_order.status != "unfulfilled"

    # Verify audit trail
    audit = repo.get_audit_log()
    decision_events = [e for e in audit if e.get("event") == "OPERATOR_DECISION_COMMITTED"]
    assert len(decision_events) >= 1
    assert decision_events[-1]["operator"] == "Senior Operations Lead"
