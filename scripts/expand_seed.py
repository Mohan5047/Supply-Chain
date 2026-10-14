import json
from pathlib import Path

# Base existing data preservation
seed_path = Path("data/seed_data.json")
with open(seed_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# 1. Ensure 8 Suppliers
suppliers = data.get("suppliers", [])
existing_sup_ids = {s["supplier_id"] for s in suppliers}

new_suppliers = [
    {
        "supplier_id": "SUP-007",
        "name": "Bosch Mobility Electronics",
        "aliases": ["Bosch", "Bosch Mobility", "Bosch Electronics", "Robert Bosch"],
        "contact_email": "supply.automotive@bosch.de",
        "location": "Stuttgart, Germany",
        "reliability_score": 0.96,
        "expedite_available": True,
        "expedite_cost_multiplier": 1.4
    },
    {
        "supplier_id": "SUP-008",
        "name": "Murata Capacitors & Passives",
        "aliases": ["Murata", "Murata Electronics", "Murata Passives", "Murata Japan"],
        "contact_email": "orders@murata.jp",
        "location": "Kyoto, Japan",
        "reliability_score": 0.97,
        "expedite_available": True,
        "expedite_cost_multiplier": 1.35
    }
]

for ns in new_suppliers:
    if ns["supplier_id"] not in existing_sup_ids:
        suppliers.append(ns)
        existing_sup_ids.add(ns["supplier_id"])

# 2. Ensure 4 Warehouses
warehouses = [
    {
        "warehouse_id": "WH-MAIN",
        "warehouse_name": "Central Logistics Hub - Chicago",
        "city": "Chicago, IL",
        "capacity_pallets": 15000,
        "manager": "D. Miller",
        "status": "Operational"
    },
    {
        "warehouse_id": "WH-WEST",
        "warehouse_name": "Pacific Gateway Hub - Reno",
        "city": "Reno, NV",
        "capacity_pallets": 12000,
        "manager": "T. Martinez",
        "status": "Operational"
    },
    {
        "warehouse_id": "WH-EAST",
        "warehouse_name": "Atlantic Logistics Center - Newark",
        "city": "Newark, NJ",
        "capacity_pallets": 10000,
        "manager": "R. Sterling",
        "status": "Operational"
    },
    {
        "warehouse_id": "WH-SOUTH",
        "warehouse_name": "Sunbelt Distribution Depot - Dallas",
        "city": "Dallas, TX",
        "capacity_pallets": 14000,
        "manager": "K. Washington",
        "status": "Operational"
    }
]

# 3. Ensure 20 Products / SKUs
skus = data.get("skus", [])
existing_sku_ids = {s["sku_id"] for s in skus}

additional_skus = [
    {
        "sku_id": "SKU-1006",
        "name": "Multi-Layer Ceramic Capacitor Array 100uF",
        "aliases": ["MLCC-100uF", "capacitor array", "ceramic capacitors", "Murata caps"],
        "category": "Passive Components",
        "unit_cost": 12.0,
        "unit_price": 28.0,
        "lead_time_days": 8,
        "safety_stock_threshold": 200,
        "preferred_supplier_id": "SUP-008"
    },
    {
        "sku_id": "SKU-1007",
        "name": "CAN-Bus Transceiver IC Industrial Grade",
        "aliases": ["CAN-IC", "CAN transceiver", "CAN-bus controller", "Bosch CAN chip"],
        "category": "Semiconductors",
        "unit_cost": 22.0,
        "unit_price": 55.0,
        "lead_time_days": 12,
        "safety_stock_threshold": 80,
        "preferred_supplier_id": "SUP-007"
    },
    {
        "sku_id": "SKU-1008",
        "name": "BLDC Motor Controller Inverter Board",
        "aliases": ["BLDC-INV", "motor inverter board", "motor controller", "inverter PCB"],
        "category": "Power Electronics",
        "unit_cost": 175.0,
        "unit_price": 380.0,
        "lead_time_days": 16,
        "safety_stock_threshold": 35,
        "preferred_supplier_id": "SUP-007"
    },
    {
        "sku_id": "SKU-1009",
        "name": "MEMS Inertial Measurement Unit 6-DoF",
        "aliases": ["IMU-6DOF", "inertial measurement unit", "MEMS gyroscope", "6-axis IMU"],
        "category": "Sensors",
        "unit_cost": 48.0,
        "unit_price": 110.0,
        "lead_time_days": 14,
        "safety_stock_threshold": 75,
        "preferred_supplier_id": "SUP-008"
    },
    {
        "sku_id": "SKU-1010",
        "name": "Silicon Carbide MOSFET Power Switch",
        "aliases": ["SiC-MOSFET", "SiC switch", "silicon carbide transistor", "power MOSFET"],
        "category": "Power Electronics",
        "unit_cost": 92.0,
        "unit_price": 215.0,
        "lead_time_days": 18,
        "safety_stock_threshold": 60,
        "preferred_supplier_id": "SUP-007"
    },
    {
        "sku_id": "SKU-1011",
        "name": "Ruggedized Dual-Band GNSS Antenna",
        "aliases": ["GNSS-ANT", "GPS antenna", "dual-band GNSS", "Apex antenna"],
        "category": "RF & Wireless",
        "unit_cost": 65.0,
        "unit_price": 145.0,
        "lead_time_days": 10,
        "safety_stock_threshold": 45,
        "preferred_supplier_id": "SUP-001"
    },
    {
        "sku_id": "SKU-1012",
        "name": "FPGA Core System-on-Module 64K LE",
        "aliases": ["FPGA-SOM", "SoM 64K", "FPGA module", "TSMC FPGA board"],
        "category": "Embedded Systems",
        "unit_cost": 420.0,
        "unit_price": 890.0,
        "lead_time_days": 24,
        "safety_stock_threshold": 20,
        "preferred_supplier_id": "SUP-002"
    },
    {
        "sku_id": "SKU-1013",
        "name": "High-Current Relay Module 48V/100A",
        "aliases": ["RELAY-100A", "power relay 48V", "industrial relay module"],
        "category": "Electromechanical",
        "unit_cost": 58.0,
        "unit_price": 130.0,
        "lead_time_days": 12,
        "safety_stock_threshold": 50,
        "preferred_supplier_id": "SUP-003"
    },
    {
        "sku_id": "SKU-1014",
        "name": "High-Efficiency DC Fast-Charge Cable",
        "aliases": ["DCFC-CABLE", "fast charge harness", "charging cable", "Nordic cable"],
        "category": "Cabling & Harness",
        "unit_cost": 115.0,
        "unit_price": 250.0,
        "lead_time_days": 15,
        "safety_stock_threshold": 40,
        "preferred_supplier_id": "SUP-004"
    },
    {
        "sku_id": "SKU-1015",
        "name": "Solid-State LiDAR Ranging Sensor",
        "aliases": ["LiDAR-SS", "solid state lidar", "laser radar sensor", "Shenzhen LiDAR"],
        "category": "Optoelectronics",
        "unit_cost": 580.0,
        "unit_price": 1250.0,
        "lead_time_days": 28,
        "safety_stock_threshold": 15,
        "preferred_supplier_id": "SUP-005"
    },
    {
        "sku_id": "SKU-1016",
        "name": "Industrial Ethernet PHY Transceiver 1000Base-T",
        "aliases": ["ETH-PHY", "gigabit PHY", "ethernet transceiver", "TSMC PHY"],
        "category": "Networking",
        "unit_cost": 28.0,
        "unit_price": 68.0,
        "lead_time_days": 11,
        "safety_stock_threshold": 100,
        "preferred_supplier_id": "SUP-002"
    },
    {
        "sku_id": "SKU-1017",
        "name": "Precision Shunt Current Sensor 500A",
        "aliases": ["SHUNT-500A", "current sensor", "precision shunt", "Murata shunt"],
        "category": "Sensors",
        "unit_cost": 34.0,
        "unit_price": 82.0,
        "lead_time_days": 9,
        "safety_stock_threshold": 70,
        "preferred_supplier_id": "SUP-008"
    },
    {
        "sku_id": "SKU-1018",
        "name": "Thermal Management Aluminum Cold Plate",
        "aliases": ["COLD-PLATE", "aluminum cooling plate", "thermal cold plate"],
        "category": "Thermal Solutions",
        "unit_cost": 88.0,
        "unit_price": 195.0,
        "lead_time_days": 14,
        "safety_stock_threshold": 40,
        "preferred_supplier_id": "SUP-003"
    },
    {
        "sku_id": "SKU-1019",
        "name": "Battery Management System Master ECU",
        "aliases": ["BMS-ECU", "battery master ECU", "BMS controller", "Nordic BMS"],
        "category": "Battery Systems",
        "unit_cost": 340.0,
        "unit_price": 750.0,
        "lead_time_days": 21,
        "safety_stock_threshold": 25,
        "preferred_supplier_id": "SUP-004"
    },
    {
        "sku_id": "SKU-1020",
        "name": "Dual-Port Isolated RS-485 Interface Module",
        "aliases": ["RS485-MOD", "isolated serial interface", "RS-485 transceiver module"],
        "category": "Communication",
        "unit_cost": 38.0,
        "unit_price": 90.0,
        "lead_time_days": 10,
        "safety_stock_threshold": 65,
        "preferred_supplier_id": "SUP-007"
    }
]

for nsku in additional_skus:
    if nsku["sku_id"] not in existing_sku_ids:
        skus.append(nsku)
        existing_sku_ids.add(nsku["sku_id"])

# 4. Multi-Warehouse Inventory (for all 20 SKUs across 4 warehouses)
inventory = data.get("inventory", [])
existing_inv_keys = {f"{inv['warehouse_id']}_{inv['sku_id']}" for inv in inventory}

# Add inventory records for the other 3 warehouses and newly added SKUs
wh_list = ["WH-MAIN", "WH-WEST", "WH-EAST", "WH-SOUTH"]
for wh in warehouses:
    wh_id = wh["warehouse_id"]
    wh_name = wh["warehouse_name"]
    for s in skus:
        sku_id = s["sku_id"]
        key = f"{wh_id}_{sku_id}"
        if key not in existing_inv_keys:
            # Baseline quantities based on warehouse profile
            base_multiplier = 1.0 if wh_id == "WH-MAIN" else (0.7 if wh_id == "WH-WEST" else (0.5 if wh_id == "WH-EAST" else 0.6))
            on_hand = int(s["safety_stock_threshold"] * 2.2 * base_multiplier)
            allocated = int(on_hand * 0.45)
            reserved_safety = int(s["safety_stock_threshold"] * 0.3 * base_multiplier)
            available = max(0, on_hand - allocated - reserved_safety)
            bin_idx = hash(sku_id + wh_id) % 20 + 1
            inventory.append({
                "warehouse_id": wh_id,
                "warehouse_name": wh_name,
                "sku_id": sku_id,
                "on_hand": on_hand,
                "allocated": allocated,
                "reserved_safety": reserved_safety,
                "available": available,
                "location_bin": f"Aisle-{(bin_idx % 5)+1}-Bay-{(bin_idx % 12)+1:02d}"
            })
            existing_inv_keys.add(key)

# 5. Inbound Shipments: 25 shipments total
inbound_shipments = data.get("inbound_shipments", [])
existing_ship_ids = {s["shipment_id"] for s in inbound_shipments}

more_shipments = [
    {
        "shipment_id": "SH-1005",
        "po_number": "PO-7711",
        "supplier_id": "SUP-007",
        "carrier_name": "DHL Express Global",
        "tracking_number": "DHL-992101",
        "origin": "Stuttgart, Germany",
        "destination_warehouse": "WH-EAST",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-14",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1007", "quantity_ordered": 400, "quantity_shipped": 400}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 2,
        "expedite_air_cost": 2100.0
    },
    {
        "shipment_id": "SH-1006",
        "po_number": "PO-7712",
        "supplier_id": "SUP-008",
        "carrier_name": "Ocean Network Express (ONE)",
        "tracking_number": "ONE-332910",
        "origin": "Kyoto, Japan",
        "destination_warehouse": "WH-WEST",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-18",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1006", "quantity_ordered": 1500, "quantity_shipped": 1500}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 3,
        "expedite_air_cost": 1600.0
    },
    {
        "shipment_id": "SH-1007",
        "po_number": "PO-7713",
        "supplier_id": "SUP-001",
        "carrier_name": "FedEx Freight Express",
        "tracking_number": "FX-449102",
        "origin": "Fremont, CA",
        "destination_warehouse": "WH-WEST",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-09",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1011", "quantity_ordered": 150, "quantity_shipped": 150}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 1,
        "expedite_air_cost": 750.0
    },
    {
        "shipment_id": "SH-1008",
        "po_number": "PO-7714",
        "supplier_id": "SUP-002",
        "carrier_name": "Maersk Line",
        "tracking_number": "MSKU-440192",
        "origin": "Hsinchu, Taiwan",
        "destination_warehouse": "WH-WEST",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-22",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1012", "quantity_ordered": 100, "quantity_shipped": 100}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 4,
        "expedite_air_cost": 4200.0
    },
    {
        "shipment_id": "SH-1009",
        "po_number": "PO-7715",
        "supplier_id": "SUP-003",
        "carrier_name": "UPS Freight Air",
        "tracking_number": "UPS-119280",
        "origin": "Taipei, Taiwan",
        "destination_warehouse": "WH-MAIN",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-11",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1013", "quantity_ordered": 250, "quantity_shipped": 250}],
        "expedite_air_available": False,
        "expedite_air_lead_time_days": None,
        "expedite_air_cost": 0.0
    },
    {
        "shipment_id": "SH-1010",
        "po_number": "PO-7716",
        "supplier_id": "SUP-004",
        "carrier_name": "DHL Global Forwarding",
        "tracking_number": "DHL-663810",
        "origin": "Oslo, Norway",
        "destination_warehouse": "WH-EAST",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-17",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1014", "quantity_ordered": 180, "quantity_shipped": 180}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 3,
        "expedite_air_cost": 2900.0
    },
    {
        "shipment_id": "SH-1011",
        "po_number": "PO-7717",
        "supplier_id": "SUP-005",
        "carrier_name": "FedEx Air Cargo",
        "tracking_number": "FX-221940",
        "origin": "Shenzhen, China",
        "destination_warehouse": "WH-WEST",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-13",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1015", "quantity_ordered": 60, "quantity_shipped": 60}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 2,
        "expedite_air_cost": 3100.0
    },
    {
        "shipment_id": "SH-1012",
        "po_number": "PO-7718",
        "supplier_id": "SUP-007",
        "carrier_name": "Kuehne + Nagel",
        "tracking_number": "KN-552019",
        "origin": "Stuttgart, Germany",
        "destination_warehouse": "WH-MAIN",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-16",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1008", "quantity_ordered": 120, "quantity_shipped": 120}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 3,
        "expedite_air_cost": 2600.0
    },
    {
        "shipment_id": "SH-1013",
        "po_number": "PO-7719",
        "supplier_id": "SUP-008",
        "carrier_name": "Nippon Express Air",
        "tracking_number": "NE-881204",
        "origin": "Kyoto, Japan",
        "destination_warehouse": "WH-SOUTH",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-12",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1009", "quantity_ordered": 300, "quantity_shipped": 300}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 2,
        "expedite_air_cost": 1850.0
    },
    {
        "shipment_id": "SH-1014",
        "po_number": "PO-7720",
        "supplier_id": "SUP-007",
        "carrier_name": "Lufthansa Cargo",
        "tracking_number": "LH-772910",
        "origin": "Frankfurt, Germany",
        "destination_warehouse": "WH-SOUTH",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-15",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1010", "quantity_ordered": 220, "quantity_shipped": 220}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 2,
        "expedite_air_cost": 2400.0
    },
    {
        "shipment_id": "SH-1015",
        "po_number": "PO-7721",
        "supplier_id": "SUP-002",
        "carrier_name": "China Airlines Cargo",
        "tracking_number": "CI-339180",
        "origin": "Taipei, Taiwan",
        "destination_warehouse": "WH-EAST",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-10",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1016", "quantity_ordered": 500, "quantity_shipped": 500}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 2,
        "expedite_air_cost": 1500.0
    },
    {
        "shipment_id": "SH-1016",
        "po_number": "PO-7722",
        "supplier_id": "SUP-008",
        "carrier_name": "Yamato Transport",
        "tracking_number": "YT-992100",
        "origin": "Osaka, Japan",
        "destination_warehouse": "WH-MAIN",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-19",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1017", "quantity_ordered": 350, "quantity_shipped": 350}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 3,
        "expedite_air_cost": 1900.0
    },
    {
        "shipment_id": "SH-1017",
        "po_number": "PO-7723",
        "supplier_id": "SUP-003",
        "carrier_name": "Evergreen Marine",
        "tracking_number": "EGLV-441029",
        "origin": "Kaohsiung, Taiwan",
        "destination_warehouse": "WH-WEST",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-24",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1018", "quantity_ordered": 200, "quantity_shipped": 200}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 4,
        "expedite_air_cost": 2300.0
    },
    {
        "shipment_id": "SH-1018",
        "po_number": "PO-7724",
        "supplier_id": "SUP-004",
        "carrier_name": "SAS Cargo Logistics",
        "tracking_number": "SK-551029",
        "origin": "Oslo, Norway",
        "destination_warehouse": "WH-MAIN",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-14",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1019", "quantity_ordered": 80, "quantity_shipped": 80}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 2,
        "expedite_air_cost": 3200.0
    },
    {
        "shipment_id": "SH-1019",
        "po_number": "PO-7725",
        "supplier_id": "SUP-007",
        "carrier_name": "Acme Regional Express",
        "tracking_number": "ACM-881920",
        "origin": "Denver, CO",
        "destination_warehouse": "WH-SOUTH",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-08",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1020", "quantity_ordered": 300, "quantity_shipped": 300}],
        "expedite_air_available": False,
        "expedite_air_lead_time_days": None,
        "expedite_air_cost": 0.0
    },
    {
        "shipment_id": "SH-1020",
        "po_number": "PO-7726",
        "supplier_id": "SUP-001",
        "carrier_name": "FedEx Freight Express",
        "tracking_number": "FX-774011",
        "origin": "Fremont, CA",
        "destination_warehouse": "WH-EAST",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-16",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1049", "quantity_ordered": 180, "quantity_shipped": 180}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 2,
        "expedite_air_cost": 1400.0
    },
    {
        "shipment_id": "SH-1021",
        "po_number": "PO-7727",
        "supplier_id": "SUP-002",
        "carrier_name": "Yang Ming Marine",
        "tracking_number": "YMLU-881920",
        "origin": "Keelung, Taiwan",
        "destination_warehouse": "WH-WEST",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-25",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-2088", "quantity_ordered": 600, "quantity_shipped": 600}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 4,
        "expedite_air_cost": 4100.0
    },
    {
        "shipment_id": "SH-1022",
        "po_number": "PO-7728",
        "supplier_id": "SUP-004",
        "carrier_name": "Maersk Line",
        "tracking_number": "MSKU-112940",
        "origin": "Bergen, Norway",
        "destination_warehouse": "WH-EAST",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-21",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-3150", "quantity_ordered": 220, "quantity_shipped": 220}],
        "expedite_air_available": False,
        "expedite_air_lead_time_days": None,
        "expedite_air_cost": 0.0
    },
    {
        "shipment_id": "SH-1023",
        "po_number": "PO-7729",
        "supplier_id": "SUP-003",
        "carrier_name": "DHL Global Forwarding",
        "tracking_number": "DHL-330194",
        "origin": "Taipei, Taiwan",
        "destination_warehouse": "WH-SOUTH",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-17",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-4022", "quantity_ordered": 350, "quantity_shipped": 350}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 3,
        "expedite_air_cost": 1700.0
    },
    {
        "shipment_id": "SH-1024",
        "po_number": "PO-7730",
        "supplier_id": "SUP-005",
        "carrier_name": "Ocean Network Express (ONE)",
        "tracking_number": "ONE-551029",
        "origin": "Yantian, China",
        "destination_warehouse": "WH-MAIN",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-27",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-5011", "quantity_ordered": 80, "quantity_shipped": 80}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 3,
        "expedite_air_cost": 3300.0
    },
    {
        "shipment_id": "SH-1025",
        "po_number": "PO-7731",
        "supplier_id": "SUP-007",
        "carrier_name": "FedEx Freight Express",
        "tracking_number": "FX-991048",
        "origin": "Stuttgart, Germany",
        "destination_warehouse": "WH-WEST",
        "status": "in_transit",
        "scheduled_arrival_date": "2026-09-13",
        "revised_arrival_date": None,
        "items": [{"sku_id": "SKU-1007", "quantity_ordered": 250, "quantity_shipped": 250}],
        "expedite_air_available": True,
        "expedite_air_lead_time_days": 2,
        "expedite_air_cost": 1950.0
    }
]

