/**
 * ChainSolve AI - Supplier Disruption Response Assistant (PS08)
 * Full Interactive Operator Workbench & Multi-Persona Stakeholder Portals
 */

// ============================================================================
// EMBEDDED FALLBACK DATA FOR ZERO-DEPENDENCY / GITHUB PAGES DEPLOYMENT
// ============================================================================
const FALLBACK_SCENARIOS = [
  {
    "id": "scenario_1_critical_apex",
    "title": "Scenario 1: Critical Factory Halt (Apex APX-902 Sensors)",
    "category": "Supplier Production Halt",
    "difficulty": "Standard / High Impact",
    "description": "Supplier email reporting catastrophic hydraulic failure delaying sensor assembly dispatch by 14 days. Impacts mission-critical Platinum customer orders (Tesla, Siemens).",
    "notice_text": "From: Marcus Vance <dispatch@apexprecision.com>
Subject: URGENT: Production Line 3 Halt - PO-4482 / APX-902 Dispatch Delay
Date: September 5, 2026 06:40 AM

Logistics Team,

We regret to inform you that earlier this morning Line 3 at our Apex Dynamics Fremont facility experienced a major hydraulic pump failure. All production of our APX-902 optical sensor assemblies scheduled for Inbound Shipment SH-8921 (PO-4482) is halted while technicians source replacement valves.

Dispatch was originally scheduled for delivery to your Chicago warehouse by September 8th. The revised estimated arrival date is now pushed back by 14 days to September 22, 2026. We can arrange partial air express upon request once initial testing resumes next week.

We apologize for the disruption.

Best regards,
Marcus Vance
Apex Precision Technologies",
    "structured_input": {
      "disruption_type": "Supplier Production Halt",
      "supplier_id": "SUP-001",
      "po_number": "PO-4482",
      "shipment_id": "SH-8921",
      "sku_id": "SKU-1049",
      "disruption_date": "2026-09-05",
      "delay_days": 14,
      "affected_location": "Fremont, CA",
      "quantity_affected": null,
      "reason": "Production Line 3 hydraulic pump failure halting APX-902 assembly dispatch.",
      "severity": "Critical"
    },
    "expected_outcome": {
      "has_impact": true,
      "disrupted_shipment": "SH-8921",
      "supplier_id": "SUP-001",
      "affected_sku": "SKU-1049",
      "delay_days": 14,
      "primary_impacted_orders": [
        "ORD-501",
        "ORD-502"
      ]
    }
  },
  {
    "id": "scenario_2_carrier_port_congestion",
    "title": "Scenario 2: Carrier Delay / Port Congestion (Maersk Long Beach)",
    "category": "Carrier/Shipment Delay",
    "difficulty": "Moderate / Trade-offs",
    "description": "Ocean carrier notice detailing port congestion at Long Beach delaying container of automotive microcontrollers by 10 days.",
    "notice_text": "EXCEPTION ALERT: OCEAN FREIGHT DISRUPTION
CARRIER: Maersk Line
VESSEL: MSC VALERIA / Voyage 402W
CONTAINER: MSKU-8839210 (Inbound SH-7714, PO-3910)
DESTINATION: Chicago Logistics Hub

Please be advised that due to severe berth congestion, labor shortages, and railhead bottlenecks at the Port of Long Beach, discharge of container MSKU-8839210 carrying 32-bit automotive microcontrollers (MC-320) cannot proceed as scheduled.

The scheduled arrival date of September 12, 2026 is delayed by 10 calendar days. Expected Chicago rail terminal arrival is rescheduled for September 22, 2026. Emergency off-dock drayage & air freight forwarding can be quoted upon escalation.",
    "structured_input": {
      "disruption_type": "Carrier/Shipment Delay",
      "supplier_id": "SUP-002",
      "po_number": "PO-3910",
      "shipment_id": "SH-7714",
      "sku_id": "SKU-2088",
      "disruption_date": "2026-09-05",
      "delay_days": 10,
      "affected_location": "Port of Long Beach",
      "quantity_affected": null,
      "reason": "Berth and railhead bottlenecks at Port of Long Beach delaying container MSKU-8839210.",
      "severity": "High"
    },
    "expected_outcome": {
      "has_impact": true,
      "disrupted_shipment": "SH-7714",
      "supplier_id": "SUP-002",
      "affected_sku": "SKU-2088",
      "delay_days": 10,
      "primary_impacted_orders": [
        "ORD-503"
      ]
    }
  },
  {
    "id": "scenario_3_warehouse_incident",
    "title": "Scenario 3: Internal Warehouse Incident (Bay C-12 Forklift Crush)",
    "category": "Warehouse Incident",
    "difficulty": "Immediate Stock Destruction",
    "description": "Internal warehouse incident report detailing forklift collision destroying 150 units of high-density lithium battery packs.",
    "notice_text": "INCIDENT REPORT #IR-2026-0905-01
FACILITY: WH-MAIN Chicago Logistics Hub
ZONE: Bay C-12 Cross-Dock Aisle
TIME: 06:15 AM CST
REPORTED BY: Warehouse Supervisor D. Miller

During morning inbound cross-dock staging, forklift #4 suffered a mast cable snap while transporting two pallet loads of industrial lithium battery packs (SKU BAT-4400 / SKU-3150).

Total of 150 battery pack units fell from height and sustained catastrophic casing fractures and cell puncture. Fire suppression protocols were activated and Bay C-12 quarantine was established. All 150 units have been formally condemned and written off to salvage scrap. Physical available inventory in WH-MAIN has dropped immediately from 180 to 30 units.",
    "structured_input": {
      "disruption_type": "Warehouse Incident",
      "supplier_id": "SUP-004",
      "po_number": null,
      "shipment_id": null,
      "sku_id": "SKU-3150",
      "disruption_date": "2026-09-05",
      "delay_days": 18,
      "affected_location": "WH-MAIN",
      "quantity_affected": 150,
      "reason": "Forklift collision in Bay C-12 destroyed 150 units of BAT-4400 battery packs.",
      "severity": "Critical"
    },
    "expected_outcome": {
      "has_impact": true,
      "disrupted_shipment": null,
      "supplier_id": null,
      "affected_sku": "SKU-3150",
      "quantity_lost": 150,
      "primary_impacted_orders": [
        "ORD-505"
      ]
    }
  },
  {
    "id": "scenario_4_false_alarm_no_impact",
    "title": "Scenario 4: False Alarm / Zero Impact (Acme Regional Road Closure)",
    "category": "Other",
    "difficulty": "Edge Case: False Alarm",
    "description": "Alarming emergency notice from Acme Logistics regarding Route 9 road closure, but distributor has no pending orders or shipments with Acme.",
    "notice_text": "URGENT LOGISTICS ADVISORY: ACME FREIGHT & LOGISTICS
BULLETIN: #ADV-9921-DENVER
EFFECTIVE: IMMEDIATELY

Severe mudslides and structural damage have forced the Colorado Department of Transportation to close US Route 9 near Silverthorne / Denver junction in both directions. All Acme regional line-haul trucking and freight operations are suspended for the next 72 hours. Shipments transiting Denver hub will face extensive rerouting delays of up to 5 business days.

All dispatch operations advised to take immediate emergency measures.",
    "structured_input": {
      "disruption_type": "Other",
      "supplier_id": "SUP-006",
      "po_number": null,
      "shipment_id": null,
      "sku_id": null,
      "disruption_date": "2026-09-05",
      "delay_days": 5,
      "affected_location": "Denver, CO",
      "quantity_affected": null,
      "reason": "Route 9 closure near Denver affecting Acme freight trucking operations.",
      "severity": "Low"
    },
    "expected_outcome": {
      "has_impact": false,
      "reason": "Acme Logistics is listed as a potential partner, but no active inbound purchase orders or scheduled shipments are pending via Acme or routing through Denver. System reports verified NO IMPACT."
    }
  },
  {
    "id": "scenario_5_ambiguous_entity",
    "title": "Scenario 5: Ambiguous / Underspecified Notice (Taiwan Weather Delay)",
    "category": "Carrier/Shipment Delay",
    "difficulty": "Edge Case: Entity Disambiguation",
    "description": "Vague regional weather alert naming 'Taiwan supplier shipments' without identifying whether it affects TSMC Micro or Foxconn Components.",
    "notice_text": "REGIONAL SUPPLY ADVISORY: Super Typhoon Gaemi has made landfall on the north-east coast of Taiwan. Port operations at Kaohsiung and Keelung, as well as freight terminals at Taoyuan International Airport, have ceased loading operations for safety. All shipments originating from our Taiwan suppliers will be stalled by at least 6 days pending civil aviation and maritime clearance.",
    "structured_input": {
      "disruption_type": "Carrier/Shipment Delay",
      "supplier_id": "SUP-002",
      "po_number": "PO-3910",
      "shipment_id": "SH-7714",
      "sku_id": "SKU-2088",
      "disruption_date": "2026-09-05",
      "delay_days": 6,
      "affected_location": "Kaohsiung Port, Taiwan",
      "quantity_affected": null,
      "reason": "Super Typhoon Gaemi causing port closures and 6-day shipping delays.",
      "severity": "Medium"
    },
    "expected_outcome": {
      "has_impact": true,
      "is_ambiguous": true,
      "candidate_suppliers": [
        "SUP-002",
        "SUP-003"
      ],
      "action_required": "Prompt operator to select which supplier/shipment is confirmed, or simulate both branches."
    }
  },
  {
    "id": "scenario_6_customs_regulatory_hold",
    "title": "Scenario 6: Customs & Regulatory Hold (Port of Rotterdam Lithium Audit)",
    "category": "Carrier/Shipment Delay",
    "difficulty": "International Maritime & Compliance",
    "description": "European maritime customs authority has issued a mandatory compliance hold on container DHL-7710928 from Nordic Lithium awaiting UN38.3 battery certification, delaying inbound shipment SH-9011 by 8 days.",
    "notice_text": "CUSTOMS COMPLIANCE NOTIFICATION #EU-HL-2026-8841
PORT AUTHORITY: Port of Rotterdam Maritime Terminal
CONSIGNEE: Central Logistics Hub Chicago (WH-MAIN)
INBOUND CONSIGNMENT: SH-9011 / PO-6200
CARRIER: DHL Global Forwarding (Tracking #DHL-7710928)
ORIGIN: Oslo, Norway (Nordic Lithium & Power)

Please be informed that container DHL-7710928 containing 150 units of BAT-4400 Industrial Lithium Battery Packs (SKU-3150) has been selected for mandatory secondary UN38.3 thermal runaway testing verification. Maritime clearance is temporarily halted for approximately 8 calendar days pending document apostille from the manufacturer.",
    "structured_input": {
      "disruption_type": "Carrier/Shipment Delay",
      "supplier_id": "SUP-004",
      "po_number": "PO-6200",
      "shipment_id": "SH-9011",
      "sku_id": "SKU-3150",
      "disruption_date": "2026-09-05",
      "delay_days": 8,
      "affected_location": "Oslo, Norway",
      "quantity_affected": null,
      "reason": "Rotterdam customs mandatory UN38.3 compliance inspection delaying container DHL-7710928.",
      "severity": "High"
    },
    "expected_outcome": {
      "has_impact": true,
      "disrupted_shipment": "SH-9011",
      "supplier_id": "SUP-004",
      "affected_sku": "SKU-3150",
      "delay_days": 8,
      "primary_impacted_orders": [
        "ORD-505"
      ]
    }
  },
  {
    "id": "scenario_7_quality_defect_quarantine",
    "title": "Scenario 7: Component Quality Quarantine (Foxconn Micro-Solder Inspection)",
    "category": "Supplier Production Halt",
    "difficulty": "Quality Assurance & Batch Defect",
    "description": "Quality bulletin from Foxconn Components Taipei halting dispatch of step-down power converters (SKU-4022) for 12 days to perform non-destructive X-ray inspection of solder joints.",
    "notice_text": "QUALITY ENGINEERING ADVISORY #QA-FXC-2026-09
SUPPLIER: Foxconn Components Corp (Taipei, Taiwan)
COMMODITY: Industrial Step-Down Power Converter 12V/5A (SKU-4022 / PWR-12V)
TARGET SHIPMENT: SH-6520 (PO-5102)

During routine automated optical inspection (AOI) on Subassembly Line B, engineering identified intermittent solder bridging on primary induction coils. As a mandatory safety precaution, 400 units designated for Inbound Shipment SH-6520 are placed in technical quarantine for comprehensive X-ray verification and thermal stress recertification.

Revised dispatch will be postponed by 12 calendar days. Initial units passing stress test will be released on rolling batches.",
    "structured_input": {
      "disruption_type": "Supplier Production Halt",
      "supplier_id": "SUP-003",
      "po_number": "PO-5102",
      "shipment_id": "SH-6520",
      "sku_id": "SKU-4022",
      "disruption_date": "2026-09-05",
      "delay_days": 12,
      "affected_location": "Taipei, Taiwan",
      "quantity_affected": null,
      "reason": "Intermittent solder bridging detected on Subassembly Line B requiring 12-day quarantine inspection.",
      "severity": "Medium"
    },
    "expected_outcome": {
      "has_impact": true,
      "disrupted_shipment": "SH-6520",
      "supplier_id": "SUP-003",
      "affected_sku": "SKU-4022",
      "delay_days": 12,
      "primary_impacted_orders": [
        "ORD-506"
      ]
    }
  },
  {
    "id": "scenario_8_demand_surge_rush",
    "title": "Scenario 8: Priority Acceleration Surge (Tesla Emergency Production Pull)",
    "category": "Other",
    "difficulty": "High Priority Expedite Surge",
    "description": "Tesla Energy Solutions requests emergency priority delivery acceleration of 120 units APX-902 sensors by 3 days, requiring urgent stock reallocation from non-critical orders to avoid vehicle line halt.",
    "notice_text": "MEMORANDUM: GLOBAL VEHICLE MANUFACTURING OPERATIONS
CUSTOMER: Tesla Energy Solutions (Austin Gigafactory)
SUBJECT: CRITICAL ESCALATION - APX-902 Sensor Assembly Delivery Schedule Acceleration
DATE: September 5, 2026

Due to unprecedented ramp in Model Y / Megapack power conditioning unit output, Austin Gigafactory requires delivery of 120 units High-Precision Optical Sensors (SKU-1049 / APX-902) accelerated from September 10th to September 7th (3-day acceleration).

Failure to meet this expedited gate schedule will incur statutory $500/day tier SLA delivery penalties and risk vehicle final assembly bottleneck. Proactive stock reallocation or emergency expedited air delivery requested immediately.",
    "structured_input": {
      "disruption_type": "Other",
      "supplier_id": "SUP-001",
      "po_number": "PO-4482",
      "shipment_id": "SH-8921",
      "sku_id": "SKU-1049",
      "disruption_date": "2026-09-05",
      "delay_days": 3,
      "affected_location": "Fremont, CA",
      "quantity_affected": null,
      "reason": "Austin Gigafactory urgent production acceleration request for SKU-1049 optical sensors.",
      "severity": "High"
    },
    "expected_outcome": {
      "has_impact": true,
      "disrupted_shipment": "SH-8921",
      "supplier_id": "SUP-001",
      "affected_sku": "SKU-1049",
      "delay_days": 3,
      "primary_impacted_orders": [
        "ORD-501"
      ]
    }
  }
];

const FALLBACK_SEED_DATA = {
  "system_current_date": "2026-09-05",
  "suppliers": [
    {
      "supplier_id": "SUP-001",
      "name": "Apex Precision Technologies",
      "aliases": ["Apex Dynamics", "Apex Precision", "Apex Tech", "Apex Sensors", "Apex"],
      "contact_email": "dispatch@apexprecision.com",
      "location": "Fremont, CA, USA",
      "reliability_score": 0.94,
      "expedite_available": true,
      "expedite_cost_multiplier": 1.45
    },
    {
      "supplier_id": "SUP-002",
      "name": "TSMC Micro Systems",
      "aliases": ["TSMC", "Taiwan Semiconductor", "TSMC Micro", "Taiwan Semi"],
      "contact_email": "orders@tsmc-micro.tw",
      "location": "Hsinchu Science Park, Taiwan",
      "reliability_score": 0.98,
      "expedite_available": true,
      "expedite_cost_multiplier": 1.6
    },
    {
      "supplier_id": "SUP-003",
      "name": "Foxconn Components Corp",
      "aliases": ["Foxconn", "Foxconn Taiwan", "Foxconn Comps", "Foxconn Electronics"],
      "contact_email": "logistics@foxconn-comps.tw",
      "location": "Taipei, Taiwan",
      "reliability_score": 0.91,
      "expedite_available": true,
      "expedite_cost_multiplier": 1.35
    },
    {
      "supplier_id": "SUP-004",
      "name": "Nordic Lithium & Power",
      "aliases": ["Nordic Lithium", "Nordic Power", "Nordic Batt", "Nordic"],
      "contact_email": "support@nordiclithium.no",
      "location": "Oslo, Norway",
      "reliability_score": 0.88,
      "expedite_available": false,
      "expedite_cost_multiplier": 1.0
    },
    {
      "supplier_id": "SUP-005",
      "name": "Shenzhen Optical Electronics",
      "aliases": ["Shenzhen Optics", "Shenzhen Opto", "Shenzhen Electronics"],
      "contact_email": "sales@shenzhenoptics.cn",
      "location": "Shenzhen, China",
      "reliability_score": 0.89,
      "expedite_available": true,
      "expedite_cost_multiplier": 1.5
    },
    {
      "supplier_id": "SUP-006",
      "name": "Acme Logistics & Freight",
      "aliases": ["Acme Logistics", "Acme Freight", "Acme Carriers", "Acme"],
      "contact_email": "dispatch@acmelogistics.com",
      "location": "Denver, CO, USA",
      "reliability_score": 0.76,
      "expedite_available": false,
      "expedite_cost_multiplier": 1.0
    }
  ],
  "skus": [
    {
      "sku_id": "SKU-1049",
      "name": "High-Precision Optical Sensor Assembly",
      "aliases": ["APX-902", "APX-902 sensor", "optical sensor assembly", "Apex optical sensor", "optical sensors", "sensor assemblies"],
      "category": "Optoelectronics",
      "unit_cost": 140.0,
      "unit_price": 280.0,
      "lead_time_days": 14,
      "safety_stock_threshold": 30,
      "preferred_supplier_id": "SUP-001"
    },
    {
      "sku_id": "SKU-2088",
      "name": "Automotive Edge Microcontroller 32-Bit",
      "aliases": ["MC-320", "auto microcontroller", "edge MCU", "automotive microcontrollers", "automotive MCUs", "microcontrollers"],
      "category": "Semiconductors",
      "unit_cost": 85.0,
      "unit_price": 190.0,
      "lead_time_days": 21,
      "safety_stock_threshold": 50,
      "preferred_supplier_id": "SUP-002"
    },
    {
      "sku_id": "SKU-3150",
      "name": "Industrial High-Density Lithium Battery Pack",
      "aliases": ["BAT-4400", "lithium battery pack", "4400mAh industrial cell", "heavy-duty battery pack", "battery packs", "lithium batteries"],
      "category": "Power Systems",
      "unit_cost": 210.0,
      "unit_price": 460.0,
      "lead_time_days": 18,
      "safety_stock_threshold": 40,
      "preferred_supplier_id": "SUP-004"
    },
    {
      "sku_id": "SKU-4022",
      "name": "Industrial Step-Down Power Converter 12V/5A",
      "aliases": ["PWR-12V", "step-down converter", "DC-DC power module", "power converter", "power modules"],
      "category": "Power Electronics",
      "unit_cost": 45.0,
      "unit_price": 95.0,
      "lead_time_days": 10,
      "safety_stock_threshold": 60,
      "preferred_supplier_id": "SUP-003"
    },
    {
      "sku_id": "SKU-5011",
      "name": "Ultra-Low Latency 10G Optical Transceiver Module",
      "aliases": ["TRX-10G", "fiber transceiver", "10G optical module", "transceiver module"],
      "category": "Networking",
      "unit_cost": 310.0,
      "unit_price": 650.0,
      "lead_time_days": 25,
      "safety_stock_threshold": 25,
      "preferred_supplier_id": "SUP-005"
    }
  ],
  "inventory": [
    {
      "warehouse_id": "WH-MAIN",
      "warehouse_name": "Central Logistics Hub - Chicago",
      "sku_id": "SKU-1049",
      "on_hand": 55,
      "allocated": 50,
      "reserved_safety": 5,
      "available": 0,
      "location_bin": "Aisle-3-Bay-04"
    },
    {
      "warehouse_id": "WH-MAIN",
      "warehouse_name": "Central Logistics Hub - Chicago",
      "sku_id": "SKU-2088",
      "on_hand": 120,
      "allocated": 80,
      "reserved_safety": 20,
      "available": 20,
      "location_bin": "Aisle-2-Bay-11"
    },
    {
      "warehouse_id": "WH-MAIN",
      "warehouse_name": "Central Logistics Hub - Chicago",
      "sku_id": "SKU-3150",
      "on_hand": 180,
      "allocated": 150,
      "reserved_safety": 20,
      "available": 10,
      "location_bin": "Aisle-5-Bay-12"
    },
    {
      "warehouse_id": "WH-MAIN",
      "warehouse_name": "Central Logistics Hub - Chicago",
      "sku_id": "SKU-4022",
      "on_hand": 250,
      "allocated": 120,
      "reserved_safety": 30,
      "available": 100,
      "location_bin": "Aisle-1-Bay-08"
    },
    {
      "warehouse_id": "WH-MAIN",
      "warehouse_name": "Central Logistics Hub - Chicago",
      "sku_id": "SKU-5011",
      "on_hand": 45,
      "allocated": 40,
      "reserved_safety": 5,
      "available": 0,
      "location_bin": "Aisle-4-Bay-02"
    }
  ],
  "inbound_shipments": [
    {
      "shipment_id": "SH-8921",
      "po_number": "PO-4482",
      "supplier_id": "SUP-001",
      "carrier_name": "FedEx Freight Express",
      "tracking_number": "FX-88910411",
      "origin": "Fremont, CA",
      "destination_warehouse": "WH-MAIN",
      "status": "in_transit",
      "scheduled_arrival_date": "2026-09-08",
      "revised_arrival_date": null,
      "items": [
        {
          "sku_id": "SKU-1049",
          "quantity_ordered": 200,
          "quantity_shipped": 200
        }
      ],
      "expedite_air_available": true,
      "expedite_air_lead_time_days": 2,
      "expedite_air_cost": 1250.0
    },
    {
      "shipment_id": "SH-7714",
      "po_number": "PO-3910",
      "supplier_id": "SUP-002",
      "carrier_name": "Maersk Line",
      "tracking_number": "MSKU-8839210",
      "origin": "Kaohsiung Port, Taiwan",
      "destination_warehouse": "WH-MAIN",
      "status": "in_transit",
      "scheduled_arrival_date": "2026-09-12",
      "revised_arrival_date": null,
      "items": [
        {
          "sku_id": "SKU-2088",
          "quantity_ordered": 500,
          "quantity_shipped": 500
        }
      ],
      "expedite_air_available": true,
      "expedite_air_lead_time_days": 3,
      "expedite_air_cost": 3400.0
    },
    {
      "shipment_id": "SH-6520",
      "po_number": "PO-5102",
      "supplier_id": "SUP-003",
      "carrier_name": "Evergreen Marine",
      "tracking_number": "EGLV-991204",
      "origin": "Taipei, Taiwan",
      "destination_warehouse": "WH-MAIN",
      "status": "in_transit",
      "scheduled_arrival_date": "2026-09-20",
      "revised_arrival_date": null,
      "items": [
        {
          "sku_id": "SKU-4022",
          "quantity_ordered": 400,
          "quantity_shipped": 400
        }
      ],
      "expedite_air_available": true,
      "expedite_air_lead_time_days": 4,
      "expedite_air_cost": 1800.0
    },
    {
      "shipment_id": "SH-9011",
      "po_number": "PO-6200",
      "supplier_id": "SUP-004",
      "carrier_name": "DHL Global Forwarding",
      "tracking_number": "DHL-7710928",
      "origin": "Oslo, Norway",
      "destination_warehouse": "WH-MAIN",
      "status": "in_transit",
      "scheduled_arrival_date": "2026-09-15",
      "revised_arrival_date": null,
      "items": [
        {
          "sku_id": "SKU-3150",
          "quantity_ordered": 150,
          "quantity_shipped": 150
        }
      ],
      "expedite_air_available": false,
      "expedite_air_lead_time_days": null,
      "expedite_air_cost": 0.0
    }
  ],
  "customer_orders": [
    {
      "order_id": "ORD-501",
      "customer_name": "Tesla Energy Solutions",
      "customer_tier": "Platinum",
      "priority": 1,
      "order_date": "2026-08-28",
      "promise_date": "2026-09-10",
      "sla_penalty_per_day": 500.0,
      "destination_city": "Austin, TX",
      "status": "partially_allocated",
      "items": [
        {
          "sku_id": "SKU-1049",
          "quantity_demanded": 120,
          "quantity_allocated": 50
        }
      ],
      "notes": "Mission-critical production run. Strictly penalizes delivery delays beyond 24h."
    },
    {
      "order_id": "ORD-502",
      "customer_name": "Siemens Mobility Systems",
      "customer_tier": "Platinum",
      "priority": 1,
      "order_date": "2026-08-30",
      "promise_date": "2026-09-11",
      "sla_penalty_per_day": 350.0,
      "destination_city": "Sacramento, CA",
      "status": "unfulfilled",
      "items": [
        {
          "sku_id": "SKU-1049",
          "quantity_demanded": 60,
          "quantity_allocated": 0
        }
      ],
      "notes": "Train signaling subsystem assembly. Key strategic European partner."
    },
    {
      "order_id": "ORD-503",
      "customer_name": "Rivian Automotive",
      "customer_tier": "Gold",
      "priority": 2,
      "order_date": "2026-08-25",
      "promise_date": "2026-09-16",
      "sla_penalty_per_day": 200.0,
      "destination_city": "Normal, IL",
      "status": "partially_allocated",
      "items": [
        {
          "sku_id": "SKU-2088",
          "quantity_demanded": 300,
          "quantity_allocated": 80
        }
      ],
      "notes": "R1T powertrain electronics batch. High volume tier."
    },
    {
      "order_id": "ORD-504",
      "customer_name": "Quantum Robotics Lab",
      "customer_tier": "Gold",
      "priority": 2,
      "order_date": "2026-09-01",
      "promise_date": "2026-09-25",
      "sla_penalty_per_day": 100.0,
      "destination_city": "Boston, MA",
      "status": "unfulfilled",
      "items": [
        {
          "sku_id": "SKU-1049",
          "quantity_demanded": 20,
          "quantity_allocated": 0
        }
      ],
      "notes": "Research prototype run. Late-September target allows delivery flexibility."
    },
    {
      "order_id": "ORD-505",
      "customer_name": "General Industrial Robotics",
      "customer_tier": "Standard",
      "priority": 3,
      "order_date": "2026-08-20",
      "promise_date": "2026-09-18",
      "sla_penalty_per_day": 50.0,
      "destination_city": "Detroit, MI",
      "status": "partially_allocated",
      "items": [
        {
          "sku_id": "SKU-3150",
          "quantity_demanded": 120,
          "quantity_allocated": 120
        }
      ],
      "notes": "Standard OEM factory replenishment."
    },
    {
      "order_id": "ORD-506",
      "customer_name": "Midwest Automation Parts",
      "customer_tier": "Standard",
      "priority": 3,
      "order_date": "2026-09-02",
      "promise_date": "2026-09-28",
      "sla_penalty_per_day": 0.0,
      "destination_city": "Columbus, OH",
      "status": "allocated",
      "items": [
        {
          "sku_id": "SKU-4022",
          "quantity_demanded": 100,
          "quantity_allocated": 100
        }
      ],
      "notes": "Standard wholesale distributor order."
    }
  ]
}
;

const FALLBACK_REFERENCE_DATA = {
  system_current_date: FALLBACK_SEED_DATA.system_current_date,
  disruption_types: [
    "Supplier Production Halt",
    "Carrier/Shipment Delay",
    "Warehouse Incident",
    "Other"
  ],
  severities: ["Low", "Medium", "High", "Critical"],
  suppliers: FALLBACK_SEED_DATA.suppliers.map(s => ({
    supplier_id: s.supplier_id,
    name: s.name,
    location: s.location,
    reliability_score: s.reliability_score,
    expedite_available: s.expedite_available
  })),
  purchase_orders: FALLBACK_SEED_DATA.inbound_shipments.map(sh => ({
    po_number: sh.po_number,
    supplier_id: sh.supplier_id,
    shipment_id: sh.shipment_id,
    sku_ids: sh.items.map(it => it.sku_id)
  })),
  shipments: FALLBACK_SEED_DATA.inbound_shipments.map(sh => ({
    shipment_id: sh.shipment_id,
    po_number: sh.po_number,
    supplier_id: sh.supplier_id,
    carrier_name: sh.carrier_name,
    tracking_number: sh.tracking_number,
    origin: sh.origin,
    destination_warehouse: sh.destination_warehouse,
    scheduled_arrival_date: sh.scheduled_arrival_date,
    sku_ids: sh.items.map(it => it.sku_id)
  })),
  skus: FALLBACK_SEED_DATA.skus.map(sku => ({
    sku_id: sku.sku_id,
    name: sku.name,
    category: sku.category,
    unit_cost: sku.unit_cost,
    unit_price: sku.unit_price,
    preferred_supplier_id: sku.preferred_supplier_id
  })),
  locations: [
    { id: "WH-MAIN", name: "Central Logistics Hub - Chicago (WH-MAIN)" },
    { id: "Fremont, CA", name: "Apex Fremont Facility (Fremont, CA)" },
    { id: "Port of Long Beach", name: "Port of Long Beach Marine Terminal (CA)" },
    { id: "Kaohsiung Port, Taiwan", name: "Kaohsiung Port (Taiwan)" },
    { id: "Taipei, Taiwan", name: "Foxconn Logistics Hub (Taipei, Taiwan)" },
    { id: "Oslo, Norway", name: "Nordic Power Distribution (Oslo, Norway)" },
    { id: "Denver, CO", name: "Acme Regional Freight Hub (Denver, CO)" }
  ]
};

const FALLBACK_PROFILES = {
  operator: {
    id: "OPERATOR-01",
    name: "Username",
    title: "Operations Controller (Distributor Admin)",
    facility: "Central Logistics Hub - Chicago (WH-MAIN)",
    role: "admin"
  },
  suppliers: FALLBACK_SEED_DATA.suppliers.map(s => ({
    supplier_id: s.supplier_id,
    name: s.name,
    location: s.location,
    contact_email: s.contact_email,
    reliability_score: s.reliability_score,
    expedite_available: s.expedite_available,
    active_shipments: FALLBACK_SEED_DATA.inbound_shipments.filter(sh => sh.supplier_id === s.supplier_id)
  })),
  customers: (() => {
    const map = {};
    FALLBACK_SEED_DATA.customer_orders.forEach(o => {
      if (!map[o.customer_name]) {
        map[o.customer_name] = {
          customer_name: o.customer_name,
          customer_tier: o.customer_tier,
          destination_city: o.destination_city,
          orders: []
        };
      }
      map[o.customer_name].orders.push(o);
    });
    return Object.values(map);
  })()
};


// Global State
let currentAssessment = null;
let preloadedScenarios = [];
let referenceData = null;
let selectedOptions = {}; // { [order_id]: option_id }
let systemProfiles = { operator: null, suppliers: [], customers: [] };
let activePersona = {
  type: "admin", // 'admin' | 'customer' | 'supplier'
  id: "OPERATOR-01",
  name: "Username",
  title: "Operations Controller (Distributor Admin)",
  avatar: "👑",
  facility: "WH-MAIN (Chicago Central Hub)"
};
let liveStreamTimer = null;
let liveStreamIndex = 0;
let cachedStreamEvents = [];

// App Settings & Preferences
const DEFAULT_SETTINGS = {
  username: "Username",
  parserMode: "hybrid",
  confidence: "0.85",
  streamInterval: 10000,
  soundEnabled: true,
  autoRunScenario: true,
  currency: "$"
};
let appSettings = { ...DEFAULT_SETTINGS };

// ============================================================================
// Initialization Lifecycle
// ============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  loadSettings();
  initTheme();
  initSplashScreen();
  initSidebarDrawer();
  await loadReferenceData();
  initEventListeners();
  initStructuredFormCascading();
  await loadProfiles();
  handleURLParamsOnLoad();
  await initScenarios();
  await loadAuditCount();
  startLiveTelemetryStream();
});

