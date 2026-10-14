-- ============================================================================
-- Supply Chain Disruption Response Assistant
-- Normalized PostgreSQL Database Schema (Production Ready DDL)
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in reverse dependency order if rebuilding
DROP TABLE IF EXISTS shipment_events CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS action_assignments CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS disruption_impacts CASCADE;
DROP TABLE IF EXISTS disruptions CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS customer_orders CASCADE;
DROP TABLE IF EXISTS shipment_items CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Roles & Permissions Table
CREATE TABLE roles (
    role_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    can_create_disruption BOOLEAN DEFAULT TRUE,
    can_analyze_impact BOOLEAN DEFAULT TRUE,
    can_commit_decision BOOLEAN DEFAULT FALSE,
    can_manage_users BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role_id VARCHAR(50) NOT NULL REFERENCES roles(role_id) ON DELETE RESTRICT,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 3. Suppliers Table
CREATE TABLE suppliers (
    supplier_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    aliases TEXT[] DEFAULT '{}',
    contact_email VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    reliability_score NUMERIC(4, 3) NOT NULL DEFAULT 0.900 CHECK (reliability_score >= 0.0 AND reliability_score <= 1.0),
    expedite_available BOOLEAN DEFAULT FALSE,
    expedite_cost_multiplier NUMERIC(4, 2) DEFAULT 1.00,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_name ON suppliers(name);

-- 4. Products / Catalog SKUs Table
CREATE TABLE products (
    sku_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    aliases TEXT[] DEFAULT '{}',
    category VARCHAR(100) NOT NULL,
    unit_cost NUMERIC(12, 2) NOT NULL CHECK (unit_cost >= 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    lead_time_days INTEGER NOT NULL CHECK (lead_time_days >= 0),
    safety_stock_threshold INTEGER NOT NULL CHECK (safety_stock_threshold >= 0),
    preferred_supplier_id VARCHAR(50) REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_supplier ON products(preferred_supplier_id);

-- 5. Warehouses Table
CREATE TABLE warehouses (
    warehouse_id VARCHAR(50) PRIMARY KEY,
    warehouse_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    capacity_pallets INTEGER NOT NULL DEFAULT 10000,
    manager VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Operational',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Warehouse Inventory Table (Normalized stock)
CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    sku_id VARCHAR(50) NOT NULL REFERENCES products(sku_id) ON DELETE CASCADE,
    on_hand INTEGER NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
    allocated INTEGER NOT NULL DEFAULT 0 CHECK (allocated >= 0),
    reserved_safety INTEGER NOT NULL DEFAULT 0 CHECK (reserved_safety >= 0),
    available INTEGER GENERATED ALWAYS AS (GREATEST(0, on_hand - allocated - reserved_safety)) STORED,
    location_bin VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_warehouse_sku UNIQUE (warehouse_id, sku_id)
);

CREATE INDEX idx_inventory_sku ON inventory(sku_id);
CREATE INDEX idx_inventory_wh ON inventory(warehouse_id);

-- 7. Inbound Shipments Table
CREATE TABLE shipments (
    shipment_id VARCHAR(50) PRIMARY KEY,
    po_number VARCHAR(100) NOT NULL,
    supplier_id VARCHAR(50) NOT NULL REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    carrier_name VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination_warehouse VARCHAR(50) NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'in_transit',
    scheduled_arrival_date DATE NOT NULL,
    revised_arrival_date DATE,
    delay_days INTEGER DEFAULT 0,
    expedite_air_available BOOLEAN DEFAULT FALSE,
    expedite_air_lead_time_days INTEGER,
    expedite_air_cost NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipments_po ON shipments(po_number);
CREATE INDEX idx_shipments_supplier ON shipments(supplier_id);
CREATE INDEX idx_shipments_status ON shipments(status);

-- 8. Shipment Line Items Table
CREATE TABLE shipment_items (
    item_id SERIAL PRIMARY KEY,
    shipment_id VARCHAR(50) NOT NULL REFERENCES shipments(shipment_id) ON DELETE CASCADE,
    sku_id VARCHAR(50) NOT NULL REFERENCES products(sku_id) ON DELETE RESTRICT,
    quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
    quantity_shipped INTEGER NOT NULL CHECK (quantity_shipped >= 0)
);

CREATE INDEX idx_shipment_items_shipment ON shipment_items(shipment_id);
CREATE INDEX idx_shipment_items_sku ON shipment_items(sku_id);

-- 9. Customer Orders Table
CREATE TABLE customer_orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_tier VARCHAR(50) NOT NULL CHECK (customer_tier IN ('Platinum', 'Gold', 'Standard')),
    priority INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
    order_date DATE NOT NULL,
    promise_date DATE NOT NULL,
    sla_penalty_per_day NUMERIC(10, 2) DEFAULT 0.00,
    destination_city VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unfulfilled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer ON customer_orders(customer_name);
CREATE INDEX idx_orders_tier ON customer_orders(customer_tier);
CREATE INDEX idx_orders_status ON customer_orders(status);

-- 10. Order Line Items Table
CREATE TABLE order_items (
    item_id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES customer_orders(order_id) ON DELETE CASCADE,
    sku_id VARCHAR(50) NOT NULL REFERENCES products(sku_id) ON DELETE RESTRICT,
    quantity_demanded INTEGER NOT NULL CHECK (quantity_demanded > 0),
    quantity_allocated INTEGER NOT NULL DEFAULT 0 CHECK (quantity_allocated >= 0)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_sku ON order_items(sku_id);

-- 11. Disruptions Table (Incident Registry)
CREATE TABLE disruptions (
    disruption_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    disruption_type VARCHAR(100) NOT NULL CHECK (disruption_type IN (
        'Supplier Production Halt',
        'Carrier/Shipment Delay',
        'Warehouse Incident',
        'Inventory Shortage',
        'Transportation Disruption',
        'Other'
    )),
    supplier_id VARCHAR(50) REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
    shipment_id VARCHAR(50) REFERENCES shipments(shipment_id) ON DELETE SET NULL,
    sku_id VARCHAR(50) REFERENCES products(sku_id) ON DELETE SET NULL,
    warehouse_id VARCHAR(50) REFERENCES warehouses(warehouse_id) ON DELETE SET NULL,
    location VARCHAR(255),
    severity VARCHAR(50) NOT NULL DEFAULT 'Medium' CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    status VARCHAR(50) NOT NULL DEFAULT 'Reported' CHECK (status IN (
        'Reported',
        'Under Analysis',
        'Action Required',
        'In Progress',
        'Resolved'
    )),
    delay_days INTEGER DEFAULT 0 CHECK (delay_days >= 0),
    quantity_affected INTEGER DEFAULT 0 CHECK (quantity_affected >= 0),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    evidence TEXT,
    affected_orders_count INTEGER DEFAULT 0,
    estimated_financial_impact NUMERIC(14, 2) DEFAULT 0.00,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_method VARCHAR(100),
    resolution_notes TEXT,
    created_by VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disruptions_status ON disruptions(status);
CREATE INDEX idx_disruptions_severity ON disruptions(severity);
CREATE INDEX idx_disruptions_type ON disruptions(disruption_type);

-- 12. Disruption Impacts Table (Detailed Analysis Output)
CREATE TABLE disruption_impacts (
    impact_id SERIAL PRIMARY KEY,
    disruption_id VARCHAR(50) NOT NULL REFERENCES disruptions(disruption_id) ON DELETE CASCADE,
    assessment_id VARCHAR(100) NOT NULL UNIQUE,
    has_system_impact BOOLEAN DEFAULT TRUE,
    summary_headline VARCHAR(255),
    executive_briefing TEXT,
    total_orders_impacted INTEGER DEFAULT 0,
    total_revenue_at_risk NUMERIC(14, 2) DEFAULT 0.00,
    total_sla_penalty_risk NUMERIC(14, 2) DEFAULT 0.00,
    affected_order_ids TEXT[] DEFAULT '{}',
    grounding_summary JSONB,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disruption_impacts_disr ON disruption_impacts(disruption_id);

-- 13. Action Recommendations Table
CREATE TABLE recommendations (
    recommendation_id VARCHAR(50) PRIMARY KEY,
    disruption_id VARCHAR(50) NOT NULL REFERENCES disruptions(disruption_id) ON DELETE CASCADE,
    priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
    action VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    evidence TEXT NOT NULL,
    expected_benefit TEXT NOT NULL,
    responsible_role VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN (
        'Pending',
        'Accepted',
        'Rejected',
        'In Progress',
        'Completed'
    )),
    rejection_reason TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    assigned_to VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recommendations_disr ON recommendations(disruption_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);

-- 14. Action Assignments Table (Workflow tracking)
CREATE TABLE action_assignments (
    assignment_id SERIAL PRIMARY KEY,
    recommendation_id VARCHAR(50) NOT NULL REFERENCES recommendations(recommendation_id) ON DELETE CASCADE,
    assigned_by VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
    assigned_to VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    instructions TEXT,
    status VARCHAR(50) DEFAULT 'Assigned'
);

-- 15. In-App Notifications Table
CREATE TABLE notifications (
    notification_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'Info' CHECK (severity IN ('Critical', 'High', 'Medium', 'Low', 'Info', 'Success')),
    is_read BOOLEAN DEFAULT FALSE,
    link_type VARCHAR(50),
    link_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_unread ON notifications(is_read);

-- 16. Activity & Audit Logs Table (Immutable audit trail)
CREATE TABLE activity_logs (
    log_id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event VARCHAR(100) NOT NULL,
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    detail TEXT NOT NULL,
    metadata JSONB
);

CREATE INDEX idx_activity_logs_event ON activity_logs(event);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);

-- 17. Shipment Events & Milestones Table
CREATE TABLE shipment_events (
    event_id SERIAL PRIMARY KEY,
    shipment_id VARCHAR(50) NOT NULL REFERENCES shipments(shipment_id) ON DELETE CASCADE,
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(100) NOT NULL,
    note TEXT
);

CREATE INDEX idx_shipment_events_shipment ON shipment_events(shipment_id);

-- ============================================================================
-- Seed Initial Roles and Superuser
-- ============================================================================
INSERT INTO roles (role_id, name, description, can_create_disruption, can_analyze_impact, can_commit_decision, can_manage_users)
VALUES
    ('ROLE_ADMIN', 'Admin', 'Full administrative authority and resolution commitment', TRUE, TRUE, TRUE, TRUE),
    ('ROLE_MANAGER', 'Supply Chain Manager', 'Operational controller managing inventory and orders', TRUE, TRUE, TRUE, FALSE),
    ('ROLE_ANALYST', 'Analyst', 'Disruption intake, simulation modeling, and report generation', TRUE, TRUE, FALSE, FALSE),
    ('ROLE_VIEWER', 'Viewer', 'Read-only access to dashboards, reports, and tracking', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role_id) DO NOTHING;

INSERT INTO users (user_id, username, email, full_name, hashed_password, role_id, department)
VALUES
    ('USR-001', 'admin', 'admin@chainsolve.io', 'Marcus Vance', 'pbkdf2:sha256:600000$chainsolve$e11c5e93345d3789436bc1767e1694f4a38f325d97f5d6067fa9f6ecba5b4c10', 'ROLE_ADMIN', 'Global Supply Chain Operations'),
    ('USR-002', 'manager', 'manager@chainsolve.io', 'Elena Rostova', 'pbkdf2:sha256:600000$chainsolve$e11c5e93345d3789436bc1767e1694f4a38f325d97f5d6067fa9f6ecba5b4c10', 'ROLE_MANAGER', 'Distributor Logistics & Fulfillment'),
    ('USR-003', 'analyst', 'analyst@chainsolve.io', 'David Chen', 'pbkdf2:sha256:600000$chainsolve$e11c5e93345d3789436bc1767e1694f4a38f325d97f5d6067fa9f6ecba5b4c10', 'ROLE_ANALYST', 'Risk & Inventory Intelligence'),
    ('USR-004', 'viewer', 'viewer@chainsolve.io', 'Sarah Jenkins', 'pbkdf2:sha256:600000$chainsolve$e11c5e93345d3789436bc1767e1694f4a38f325d97f5d6067fa9f6ecba5b4c10', 'ROLE_VIEWER', 'Executive Board')
ON CONFLICT (user_id) DO NOTHING;