for ns in more_shipments:
    if ns["shipment_id"] not in existing_ship_ids:
        inbound_shipments.append(ns)
        existing_ship_ids.add(ns["shipment_id"])

# 6. Customer Orders: 30 orders total
customer_orders = data.get("customer_orders", [])
existing_ord_ids = {o["order_id"] for o in customer_orders}

more_orders = [
    {
        "order_id": "ORD-507",
        "customer_name": "Apple Hardware Ops",
        "customer_tier": "Platinum",
        "priority": 1,
        "order_date": "2026-08-29",
        "promise_date": "2026-09-12",
        "sla_penalty_per_day": 600.0,
        "destination_city": "Cupertino, CA",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-1006", "quantity_demanded": 500, "quantity_allocated": 200}],
        "notes": "iPhone prototype automated test bench component build."
    },
    {
        "order_id": "ORD-508",
        "customer_name": "General Motors EV Propulsion",
        "customer_tier": "Platinum",
        "priority": 1,
        "order_date": "2026-08-31",
        "promise_date": "2026-09-14",
        "sla_penalty_per_day": 450.0,
        "destination_city": "Warren, MI",
        "status": "partially_allocated",
        "items": [{"sku_id": "SKU-1008", "quantity_demanded": 80, "quantity_allocated": 30}],
        "notes": "Ultium motor inverter module assembly line."
    },
    {
        "order_id": "ORD-509",
        "customer_name": "Amazon Robotics Fulfilment",
        "customer_tier": "Platinum",
        "priority": 1,
        "order_date": "2026-09-01",
        "promise_date": "2026-09-15",
        "sla_penalty_per_day": 550.0,
        "destination_city": "Seattle, WA",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-1009", "quantity_demanded": 150, "quantity_allocated": 60}],
        "notes": "Hercules drive robot navigation sensor retrofits."
    },
    {
        "order_id": "ORD-510",
        "customer_name": "Honeywell Aerospace",
        "customer_tier": "Platinum",
        "priority": 1,
        "order_date": "2026-08-27",
        "promise_date": "2026-09-13",
        "sla_penalty_per_day": 700.0,
        "destination_city": "Phoenix, AZ",
        "status": "partially_allocated",
        "items": [{"sku_id": "SKU-1012", "quantity_demanded": 40, "quantity_allocated": 10}],
        "notes": "Avionics primary cockpit display processing cards."
    },
    {
        "order_id": "ORD-511",
        "customer_name": "Schneider Electric Grid",
        "customer_tier": "Gold",
        "priority": 2,
        "order_date": "2026-08-26",
        "promise_date": "2026-09-19",
        "sla_penalty_per_day": 250.0,
        "destination_city": "Nashville, TN",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-1010", "quantity_demanded": 90, "quantity_allocated": 40}],
        "notes": "Smart substation switchgear installation."
    },
    {
        "order_id": "ORD-512",
        "customer_name": "Lockheed Martin Space",
        "customer_tier": "Platinum",
        "priority": 1,
        "order_date": "2026-09-02",
        "promise_date": "2026-09-17",
        "sla_penalty_per_day": 800.0,
        "destination_city": "Denver, CO",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-1011", "quantity_demanded": 50, "quantity_allocated": 15}],
        "notes": "Satellite ground terminal tracking array."
    },
    {
        "order_id": "ORD-513",
        "customer_name": "ABB Automation Solutions",
        "customer_tier": "Gold",
        "priority": 2,
        "order_date": "2026-08-24",
        "promise_date": "2026-09-20",
        "sla_penalty_per_day": 180.0,
        "destination_city": "Auburn Hills, MI",
        "status": "partially_allocated",
        "items": [{"sku_id": "SKU-1013", "quantity_demanded": 120, "quantity_allocated": 50}],
        "notes": "Robotic welding cell power relay panels."
    },
    {
        "order_id": "ORD-514",
        "customer_name": "ChargePoint Technologies",
        "customer_tier": "Gold",
        "priority": 2,
        "order_date": "2026-08-29",
        "promise_date": "2026-09-21",
        "sla_penalty_per_day": 220.0,
        "destination_city": "Campbell, CA",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-1014", "quantity_demanded": 60, "quantity_allocated": 20}],
        "notes": "Express DC fast charger highway deployment corridor."
    },
    {
        "order_id": "ORD-515",
        "customer_name": "Waymo Autonomous Fleet",
        "customer_tier": "Platinum",
        "priority": 1,
        "order_date": "2026-09-03",
        "promise_date": "2026-09-18",
        "sla_penalty_per_day": 650.0,
        "destination_city": "Mountain View, CA",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-1015", "quantity_demanded": 25, "quantity_allocated": 5}],
        "notes": "6th-generation robotaxi roof pod sensor suite."
    },
    {
        "order_id": "ORD-516",
        "customer_name": "Cisco Systems Enterprise",
        "customer_tier": "Gold",
        "priority": 2,
        "order_date": "2026-08-22",
        "promise_date": "2026-09-22",
        "sla_penalty_per_day": 150.0,
        "destination_city": "San Jose, CA",
        "status": "allocated",
        "items": [{"sku_id": "SKU-1016", "quantity_demanded": 200, "quantity_allocated": 200}],
        "notes": "Catalyst industrial switch hardware refresh batch."
    },
    {
        "order_id": "ORD-517",
        "customer_name": "Eaton Power Quality",
        "customer_tier": "Gold",
        "priority": 2,
        "order_date": "2026-08-30",
        "promise_date": "2026-09-23",
        "sla_penalty_per_day": 170.0,
        "destination_city": "Raleigh, NC",
        "status": "partially_allocated",
        "items": [{"sku_id": "SKU-1017", "quantity_demanded": 140, "quantity_allocated": 70}],
        "notes": "Modular UPS precision current monitoring subsystem."
    },
    {
        "order_id": "ORD-518",
        "customer_name": "Vertiv Data Infrastructure",
        "customer_tier": "Standard",
        "priority": 3,
        "order_date": "2026-08-21",
        "promise_date": "2026-09-26",
        "sla_penalty_per_day": 60.0,
        "destination_city": "Columbus, OH",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-1018", "quantity_demanded": 80, "quantity_allocated": 30}],
        "notes": "Liquid cooled server rack manifold cooling units."
    },
    {
        "order_id": "ORD-519",
        "customer_name": "Fluence Energy Storage",
        "customer_tier": "Platinum",
        "priority": 1,
        "order_date": "2026-09-01",
        "promise_date": "2026-09-16",
        "sla_penalty_per_day": 520.0,
        "destination_city": "Arlington, VA",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-1019", "quantity_demanded": 35, "quantity_allocated": 10}],
        "notes": "Utility-scale Gridstack battery energy storage controllers."
    },
    {
        "order_id": "ORD-520",
        "customer_name": "Rockwell Automation OEM",
        "customer_tier": "Standard",
        "priority": 3,
        "order_date": "2026-08-25",
        "promise_date": "2026-09-27",
        "sla_penalty_per_day": 40.0,
        "destination_city": "Milwaukee, WI",
        "status": "allocated",
        "items": [{"sku_id": "SKU-1020", "quantity_demanded": 150, "quantity_allocated": 150}],
        "notes": "Point I/O fieldbus communication interface expansion."
    },
    {
        "order_id": "ORD-521",
        "customer_name": "Lucid Motors",
        "customer_tier": "Gold",
        "priority": 2,
        "order_date": "2026-08-28",
        "promise_date": "2026-09-24",
        "sla_penalty_per_day": 260.0,
        "destination_city": "Casa Grande, AZ",
        "status": "partially_allocated",
        "items": [{"sku_id": "SKU-1007", "quantity_demanded": 120, "quantity_allocated": 50}],
        "notes": "Lucid Gravity powertrain telemetry bus module."
    },
    {
        "order_id": "ORD-522",
        "customer_name": "Zoox Mobility Robot",
        "customer_tier": "Gold",
        "priority": 2,
        "order_date": "2026-09-02",
        "promise_date": "2026-09-25",
        "sla_penalty_per_day": 240.0,
        "destination_city": "Foster City, CA",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-1011", "quantity_demanded": 30, "quantity_allocated": 10}],
        "notes": "Bidirectional vehicle roof antenna mounting modules."
    },
    {
        "order_id": "ORD-523",
        "customer_name": "Northrop Grumman Mission",
        "customer_tier": "Platinum",
        "priority": 1,
        "order_date": "2026-08-30",
        "promise_date": "2026-09-15",
        "sla_penalty_per_day": 750.0,
        "destination_city": "Baltimore, MD",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-5011", "quantity_demanded": 20, "quantity_allocated": 5}],
        "notes": "Secure fiber optic tactical communications gateway."
    },
    {
        "order_id": "ORD-524",
        "customer_name": "Siemens Energy USA",
        "customer_tier": "Platinum",
        "priority": 1,
        "order_date": "2026-08-29",
        "promise_date": "2026-09-17",
        "sla_penalty_per_day": 480.0,
        "destination_city": "Orlando, FL",
        "status": "partially_allocated",
        "items": [{"sku_id": "SKU-1010", "quantity_demanded": 70, "quantity_allocated": 25}],
        "notes": "Gas turbine electronic governor power driver."
    },
    {
        "order_id": "ORD-525",
        "customer_name": "John Deere Autonomous Ag",
        "customer_tier": "Gold",
        "priority": 2,
        "order_date": "2026-08-27",
        "promise_date": "2026-09-22",
        "sla_penalty_per_day": 190.0,
        "destination_city": "Moline, IL",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-1015", "quantity_demanded": 15, "quantity_allocated": 5}],
        "notes": "Autonomous combine harvester terrain obstacle detection."
    },
    {
        "order_id": "ORD-526",
        "customer_name": "Cummins Power Generation",
        "customer_tier": "Standard",
        "priority": 3,
        "order_date": "2026-08-23",
        "promise_date": "2026-09-28",
        "sla_penalty_per_day": 50.0,
        "destination_city": "Columbus, IN",
        "status": "allocated",
        "items": [{"sku_id": "SKU-1013", "quantity_demanded": 80, "quantity_allocated": 80}],
        "notes": "Stationary standby generator start solenoid circuits."
    },
    {
        "order_id": "ORD-527",
        "customer_name": "Proterra Electric Transit",
        "customer_tier": "Gold",
        "priority": 2,
        "order_date": "2026-08-28",
        "promise_date": "2026-09-23",
        "sla_penalty_per_day": 210.0,
        "destination_city": "Greenville, SC",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-1014", "quantity_demanded": 35, "quantity_allocated": 10}],
        "notes": "Heavy-duty electric transit bus rooftop pantograph charging cable."
    },
    {
        "order_id": "ORD-528",
        "customer_name": "Raytheon Intelligence",
        "customer_tier": "Platinum",
        "priority": 1,
        "order_date": "2026-09-01",
        "promise_date": "2026-09-18",
        "sla_penalty_per_day": 620.0,
        "destination_city": "Tucson, AZ",
        "status": "unfulfilled",
        "items": [{"sku_id": "SKU-1012", "quantity_demanded": 25, "quantity_allocated": 5}],
        "notes": "Next-gen radar digital signal processing subassembly."
    },
    {
        "order_id": "ORD-529",
        "customer_name": "Danfoss Drives Americas",
        "customer_tier": "Standard",
        "priority": 3,
        "order_date": "2026-08-26",
        "promise_date": "2026-09-29",
        "sla_penalty_per_day": 45.0,
        "destination_city": "Loves Park, IL",
        "status": "allocated",
        "items": [{"sku_id": "SKU-1006", "quantity_demanded": 300, "quantity_allocated": 300}],
        "notes": "VLT variable frequency drive filter capacitor kits."
    },
    {
        "order_id": "ORD-530",
        "customer_name": "Enovix Advanced Silicon",
        "customer_tier": "Gold",
        "priority": 2,
        "order_date": "2026-08-29",
        "promise_date": "2026-09-24",
        "sla_penalty_per_day": 230.0,
        "destination_city": "Fremont, CA",
        "status": "partially_allocated",
        "items": [{"sku_id": "SKU-1019", "quantity_demanded": 20, "quantity_allocated": 8}],
        "notes": "Silicon-anode lithium cell formation and cycling racks."
    }
]