// ============================================================================
// 1. Sidebar Drawer Controls (Hidden by Default, Opens on Click)
// ============================================================================
function initSidebarDrawer() {
  const sidebar = document.getElementById("leftSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  const btnToggle = document.getElementById("btnToggleSidebar");
  const btnClose = document.getElementById("btnCloseSidebar");

  const openDrawer = () => {
    if (sidebar) sidebar.classList.add("sidebar-open");
    if (backdrop) backdrop.classList.add("active");
  };

  const closeDrawer = () => {
    if (sidebar) sidebar.classList.remove("sidebar-open");
    if (backdrop) backdrop.classList.remove("active");
  };

  if (btnToggle) btnToggle.addEventListener("click", openDrawer);
  if (btnClose) btnClose.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  // Close drawer with Escape key if open
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar && sidebar.classList.contains("sidebar-open")) {
      closeDrawer();
    }
  });
}

function closeSidebarDrawer() {
  const sidebar = document.getElementById("leftSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (sidebar) sidebar.classList.remove("sidebar-open");
  if (backdrop) backdrop.classList.remove("active");
}

// ============================================================================
// 2. Settings & Preferences Management
// ============================================================================
function loadSettings() {
  try {
    const saved = localStorage.getItem("chainSolve_settings");
    if (saved) {
      appSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("Could not parse saved settings:", e);
    appSettings = { ...DEFAULT_SETTINGS };
  }

  const customUser = localStorage.getItem("chainSolve_username") || appSettings.username;
  if (customUser) {
    appSettings.username = customUser;
    if (activePersona.type === "admin") {
      activePersona.name = customUser;
    }
  }
  updateActivePersonaUI();
  updateSoundButtonUI();
}

function saveSettingsFromModal() {
  const userInput = document.getElementById("settingUsernameInput");
  if (userInput && userInput.value.trim()) {
    const newName = userInput.value.trim();
    appSettings.username = newName;
    localStorage.setItem("chainSolve_username", newName);
    if (activePersona.type === "admin") {
      activePersona.name = newName;
      updateActivePersonaUI();
    }
  }

  const parserSelect = document.getElementById("settingParserMode");
  if (parserSelect) appSettings.parserMode = parserSelect.value;

  const confRadio = document.querySelector('input[name="settingConfidence"]:checked');
  if (confRadio) appSettings.confidence = confRadio.value;

  const streamSelect = document.getElementById("settingStreamInterval");
  if (streamSelect) appSettings.streamInterval = parseInt(streamSelect.value, 10);

  const soundCheckbox = document.getElementById("settingSoundToggle");
  if (soundCheckbox) appSettings.soundEnabled = soundCheckbox.checked;

  const autoRunCheckbox = document.getElementById("settingAutoRunScenario");
  if (autoRunCheckbox) appSettings.autoRunScenario = autoRunCheckbox.checked;

  localStorage.setItem("chainSolve_settings", JSON.stringify(appSettings));
  updateSoundButtonUI();
  startLiveTelemetryStream();
  closeSettingsModal();
  showToast("Settings & Preferences saved successfully!", "success", "✓");
  playAudioChime("success");
}

function resetSettingsToDefaults() {
  appSettings = { ...DEFAULT_SETTINGS };
  localStorage.setItem("chainSolve_settings", JSON.stringify(appSettings));
  localStorage.removeItem("chainSolve_username");
  if (activePersona.type === "admin") {
    activePersona.name = "Username";
    updateActivePersonaUI();
  }
  populateSettingsModal();
  updateSoundButtonUI();
  startLiveTelemetryStream();
  showToast("Preferences reset to default configuration.", "info", "⚙️");
}

function populateSettingsModal() {
  const userInput = document.getElementById("settingUsernameInput");
  if (userInput) userInput.value = localStorage.getItem("chainSolve_username") || appSettings.username || "Username";

  const parserSelect = document.getElementById("settingParserMode");
  if (parserSelect) parserSelect.value = appSettings.parserMode;

  const confRadio = document.querySelector(`input[name="settingConfidence"][value="${appSettings.confidence}"]`);
  if (confRadio) confRadio.checked = true;

  const streamSelect = document.getElementById("settingStreamInterval");
  if (streamSelect) streamSelect.value = appSettings.streamInterval.toString();

  const soundCheckbox = document.getElementById("settingSoundToggle");
  if (soundCheckbox) soundCheckbox.checked = appSettings.soundEnabled;

  const autoRunCheckbox = document.getElementById("settingAutoRunScenario");
  if (autoRunCheckbox) autoRunCheckbox.checked = appSettings.autoRunScenario;
}

// ============================================================================
// 3. Audio Chimes & Sound Synthesis (Web Audio API)
// ============================================================================
function playAudioChime(type = "ping") {
  if (!appSettings.soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "ping") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "alert") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.debug("Web Audio Synthesizer:", e);
  }
}

