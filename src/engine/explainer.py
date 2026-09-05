import logging
from typing import Dict, Any, Optional
from src.core.config import GEMINI_API_KEY, GEMINI_MODEL
from src.models.disruption import DisruptionImpactAssessment, OrderImpactDetail, ResolutionOption

logger = logging.getLogger(__name__)

class GroundedExplainer:
    """Produces human operator briefings and customer/carrier communications grounded in system data."""

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
                logger.warning(f"Failed to initialize Gemini client for explainer: {e}")
                self._llm_available = False

    def generate_customer_email(self, assessment: DisruptionImpactAssessment, order: OrderImpactDetail, option: ResolutionOption) -> str:
        """Draft a transparent, customer-facing notification email."""
        if self._llm_available:
            try:
                return self._llm_draft_email(assessment, order, option)
            except Exception as e:
                logger.warning(f"LLM email drafting failed: {e}. Using grounded template.")

        return self._template_customer_email(assessment, order, option)

    def generate_supplier_escalation(self, assessment: DisruptionImpactAssessment) -> str:
        """Draft a formal supplier escalation notice."""
        supplier_name = "Supplier Dispatch Team"
        for m in assessment.grounding.matches:
            if m.entity_type == "supplier" and m.matched_name:
                supplier_name = m.matched_name

        shipment_id = assessment.grounding.resolved_shipment_id or "Pending Shipment"
        sku_id = assessment.grounding.resolved_sku_id or "Disrupted Component"

        return (
            f"SUBJECT: URGENT: Operational Escalation - Inbound {shipment_id} / Critical Part {sku_id}\n\n"
            f"Dear {supplier_name} Account Management,\n\n"
            f"We have ingested and analyzed your recent operational disruption notice regarding {shipment_id}.\n\n"
            f"Our deterministic impact assessment indicates this delay directly imperils {assessment.total_orders_impacted} committed customer orders, "
            f"representing ${assessment.total_sla_penalty_risk:,.2f} in immediate contractual delay penalties.\n\n"
            f"REQUIRED NEXT STEPS:\n"
            f"1. Please immediately verify whether emergency air express expediting can be activated.\n"
            f"2. Confirm the earliest possible partial dispatch timestamp.\n"
            f"3. Provide daily transit telematics and carrier milestone tracking.\n\n"
            f"We request a written response within 4 hours to confirm expedited booking.\n\n"
            f"Sincerely,\n"
            f"Supply Chain Operations Command\n"
            f"Central Distribution Hub"
        )

    def _template_customer_email(self, assessment: DisruptionImpactAssessment, order: OrderImpactDetail, option: ResolutionOption) -> str:
        return (
            f"SUBJECT: Delivery Update: Purchase Order #{order.order_id} - Scheduled Delivery Plan\n\n"
            f"Dear {order.customer_name} Supply Chain & Procurement Team,\n\n"
            f"We are writing to provide a proactive update regarding your scheduled order #{order.order_id} for "
            f"{order.quantity_demanded} units of {order.sku_name} (Part #{order.sku_id}), originally promised for {order.promise_date}.\n\n"
            f"SITUATION OVERVIEW:\n"
            f"Our logistics monitoring system detected an upstream supply disruption ({assessment.category.value}). "
            f"Rather than allowing an unannounced delay, our operations team has formulated a targeted mitigation plan.\n\n"
            f"ACTION PLAN & PROPOSED RESOLUTION:\n"
            f"• Resolution Type: {option.title}\n"
            f"• Projected Delivery Date: {option.new_delivery_date}\n"
            f"• Solution Summary: {option.description}\n"
            f"• Operational Impact: {option.customer_impact_summary}\n\n"
            f"Our dedicated logistics desk is actively monitoring this batch. If you require specialized staging or modified split deliveries, "
            f"please reply directly to this notice.\n\n"
            f"Best regards,\n"
            f"Customer Fulfillment Desk\n"
            f"Distributor Operations Hub"
        )

    def _llm_draft_email(self, assessment: DisruptionImpactAssessment, order: OrderImpactDetail, option: ResolutionOption) -> str:
        prompt = f"""
Draft a professional, proactive customer notification email based ONLY on the verified data below. Do NOT invent facts.

Customer: {order.customer_name} ({order.customer_tier.value} Tier)
Order ID: {order.order_id}
Promised Date: {order.promise_date}
Item: {order.sku_name} ({order.sku_id}), Quantity: {order.quantity_demanded}
Disruption Cause: {assessment.category.value}
Chosen Resolution: {option.title}
New Delivery Date: {option.new_delivery_date}
Resolution Details: {option.description}
Customer Impact: {option.customer_impact_summary}

Keep the tone professional, transparent, and proactive.
"""
        response = self.genai_client.generate_content(prompt)
        return response.text.strip()
