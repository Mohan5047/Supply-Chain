import re
import json
import logging
from typing import Dict, Any, Optional
from src.core.config import GEMINI_API_KEY, GEMINI_MODEL
from src.models.disruption import ExtractedEntities

logger = logging.getLogger(__name__)

class NoticeExtractor:
    """Extracts operational entities, disruption metrics, and severity from unstructured text.
    
    Supports Google Gemini LLM when configured, with an automated, robust
    heuristic regex/NLP engine fallback if the API key is missing or unavailable.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or GEMINI_API_KEY
        self.model_name = model_name or GEMINI_MODEL
        self._llm_available = bool(self.api_key)
        if self._llm_available:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.genai_client = genai.GenerativeModel(self.model_name)
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}. Falling back to heuristic NLP.")
                self._llm_available = False

    def extract(self, notice_text: str) -> ExtractedEntities:
        """Extract structured operational disruption signals from raw notice text."""
        if self._llm_available:
            try:
                return self._extract_with_gemini(notice_text)
            except Exception as e:
                logger.warning(f"LLM extraction encountered error: {e}. Falling back to heuristic NLP.")
        
        return self._extract_with_heuristics(notice_text)

    def _extract_with_gemini(self, notice_text: str) -> ExtractedEntities:
        """Use Gemini model with structured JSON prompting."""
        prompt = f"""
You are an expert supply chain operations parser. Analyze the following inbound disruption notice:

<NOTICE>
{notice_text}
</NOTICE>