function updateSoundButtonUI() {
  const soundIcon = document.getElementById("soundIcon");
  const soundIconSymbol = document.getElementById("soundIconSymbol");
  const btnToggle = document.getElementById("btnToggleSound");
  if (soundIcon) {
    soundIcon.textContent = appSettings.soundEnabled ? "ON" : "OFF";
    soundIcon.className = appSettings.soundEnabled ? "text-[10px] font-black text-emerald-600 dark:text-emerald-400" : "text-[10px] font-black text-slate-400 dark:text-slate-500";
  }
  if (soundIconSymbol) {
    soundIconSymbol.textContent = appSettings.soundEnabled ? "🔔" : "🔕";
  }
  if (btnToggle) {
    btnToggle.title = appSettings.soundEnabled ? "Audio chime alerts active" : "Audio chime alerts muted";
  }
}

// ============================================================================
// 4. Floating Toast Notifications
// ============================================================================
function showToast(message, type = "info", icon = "🔔") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");

  let colorClasses = "bg-[#042016]/95 border-emerald-500/80 text-emerald-100";
  if (type === "success") colorClasses = "bg-emerald-950/95 border-emerald-500 text-emerald-100";
  else if (type === "alert") colorClasses = "bg-rose-950/95 border-rose-500 text-rose-100";

  toast.className = `flex items-center space-x-3 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-semibold backdrop-blur-md transform transition-all duration-300 translate-y-3 opacity-0 pointer-events-auto ${colorClasses}`;
  toast.innerHTML = `
    <span class="text-base shrink-0">${icon}</span>
    <span class="leading-tight">${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-3", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("translate-y-3", "opacity-0");
    setTimeout(() => toast.remove(), 350);
  }, 4500);
}

// ============================================================================
// 5. Dark / Light Theme System
// ============================================================================
function initTheme() {
  const btnToggle = document.getElementById("btnThemeToggle");
  const btnTopToggle = document.getElementById("btnTopThemeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const topThemeIcon = document.getElementById("topThemeIcon");
  const themeLabel = document.getElementById("themeLabel");

  const applyTheme = (theme) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      if (themeIcon) themeIcon.textContent = "☀️";
      if (topThemeIcon) topThemeIcon.textContent = "☀️";
      if (themeLabel) themeLabel.textContent = "Light";
      if (btnToggle) btnToggle.setAttribute("title", "Switch to Light Mode");
    } else {
      document.documentElement.classList.remove("dark");
      if (themeIcon) themeIcon.textContent = "🌙";
      if (topThemeIcon) topThemeIcon.textContent = "🌙";
      if (themeLabel) themeLabel.textContent = "Dark";
      if (btnToggle) btnToggle.setAttribute("title", "Switch to Dark Mode");
    }
  };

  const savedTheme = localStorage.getItem("chainSolve_theme");
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme("dark");
  }

  const toggleHandler = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";
    localStorage.setItem("chainSolve_theme", nextTheme);
    applyTheme(nextTheme);
    showToast(`Theme switched to ${nextTheme.toUpperCase()} mode`, "info", nextTheme === "dark" ? "🌙" : "☀️");
  };

  if (btnToggle) btnToggle.addEventListener("click", toggleHandler);
  if (btnTopToggle) btnTopToggle.addEventListener("click", toggleHandler);
}

// ============================================================================
// 6. Clean Splash Screen Loader (Logo & Loader Only)
// ============================================================================
function initSplashScreen() {
  const splash = document.getElementById("splashScreen");
  const btnSkip = document.getElementById("btnSkipSplash");

  if (!splash) return;

  const dismissSplash = () => {
    splash.classList.add("splash-hidden");
    setTimeout(() => {
      splash.style.display = "none";
    }, 700);
  };

  if (btnSkip) {
    btnSkip.addEventListener("click", dismissSplash);
  }

  // Smooth dismiss after brief loading time (2.6 seconds)
  setTimeout(() => {
    dismissSplash();
  }, 2600);
}

// ============================================================================
// 7. Profiles & Multi-Persona Stakeholder Portals
// ============================================================================
async function loadProfiles() {
  try {
    const res = await fetch("/api/profiles");
    if (!res.ok) throw new Error("Failed to load profiles");
    systemProfiles = await res.json();
    populateProfileModal(systemProfiles);
  } catch (err) {
    console.warn("Could not load profiles from API:", err);
  }
}

function populateProfileModal(profiles) {
  const custCountBadge = document.getElementById("profileCustCount");
  if (custCountBadge && profiles.customers) custCountBadge.textContent = profiles.customers.length;

  const suppCountBadge = document.getElementById("profileSuppCount");
  if (suppCountBadge && profiles.suppliers) suppCountBadge.textContent = profiles.suppliers.length;

  // 1. Customer Profiles List
  const custList = document.getElementById("customerProfilesList");
  if (custList && profiles.customers) {
    custList.innerHTML = "";
    profiles.customers.forEach(c => {
      const card = document.createElement("div");
      let tierColor = "bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-900/60 dark:text-purple-200";
      if (c.customer_tier === "Platinum") tierColor = "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200";
      else if (c.customer_tier === "Gold") tierColor = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200";

      card.className = "bg-slate-50 dark:bg-[#160731] p-4 rounded-2xl border border-slate-200 dark:border-purple-800/60 flex flex-col justify-between space-y-3.5 hover:border-purple-400 transition shadow-sm";
      card.innerHTML = `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${tierColor}">${c.customer_tier} Tier</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-300 font-mono">📍 ${c.destination_city}</span>
          </div>
          <h5 class="text-xs font-bold text-slate-900 dark:text-white">${c.customer_name}</h5>
          <div class="text-[11px] text-slate-600 dark:text-purple-300">
            Active Orders: <strong class="text-purple-950 dark:text-white font-bold">${c.orders.length}</strong> (${c.orders.map(o => o.order_id).join(", ")})
          </div>
        </div>
        <button class="btn-login-customer w-full bg-white dark:bg-[#0e031f] hover:bg-purple-50 dark:hover:bg-purple-900/60 text-purple-950 dark:text-purple-200 border border-purple-200 dark:border-purple-700 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer">
          <span>🏢 Login as Customer</span>
          <span>➔</span>
        </button>
      `;

      card.querySelector(".btn-login-customer").addEventListener("click", () => {
        loginAsCustomer(c);
      });
      custList.appendChild(card);
    });
  }

  // 2. Supplier Profiles List
  const suppList = document.getElementById("supplierProfilesList");
  if (suppList && profiles.suppliers) {
    suppList.innerHTML = "";
    profiles.suppliers.forEach(s => {
      const card = document.createElement("div");
      card.className = "bg-slate-50 dark:bg-[#160731] p-4 rounded-2xl border border-slate-200 dark:border-purple-800/60 flex flex-col justify-between space-y-3.5 hover:border-purple-400 transition shadow-sm";
      card.innerHTML = `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200">${s.supplier_id}</span>
            <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">★ ${(s.reliability_score * 100).toFixed(0)}% Score</span>
          </div>
          <h5 class="text-xs font-bold text-slate-900 dark:text-white">${s.name}</h5>
          <div class="text-[11px] text-slate-600 dark:text-purple-300">
            📍 ${s.location} • Inbound POs: <strong>${s.active_shipments.length}</strong>
          </div>
        </div>
        <button class="btn-login-supplier w-full bg-white dark:bg-[#0e031f] hover:bg-purple-50 dark:hover:bg-purple-900/60 text-purple-950 dark:text-purple-200 border border-purple-200 dark:border-purple-700 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer">
          <span>🏭 Login as Supplier</span>
          <span>➔</span>
        </button>
      `;

      card.querySelector(".btn-login-supplier").addEventListener("click", () => {
        loginAsSupplier(s);
      });
      suppList.appendChild(card);
    });
  }
}

function loginAsAdmin() {
  const input = document.getElementById("profileModalNameInput");
  let currentUsername = localStorage.getItem("chainSolve_username") || appSettings.username || "Username";
  if (input && input.value.trim()) {
    currentUsername = input.value.trim();
    localStorage.setItem("chainSolve_username", currentUsername);
    appSettings.username = currentUsername;
    localStorage.setItem("chainSolve_settings", JSON.stringify(appSettings));
  }

  activePersona = {
    type: "admin",
    id: "OPERATOR-01",
    name: currentUsername,
    title: "Operations Controller (Distributor Admin)",
    avatar: "👑",
    facility: "WH-MAIN (Chicago Central Hub)"
  };
  updateActivePersonaUI();
  closeProfileModal();
  closeSidebarDrawer();
  showToast(`Logged in as Operations Controller (${currentUsername})`, "success", "👑");
  playAudioChime("success");
}

function loginAsCustomer(cust) {
  activePersona = {
    type: "customer",
    id: cust.customer_name,
    name: cust.customer_name,
    tier: cust.customer_tier,
    city: cust.destination_city,
    orders: cust.orders,
    avatar: "🏢",
    facility: `Client Destination: ${cust.destination_city}`
  };
  updateActivePersonaUI();
  closeProfileModal();
  closeSidebarDrawer();
  showToast(`Switched to Customer Portal: ${cust.customer_name}`, "info", "🏢");
  playAudioChime("ping");
}

function loginAsSupplier(supp) {
  activePersona = {
    type: "supplier",
    id: supp.supplier_id,
    name: supp.name,
    location: supp.location,
    shipments: supp.active_shipments,
    reliability: supp.reliability_score,
    avatar: "🏭",
    facility: `Origin: ${supp.location}`
  };
  updateActivePersonaUI();
  closeProfileModal();
  closeSidebarDrawer();
  showToast(`Switched to Supplier Portal: ${supp.name}`, "info", "🏭");
  playAudioChime("ping");
}

function updateActivePersonaUI() {
  const avatarEl = document.getElementById("sidebarAvatar");
  const topAvatarEl = document.getElementById("topBarAvatar");
  const nameEl = document.getElementById("profileName");
  const topNameEl = document.getElementById("topBarName");
  const adminCardName = document.getElementById("adminProfileCardName");
  const modalInput = document.getElementById("profileModalNameInput");
  const settingInput = document.getElementById("settingUsernameInput");
  const roleSubtext = document.getElementById("sidebarRoleSubtext");
  const facilitySubtext = document.getElementById("sidebarFacilitySubtext");
  const rolePill = document.getElementById("sidebarRolePill");
  const modalText = document.getElementById("modalActivePersonaText");

  const currentSavedName = localStorage.getItem("chainSolve_username") || appSettings.username || "Username";

  if (avatarEl) avatarEl.textContent = activePersona.avatar;
  if (topAvatarEl) topAvatarEl.textContent = activePersona.avatar;
  if (nameEl) nameEl.textContent = activePersona.name;
  if (topNameEl) topNameEl.textContent = activePersona.name;
  if (adminCardName) adminCardName.textContent = currentSavedName;
  if (modalInput && document.activeElement !== modalInput) {
    modalInput.value = currentSavedName;
  }
  if (settingInput && document.activeElement !== settingInput) {
    settingInput.value = currentSavedName;
  }

  if (roleSubtext) {
    if (activePersona.type === "customer") roleSubtext.textContent = `Customer (${activePersona.tier} Tier)`;
    else if (activePersona.type === "supplier") roleSubtext.textContent = `Supplier (${activePersona.id})`;
    else roleSubtext.textContent = "Operations Controller (Admin)";
  }
  if (facilitySubtext) facilitySubtext.textContent = activePersona.facility || "WH-MAIN (Chicago Central Hub)";
  if (rolePill) rolePill.textContent = `${activePersona.type.toUpperCase()} PORTAL`;
  if (modalText) modalText.textContent = `${activePersona.name} (${activePersona.type.toUpperCase()})`;

  const custBanner = document.getElementById("customerPortalBanner");
  const suppBanner = document.getElementById("supplierPortalBanner");

  if (activePersona.type === "customer") {
    if (custBanner) {
      custBanner.classList.remove("hidden");
      document.getElementById("custBannerName").textContent = activePersona.name;
      const tierBadge = document.getElementById("custBannerTier");
      tierBadge.textContent = `${activePersona.tier} Tier`;
      if (activePersona.tier === "Platinum") tierBadge.className = "px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500 text-white uppercase tracking-wider";
      else if (activePersona.tier === "Gold") tierBadge.className = "px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500 text-white uppercase tracking-wider";
      else tierBadge.className = "px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-700 text-purple-200 uppercase tracking-wider";

      const ordersSummary = document.getElementById("customerOrdersSummary");
      ordersSummary.innerHTML = "";
      (activePersona.orders || []).forEach(ord => {
        const div = document.createElement("div");
        div.className = "bg-purple-950/80 border border-purple-700/70 rounded-xl p-3.5 text-xs space-y-1.5";
        div.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-bold text-white">Order: ${ord.order_id}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ord.status === 'allocated' ? 'bg-emerald-800 text-emerald-200' : 'bg-amber-800 text-amber-200'}">${ord.status}</span>
          </div>
          <div class="text-[11px] text-purple-200">Promise Delivery: <strong>${ord.promise_date}</strong> • Penalty: <strong>$${ord.sla_penalty_per_day}/day</strong></div>
        `;
        ordersSummary.appendChild(div);
      });
    }
    if (suppBanner) suppBanner.classList.add("hidden");
  } else if (activePersona.type === "supplier") {
    if (suppBanner) {
      suppBanner.classList.remove("hidden");
      document.getElementById("suppBannerName").textContent = activePersona.name;
      document.getElementById("suppBannerId").textContent = activePersona.id;
    }
    if (custBanner) custBanner.classList.add("hidden");
  } else {
    // Admin
    if (custBanner) custBanner.classList.add("hidden");
    if (suppBanner) suppBanner.classList.add("hidden");
  }
}

