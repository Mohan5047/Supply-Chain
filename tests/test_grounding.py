import pytest
from src.db.repository import DataRepository
from src.engine.extractor import NoticeExtractor
from src.engine.grounding import GroundingEngine
from src.core.types import MatchConfidence

@pytest.fixture
def repo():
    r = DataRepository()
    r.reset_to_seed()
    return r

@pytest.fixture
def grounding_engine(repo):
    return GroundingEngine(repo)

@pytest.fixture
def extractor():
    return NoticeExtractor()

def test_grounding_exact_po_and_shipment(extractor, grounding_engine):
    notice = "Notice from Apex Dynamics: PO-4482 / SH-8921 delayed by 14 days."
    extracted = extractor.extract(notice)
    result = grounding_engine.ground(extracted)

    assert result.has_active_matches is True
    assert result.resolved_shipment_id == "SH-8921"
    assert result.resolved_supplier_id == "SUP-001"
    assert result.resolved_sku_id == "SKU-1049"
    assert any(m.confidence == MatchConfidence.EXACT for m in result.matches)

def test_grounding_false_alarm_discipline_to_refuse(extractor, grounding_engine):
    notice = "Acme Logistics reporting Route 9 closure in Denver, regional trucking halted for 5 days."
    extracted = extractor.extract(notice)
    result = grounding_engine.ground(extracted)

    # Acme is in the database, BUT has no active inbound POs, shipments, or stock allocations
    assert result.has_active_matches is False
    assert "no active" in result.reasoning.lower()

def test_grounding_regional_ambiguity_detection(extractor, grounding_engine):
    notice = "All Taiwan suppliers facing 6-day disruption due to typhoon."
    extracted = extractor.extract(notice)
    result = grounding_engine.ground(extracted)

    assert result.is_ambiguous is True
    assert result.ambiguity_reason is not None
    ambiguous_match = next((m for m in result.matches if m.is_ambiguous), None)
    assert ambiguous_match is not None
    assert len(ambiguous_match.candidate_matches) >= 2
    supplier_ids = [c["supplier_id"] for c in ambiguous_match.candidate_matches]
    assert "SUP-002" in supplier_ids
    assert "SUP-003" in supplier_ids
