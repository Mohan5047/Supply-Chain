# Supply Chain Disruption Response Assistant

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com)
[![PostgreSQL Ready](https://img.shields.io/badge/PostgreSQL-15%2B-336791.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests: 40 Passed](https://img.shields.io/badge/tests-40%2F40%20passed-brightgreen.svg)]()

> **Detect Disruptions. Analyze Impact. Respond Smarter.**  
> An enterprise-grade decision-support platform designed for supply-chain managers. Connects noisy disruption notices with suppliers, multi-facility inventory, shipments, and customer orders to quantify operational and financial impact, evaluate risk transparently, and recommend actionable responses.

---

## 🌟 Executive Summary & Problem Understanding

Supply-chain disruptions—supplier factory shutdowns, port strikes, carrier delays, and warehouse incidents—cost enterprises billions annually. When a disruption occurs, the primary operational bottleneck is rarely taking action—**it is identifying what is affected, calculating downstream customer impact, and evaluating trade-offs**.

### The Core Operational Workflow
```
Detect Disruption  ──>  Analyze Impact  ──>  Evaluate Risk  ──>  Recommend Actions  ──>  Track Resolution
```

1. **Detect**: Ingest informal disruption notices (emails, carrier exception reports, warehouse incident logs) or structured reports.
2. **Analyze**: Link notices to database entities (suppliers, purchase orders, shipments, multi-warehouse inventory, and customer commitments) to compute real stock deficits and order slips.
3. **Evaluate Risk**: Apply transparent, explainable multi-factor scoring (severity, lead time, available buffer, alternative suppliers, SLA penalty exposure) without black-box hallucination.
4. **Recommend**: Deliver actionable, evidence-backed recommendations (air expedite, stock reallocation, split-fulfillment, proactive rescheduling) with clear financial trade-offs.
5. **Track Resolution**: Centralize incident response, assign tasks, enforce role-based approvals, and log audit trails.

---

## 🎨 Enterprise Design System

The user interface adheres to a clean, minimal enterprise SaaS design system engineered for high-density operational data:

| Token | Hex Value | Application |
|---|---|---|
| **Background** | `#F5F7FB` | Main workspace canvas |
| **Main Surface** | `#FFFFFF` | Cards, tables, drawers, modal sheets |
| **Primary** | `#4F46E5` | Active states, primary CTAs, links |
| **Primary Hover** | `#4338CA` | Interactive hover transitions |
| **Main Text** | `#0F172A` | Primary typography, headers, metric values |
| **Secondary Text** | `#64748B` | Labels, captions, table subheaders |
| **Borders** | `#E2E8F0` | Dividers, card boundaries, table cell lines |
| **Critical Risk** | `#DC2626` | Critical severity, stockouts, overdue SLAs |
| **Warning** | `#D97706` | Medium/high risk, approaching delivery dates |
| **Success** | `#16A34A` | Resolved incidents, on-time shipments, fulfilled orders |

### Key UI Features
- **Collapsible Sidebar**: Quick switching across all 15 operational modules.
- **Top Bar with Global Search**: Instant filtering across disruptions, suppliers, SKUs, and shipments.
- **Notification Drawer**: In-app center for critical incidents and approaching deadlines.
- **Profile & Role Switching**: Test as Admin, Supply Chain Manager, Analyst, or Viewer.
- **Light & Dark Themes**: System-aware with persistent local storage.
- **Responsive Layout**: Designed for 1920x1080 command centers, laptops, and tablets.

---

## 🖥️ Application Modules (15 Complete Modules)

1. **Landing Page (`#landing`)**:
   - Hero section with tagline, platform overview, dynamic KPI counters, feature deep dives, and 6-step operational workflow.
2. **Dashboard (`#dashboard`)**:
   - Real-time operational metrics calculated strictly from system state (Active Disruptions, Critical Incidents, At-Risk Orders, Affected Shipments, Affected SKUs, and Financial Penalty Exposure).
   - Severity distribution chart, disruption timeline, at-risk order queue, and supplier risk overview.
3. **Disruption Management (`#disruptions`)**:
   - Searchable, sortable, and filterable incident registry with filters for severity, status, supplier, and date.
   - 1-click drill-down to impact analysis.
4. **Create Disruption (`#create`)**:
   - Structured entry form combined with an intelligent text extractor that parses informal notices into structured entities with confirmation.
5. **Impact Analysis Engine (`#impact`)**:
   - Deep dive into Disruption Summary, Supplier Dependencies, Multi-Warehouse Inventory (Physical, Reserved, Available), Shipment Tracking, and Affected Customer Orders with traceable citations.
6. **Risk Assessment (`#risk`)**:
   - Explainable multi-factor scoring analyzing shortage depth, order tiers, SLA penalties, and supplier lead times with data-completeness metrics.
7. **Recommended Actions (`#recommendations`)**:
   - Urgency-ranked operational playbooks (Expedite Air Freight, Stock Reallocation, Part-Ship, Reschedule) with plain financial trade-offs, status tracking, and rejection reasoning.
8. **Supplier Management (`#suppliers`)**:
   - Supplier registry tracking contact data, location, active disruptions, lead times, reliability scores, and risk classifications.
9. **Inventory Management (`#inventory`)**:
   - Multi-warehouse inventory catalog (`WH-MAIN`, `WH-WEST`, `WH-EAST`, `WH-SOUTH`) showing on-hand, reserved, and available quantities, reorder points, unit costs, and stockout risk badges.
10. **Shipment Tracking (`#shipments`)**:
    - Inbound and outbound logistics tracking with carriers, origin/destination, planned vs. actual delivery dates, delay durations, and demonstration timeline events.
11. **Customer Orders (`#orders`)**:
    - High-visibility customer order book displaying contractual delivery dates, required SKUs, quantities, fulfillment status, disruption risk, and calculated SLA penalty exposure.
12. **Resolution Center (`#resolution`)**:
    - Centralized incident management workspace for tracking open disruptions, assigned actions, pending decisions, resolution methods, and final sign-off.
13. **Reports & Analytics (`#reports`)**:
    - Disruption type breakdowns, average resolution times, supplier performance trends, action completion rates, and real-time CSV data export.
14. **In-App Notification Center (`#notifications`)**:
    - Interactive notifications drawer for critical incident alerts, high-risk order warnings, and action assignments with read/unread toggle and mark-all-read.
15. **User Management & Settings (`#settings`)**:
    - Role-Based Access Control (Admin, Supply Chain Manager, Analyst, Viewer), profile management, notification preferences, and system data reset.

---

## 🗄️ Database Design (PostgreSQL Schema)

The platform includes a normalized PostgreSQL schema ([`schema.sql`](file:///c:/Users/mohan/OneDrive/Pictures/Desktop/chain/schema.sql)) with 17 relational tables, foreign key constraints, indexes, and audit logging:

```
roles ──< users ──< action_assignments
                ──< activity_logs
                ──< notifications

suppliers ──< products ──< inventory >── warehouses
          ──< shipments ──< shipment_items
                        ──< shipment_events

customer_orders ──< order_items

disruptions ──< disruption_impacts
            ──< recommendations ──< action_assignments
```

### Table Catalog
1. `roles`: Role definitions and permission bitmaps.
2. `users`: Enterprise user accounts with bcrypt password hashes.
3. `suppliers`: Supplier directory, locations, lead times, and reliability metrics.
4. `products`: Catalog items, SKUs, categories, and unit costs.
5. `warehouses`: Distribution centers (`WH-MAIN`, `WH-WEST`, `WH-EAST`, `WH-SOUTH`).
6. `inventory`: Multi-warehouse stock tracking (on-hand, reserved, available, reorder points).
7. `shipments`: Inbound/outbound logistics shipments, tracking numbers, and delivery dates.
8. `shipment_items`: Line items and quantities per shipment.
9. `shipment_events`: Milestone audit tracking for carrier events.
10. `customer_orders`: Customer orders, priority tiers, and delivery commitments.
11. `order_items`: Quantities and SKUs per customer order.
12. `disruptions`: Incident records, types, reported dates, durations, and statuses.
13. `disruption_impacts`: Traceable linkage records connecting disruptions to affected inventory and orders.
14. `recommendations`: Actionable response alternatives with financial trade-offs.
15. `action_assignments`: Task assignments with assignees and due dates.
16. `notifications`: In-app alert queue with read/unread statuses.
17. `activity_logs`: Immutable audit trail of all operational decisions.

---

## 📊 Demo Data Benchmark

The system includes realistic, consistent demonstration data in [`data/seed_data.json`](file:///c:/Users/mohan/OneDrive/Pictures/Desktop/chain/data/seed_data.json):
- **8 Suppliers**: Apex Optics (`SUP-001`), Silicon Dynamics (`SUP-002`), Nippon Precision (`SUP-003`), EuroSensors BV (`SUP-004`), FlexLogistics Global (`SUP-005`), Acme Freight Corp (`SUP-006` - false alarm benchmark), Bosch Automotive (`SUP-007`), Murata Electronics (`SUP-008`).
- **4 Warehouses**: Central Hub (`WH-MAIN`), Pacific Coast (`WH-WEST`), Atlantic DC (`WH-EAST`), Midwest Hub (`WH-SOUTH`).
- **20 Catalog SKUs**: High-precision optical sensors, microcontrollers, brushless motors, display assemblies, MEMS sensors, lithium batteries, CAN transceivers, and optical lenses.
- **80 Inventory Records**: Multi-warehouse stock balances with clean physical, reserved, and available tracking.
- **25 Shipments**: In-transit and scheduled sea, air, and truck consignments.
- **30 Customer Orders**: Committed orders for VIP accounts (Tesla, Siemens, Honeywell, Apple, Medtronic, Raytheon, Rivian).
- **5 Disruption Scenarios**:
  1. *Apex Optics Factory Halt* (Catastrophic supplier downtime affecting VIP orders).
  2. *Suez Canal Freight Delay* (Carrier delay slipping high-priority automotive orders).
  3. *Main Warehouse Sprinkler Failure* (Physical stock destruction requiring immediate alternative allocation).
  4. *Acme Freight Road Closure (False Alarm)* (Demonstrates system discipline: checks dependencies, verifies zero impact, refuses to hallucinate).
  5. *Typhoon Island Alert (Ambiguity)* (Vague regional alert triggering operator disambiguation).

---

## 🚀 Quickstart & Installation

### 1. Requirements
- Python 3.10+ (or Python 3.14)
- Modern Web Browser (Chrome, Edge, Firefox, Safari)

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/Mohan5047/Supply-Chain.git
cd Supply-Chain

# Create a virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment
Copy the example configuration:
```bash
cp .env.example .env
```
*(Optional)* Add a `GEMINI_API_KEY` in `.env` if you wish to enable Google Gemini for natural language synthesis. The platform includes a robust, heuristic NLP extractor and deterministic reasoning engine that operates with 100% functionality without external API keys.

### 4. Run the Server
```bash
python app.py
```
Open your browser to:
- **Enterprise Web App**: `http://127.0.0.1:8000`
- **Interactive OpenAPI/Swagger Docs**: `http://127.0.0.1:8000/docs`
- **System Health Check**: `http://127.0.0.1:8000/health`

---

## 🧪 Automated Testing

The repository features 40 automated tests across 5 test suites validating entity extraction, grounding discipline, mathematical stock simulation, SLA penalties, trade-off optimization, and REST API contracts:

```bash
python -m pytest tests/ -v
```

### Test Coverage Highlights
- `tests/test_extraction.py`: Unstructured text parsing, date normalization, and entity extraction.
- `tests/test_grounding.py`: Entity resolution, alias matching, candidate ranking, and false alarm refusal.
- `tests/test_impact.py`: Multi-warehouse inventory simulation, stockout timelines, and order slip calculations.
- `tests/test_recommender.py`: Air expediting, reallocation, part-shipping, and customer draft synthesis.
- `tests/test_enterprise_endpoints.py`: All REST API routes, filtering, RBAC, CSV report generation, and resolution persistence.

---

## 🌐 REST API Catalog

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `POST` | `/api/auth/register` | Register new user account |
| `GET` | `/api/auth/me` | Fetch active user profile and roles |
| `GET` | `/api/dashboard/summary` | Real-time enterprise KPI metrics |
| `GET` | `/api/dashboard/analytics` | Severity distributions and timeline trends |
| `GET` | `/api/disruptions` | Filterable disruption incident registry |
| `POST` | `/api/disruptions` | Report new disruption incident |
| `GET` | `/api/disruptions/{id}` | Retrieve incident details |
| `PATCH`| `/api/disruptions/{id}` | Update incident attributes and status |
| `POST` | `/api/disruptions/{id}/analyze` | Trigger full impact and risk analysis |
| `POST` | `/api/disruptions/{id}/resolve` | Record formal resolution method and notes |
| `GET` | `/api/disruptions/{id}/impact` | Fetch structured impact assessment |
| `GET` | `/api/disruptions/{id}/recommendations` | Fetch actionable response alternatives |
| `PATCH`| `/api/recommendations/{id}` | Accept, reject, or assign recommendation |
| `GET` | `/api/suppliers` | Supplier master directory with filters |
| `GET` | `/api/inventory` | Multi-facility inventory catalog |
| `GET` | `/api/shipments` | Inbound/outbound logistics tracking |
| `GET` | `/api/orders` | Customer order book with SLA penalty risk |
| `GET` | `/api/reports/summary` | Aggregated resolution and performance metrics |
| `GET` | `/api/reports/export` | Download live reports as CSV |
| `GET` | `/api/notifications` | Fetch notification feed |
| `POST` | `/api/notifications/{id}/read` | Mark individual notification as read |
| `POST` | `/api/notifications/mark-all-read` | Mark all notifications as read |
| `POST` | `/api/system/reset` | Restore demo baseline database |

---

## 🚢 Deployment Guide

### Deploying to Render / Linux Server
1. Create a **Web Service** on Render pointing to this GitHub repository.
2. Select **Python** runtime.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Set Environment Variables:
   - `PYTHON_VERSION`: `3.11.0` or `3.10.0`
   - `JWT_SECRET`: Your production secret key.

### Deploying with Docker
A production [`Dockerfile`](file:///c:/Users/mohan/OneDrive/Pictures/Desktop/chain/Dockerfile) is included:
```bash
docker build -t supply-chain-assistant .
docker run -p 8000:8000 --env-file .env supply-chain-assistant
```

---

## 📄 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
