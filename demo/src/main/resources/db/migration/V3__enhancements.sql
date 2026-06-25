-- V3: organization addresses, tax summary, report aggregates, JSONB snapshots, documents

-- ---------------------------------------------------------------------------
-- Organization addresses
-- ---------------------------------------------------------------------------
CREATE TABLE organization_addresses (
    id                  VARCHAR(36) PRIMARY KEY,
    organization_id     VARCHAR(36) NOT NULL REFERENCES organizations(id),
    address_type        VARCHAR(20) NOT NULL,
    line1               VARCHAR(200) NOT NULL,
    line2               VARCHAR(200),
    city                VARCHAR(100) NOT NULL,
    state_code          CHAR(2) NOT NULL,
    pincode             VARCHAR(10) NOT NULL,
    country_code        CHAR(2) NOT NULL DEFAULT 'IN',
    is_default          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP NOT NULL
);

CREATE INDEX idx_org_addresses_org ON organization_addresses (organization_id);

-- ---------------------------------------------------------------------------
-- Customer addresses (billing / shipping)
-- ---------------------------------------------------------------------------
CREATE TABLE customer_addresses (
    id                  VARCHAR(36) PRIMARY KEY,
    customer_id         VARCHAR(36) NOT NULL REFERENCES customers(id),
    address_type        VARCHAR(20) NOT NULL,
    line1               VARCHAR(200) NOT NULL,
    line2               VARCHAR(200),
    city                VARCHAR(100) NOT NULL,
    state_code          CHAR(2) NOT NULL,
    pincode             VARCHAR(10) NOT NULL,
    is_default          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP NOT NULL
);

CREATE INDEX idx_customer_addresses_customer ON customer_addresses (customer_id);

-- ---------------------------------------------------------------------------
-- Invoice tax summary (GSTR-friendly rollups per invoice)
-- ---------------------------------------------------------------------------
CREATE TABLE invoice_tax_summary (
    id                  VARCHAR(36) PRIMARY KEY,
    invoice_id          VARCHAR(36) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    tax_type            VARCHAR(10) NOT NULL,
    rate                DECIMAL(5,2) NOT NULL,
    taxable_amount      DECIMAL(15,2) NOT NULL,
    tax_amount          DECIMAL(15,2) NOT NULL,
    CONSTRAINT chk_invoice_tax_summary_type CHECK (tax_type IN ('CGST', 'SGST', 'IGST', 'CESS'))
);

CREATE INDEX idx_invoice_tax_summary_invoice ON invoice_tax_summary (invoice_id);

-- ---------------------------------------------------------------------------
-- Report aggregate table (dashboard / analytics)
-- ---------------------------------------------------------------------------
CREATE TABLE report_daily_sales (
    tenant_id           VARCHAR(36) NOT NULL REFERENCES tenants(id),
    organization_id     VARCHAR(36) NOT NULL REFERENCES organizations(id),
    report_date         DATE NOT NULL,
    invoice_count       INTEGER NOT NULL DEFAULT 0,
    taxable_total       DECIMAL(15,2) NOT NULL DEFAULT 0,
    cgst_total          DECIMAL(15,2) NOT NULL DEFAULT 0,
    sgst_total          DECIMAL(15,2) NOT NULL DEFAULT 0,
    igst_total          DECIMAL(15,2) NOT NULL DEFAULT 0,
    cess_total          DECIMAL(15,2) NOT NULL DEFAULT 0,
    grand_total         DECIMAL(15,2) NOT NULL DEFAULT 0,
    updated_at          TIMESTAMP NOT NULL,
    PRIMARY KEY (tenant_id, organization_id, report_date)
);

CREATE INDEX idx_report_daily_sales_lookup
    ON report_daily_sales (tenant_id, organization_id, report_date DESC);

-- ---------------------------------------------------------------------------
-- Document metadata (PDF invoices, exports)
-- ---------------------------------------------------------------------------
CREATE TABLE documents (
    id                  VARCHAR(36) PRIMARY KEY,
    tenant_id           VARCHAR(36) NOT NULL REFERENCES tenants(id),
    entity_type         VARCHAR(50) NOT NULL,
    entity_id           VARCHAR(36) NOT NULL,
    file_type           VARCHAR(20) NOT NULL,
    storage_key         TEXT NOT NULL,
    version             INTEGER NOT NULL DEFAULT 1,
    created_at          TIMESTAMP NOT NULL,
    created_by          VARCHAR(36)
);

CREATE INDEX idx_documents_entity ON documents (tenant_id, entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Tenant settings (SaaS feature flags / limits)
-- ---------------------------------------------------------------------------
-- JSON (PostgreSQL: use jsonb in prod via cast; H2 test profile uses JSON)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS settings JSON NOT NULL DEFAULT '{}';

-- ---------------------------------------------------------------------------
-- JSON snapshots & audit payloads
-- ---------------------------------------------------------------------------
ALTER TABLE invoices
    ALTER COLUMN customer_snapshot TYPE JSON
    USING CASE
        WHEN customer_snapshot IS NULL OR TRIM(customer_snapshot) = '' THEN NULL
        ELSE customer_snapshot::json
    END;

ALTER TABLE invoice_lines
    ALTER COLUMN product_snapshot TYPE JSON
    USING CASE
        WHEN product_snapshot IS NULL OR TRIM(product_snapshot) = '' THEN NULL
        ELSE product_snapshot::json
    END;

ALTER TABLE invoice_status_history
    ALTER COLUMN metadata TYPE JSON
    USING CASE
        WHEN metadata IS NULL OR TRIM(metadata) = '' THEN NULL
        ELSE metadata::json
    END;

ALTER TABLE audit_logs
    ALTER COLUMN old_values TYPE JSON
    USING CASE
        WHEN old_values IS NULL OR TRIM(old_values) = '' THEN NULL
        ELSE old_values::json
    END;

ALTER TABLE audit_logs
    ALTER COLUMN new_values TYPE JSON
    USING CASE
        WHEN new_values IS NULL OR TRIM(new_values) = '' THEN NULL
        ELSE new_values::json
    END;

-- Optional org-level user restriction (multi-branch RBAC)
CREATE TABLE user_organization_access (
    user_id             VARCHAR(36) NOT NULL REFERENCES users(id),
    organization_id     VARCHAR(36) NOT NULL REFERENCES organizations(id),
    PRIMARY KEY (user_id, organization_id)
);

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_invoices_customer
    ON invoices (tenant_id, customer_id, invoice_date DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_created
    ON invoices (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoice_lines_product
    ON invoice_lines (product_id)
    WHERE product_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_status_history_invoice
    ON invoice_status_history (invoice_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_customers_name
    ON customers (tenant_id, organization_id, name)
    WHERE deleted_at IS NULL;