for no in more_orders:
    if no["order_id"] not in existing_ord_ids:
        customer_orders.append(no)
        existing_ord_ids.add(no["order_id"])

# 7. Seed Demo Disruptions: 5 Realistic Enterprise Scenarios
disruptions = [
    {
        "disruption_id": "DISR-2026-001",
        "title": "Fremont Line 3 Hydraulic Pump Failure",
        "disruption_type": "Supplier Production Halt",
        "supplier_id": "SUP-001",
        "shipment_id": "SH-8921",
        "po_number": "PO-4482",
        "sku_id": "SKU-1049",
        "warehouse_id": "WH-MAIN",
        "location": "Fremont, CA",
        "severity": "Critical",
        "status": "Action Required",
        "reported_at": "2026-09-05T06:40:00Z",
        "delay_days": 14,
        "quantity_affected": 200,
        "description": "Production Line 3 at Apex Fremont facility experienced a catastrophic hydraulic pump failure. Dispatches of APX-902 optical sensor assemblies delayed by 14 days.",
        "evidence": "EDI dispatch delay notice from Marcus Vance; confirmed zero unallocated safety stock in WH-MAIN.",
        "affected_orders_count": 2,
        "estimated_financial_impact": 18200.0,
        "resolved_at": None,
        "resolution_method": None,
        "resolution_notes": None
    },
    {
        "disruption_id": "DISR-2026-002",
        "title": "Port of Long Beach Berth & Railhead Congestion",
        "disruption_type": "Carrier/Shipment Delay",
        "supplier_id": "SUP-002",
        "shipment_id": "SH-7714",
        "po_number": "PO-3910",
        "sku_id": "SKU-2088",
        "warehouse_id": "WH-MAIN",
        "location": "Port of Long Beach, CA",
        "severity": "High",
        "status": "Under Analysis",
        "reported_at": "2026-09-05T07:15:00Z",
        "delay_days": 10,
        "quantity_affected": 500,
        "description": "Severe vessel anchorage queue and intermodal chassis shortage at Long Beach terminal. Container MSKU-8839210 arrival pushed back 10 days.",
        "evidence": "Maersk AIS AIS-vessel voyage 402W tracking notice and terminal gate hold telemetry.",
        "affected_orders_count": 1,
        "estimated_financial_impact": 9400.0,
        "resolved_at": None,
        "resolution_method": None,
        "resolution_notes": None
    },
    {
        "disruption_id": "DISR-2026-003",
        "title": "WH-MAIN Bay C-12 Forklift Mast Failure & Pallet Crush",
        "disruption_type": "Warehouse Incident",
        "supplier_id": "SUP-004",
        "shipment_id": None,
        "po_number": None,
        "sku_id": "SKU-3150",
        "warehouse_id": "WH-MAIN",
        "location": "Central Logistics Hub - Chicago",
        "severity": "Critical",
        "status": "Action Required",
        "reported_at": "2026-09-05T06:15:00Z",
        "delay_days": 18,
        "quantity_affected": 150,
        "description": "Forklift mast cable rupture during morning staging. Two pallet loads (150 units) of industrial lithium battery packs destroyed and quarantined.",
        "evidence": "Warehouse Incident Report #IR-2026-0905-01 signed by D. Miller; scrap write-off logged.",
        "affected_orders_count": 1,
        "estimated_financial_impact": 31500.0,
        "resolved_at": None,
        "resolution_method": None,
        "resolution_notes": None
    },
    {
        "disruption_id": "DISR-2026-004",
        "title": "Hsinchu Fab 12 Wafer Stepper Allocation Shortage",
        "disruption_type": "Inventory Shortage",
        "supplier_id": "SUP-002",
        "shipment_id": "SH-1008",
        "po_number": "PO-7714",
        "sku_id": "SKU-1012",
        "warehouse_id": "WH-WEST",
        "location": "Hsinchu Science Park, Taiwan",
        "severity": "High",
        "status": "In Progress",
        "reported_at": "2026-09-04T18:30:00Z",
        "delay_days": 12,
        "quantity_affected": 60,
        "description": "TSMC notified distributor of sudden wafer quota reduction on 64K LE FPGA System-on-Module. Safety buffer exhausted across western depots.",
        "evidence": "TSMC Fab 12 quota revision letter #TSMC-Q3-881; Honeywell Avionics promise date at risk.",
        "affected_orders_count": 2,
        "estimated_financial_impact": 24800.0,
        "resolved_at": None,
        "resolution_method": None,
        "resolution_notes": None
    },
    {
        "disruption_id": "DISR-2026-005",
        "title": "I-80 Freight Corridor Bridge Structural Closure",
        "disruption_type": "Transportation Disruption",
        "supplier_id": "SUP-006",
        "shipment_id": "SH-1019",
        "po_number": "PO-7725",
        "sku_id": "SKU-1020",
        "warehouse_id": "WH-SOUTH",
        "location": "Denver to Dallas Corridor (I-80/I-25)",
        "severity": "Medium",
        "status": "Reported",
        "reported_at": "2026-09-05T05:00:00Z",
        "delay_days": 6,
        "quantity_affected": 300,
        "description": "DOT emergency closure of interstate freight bridge near regional junction. Acme Freight motor carrier routing detoured via southern secondary highways.",
        "evidence": "DOT Freight Alert #DOT-WY-991 and Acme regional dispatch telemetry feed.",
        "affected_orders_count": 1,
        "estimated_financial_impact": 3200.0,
        "resolved_at": None,
        "resolution_method": None,
        "resolution_notes": None
    }
]