// ============================================================================
// 8. Live Telemetry Stream Engine
// ============================================================================
async function startLiveTelemetryStream() {
  if (liveStreamTimer) clearInterval(liveStreamTimer);
  await fetchLiveTelemetry();

  if (appSettings.streamInterval > 0) {
    liveStreamTimer = setInterval(async () => {
      await fetchLiveTelemetry();
    }, appSettings.streamInterval);
  }
}

async function fetchLiveTelemetry() {
  try {
    const res = await fetch("/api/live/stream");
    if (!res.ok) return;
    const data = await res.json();
    if (data.events && data.events.length > 0) {
      cachedStreamEvents = data.events;
      rotateLiveTicker();
    }
  } catch (err) {
    console.debug("Telemetry polling skipped:", err);
  }
}

function rotateLiveTicker() {
  if (!cachedStreamEvents.length) return;
  const ev = cachedStreamEvents[liveStreamIndex % cachedStreamEvents.length];
  liveStreamIndex++;

  const iconEl = document.getElementById("liveTickerIcon");
  const textEl = document.getElementById("liveTickerText");

  if (iconEl && textEl) {
    textEl.style.opacity = "0";
    setTimeout(() => {
      iconEl.textContent = ev.icon || "📡";
      textEl.textContent = `${ev.source}: ${ev.message}`;
      textEl.style.opacity = "1";
    }, 200);
  }
}

function pushManualTelemetryPing() {
  const pings = [
    { icon: "🚢", text: "Vessel EVER GLOBE: Long Beach pilot boarded; container offload queue positioned #2." },
    { icon: "📦", text: "WH-MAIN RFID Gate 4: Cross-dock staging verified 45 units SKU-1049 in clean Bay B." },
    { icon: "⚡", text: "Apex Dynamics Line 2 EDI: Component pressure telemetry restored to nominal 120 PSI." },
    { icon: "✈️", text: "FedEx Express Cargo: Flight FX-912 booked with priority airway bill 88910411-FX." },
    { icon: "⏱️", text: "SLA Sentinel: Siemens Mobility Systems order ORD-502 promise clock: 6 days remaining." }
  ];
  const rand = pings[Math.floor(Math.random() * pings.length)];
  const iconEl = document.getElementById("liveTickerIcon");
  const textEl = document.getElementById("liveTickerText");

  if (iconEl && textEl) {
    iconEl.textContent = rand.icon;
    textEl.textContent = `Live Push: ${rand.text}`;
  }

  showToast(rand.text, "info", rand.icon);
  playAudioChime("ping");
}

// ============================================================================
// 8.5. Structured Reference Data & Form Cascading Engine
// ============================================================================
async function loadReferenceData() {
  try {
    const res = await fetch("/api/reference-data");
    if (res.ok) {
      referenceData = await res.json();
    } else {
      referenceData = FALLBACK_REFERENCE_DATA;
    }
  } catch (err) {
    console.warn("Using embedded reference data fallback:", err);
    referenceData = FALLBACK_REFERENCE_DATA;
  }
  populateFormDropdowns(referenceData);
}

function populateFormDropdowns(data) {
  if (!data) return;

  // 1. Suppliers
  const supplierSelect = document.getElementById("inputSupplier");
  if (supplierSelect && data.suppliers) {
    supplierSelect.innerHTML = `<option value="">-- Select Supplier --</option>`;
    data.suppliers.forEach(s => {
      supplierSelect.innerHTML += `<option value="${s.supplier_id}">${s.name} (${s.supplier_id})</option>`;
    });
  }

  // 2. Purchase Orders
  const poSelect = document.getElementById("inputPO");
  if (poSelect && data.purchase_orders) {
    poSelect.innerHTML = `<option value="">-- Select Purchase Order --</option>`;
    data.purchase_orders.forEach(po => {
      poSelect.innerHTML += `<option value="${po.po_number}" data-supplier="${po.supplier_id}" data-shipment="${po.shipment_id}">${po.po_number} (${po.supplier_id})</option>`;
    });
  }

  // 3. Inbound Shipments
  const shipmentSelect = document.getElementById("inputShipment");
  if (shipmentSelect && data.shipments) {
    shipmentSelect.innerHTML = `<option value="">-- Select Shipment --</option>`;
    data.shipments.forEach(sh => {
      shipmentSelect.innerHTML += `<option value="${sh.shipment_id}" data-supplier="${sh.supplier_id}" data-po="${sh.po_number}">${sh.shipment_id} - ${sh.carrier_name} (${sh.po_number})</option>`;
    });
  }

  // 4. Catalog SKUs
  const skuSelect = document.getElementById("inputSKU");
  if (skuSelect && data.skus) {
    skuSelect.innerHTML = `<option value="">-- Select SKU / Product --</option>`;
    data.skus.forEach(sku => {
      skuSelect.innerHTML += `<option value="${sku.sku_id}" data-supplier="${sku.preferred_supplier_id}">${sku.sku_id} - ${sku.name}</option>`;
    });
  }

  // 5. Locations
  const locationSelect = document.getElementById("inputLocation");
  if (locationSelect && data.locations) {
    locationSelect.innerHTML = "";
    data.locations.forEach(loc => {
      locationSelect.innerHTML += `<option value="${loc.id}">${loc.name}</option>`;
    });
  }

  // Default Disruption Date to System Date
  const dateInput = document.getElementById("inputDisruptionDate");
  if (dateInput && data.system_current_date) {
    dateInput.value = data.system_current_date;
  }
}

