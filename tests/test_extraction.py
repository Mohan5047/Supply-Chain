import pytest
from src.engine.extractor import NoticeExtractor

@pytest.fixture
def extractor():
    return NoticeExtractor()

def test_extract_supplier_halt(extractor):
    notice = (
        "URGENT: Production line 3 at Apex Dynamics suffered pump failure. "
        "All APX-902 sensor assemblies for PO-4482 (Shipment SH-8921) delayed by 14 days."
    )
    extracted = extractor.extract(notice)
    assert "PO-4482" in extracted.mentioned_pos
    assert "SH-8921" in extracted.mentioned_shipments
    assert extracted.delay_days == 14
    assert extracted.incident_type == "production_halt"
    assert any("Apex" in s for s in extracted.mentioned_suppliers)

def test_extract_carrier_delay(extractor):
    notice = (
        "Carrier Maersk Line reports container MSKU-8839210 at Port of Long Beach "
        "delayed by 10 days affecting automotive microcontrollers."
    )
    extracted = extractor.extract(notice)
    assert any("Maersk" in c for c in extracted.mentioned_carriers)
    assert "MSKU-8839210" in extracted.mentioned_shipments
    assert extracted.delay_days == 10
    assert extracted.incident_type == "port_congestion"

def test_extract_warehouse_incident(extractor):
    notice = (
        "INCIDENT REPORT: WH-MAIN Chicago facility Bay C-12 forklift accident crushed "
        "150 units of battery pack BAT-4400. Scrapped immediately."
    )
    extracted = extractor.extract(notice)
    assert "WH-MAIN" in extracted.mentioned_warehouses
    assert extracted.quantity_affected == 150
    assert extracted.incident_type == "warehouse_damage"

def test_extract_false_alarm(extractor):
    notice = (
        "TRAFFIC ADVISORY: Acme Logistics announces complete closure of Route 9 near Denver. "
        "Delays of up to 5 days expected."
    )
    extracted = extractor.extract(notice)
    assert any("Acme" in s for s in extracted.mentioned_suppliers)
    assert extracted.delay_days == 5
    assert extracted.incident_type == "traffic_closure"

def test_extract_ambiguous_regional_notice(extractor):
    notice = (
        "Typhoon warning in Taiwan has halted all supplier shipments for 6 days."
    )
    extracted = extractor.extract(notice)
    assert extracted.delay_days == 6
    assert any("Taiwan" in s for s in extracted.mentioned_suppliers)