# 8. Users & Roles
users = [
    {
        "user_id": "USR-001",
        "username": "admin",
        "email": "admin@chainsolve.io",
        "full_name": "Marcus Vance",
        "role": "Admin",
        "department": "Global Supply Chain Operations",
        "hashed_password": "pbkdf2:sha256:600000$chainsolve$e11c5e93345d3789436bc1767e1694f4a38f325d97f5d6067fa9f6ecba5b4c10"
    },
    {
        "user_id": "USR-002",
        "username": "manager",
        "email": "manager@chainsolve.io",
        "full_name": "Elena Rostova",
        "role": "Supply Chain Manager",
        "department": "Distributor Logistics & Fulfillment",
        "hashed_password": "pbkdf2:sha256:600000$chainsolve$e11c5e93345d3789436bc1767e1694f4a38f325d97f5d6067fa9f6ecba5b4c10"
    },
    {
        "user_id": "USR-003",
        "username": "analyst",
        "email": "analyst@chainsolve.io",
        "full_name": "David Chen",
        "role": "Analyst",
        "department": "Risk & Inventory Intelligence",
        "hashed_password": "pbkdf2:sha256:600000$chainsolve$e11c5e93345d3789436bc1767e1694f4a38f325d97f5d6067fa9f6ecba5b4c10"
    },
    {
        "user_id": "USR-004",
        "username": "viewer",
        "email": "viewer@chainsolve.io",
        "full_name": "Sarah Jenkins",
        "role": "Viewer",
        "department": "Executive Board",
        "hashed_password": "pbkdf2:sha256:600000$chainsolve$e11c5e93345d3789436bc1767e1694f4a38f325d97f5d6067fa9f6ecba5b4c10"
    }
]