function initStructuredFormCascading() {
  const supplierSelect = document.getElementById("inputSupplier");
  const poSelect = document.getElementById("inputPO");
  const shipmentSelect = document.getElementById("inputShipment");
  const skuSelect = document.getElementById("inputSKU");
  const typeSelect = document.getElementById("inputDisruptionType");

  if (!supplierSelect || !poSelect || !shipmentSelect || !skuSelect || !typeSelect) return;

  // 1. Supplier Change -> Filter and auto-sync POs, Shipments & SKUs
  supplierSelect.addEventListener("change", () => {
    hideValidationError();
    const selectedSupplier = supplierSelect.value;

    // Filter POs
    let firstMatchingPO = "";
    Array.from(poSelect.options).forEach((opt, idx) => {
      if (idx === 0) return;
      const supp = opt.getAttribute("data-supplier");
      const matches = !selectedSupplier || supp === selectedSupplier;
      opt.hidden = !matches;
      if (matches && !firstMatchingPO) firstMatchingPO = opt.value;
    });
    if (poSelect.selectedOptions[0] && poSelect.selectedOptions[0].hidden) {
      poSelect.value = firstMatchingPO || "";
    }

    // Filter Shipments
    let firstMatchingShip = "";
    Array.from(shipmentSelect.options).forEach((opt, idx) => {
      if (idx === 0) return;
      const supp = opt.getAttribute("data-supplier");
      const matches = !selectedSupplier || supp === selectedSupplier;
      opt.hidden = !matches;
      if (matches && !firstMatchingShip) firstMatchingShip = opt.value;
    });
    if (shipmentSelect.selectedOptions[0] && shipmentSelect.selectedOptions[0].hidden) {
      shipmentSelect.value = firstMatchingShip || "";
    }

    // Filter SKUs
    let firstMatchingSKU = "";
    Array.from(skuSelect.options).forEach((opt, idx) => {
      if (idx === 0) return;
      const supp = opt.getAttribute("data-supplier");
      const matches = !selectedSupplier || !supp || supp === selectedSupplier;
      opt.hidden = !matches;
      if (matches && !firstMatchingSKU) firstMatchingSKU = opt.value;
    });
    if (skuSelect.selectedOptions[0] && skuSelect.selectedOptions[0].hidden) {
      skuSelect.value = firstMatchingSKU || "";
    }

    // Auto-select corresponding shipment and SKU if available
    if (selectedSupplier && referenceData) {
      const matchShip = referenceData.shipments.find(s => s.supplier_id === selectedSupplier);
      if (matchShip) {
        if (!shipmentSelect.value) shipmentSelect.value = matchShip.shipment_id;
        if (!poSelect.value && matchShip.po_number) poSelect.value = matchShip.po_number;
        if (!skuSelect.value && matchShip.sku_ids && matchShip.sku_ids.length > 0) {
          skuSelect.value = matchShip.sku_ids[0];
        }
      }
    }
  });

  // 2. Purchase Order Change -> Auto-fill Supplier & Filter Shipments / SKUs
  poSelect.addEventListener("change", () => {
    hideValidationError();
    const selectedPO = poSelect.value;
    if (!selectedPO) return;

    if (referenceData && referenceData.purchase_orders) {
      const poObj = referenceData.purchase_orders.find(p => p.po_number === selectedPO);
      if (poObj) {
        if (poObj.supplier_id) supplierSelect.value = poObj.supplier_id;
        if (poObj.shipment_id) shipmentSelect.value = poObj.shipment_id;
        if (poObj.sku_ids && poObj.sku_ids.length > 0) {
          skuSelect.value = poObj.sku_ids[0];
        }
      }
    }
  });

  // 3. Shipment Change -> Auto-fill Supplier, PO & SKU
  shipmentSelect.addEventListener("change", () => {
    hideValidationError();
    const selectedShipment = shipmentSelect.value;
    if (!selectedShipment) return;

    if (referenceData && referenceData.shipments) {
      const shipObj = referenceData.shipments.find(s => s.shipment_id === selectedShipment);
      if (shipObj) {
        if (shipObj.supplier_id) supplierSelect.value = shipObj.supplier_id;
        if (shipObj.po_number) poSelect.value = shipObj.po_number;
        if (shipObj.sku_ids && shipObj.sku_ids.length > 0) {
          skuSelect.value = shipObj.sku_ids[0];
        }
      }
    }
  });

  // 4. SKU Change -> Auto-fill Preferred Supplier and Linked Shipment
  skuSelect.addEventListener("change", () => {
    hideValidationError();
    const selectedSKU = skuSelect.value;
    if (!selectedSKU || !referenceData) return;

    const skuObj = referenceData.skus ? referenceData.skus.find(s => s.sku_id === selectedSKU) : null;
    if (skuObj && skuObj.preferred_supplier_id && !supplierSelect.value) {
      supplierSelect.value = skuObj.preferred_supplier_id;
    }

    if (referenceData.shipments) {
      const shipObj = referenceData.shipments.find(s => s.sku_ids && s.sku_ids.includes(selectedSKU));
      if (shipObj) {
        if (!shipmentSelect.value) shipmentSelect.value = shipObj.shipment_id;
        if (!poSelect.value) poSelect.value = shipObj.po_number;
        if (!supplierSelect.value) supplierSelect.value = shipObj.supplier_id;
      }
    }
  });

  // 5. Disruption Type Change -> Adjust UI hints
  typeSelect.addEventListener("change", () => {
    hideValidationError();
    const isWarehouse = (typeSelect.value === "Warehouse Incident");
    const suppStar = document.getElementById("supplierRequiredStar");
    if (suppStar) suppStar.style.display = isWarehouse ? "none" : "inline";

    if (isWarehouse) {
      const locSelect = document.getElementById("inputLocation");
      if (locSelect) locSelect.value = "WH-MAIN";
      if (!skuSelect.value && referenceData && referenceData.skus && referenceData.skus.length > 0) {
        skuSelect.value = "SKU-3150";
      }
    }
  });

  // Close button on validation error banner
  const btnCloseAlert = document.getElementById("btnCloseValidationAlert");
  if (btnCloseAlert) btnCloseAlert.addEventListener("click", hideValidationError);
}

function showValidationError(message) {
  const banner = document.getElementById("formValidationError");
  const textEl = document.getElementById("validationErrorText");
  if (banner && textEl) {
    textEl.textContent = message;
    banner.classList.remove("hidden");
    banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  showToast(message, "alert", "⚠️");
  playAudioChime("alert");
}

function hideValidationError() {
  const banner = document.getElementById("formValidationError");
  if (banner) banner.classList.add("hidden");
}

function populateStructuredForm(structured) {
  hideValidationError();
  if (!structured) return;

  const typeSelect = document.getElementById("inputDisruptionType");
  const suppSelect = document.getElementById("inputSupplier");
  const poSelect = document.getElementById("inputPO");
  const shipmentSelect = document.getElementById("inputShipment");
  const skuSelect = document.getElementById("inputSKU");
  const dateInput = document.getElementById("inputDisruptionDate");
  const delayInput = document.getElementById("inputDelayDays");
  const qtyInput = document.getElementById("inputQuantityAffected");
  const locSelect = document.getElementById("inputLocation");
  const reasonInput = document.getElementById("inputReason");
  const severitySelect = document.getElementById("inputSeverity");

  if (typeSelect) typeSelect.value = structured.disruption_type || "Supplier Production Halt";
  if (suppSelect) suppSelect.value = structured.supplier_id || "";
  if (poSelect) poSelect.value = structured.po_number || "";
  if (shipmentSelect) shipmentSelect.value = structured.shipment_id || "";
  if (skuSelect) skuSelect.value = structured.sku_id || "";
  if (dateInput) dateInput.value = structured.disruption_date || (referenceData ? referenceData.system_current_date : "2026-09-05");
  if (delayInput) delayInput.value = structured.delay_days || 14;
  if (qtyInput) qtyInput.value = structured.quantity_affected || "";
  if (locSelect) locSelect.value = structured.affected_location || "WH-MAIN";
  if (reasonInput) reasonInput.value = structured.reason || "";
  if (severitySelect) severitySelect.value = structured.severity || "High";

  // Trigger type change update
  if (typeSelect) {
    const isWarehouse = (typeSelect.value === "Warehouse Incident");
    const suppStar = document.getElementById("supplierRequiredStar");
    if (suppStar) suppStar.style.display = isWarehouse ? "none" : "inline";
  }
}

function clearStructuredForm() {
  hideValidationError();
  const form = document.getElementById("structuredDisruptionForm");
  if (form) form.reset();

  // Reset dropdown filters
  if (referenceData) populateFormDropdowns(referenceData);

  document.getElementById("scenarioTag").classList.add("hidden");
  document.getElementById("resultsSection").classList.add("hidden");
  document.getElementById("ambiguityBanner").classList.add("hidden");
  selectedOptions = {};
  currentAssessment = null;

  document.querySelectorAll("#scenarioButtonContainer button").forEach(b => {
    b.classList.remove("selected-scenario");
  });

  showToast("Disruption form reset to clean state.", "info", "🧹");
}

// ============================================================================
// 9. Benchmark Scenarios Loader
// ============================================================================
async function initScenarios() {
  try {
    const res = await fetch("/api/scenarios");
    if (res.ok) {
      preloadedScenarios = await res.json();
    } else {
      preloadedScenarios = FALLBACK_SCENARIOS;
    }
  } catch (err) {
    console.warn("API scenarios unavailable, loading embedded benchmark dataset:", err);
    preloadedScenarios = FALLBACK_SCENARIOS;
  }

  const badge = document.getElementById("scenarioCountBadge");
  if (badge) badge.textContent = `${preloadedScenarios.length} Scenarios`;

  const container = document.getElementById("scenarioButtonContainer");
  if (!container) return;
  container.innerHTML = "";

  const icons = ["⚡", "🚢", "💥", "🛑", "❓", "⚓", "🔬", "🚀"];

  preloadedScenarios.forEach((sc, idx) => {
    const btn = document.createElement("button");
    btn.className = "scenario-box cursor-pointer group";

    const rawTitle = sc.title.includes(":") ? sc.title.split(":")[1] : sc.title;
    const cleanTitle = rawTitle.trim();

    btn.innerHTML = `
      <div class="w-full space-y-2">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-purple-950/90 text-purple-200 border border-purple-500/60 shadow-sm">
            Scenario ${idx + 1}
          </span>
          <span class="text-base group-hover:scale-110 transition-transform">${icons[idx] || "📌"}</span>
        </div>
        <h4 class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-200 leading-snug line-clamp-2 text-left">
          ${cleanTitle}
        </h4>
      </div>
      <div class="w-full pt-2 border-t border-purple-200 dark:border-purple-800/60 flex flex-col space-y-0.5 text-left">
        <span class="text-[11px] font-semibold text-purple-700 dark:text-purple-300 truncate">${sc.category}</span>
        <span class="text-[10px] text-purple-600/80 dark:text-purple-400/80 font-medium truncate">${sc.difficulty}</span>
      </div>
    `;
    btn.addEventListener("click", () => loadScenario(sc, btn));
    container.appendChild(btn);
  });
}

function loadScenario(sc, clickedBtn) {
  document.querySelectorAll("#scenarioButtonContainer button").forEach(b => {
    b.classList.remove("selected-scenario");
  });
  if (clickedBtn) clickedBtn.classList.add("selected-scenario");

  selectedOptions = {};

  // Populate structured form directly with scenario fields
  if (sc.structured_input) {
    populateStructuredForm(sc.structured_input);
  }

  const tag = document.getElementById("scenarioTag");
  tag.textContent = sc.title;
  tag.classList.remove("hidden");

  if (appSettings.autoRunScenario) {
    analyzeDisruption();
  } else {
    showToast(`Loaded ${sc.title}. Click 'Analyze Disruption' to run.`, "info", "📥");
  }
}

// ============================================================================
// 10. Event Listeners Setup
// ============================================================================
function initEventListeners() {
  // 1. Core Action Buttons
  document.getElementById("btnAnalyze").addEventListener("click", () => {
    selectedOptions = {};
    analyzeDisruption();
  });

  document.getElementById("btnClear").addEventListener("click", clearStructuredForm);

  document.getElementById("btnResetDB").addEventListener("click", async () => {
    if (!confirm("Reset database state to pristine initial seed values?")) return;
    try {
      const res = await fetch("/api/system/reset", { method: "POST" });
      const data = await res.json();
      showToast(data.message, "success", "🔄");
      playAudioChime("success");
      await loadReferenceData();
      await loadProfiles();
  handleURLParamsOnLoad();
      await loadAuditCount();
      clearStructuredForm();
    } catch (e) {
      alert("Error resetting database: " + e.message);
    }
  });

  // 2. Modals Triggers
  document.getElementById("btnProfile").addEventListener("click", () => openProfileModal(false));
  document.getElementById("btnCloseProfileModal").addEventListener("click", closeProfileModal);
  document.getElementById("btnCloseProfileModalBtn").addEventListener("click", closeProfileModal);

  // Quick edit name from sidebar profile card
  const btnQuickEdit = document.getElementById("btnQuickEditName");
  if (btnQuickEdit) {
    btnQuickEdit.addEventListener("click", () => {
      openProfileModal(true);
    });
  }

  // Save profile name button & Enter key in Profile Modal
  const btnSaveProfName = document.getElementById("btnSaveProfileNameModal");
  if (btnSaveProfName) {
    btnSaveProfName.addEventListener("click", saveProfileNameFromModal);
  }
  const inputProfName = document.getElementById("profileModalNameInput");
  if (inputProfName) {
    inputProfName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveProfileNameFromModal();
      }
    });
  }

  document.getElementById("btnSettings").addEventListener("click", openSettingsModal);
  const btnTopSettings = document.getElementById("btnTopSettings");
  if (btnTopSettings) btnTopSettings.addEventListener("click", openSettingsModal);

  document.getElementById("btnCloseSettingsModal").addEventListener("click", closeSettingsModal);
  document.getElementById("btnCloseSettingsModalBtn").addEventListener("click", closeSettingsModal);
  document.getElementById("btnSaveSettings").addEventListener("click", saveSettingsFromModal);
  document.getElementById("btnResetSettings").addEventListener("click", resetSettingsToDefaults);
  document.getElementById("btnTestChime").addEventListener("click", () => {
    playAudioChime("ping");
    showToast("Synthesized audio alert chime test successful!", "info", "🔊");
  });

  document.getElementById("btnAuditLog").addEventListener("click", openAuditModal);
  document.getElementById("btnCloseAuditModal").addEventListener("click", closeAuditModal);
  document.getElementById("btnCloseAuditModalBtn").addEventListener("click", closeAuditModal);

  document.getElementById("btnCloseCommModal").addEventListener("click", closeCommModal);
  document.getElementById("btnCloseCommModalBtn").addEventListener("click", closeCommModal);
  document.getElementById("btnCopyComm").addEventListener("click", () => {
    const text = document.getElementById("commModalBody").textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast("Communication draft copied to clipboard!", "success", "📋");
      playAudioChime("success");
    });
  });

  // 3. Telemetry Controls
  document.getElementById("btnSimulatePing").addEventListener("click", pushManualTelemetryPing);
  document.getElementById("btnToggleSound").addEventListener("click", () => {
    appSettings.soundEnabled = !appSettings.soundEnabled;
    localStorage.setItem("chainSolve_settings", JSON.stringify(appSettings));
    updateSoundButtonUI();
    if (appSettings.soundEnabled) playAudioChime("ping");
    showToast(`Audio alerts ${appSettings.soundEnabled ? "ENABLED" : "MUTED"}`, "info", appSettings.soundEnabled ? "🔔" : "🔕");
  });

  // 4. Portal Banner Switchers
  const btnCustSwitch = document.getElementById("btnCustomerSwitchAdmin");
  if (btnCustSwitch) btnCustSwitch.addEventListener("click", loginAsAdmin);

  const btnSuppSwitch = document.getElementById("btnSupplierSwitchAdmin");
  if (btnSuppSwitch) btnSuppSwitch.addEventListener("click", loginAsAdmin);

  const btnSuppSubmit = document.getElementById("btnSupplierSubmitIncident");
  if (btnSuppSubmit) {
    btnSuppSubmit.addEventListener("click", () => {
      const type = document.getElementById("suppIncidentType").value;
      const days = parseInt(document.getElementById("suppDelayDays").value, 10) || 14;
      const suppName = activePersona.name || "Apex Precision Technologies";
      const suppId = activePersona.id || "SUP-001";

      const mappedType = (type === "production_halt") ? "Supplier Production Halt" : "Carrier/Shipment Delay";

      // Find first active shipment for this supplier if any
      let poNum = "";
      let shipId = "";
      let skuId = "";
      if (referenceData && referenceData.shipments) {
        const sh = referenceData.shipments.find(s => s.supplier_id === suppId);
        if (sh) {
          shipId = sh.shipment_id;
          poNum = sh.po_number;
          skuId = sh.sku_ids ? sh.sku_ids[0] : "";
        }
      }

      populateStructuredForm({
        disruption_type: mappedType,
        supplier_id: suppId,
        po_number: poNum,
        shipment_id: shipId,
        sku_id: skuId,
        disruption_date: referenceData ? referenceData.system_current_date : "2026-09-05",
        delay_days: days,
        affected_location: "WH-MAIN",
        reason: `Supplier portal alert from ${suppName}: ${type.replace(/_/g, " ")} reported.`,
        severity: "Critical"
      });

      document.getElementById("scenarioTag").textContent = `Supplier Direct Alert: ${suppName}`;
      document.getElementById("scenarioTag").classList.remove("hidden");
      analyzeDisruption();
      showToast(`Transmitted structured incident alert from ${suppName} to impact engine!`, "alert", "⚡");
    });
  }

  // 5. Admin button in profile modal
  const btnSelectAdmin = document.getElementById("btnSelectAdminProfile");
  if (btnSelectAdmin) btnSelectAdmin.addEventListener("click", loginAsAdmin);

  // 6. Profile Tabs Filtering
  const tabAll = document.getElementById("tabRoleAll");
  const tabAdmin = document.getElementById("tabRoleAdmin");
  const tabCust = document.getElementById("tabRoleCustomers");
  const tabSupp = document.getElementById("tabRoleSuppliers");

  const secAdmin = document.getElementById("sectionAdminProfiles");
  const secCust = document.getElementById("sectionCustomerProfiles");
  const secSupp = document.getElementById("sectionSupplierProfiles");

  const resetTabs = () => {
    [tabAll, tabAdmin, tabCust, tabSupp].forEach(t => {
      if (t) {
        t.className = "profile-tab px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer";
      }
    });
  };

  const setActiveTab = (btn) => {
    resetTabs();
    if (btn) btn.className = "profile-tab active px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-950 dark:bg-emerald-900/80 dark:text-white transition cursor-pointer";
  };

  if (tabAll) {
    tabAll.addEventListener("click", () => {
      setActiveTab(tabAll);
      if (secAdmin) secAdmin.style.display = "block";
      if (secCust) secCust.style.display = "block";
      if (secSupp) secSupp.style.display = "block";
    });
  }
  if (tabAdmin) {
    tabAdmin.addEventListener("click", () => {
      setActiveTab(tabAdmin);
      if (secAdmin) secAdmin.style.display = "block";
      if (secCust) secCust.style.display = "none";
      if (secSupp) secSupp.style.display = "none";
    });
  }
  if (tabCust) {
    tabCust.addEventListener("click", () => {
      setActiveTab(tabCust);
      if (secAdmin) secAdmin.style.display = "none";
      if (secCust) secCust.style.display = "block";
      if (secSupp) secSupp.style.display = "none";
    });
  }
  if (tabSupp) {
    tabSupp.addEventListener("click", () => {
      setActiveTab(tabSupp);
      if (secAdmin) secAdmin.style.display = "none";
      if (secCust) secCust.style.display = "none";
      if (secSupp) secSupp.style.display = "block";
    });
  }

  // 7. Global Keyboard ESC handler for closing modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeProfileModal();
      closeSettingsModal();
      closeAuditModal();
      closeCommModal();
      closeSidebarDrawer();
    }
  });

  // 8. Backdrop click close handlers
  ["profileModal", "settingsModal", "auditModal", "commModal"].forEach(id => {
    const m = document.getElementById(id);
    if (m) {
      m.addEventListener("click", (e) => {
        if (e.target === m) {
          m.classList.add("hidden");
        }
      });
    }
  });
}