Extract operational disruption details in valid JSON format matching this exact schema:
{{
  "mentioned_suppliers": ["list of supplier names or loose mentions found"],
  "mentioned_carriers": ["list of carriers or transport companies found"],
  "mentioned_skus": ["list of part numbers, codes, or product descriptions found"],
  "mentioned_pos": ["list of purchase order numbers, e.g. PO-4482"],
  "mentioned_shipments": ["list of shipment IDs or container IDs, e.g. SH-8921, MSKU-8839210"],
  "mentioned_warehouses": ["list of warehouses or facilities mentioned, e.g. WH-MAIN"],
  "delay_days": <integer delay in days if mentioned, or null>,
  "new_date": "<revised arrival date formatted as YYYY-MM-DD or date string if mentioned, or null>",
  "quantity_affected": <integer quantity of damaged or halted units if mentioned, or null>,
  "incident_type": "<one of: production_halt, carrier_delay, warehouse_damage, weather_delay, traffic_closure, general_delay>",
  "severity_stated": "<critical, high, moderate, low>",
  "raw_summary": "<brief 1-sentence summary of what happened>"
}}
Return ONLY valid JSON.
"""
        response = self.genai_client.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        data = json.loads(response.text)
        return ExtractedEntities(**data)

    def _extract_with_heuristics(self, text: str) -> ExtractedEntities:
        """Deterministic regex and heuristic NLP extractor for guaranteed zero-failure resilience."""
        text_lower = text.lower()
        
        # 1. Purchase Orders (e.g. PO-4482, PO #3910)
        po_matches = re.findall(r"\bPO[-\s]?#?(\d{4,6})\b", text, re.IGNORECASE)
        mentioned_pos = [f"PO-{num}" for num in po_matches]

        # 2. Inbound Shipments / Containers (e.g. SH-8921, MSKU-8839210)
        shipment_matches = re.findall(r"\bSH[-\s]?(\d{4,5})\b", text, re.IGNORECASE)
        mentioned_shipments = [f"SH-{num}" for num in shipment_matches]
        container_matches = re.findall(r"\b([A-Z]{4}[-\s]?\d{7})\b", text)
        mentioned_shipments.extend(container_matches)

        # 3. Warehouses (e.g. WH-MAIN, Chicago, Fremont, Long Beach)
        mentioned_warehouses = []
        if "wh-main" in text_lower or "chicago" in text_lower:
            mentioned_warehouses.append("WH-MAIN")
        if "fremont" in text_lower:
            mentioned_warehouses.append("Fremont Facility")
        if "long beach" in text_lower:
            mentioned_warehouses.append("Port of Long Beach")

        # 4. Suppliers & Carriers
        mentioned_suppliers = []
        if "apex" in text_lower:
            mentioned_suppliers.append("Apex Precision Technologies")
        if "tsmc" in text_lower or "taiwan semiconductor" in text_lower:
            mentioned_suppliers.append("TSMC Micro Systems")
        if "foxconn" in text_lower:
            mentioned_suppliers.append("Foxconn Components Corp")
        if "taiwan" in text_lower and not mentioned_suppliers:
            # Regional ambiguity
            mentioned_suppliers.append("Taiwan Suppliers")
        if "nordic" in text_lower:
            mentioned_suppliers.append("Nordic Lithium & Power")
        if "shenzhen" in text_lower:
            mentioned_suppliers.append("Shenzhen Optical Electronics")
        if "acme" in text_lower:
            mentioned_suppliers.append("Acme Logistics & Freight")

        mentioned_carriers = []
        if "fedex" in text_lower:
            mentioned_carriers.append("FedEx Freight Express")
        if "maersk" in text_lower:
            mentioned_carriers.append("Maersk Line")
        if "evergreen" in text_lower:
            mentioned_carriers.append("Evergreen Marine")
        if "dhl" in text_lower:
            mentioned_carriers.append("DHL Global Forwarding")
        if "acme" in text_lower:
            mentioned_carriers.append("Acme Freight")

        # 5. SKUs / Products
        mentioned_skus = []
        if "apx-902" in text_lower or "optical sensor" in text_lower or "sku-1049" in text_lower:
            mentioned_skus.append("APX-902 / SKU-1049")
        if "mc-320" in text_lower or "microcontroller" in text_lower or "sku-2088" in text_lower or "mcu" in text_lower:
            mentioned_skus.append("MC-320 / SKU-2088")
        if "bat-4400" in text_lower or "battery pack" in text_lower or "lithium" in text_lower or "sku-3150" in text_lower:
            mentioned_skus.append("BAT-4400 / SKU-3150")
        if "pwr-12v" in text_lower or "converter" in text_lower or "sku-4022" in text_lower:
            mentioned_skus.append("PWR-12V / SKU-4022")
        if "trx-10g" in text_lower or "transceiver" in text_lower or "sku-5011" in text_lower:
            mentioned_skus.append("TRX-10G / SKU-5011")

        # 6. Delays (e.g. "14 days", "delay of 10 days", "delayed by 6 days", "for 6 days")
        delay_days = None
        delay_match = re.search(r"(?:delayed by|delay of|pushed back by|stalled by|delays of up to|halted for|stalled for|for)\s*(\d{1,3})\s*(?:business |calendar )?days", text, re.IGNORECASE)
        if not delay_match:
            delay_match = re.search(r"(\d{1,3})[-\s]day\s*(?:delay|disruption|stall|closure)", text, re.IGNORECASE)
        if not delay_match:
            delay_match = re.search(r"\b(\d{1,3})\s*(?:business |calendar )?days\b", text, re.IGNORECASE)
        if delay_match:
            delay_days = int(delay_match.group(1))

        # 7. Quantity affected / damaged / lost
        quantity_affected = None
        qty_match = re.search(r"(?:crushed|crushing|destroying|destroyed|compromised|damaged|damaging|loss of|written off|total of|scrapped)\s*(\d{1,5})\s*(?:units?|batteries|battery|packs?|sensors?|pieces?|pallets?)", text, re.IGNORECASE)
        if not qty_match:
            qty_match = re.search(r"\b(\d{1,5})\s*units\b", text, re.IGNORECASE)
        if qty_match:
            quantity_affected = int(qty_match.group(1))

        # 8. Incident type classification
        incident_type = "general_delay"
        if "pump failure" in text_lower or "halt" in text_lower or "line 3" in text_lower or "factory" in text_lower:
            incident_type = "production_halt"
        elif "forklift" in text_lower or "bay c-12" in text_lower or "warehouse" in text_lower and "crushed" in text_lower:
            incident_type = "warehouse_damage"
        elif "port of long beach" in text_lower or "congestion" in text_lower or "berth" in text_lower or "vessel" in text_lower:
            incident_type = "port_congestion"
        elif "typhoon" in text_lower or "weather" in text_lower or "flood" in text_lower:
            incident_type = "weather_delay"
        elif "route 9" in text_lower or "roadway" in text_lower or "closure" in text_lower or "traffic" in text_lower:
            incident_type = "traffic_closure"

        # 9. Stated Severity
        severity = "moderate"
        if "urgent" in text_lower or "catastrophic" in text_lower or "major" in text_lower or "emergency" in text_lower:
            severity = "critical" if delay_days and delay_days >= 10 else "high"
        elif "minor" in text_lower or "advisory" in text_lower:
            severity = "low"

        # 10. Summary
        raw_summary = f"{incident_type.replace('_', ' ').capitalize()} reported affecting {', '.join(mentioned_suppliers or mentioned_carriers or ['logistics network'])}"
        if delay_days:
            raw_summary += f" with projected delay of {delay_days} days"

        return ExtractedEntities(
            mentioned_suppliers=mentioned_suppliers,
            mentioned_carriers=mentioned_carriers,
            mentioned_skus=mentioned_skus,
            mentioned_pos=mentioned_pos,
            mentioned_shipments=mentioned_shipments,
            mentioned_warehouses=mentioned_warehouses,
            delay_days=delay_days,
            new_date=None,
            quantity_affected=quantity_affected,
            incident_type=incident_type,
            severity_stated=severity,
            raw_summary=raw_summary
        )