# 9. Recommendations
recommendations = [
    {
        "recommendation_id": "REC-001",
        "disruption_id": "DISR-2026-001",
        "priority": 1,
        "action": "Allocate available stock to urgent customer orders",
        "reason": "Tesla Energy Solutions ORD-501 has Platinum SLA penalty of $500/day starting Sept 10th.",
        "evidence": "ORD-501 demands 120 units SKU-1049; 50 units already staged. Reallocating 50 units avoids $7,000 in contractual breach penalties.",
        "expected_benefit": "Eliminates immediate $7,000 SLA penalty; satisfies Tier 1 customer contract.",
        "responsible_role": "Supply Chain Manager",
        "status": "Accepted",
        "deadline": "2026-09-06T12:00:00Z",
        "assigned_to": "Elena Rostova",
        "notes": "Approved by Ops Controller during morning standup."
    },
    {
        "recommendation_id": "REC-002",
        "disruption_id": "DISR-2026-001",
        "priority": 2,
        "action": "Consider an alternative shipping route or carrier",
        "reason": "Apex confirmed partial air freight dispatch capability once replacement valves arrive.",
        "evidence": "Inbound SH-8921 has air express option configured: 2 days transit for $1,250 expedite cost.",
        "expected_benefit": "Recovers 12 calendar days of schedule slip; restores delivery to Sept 10th.",
        "responsible_role": "Logistics Coordinator",
        "status": "In Progress",
        "deadline": "2026-09-07T17:00:00Z",
        "assigned_to": "David Chen",
        "notes": "Air charter quotes requested from FedEx."
    },
    {
        "recommendation_id": "REC-003",
        "disruption_id": "DISR-2026-001",
        "priority": 3,
        "action": "Notify customers about likely delivery changes",
        "reason": "Siemens Mobility ORD-502 promise date is Sept 11th; stock will not arrive before Sept 14th even with air freight.",
        "evidence": "Siemens contract requires 72-hour advance delay notice to waive statutory penalty clauses.",
        "expected_benefit": "Maintains high customer trust score and activates contractual waiver.",
        "responsible_role": "Customer Account Executive",
        "status": "Pending",
        "deadline": "2026-09-06T18:00:00Z",
        "assigned_to": "Marcus Vance",
        "notes": "Automated draft ready in Resolution Center."
    },
    {
        "recommendation_id": "REC-004",
        "disruption_id": "DISR-2026-002",
        "priority": 1,
        "action": "Contact the supplier for a revised delivery estimate",
        "reason": "Long Beach marine terminal congestion duration is fluctuating daily.",
        "evidence": "MSKU-8839210 delayed 10 days; off-dock drayage could bypass railhead bottleneck.",
        "expected_benefit": "Identifies if intermodal container can be pulled directly to Long Beach drayage hub.",
        "responsible_role": "Supply Chain Analyst",
        "status": "In Progress",
        "deadline": "2026-09-06T14:00:00Z",
        "assigned_to": "David Chen",
        "notes": "Maersk drayage agent contacted."
    },
    {
        "recommendation_id": "REC-005",
        "disruption_id": "DISR-2026-003",
        "priority": 1,
        "action": "Check available inventory at other warehouses",
        "reason": "WH-MAIN lost 150 units of BAT-4400 due to forklift accident. General Industrial ORD-505 needs 120 units.",
        "evidence": "WH-WEST (Reno) holds 85 units and WH-SOUTH (Dallas) holds 60 units of SKU-3150.",
        "expected_benefit": "Inter-warehouse transfer meets ORD-505 fulfillment without waiting 18 days for factory re-order.",
        "responsible_role": "Warehouse Operations Lead",
        "status": "Accepted",
        "deadline": "2026-09-06T10:00:00Z",
        "assigned_to": "Elena Rostova",
        "notes": "Inter-depot transfer order #TR-401 initiated between Reno and Chicago."
    },
    {
        "recommendation_id": "REC-006",
        "disruption_id": "DISR-2026-004",
        "priority": 1,
        "action": "Evaluate qualified alternative suppliers",
        "reason": "TSMC fab wafer quota restriction creates 12-day slip on 64K FPGA SoM.",
        "evidence": "Bosch Mobility (SUP-007) and Foxconn (SUP-003) produce equivalent pin-compatible modules.",
        "expected_benefit": "Secondary sourcing avoids halting Honeywell avionics line.",
        "responsible_role": "Strategic Sourcing Lead",
        "status": "Pending",
        "deadline": "2026-09-08T15:00:00Z",
        "assigned_to": "David Chen",
        "notes": "Spec sheet matching underway."
    },
    {
        "recommendation_id": "REC-007",
        "disruption_id": "DISR-2026-005",
        "priority": 2,
        "action": "Adjust replenishment plans",
        "reason": "Corridor closure delays RS-485 modules by 6 days into WH-SOUTH.",
        "evidence": "Wholesale safety buffer in Dallas can absorb delay if reorder trigger point is advanced 5 days.",
        "expected_benefit": "Prevents secondary stockout wave in mid-September.",
        "responsible_role": "Inventory Controller",
        "status": "Pending",
        "deadline": "2026-09-09T12:00:00Z",
        "assigned_to": "Elena Rostova",
        "notes": "ERP safety stock parameters scheduled for update."
    },
    {
        "recommendation_id": "REC-008",
        "disruption_id": "DISR-2026-001",
        "priority": 1,
        "action": "Escalate critical incidents to the responsible manager",
        "reason": "Multiple Platinum customer deadlines concurrent with factory halt.",
        "evidence": "Combined SLA penalty exposure exceeds $18,000 without immediate intervention.",
        "expected_benefit": "Provides executive visibility and emergency budget approval for air expedite.",
        "responsible_role": "Supply Chain Manager",
        "status": "Completed",
        "deadline": "2026-09-05T09:00:00Z",
        "assigned_to": "Marcus Vance",
        "notes": "Executive briefing transmitted to VP Operations."
    }
]