// ============================================================================
// 11. Structured Pipeline Analysis Execution
// ============================================================================
async function analyzeDisruption(customPayload = null) {
  hideValidationError();
  const btn = document.getElementById("btnAnalyze");
  const spinner = document.getElementById("analyzeSpinner");

  let payload = customPayload;

  if (!payload) {
    // Collect and validate from structured form
    const type = document.getElementById("inputDisruptionType").value;
    const supplier = document.getElementById("inputSupplier").value;
    const po = document.getElementById("inputPO").value;
    const shipment = document.getElementById("inputShipment").value;
    const sku = document.getElementById("inputSKU").value;
    const date = document.getElementById("inputDisruptionDate").value;
    const delayVal = document.getElementById("inputDelayDays").value;
    const qtyVal = document.getElementById("inputQuantityAffected").value;
    const location = document.getElementById("inputLocation").value;
    const reason = document.getElementById("inputReason").value;
    const severity = document.getElementById("inputSeverity").value;

    const delayDays = parseInt(delayVal, 10);
    if (isNaN(delayDays) || delayDays <= 0) {
      showValidationError("Expected delay days must be greater than 0.");
      return;
    }

    if (type === "Warehouse Incident" && !sku) {
      showValidationError("Please select a Product SKU for the warehouse incident.");
      return;
    }

    if (type !== "Warehouse Incident" && !supplier && !shipment && !sku) {
      showValidationError("Please select at least a Supplier, Shipment, or SKU.");
      return;
    }

    payload = {
      disruption_type: type,
      supplier_id: supplier || null,
      po_number: po || null,
      shipment_id: shipment || null,
      sku_id: sku || null,
      disruption_date: date || (referenceData ? referenceData.system_current_date : "2026-09-05"),
      delay_days: delayDays,
      quantity_affected: qtyVal ? parseInt(qtyVal, 10) : null,
      affected_location: location || null,
      reason: reason || "",
      severity: severity || "High"
    };
  }

  btn.disabled = true;
  spinner.classList.remove("hidden");

  try {
        const res = await fetch("/api/disruption/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let assessment;
    if (res.ok) {
      assessment = await res.json();
    } else {
      console.warn("API disruption analyze returned non-ok, using deterministic simulation fallback.");
      assessment = simulateOfflineAssessment(payload);
    }

    currentAssessment = assessment;
    renderResults(assessment);
    loadAuditCount();

    if (assessment.has_system_impact) {
      playAudioChime("alert");
      showToast(`Operational Impact Confirmed: ${assessment.total_orders_impacted} order(s) slip`, "alert", "⚠️");
    } else {
      playAudioChime("success");
      showToast("Verified Zero Operational Impact. All customer orders safe.", "success", "✅");
    }
  } catch (err) {
    console.warn("Analysis Error:", err.message);
  } finally {
    btn.disabled = false;
    spinner.classList.add("hidden");
  }
}

// ============================================================================
// 12. Render Assessment Results
// ============================================================================
function renderResults(asm) {
  const results = document.getElementById("resultsSection");
  results.classList.remove("hidden");

  // Ambiguity Banner
  const ambBanner = document.getElementById("ambiguityBanner");
  if (asm.grounding && asm.grounding.is_ambiguous) {
    ambBanner.classList.remove("hidden");
    document.getElementById("ambiguityText").textContent = asm.grounding.ambiguity_reason;
    const candContainer = document.getElementById("ambiguityCandidateContainer");
    candContainer.innerHTML = "";

    const ambMatch = asm.grounding.matches.find(m => m.is_ambiguous);
    if (ambMatch && ambMatch.candidate_matches) {
      ambMatch.candidate_matches.forEach(cand => {
        const b = document.createElement("button");
        b.className = "bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-600 text-emerald-950 dark:text-emerald-200 text-xs px-3.5 py-2.5 rounded-xl transition text-left shadow-sm hover:shadow-md cursor-pointer";
        b.innerHTML = `<strong>Confirm: ${cand.name}</strong> (${cand.supplier_id})<br><span class="text-[10px] text-emerald-700 dark:text-emerald-300">Active Shipments: ${(cand.pending_shipments && cand.pending_shipments.length) ? cand.pending_shipments.join(", ") : "None scheduled"}</span>`;
        b.addEventListener("click", () => {
          const suppSelect = document.getElementById("inputSupplier");
          if (suppSelect) {
            suppSelect.value = cand.supplier_id;
            suppSelect.dispatchEvent(new Event("change"));
          }
          analyzeDisruption();
        });
        candContainer.appendChild(b);
      });
    }
  } else {
    ambBanner.classList.add("hidden");
  }

  // Status Badge
  const statusBadge = document.getElementById("impactStatusBadge");
  const categoryBadge = document.getElementById("disruptionCategoryBadge");
  categoryBadge.textContent = asm.category || "General";

  if (!asm.has_system_impact) {
    statusBadge.className = "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700";
    statusBadge.textContent = "VERIFIED NO OPERATIONAL IMPACT";
  } else {
    statusBadge.className = "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700 badge-critical";
    statusBadge.textContent = "OPERATIONAL IMPACT CONFIRMED";
  }

  document.getElementById("summaryHeadline").textContent = asm.summary_headline || "Impact Analysis Completed";
  document.getElementById("executiveBriefingText").textContent = asm.executive_briefing || "";

  // Financial Metrics
  document.getElementById("metricOrdersCount").textContent = asm.total_orders_impacted || 0;
  document.getElementById("metricRevenueRisk").textContent = `$${(asm.total_revenue_at_risk || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById("metricSlaPenalty").textContent = `$${(asm.total_sla_penalty_risk || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  // Grounding Citations
  const evidenceList = document.getElementById("groundingEvidenceList");
  evidenceList.innerHTML = "";

  if (asm.grounding && asm.grounding.matches) {
    asm.grounding.matches.forEach(m => {
      const item = document.createElement("div");
      item.className = "trace-card bg-slate-50 dark:bg-[#160731] p-3.5 rounded-xl border border-slate-200 dark:border-purple-800/60 text-xs shadow-sm";
      item.innerHTML = `
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-bold text-slate-800 dark:text-white capitalize">${m.entity_type}: ${m.matched_name || m.raw_mention}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${m.confidence === 'EXACT' ? 'bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-900 dark:text-purple-200' : 'bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-900 dark:text-indigo-200'}">${m.confidence} MATCH</span>
        </div>
        <p class="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">${m.evidence}</p>
      `;
      evidenceList.appendChild(item);
    });
  }

  if (asm.citations) {
    asm.citations.forEach(c => {
      const citItem = document.createElement("div");
      citItem.className = "trace-card bg-purple-50/70 dark:bg-[#200a45] p-3.5 rounded-xl border border-purple-200/80 dark:border-purple-700/60 text-xs shadow-sm";
      citItem.innerHTML = `
        <div class="text-[10px] text-purple-900 dark:text-purple-300 uppercase font-bold mb-1">Database Fact Citation</div>
        <p class="text-slate-700 dark:text-purple-200 text-[11px] leading-relaxed">${c}</p>
      `;
      evidenceList.appendChild(citItem);
    });
  }

  renderOrders(asm.affected_orders);
}

// ============================================================================
// 13. Render Affected Orders & Multi-Option Trade-offs
// ============================================================================
function renderOrders(orders) {
  const container = document.getElementById("ordersContainer");
  container.innerHTML = "";

  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <div class="elite-card rounded-2xl p-8 text-center space-y-2.5 shadow-md">
        <div class="text-4xl">✅</div>
        <h4 class="text-base font-extrabold text-white">All Customer Orders Safe</h4>
        <p class="text-xs text-emerald-200/90 max-w-lg mx-auto leading-relaxed font-medium">
          No committed sales orders, critical customer delivery dates, or warehouse stock allocations are compromised by this event. 
          No expedited freight expense or customer notification required.
        </p>
      </div>
    `;
    return;
  }

  orders.forEach(order => {
    const recommendedOpt = order.options ? (order.options.find(o => o.is_recommended) || order.options[0]) : null;
    if (!selectedOptions[order.order_id] && recommendedOpt) {
      selectedOptions[order.order_id] = recommendedOpt.option_id;
    }

    const orderCard = document.createElement("div");
    orderCard.className = "elite-card rounded-2xl p-6 space-y-4 shadow-sm";
    orderCard.id = `card-${order.order_id}`;

    let tierBadgeClass = "bg-slate-100 text-slate-700 border-slate-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700";
    if (order.customer_tier === "Platinum") tierBadgeClass = "bg-rose-50 text-rose-800 border-rose-200 font-bold dark:bg-rose-950/60 dark:text-rose-200";
    else if (order.customer_tier === "Gold") tierBadgeClass = "bg-amber-50 text-amber-800 border-amber-200 font-bold dark:bg-amber-950/60 dark:text-amber-200";

    let urgencyBadgeClass = "bg-slate-100 text-slate-700";
    if (order.urgency_level === "CRITICAL") urgencyBadgeClass = "bg-rose-600 text-white font-bold";
    else if (order.urgency_level === "HIGH") urgencyBadgeClass = "bg-amber-600 text-white font-bold";
    else if (order.urgency_level === "MEDIUM") urgencyBadgeClass = "bg-purple-700 text-white font-bold";

    orderCard.innerHTML = `
      <!-- Order Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-purple-800/40 pb-3.5">
        <div class="flex items-center space-x-3">
          <span class="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/60 border border-purple-200 dark:border-purple-700 flex items-center justify-center font-extrabold text-xs text-purple-950 dark:text-white shadow-inner">
            #${order.ranking}
          </span>
          <div>
            <div class="flex items-center space-x-2">
              <h4 class="text-base font-bold text-slate-900 dark:text-white">${order.customer_name}</h4>
              <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full border ${tierBadgeClass}">${order.customer_tier} Tier</span>
              <span class="px-2.5 py-0.5 text-xs rounded-full ${urgencyBadgeClass}">${order.urgency_level} URGENCY</span>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Order: <strong class="text-slate-800 dark:text-white">${order.order_id}</strong> • SKU: <span class="text-purple-900 dark:text-purple-300 font-semibold">${order.sku_id}</span> (${order.sku_name})
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-5 text-xs">
          <div>
            <span class="text-slate-500 dark:text-slate-400 block">Promised Date:</span>
            <strong class="text-slate-900 dark:text-white block font-semibold">${order.promise_date}</strong>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 block">Projected Slip:</span>
            <strong class="text-rose-600 dark:text-rose-400 block font-bold">+${order.projected_slip_days} Days Late</strong>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 block">SLA Exposure:</span>
            <strong class="text-rose-600 dark:text-rose-400 block font-bold">$${(order.total_sla_risk || 0).toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <!-- Traceability Citations Accordion -->
      <details class="bg-slate-50/80 dark:bg-[#140529] border border-slate-200 dark:border-purple-800/50 rounded-xl p-3 text-xs group">
        <summary class="cursor-pointer font-bold text-purple-900 dark:text-purple-200 flex items-center justify-between select-none">
          <span>🔍 Evidence</span>
          <span class="text-[10px] text-slate-400 group-open:rotate-180 transition">▼</span>
        </summary>
        <ul class="mt-2.5 space-y-1.5 text-slate-700 dark:text-slate-200 pl-3 border-l-2 border-purple-600">
          ${order.data_citations ? order.data_citations.map(c => `<li>• ${c}</li>`).join("") : ""}
        </ul>
      </details>

      <!-- Options Grid -->
      <div>
        <div class="text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Resolutions</span>
          <span class="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">Select an option to commit:</span>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3" id="options-container-${order.order_id}">
          <!-- Injected dynamically -->
        </div>
      </div>

      <!-- Human Operator Action Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100 dark:border-purple-800/40">
        <div class="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
          <span class="text-purple-900 dark:text-purple-200 font-bold">Resolution:</span>
          <strong id="selectedLabel-${order.order_id}" class="text-slate-900 dark:text-white">${recommendedOpt ? recommendedOpt.title : "None"}</strong>
        </div>

        <div class="flex items-center space-x-3">
          <button class="btn-draft-email text-xs bg-purple-50 dark:bg-purple-900/60 hover:bg-purple-100 dark:hover:bg-purple-800 text-purple-900 dark:text-purple-200 hover:text-purple-950 px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-700 font-semibold transition cursor-pointer"
            data-order-id="${order.order_id}">
            ✉️ Draft
          </button>
          <button class="btn-commit-action elite-btn-primary text-white font-bold px-5 py-2.5 rounded-xl shadow-md text-xs transition cursor-pointer"
            data-order-id="${order.order_id}">
            ✓ Commit
          </button>
        </div>
      </div>
    `;

    container.appendChild(orderCard);

    const optionsContainer = document.getElementById(`options-container-${order.order_id}`);
    if (order.options) {
      order.options.forEach(opt => {
        const isSelected = selectedOptions[order.order_id] === opt.option_id;
        const optCard = document.createElement("div");
        optCard.className = `option-card border rounded-2xl p-5 cursor-pointer relative flex flex-col justify-between space-y-3.5 shadow-sm transition-all ${
          isSelected ? "selected border-purple-700 bg-purple-50/70 dark:bg-[#3b0764] ring-2 ring-purple-600/50" : "border-slate-200 dark:border-purple-800/50 bg-white dark:bg-[#15062e] hover:border-purple-300 hover:bg-purple-50/30 hover:shadow"
        }`;
        optCard.id = `optcard-${order.order_id}-${opt.option_id}`;

        optCard.innerHTML = `
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-3">
              <label class="flex items-center space-x-2.5 cursor-pointer">
                <input type="radio" name="opt-radio-${order.order_id}" value="${opt.option_id}" ${isSelected ? "checked" : ""} class="text-purple-700 focus:ring-purple-600 accent-purple-700 w-4 h-4 cursor-pointer shrink-0">
                <span class="font-bold text-[13px] text-slate-900 dark:text-white leading-tight">${opt.title}</span>
              </label>
              ${opt.is_recommended ? '<span class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-200 border border-purple-300 uppercase tracking-wide shrink-0">RECOMMENDED</span>' : ''}
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${opt.description}</p>

            ${opt.recommendation_rationale ? `
              <div class="bg-purple-50 dark:bg-[#250b4a] border border-purple-200 dark:border-purple-700/70 rounded-xl p-3 text-xs text-purple-950 dark:text-purple-100 leading-relaxed font-medium">
                ${opt.recommendation_rationale}
              </div>
            ` : ''}

            <div class="grid grid-cols-2 gap-3 text-xs pt-1">
              <div class="bg-slate-50 dark:bg-[#110426] p-3 rounded-xl border border-slate-200 dark:border-purple-800/50 space-y-1.5">
                <span class="text-purple-900 dark:text-purple-300 font-bold block text-[10px] uppercase tracking-wider">PROS</span>
                <ul class="space-y-1 text-slate-700 dark:text-slate-200 text-[11px] leading-snug">
                  ${opt.pros ? opt.pros.map(p => `<li class="flex items-start space-x-1.5"><span class="text-purple-700 dark:text-purple-400 font-bold shrink-0">+</span><span>${p}</span></li>`).join("") : ""}
                </ul>
              </div>
              <div class="bg-slate-50 dark:bg-[#110426] p-3 rounded-xl border border-slate-200 dark:border-purple-800/50 space-y-1.5">
                <span class="text-rose-700 dark:text-rose-400 font-bold block text-[10px] uppercase tracking-wider">CONS / TRADE-OFFS</span>
                <ul class="space-y-1 text-slate-700 dark:text-slate-200 text-[11px] leading-snug">
                  ${opt.cons ? opt.cons.map(c => `<li class="flex items-start space-x-1.5"><span class="text-rose-600 dark:text-rose-400 font-bold shrink-0">-</span><span>${c}</span></li>`).join("") : ""}
                </ul>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs border-t border-slate-100 dark:border-purple-800/40 pt-3 text-slate-600 dark:text-slate-300">
            <div>Cost: <strong class="text-slate-900 dark:text-white font-bold">$${(opt.cost || 0).toLocaleString()}</strong></div>
            <div>New ETA: <strong class="text-purple-900 dark:text-purple-300 font-bold">${opt.new_delivery_date}</strong></div>
            <div>SLA Risk: <strong class="text-rose-600 dark:text-rose-400 font-bold">$${(opt.sla_penalty_incurred || 0).toLocaleString()}</strong></div>
          </div>
        `;

        optCard.addEventListener("click", () => {
          selectOption(order.order_id, opt.option_id, opt.title);
        });

        optionsContainer.appendChild(optCard);
      });
    }

    orderCard.querySelector(".btn-draft-email").addEventListener("click", () => {
      openDraftEmailModal(order.order_id);
    });

    orderCard.querySelector(".btn-commit-action").addEventListener("click", () => {
      commitResolution(order.order_id);
    });
  });
}

function selectOption(orderId, optionId, optionTitle) {
  selectedOptions[orderId] = optionId;
  const container = document.getElementById(`options-container-${orderId}`);
  if (container) {
    container.querySelectorAll(".option-card").forEach(c => {
      c.classList.remove("selected", "border-purple-700", "bg-purple-50/70", "ring-2", "ring-purple-600/50");
      c.classList.add("border-slate-200", "bg-white");
    });
  }

  const activeCard = document.getElementById(`optcard-${orderId}-${optionId}`);
  if (activeCard) {
    activeCard.classList.add("selected", "border-purple-700", "bg-purple-50/70", "ring-2", "ring-purple-600/50");
    activeCard.classList.remove("border-slate-200", "bg-white");
    const radio = activeCard.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }

  const label = document.getElementById(`selectedLabel-${orderId}`);
  if (label) label.textContent = optionTitle;
}

// ============================================================================
// 14. Customer Email Draft Modal
// ============================================================================
async function openDraftEmailModal(orderId) {
  if (!currentAssessment) {
    alert("No active assessment available.");
    return;
  }
  const optionId = selectedOptions[orderId];
  if (!optionId) {
    alert("Please select a resolution option first.");
    return;
  }

  try {
    const res = await fetch("/api/disruption/draft-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessment_id: currentAssessment.assessment_id,
        order_id: orderId,
        option_id: optionId
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Draft generation failed");
    }

    const data = await res.json();
    document.getElementById("commModalTitle").textContent = `Customer Notification: ${data.customer_name} (#${data.order_id})`;
    document.getElementById("commModalSubtitle").textContent = `Grounded in chosen resolution (${data.option_id})`;
    document.getElementById("commModalBody").textContent = data.email_draft;
    document.getElementById("commModal").classList.remove("hidden");
    playAudioChime("ping");
  } catch (err) {
    alert("Failed to generate draft: " + err.message);
  }
}

function closeCommModal() {
  document.getElementById("commModal").classList.add("hidden");
}

// ============================================================================
// 15. Commit Human Operator Decision
// ============================================================================
async function commitResolution(orderId) {
  if (!currentAssessment) {
    alert("No active assessment available.");
    return;
  }
  const optionId = selectedOptions[orderId];
  if (!optionId) {
    alert("Please select a resolution option first.");
    return;
  }

  const orderImpact = currentAssessment.affected_orders.find(o => o.order_id === orderId);
  if (!orderImpact) {
    alert("Order not found in active assessment.");
    return;
  }

  const chosenOpt = orderImpact.options.find(o => o.option_id === optionId);
  if (!chosenOpt) {
    alert("Selected option not found for this order.");
    return;
  }

  const notes = prompt(`Confirm resolution '${chosenOpt.title}' for order ${orderId}.\nOptional notes:`, "Approved per recommendation");
  if (notes === null) return;

  try {
    const res = await fetch("/api/disruption/apply-decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessment_id: currentAssessment.assessment_id,
        order_id: orderId,
        chosen_option_type: chosenOpt.option_type,
        chosen_option_id: optionId,
        operator_notes: notes,
        approved_by: `${activePersona.name} (${activePersona.title || activePersona.type})`
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Decision commit failed");
    }

    const data = await res.json();
    showToast(`Resolution committed: ${data.order_id} -> ${data.new_order_status}`, "success", "✓");
    playAudioChime("success");
    loadAuditCount();

    const card = document.getElementById(`card-${orderId}`);
    if (card) {
      card.classList.add("ring-2", "ring-purple-600");
    }
  } catch (err) {
    alert("Failed to commit decision: " + err.message);
  }
}

// ============================================================================
// 16. Audit Log Modal
// ============================================================================
async function loadAuditCount() {
  try {
    const res = await fetch("/api/system/audit");
    const data = await res.json();
    const count = data.audit_entries ? data.audit_entries.length : 0;
    const badge = document.getElementById("auditCountBadge");
    if (badge) badge.textContent = count;
  } catch (e) {
    console.warn("Could not load audit count:", e);
  }
}

async function openAuditModal() {
  try {
    const res = await fetch("/api/system/audit");
    const data = await res.json();
    const list = document.getElementById("auditLogList");
    list.innerHTML = "";

    const entries = data.audit_entries || [];
    if (entries.length === 0) {
      list.innerHTML = `<div class="text-xs text-slate-500 text-center py-6">No audit entries recorded yet.</div>`;
    } else {
      entries.slice().reverse().forEach(e => {
        const div = document.createElement("div");
        div.className = "bg-slate-50 dark:bg-[#160731] border border-slate-200 dark:border-purple-800/60 rounded-xl p-3.5 text-xs space-y-1";
        div.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-bold text-purple-900 dark:text-purple-300">${e.event}</span>
            <span class="text-[10px] text-slate-500 font-mono">${new Date(e.timestamp).toLocaleTimeString()}</span>
          </div>
          <div class="text-slate-700 dark:text-slate-200 text-[11px]">${e.action_summary || e.detail || e.assessment_id || ""}</div>
          ${e.operator ? `<div class="text-[10px] text-purple-700 dark:text-purple-400 font-semibold">Approved by: ${e.operator}</div>` : ""}
        `;
        list.appendChild(div);
      });
    }

    document.getElementById("auditModal").classList.remove("hidden");
  } catch (err) {
    alert("Failed to load audit logs: " + err.message);
  }
}

function closeAuditModal() {
  document.getElementById("auditModal").classList.add("hidden");
}

// ============================================================================
// 17. Profile & Settings Modal Controls
// ============================================================================
function openProfileModal(focusEdit = false) {
  const input = document.getElementById("profileModalNameInput");
  const currentSaved = localStorage.getItem("chainSolve_username") || appSettings.username || "Username";
  if (input) {
    input.value = currentSaved;
  }
  const modal = document.getElementById("profileModal");
  if (modal) modal.classList.remove("hidden");

  if (focusEdit && input) {
    setTimeout(() => {
      input.focus();
      input.select();
    }, 120);
  }
}

function saveProfileNameFromModal() {
  const input = document.getElementById("profileModalNameInput");
  if (!input) return;
  const newName = input.value.trim() || "Username";
  localStorage.setItem("chainSolve_username", newName);
  appSettings.username = newName;
  localStorage.setItem("chainSolve_settings", JSON.stringify(appSettings));

  if (activePersona.type === "admin") {
    activePersona.name = newName;
  }
  updateActivePersonaUI();
  showToast(`Profile login name saved as: ${newName}`, "success", "💾");
  playAudioChime("success");
}

function closeProfileModal() {
  document.getElementById("profileModal").classList.add("hidden");
}

function openSettingsModal() {
  populateSettingsModal();
  document.getElementById("settingsModal").classList.remove("hidden");
}

function closeSettingsModal() {
  document.getElementById("settingsModal").classList.add("hidden");
}


// ============================================================================
// Multi-Portal Query Parameter Handler (?role=...&id=...)
// ============================================================================
function handleURLParamsOnLoad() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role");
  const id = params.get("id");

  if (role === "supplier") {
    const suppId = id || localStorage.getItem("chainSolve_supplier_id") || "SUP-001";
    loginAsSupplier(suppId);
    showToast(`Logged in to Supplier Portal (${suppId})`, "success", "🏭");
  } else if (role === "customer") {
    const custName = id || localStorage.getItem("chainSolve_customer_name") || "Tesla Energy Solutions";
    loginAsCustomer(custName);
    showToast(`Logged in to Customer Portal (${custName})`, "success", "🏢");
  } else if (role === "operator") {
    loginAsAdmin();
    showToast("Logged in as Operations Controller (Admin)", "info", "👑");
  }
}


// ============================================================================
// Client-Side Deterministic Disruption Simulator (Zero-API / GitHub Pages)
// ============================================================================
function simulateOfflineAssessment(payload) {
  const isFalseAlarm = payload.supplier_id === "SUP-006" || payload.disruption_type === "Other" && (!payload.sku_id && !payload.shipment_id && payload.delay_days <= 5);
  const isTaiwanAmbiguous = payload.affected_location && payload.affected_location.includes("Taiwan") && !payload.supplier_id;
  const isWarehouse = payload.disruption_type === "Warehouse Incident" || payload.sku_id === "SKU-3150" && payload.quantity_affected;

  if (isFalseAlarm) {
    return {
      assessment_id: "ASM-OFFLINE-FALSE-ALARM",
      has_system_impact: false,
      total_orders_impacted: 0,
      total_sla_penalty_exposure: 0,
      impact_summary: "Verified Zero Operational Impact. Acme Logistics regional notice checked against active supply chain repository: 0 active purchase orders and 0 scheduled shipments route through the affected Denver corridor.",
      grounding: {
        is_ambiguous: false,
        matches: [{ entity_type: "supplier", entity_id: "SUP-006", name: "Acme Logistics & Freight", has_active_dependencies: false }]
      },
      affected_orders: []
    };
  }

  if (isTaiwanAmbiguous) {
    return {
      assessment_id: "ASM-OFFLINE-AMBIGUOUS",
      has_system_impact: true,
      total_orders_impacted: 1,
      total_sla_penalty_exposure: 1200,
      impact_summary: "Ambiguous Regional Disruption Detected. Multiple suppliers operate within the impacted Taiwan zone (TSMC Micro Systems SUP-002, Foxconn Components SUP-003). Operator disambiguation required.",
      grounding: {
        is_ambiguous: true,
        ambiguity_reason: "Notice mentions 'Taiwan suppliers' affecting 2 active contracted suppliers with scheduled shipments.",
        matches: [{
          entity_type: "region",
          entity_id: "Taiwan",
          is_ambiguous: true,
          candidate_matches: [
            { supplier_id: "SUP-002", name: "TSMC Micro Systems", pending_shipments: ["SH-7714"] },
            { supplier_id: "SUP-003", name: "Foxconn Components Corp", pending_shipments: ["SH-6520"] }
          ]
        }]
      },
      affected_orders: [{
        order_id: "ORD-503",
        customer_name: "Rivian Automotive",
        customer_tier: "Gold",
        promise_date: "2026-09-16",
        projected_delivery_date: "2026-09-22",
        slip_days: 6,
        sla_penalty_per_day: 200,
        total_sla_exposure: 1200,
        urgency_level: "High",
        root_cause_summary: "Inbound Shipment SH-7714 delayed 6 days by Taiwan weather advisory.",
        citations: [{ source_record: "Shipment SH-7714", detail: "500 units SKU-2088" }],
        options: [
          { option_id: "OPT-1", title: "Expedite Air Express", description: "Reroute via air charter from Taipei", type: "expedite_air", cost: 1800, delay_days: 0, penalty_savings: 1200, net_savings: -600, recommended: false },
          { option_id: "OPT-2", title: "Part-Ship (80 units available)", description: "Dispatch 80 units from WH-MAIN stock immediately", type: "part_ship", cost: 250, delay_days: 0, penalty_savings: 800, net_savings: 550, recommended: true }
        ]
      }]
    };
  }

  // Standard Impact Assessment (Apex APX-902, Rotterdam Hold, Quality Recall, or Warehouse)
  let impactedOrders = [];
  let summary = "";
  let totalExposure = 0;

  if (isWarehouse) {
    summary = "Physical Warehouse Incident: Bay C-12 forklift accident destroyed 150 units of BAT-4400. Stockout triggered on ORD-505.";
    totalExposure = 450;
    impactedOrders.push({
      order_id: "ORD-505",
      customer_name: "General Industrial Robotics",
      customer_tier: "Standard",
      promise_date: "2026-09-18",
      projected_delivery_date: "2026-09-27",
      slip_days: 9,
      sla_penalty_per_day: 50,
      total_sla_exposure: 450,
      urgency_level: "High",
      root_cause_summary: "Destroyed 150 units in WH-MAIN Bay C-12",
      citations: [{ source_record: "WH-MAIN Inventory", detail: "On-hand dropped from 180 to 30 units" }],
      options: [
        { option_id: "OPT-1", title: "Emergency Supplier Replenishment", description: "Rush replenishment cycle from Nordic Lithium", type: "expedite_air", cost: 600, delay_days: 2, penalty_savings: 350, net_savings: -250, recommended: true },
        { option_id: "OPT-2", title: "Reschedule Delivery with Courtesy Credit", description: "Notify customer of incident and confirm rescheduled arrival", type: "reschedule", cost: 100, delay_days: 9, penalty_savings: 0, net_savings: -100, recommended: false }
      ]
    });
  } else if (payload.supplier_id === "SUP-003" || payload.sku_id === "SKU-4022") {
    summary = "Quality Quarantine Hold: Foxconn Components inspection delay of 12 days impacting Midwest Automation Parts.";
    totalExposure = 0;
    impactedOrders.push({
      order_id: "ORD-506",
      customer_name: "Midwest Automation Parts",
      customer_tier: "Standard",
      promise_date: "2026-09-28",
      projected_delivery_date: "2026-10-02",
      slip_days: 4,
      sla_penalty_per_day: 0,
      total_sla_exposure: 0,
      urgency_level: "Medium",
      root_cause_summary: "Inbound Shipment SH-6520 delayed by 12 days.",
      citations: [{ source_record: "Shipment SH-6520", detail: "400 units SKU-4022" }],
      options: [
        { option_id: "OPT-1", title: "Part-Ship Existing Warehouse Stock", description: "Fulfill from 100 available units in WH-MAIN", type: "part_ship", cost: 150, delay_days: 0, penalty_savings: 0, net_savings: -150, recommended: true }
      ]
    });
  } else if (payload.supplier_id === "SUP-004" || payload.shipment_id === "SH-9011") {
    summary = "Customs Maritime Hold: Rotterdam compliance audit on SH-9011 delaying 150 units BAT-4400 by 8 days.";
    totalExposure = 400;
    impactedOrders.push({
      order_id: "ORD-505",
      customer_name: "General Industrial Robotics",
      customer_tier: "Standard",
      promise_date: "2026-09-18",
      projected_delivery_date: "2026-09-26",
      slip_days: 8,
      sla_penalty_per_day: 50,
      total_sla_exposure: 400,
      urgency_level: "High",
      root_cause_summary: "Inbound SH-9011 customs clearance delayed.",
      citations: [{ source_record: "Shipment SH-9011", detail: "150 units SKU-3150" }],
      options: [
        { option_id: "OPT-1", title: "Expedite Customs Clearance Brokerage", description: "Engage expedited maritime customs clearance", type: "expedite_air", cost: 350, delay_days: 2, penalty_savings: 300, net_savings: -50, recommended: true }
      ]
    });
  } else if (payload.supplier_id === "SUP-002" || payload.shipment_id === "SH-7714") {
    summary = "Carrier Congestion: Port of Long Beach container delay of 10 days impacting Rivian Automotive.";
    totalExposure = 1200;
    impactedOrders.push({
      order_id: "ORD-503",
      customer_name: "Rivian Automotive",
      customer_tier: "Gold",
      promise_date: "2026-09-16",
      projected_delivery_date: "2026-09-22",
      slip_days: 6,
      sla_penalty_per_day: 200,
      total_sla_exposure: 1200,
      urgency_level: "High",
      root_cause_summary: "Inbound SH-7714 delayed 10 days by berth bottlenecks.",
      citations: [{ source_record: "Shipment SH-7714", detail: "500 units SKU-2088" }],
      options: [
        { option_id: "OPT-1", title: "Part-Ship 80 Units On-Hand", description: "Deliver 80 units immediately to avoid assembly stoppage; balance backordered.", type: "part_ship", cost: 300, delay_days: 0, penalty_savings: 1200, net_savings: 900, recommended: true },
        { option_id: "OPT-2", title: "Expedite Air Drayage", description: "Off-dock priority air drayage from Long Beach", type: "expedite_air", cost: 1600, delay_days: 1, penalty_savings: 1000, net_savings: -600, recommended: false }
      ]
    });
  } else {
    // Default: Apex APX-902 Factory Halt (Scenario 1 & 8)
    summary = `Critical Supplier Halt: Line 3 failure at Apex Precision delaying Inbound SH-8921 by ${payload.delay_days || 14} days. Downstream shock impacts Tesla Energy Solutions and Siemens Mobility Systems.`;
    totalExposure = 9350;
    impactedOrders.push({
      order_id: "ORD-501",
      customer_name: "Tesla Energy Solutions",
      customer_tier: "Platinum",
      promise_date: "2026-09-10",
      projected_delivery_date: "2026-09-21",
      slip_days: 11,
      sla_penalty_per_day: 500,
      total_sla_exposure: 5500,
      urgency_level: "Critical",
      root_cause_summary: "Inbound Shipment SH-8921 delayed by 14 days.",
      citations: [{ source_record: "Shipment SH-8921", detail: "200 units SKU-1049" }],
      options: [
        { option_id: "OPT-1", title: "Expedite Air Freight", description: "Rush inbound shipment via dedicated FedEx air express charter", type: "expedite_air", cost: 1250, delay_days: 0, penalty_savings: 5500, net_savings: 4250, recommended: true },
        { option_id: "OPT-2", title: "Part-Ship 50 Units On-Hand", description: "Ship 50 units immediately from WH-MAIN warehouse stock", type: "part_ship", cost: 350, delay_days: 0, penalty_savings: 3000, net_savings: 2650, recommended: false },
        { option_id: "OPT-3", title: "Reschedule Delivery with Notice", description: "Issue transparent customer notification with courtesy account credit", type: "reschedule", cost: 200, delay_days: 11, penalty_savings: 0, net_savings: -200, recommended: false }
      ]
    });
    impactedOrders.push({
      order_id: "ORD-502",
      customer_name: "Siemens Mobility Systems",
      customer_tier: "Platinum",
      promise_date: "2026-09-11",
      projected_delivery_date: "2026-09-22",
      slip_days: 11,
      sla_penalty_per_day: 350,
      total_sla_exposure: 3850,
      urgency_level: "Critical",
      root_cause_summary: "Inbound Shipment SH-8921 delayed by 14 days.",
      citations: [{ source_record: "Shipment SH-8921", detail: "200 units SKU-1049" }],
      options: [
        { option_id: "OPT-1", title: "Stock Reallocation from ORD-504", description: "Reallocate 20 units from flexible research order ORD-504 (Quantum Robotics)", type: "reallocate_stock", cost: 0, delay_days: 0, penalty_savings: 3850, net_savings: 3850, recommended: true },
        { option_id: "OPT-2", title: "Expedite Inbound Air Express", description: "Air freight dispatch for balance of 40 units", type: "expedite_air", cost: 950, delay_days: 2, penalty_savings: 3150, net_savings: 2200, recommended: false }
      ]
    });
  }

  return {
    assessment_id: "ASM-" + Date.now().toString(36).toUpperCase(),
    has_system_impact: true,
    total_orders_impacted: impactedOrders.length,
    total_sla_penalty_exposure: totalExposure,
    impact_summary: summary,
    grounding: {
      is_ambiguous: false,
      matches: [{ entity_type: "supplier", entity_id: payload.supplier_id || "SUP-001", name: "Apex Precision Technologies", has_active_dependencies: true }]
    },
    affected_orders: impactedOrders
  };
}