# 10. Notifications
notifications = [
    {
        "notification_id": "NOTIF-001",
        "title": "Critical Disruption Alert: Apex Fremont Halt",
        "message": "Production Line 3 pump failure delays APX-902 sensors by 14 days. 2 Platinum orders at risk.",
        "severity": "Critical",
        "timestamp": "2026-09-05T06:45:00Z",
        "is_read": False,
        "link_type": "disruption",
        "link_id": "DISR-2026-001"
    },
    {
        "notification_id": "NOTIF-002",
        "title": "SLA Exposure Warning: Tesla Order ORD-501",
        "message": "SLA penalty clock reaches 5 days until breach. Daily penalty of $500/day active.",
        "severity": "High",
        "timestamp": "2026-09-05T07:00:00Z",
        "is_read": False,
        "link_type": "order",
        "link_id": "ORD-501"
    },
    {
        "notification_id": "NOTIF-003",
        "title": "Action Assigned: Inter-Warehouse Stock Transfer",
        "message": "Elena Rostova assigned to transfer 85 units BAT-4400 from WH-WEST to WH-MAIN.",
        "severity": "Medium",
        "timestamp": "2026-09-05T07:30:00Z",
        "is_read": False,
        "link_type": "recommendation",
        "link_id": "REC-005"
    },
    {
        "notification_id": "NOTIF-004",
        "title": "Shipment Delay Exception: Maersk Vessel Congestion",
        "message": "Inbound SH-7714 container MSKU-8839210 rescheduled by carrier due to Port of Long Beach berth wait.",
        "severity": "High",
        "timestamp": "2026-09-05T07:20:00Z",
        "is_read": True,
        "link_type": "shipment",
        "link_id": "SH-7714"
    },
    {
        "notification_id": "NOTIF-005",
        "title": "Incident Resolved: WH-MAIN Bay C-12 Quarantine Established",
        "message": "Hazardous cell spill contained; safety inspection passed and scrap audit logged.",
        "severity": "Success",
        "timestamp": "2026-09-05T08:10:00Z",
        "is_read": True,
        "link_type": "disruption",
        "link_id": "DISR-2026-003"
    }
]

# Update dictionary
data["suppliers"] = suppliers
data["warehouses"] = warehouses
data["skus"] = skus
data["inventory"] = inventory
data["inbound_shipments"] = inbound_shipments
data["customer_orders"] = customer_orders
data["disruptions"] = disruptions
data["users"] = users
data["recommendations"] = recommendations
data["notifications"] = notifications

# Write back formatted JSON
with open(seed_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(f"Successfully generated seed_data.json:")
print(f" - Suppliers: {len(suppliers)}")
print(f" - Warehouses: {len(warehouses)}")
print(f" - Products (SKUs): {len(skus)}")
print(f" - Inventory items: {len(inventory)}")
print(f" - Shipments: {len(inbound_shipments)}")
print(f" - Customer Orders: {len(customer_orders)}")
print(f" - Disruptions: {len(disruptions)}")
print(f" - Recommendations: {len(recommendations)}")
print(f" - Notifications: {len(notifications)}")
print(f" - Users: {len(users)}")
