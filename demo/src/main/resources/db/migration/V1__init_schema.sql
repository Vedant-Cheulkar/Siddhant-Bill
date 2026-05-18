-- Core platform
CREATE TABLE tenants (
    id              VARCHAR(36) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(80) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    plan_code       VARCHAR(50),
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL,
    deleted_at      TIMESTAMP
);

CREATE UNIQUE INDEX uq_tenants_slug_active ON tenants (slug) WHERE deleted_at IS NULL;

CREATE TABLE organizations (
    id              VARCHAR(36) PRIMARY KEY,
    tenant_id       VARCHAR(36) NOT NULL REFERENCES tenants(id),
    code            VARCHAR(30) NOT NULL,
    legal_name      VARCHAR(300) NOT NULL,
    trade_name      VARCHAR(300),
    gstin           VARCHAR(15),
    pan             VARCHAR(10),
    state_code      CHAR(2) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL,
    created_by      VARCHAR(36),
    updated_by      VARCHAR(36),
    deleted_at      TIMESTAMP
);

CREATE UNIQUE INDEX uq_organizations_tenant_code ON organizations (tenant_id, code) WHERE deleted_at IS NULL;

-- Auth & users
CREATE TABLE users (
    id              VARCHAR(36) PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(200) NOT NULL,
    phone           VARCHAR(20),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL,
    deleted_at      TIMESTAMP
);

CREATE UNIQUE INDEX uq_users_email_active ON users (email) WHERE deleted_at IS NULL;

CREATE TABLE roles (
    id              VARCHAR(36) PRIMARY KEY,
    tenant_id       VARCHAR(36) REFERENCES tenants(id),
    code            VARCHAR(50) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    is_system       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL,
    deleted_at      TIMESTAMP
);

CREATE TABLE permissions (
    id              VARCHAR(36) PRIMARY KEY,
    code            VARCHAR(80) NOT NULL UNIQUE,
    module_name     VARCHAR(40) NOT NULL,
    description     TEXT
);

CREATE TABLE role_permissions (
    role_id         VARCHAR(36) NOT NULL REFERENCES roles(id),
    permission_id   VARCHAR(36) NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_tenant_roles (
    id              VARCHAR(36) PRIMARY KEY,
    user_id         VARCHAR(36) NOT NULL REFERENCES users(id),
    tenant_id       VARCHAR(36) NOT NULL REFERENCES tenants(id),
    role_id         VARCHAR(36) NOT NULL REFERENCES roles(id),
    default_organization_id VARCHAR(36) REFERENCES organizations(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL,
    deleted_at      TIMESTAMP
);

CREATE UNIQUE INDEX uq_user_tenant_roles ON user_tenant_roles (user_id, tenant_id) WHERE deleted_at IS NULL;

CREATE TABLE refresh_tokens (
    id              VARCHAR(36) PRIMARY KEY,
    user_id         VARCHAR(36) NOT NULL REFERENCES users(id),
    tenant_id       VARCHAR(36) NOT NULL REFERENCES tenants(id),
    token_hash      VARCHAR(64) NOT NULL,
    expires_at      TIMESTAMP NOT NULL,
    revoked_at      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL,
    user_agent      TEXT,
    ip_address      VARCHAR(45)
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id, expires_at);

-- Master data
CREATE TABLE tax_groups (
    id              VARCHAR(36) PRIMARY KEY,
    tenant_id       VARCHAR(36) NOT NULL REFERENCES tenants(id),
    name            VARCHAR(100) NOT NULL,
    cgst_rate       DECIMAL(5,2) NOT NULL DEFAULT 0,
    sgst_rate       DECIMAL(5,2) NOT NULL DEFAULT 0,
    igst_rate       DECIMAL(5,2) NOT NULL DEFAULT 0,
    cess_rate       DECIMAL(5,2) NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL,
    deleted_at      TIMESTAMP
);

CREATE TABLE units (
    id              VARCHAR(36) PRIMARY KEY,
    tenant_id       VARCHAR(36),
    code            VARCHAR(20) NOT NULL,
    name            VARCHAR(50) NOT NULL
);

CREATE TABLE customers (
    id              VARCHAR(36) PRIMARY KEY,
    tenant_id       VARCHAR(36) NOT NULL REFERENCES tenants(id),
    organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id),
    code            VARCHAR(30) NOT NULL,
    name            VARCHAR(300) NOT NULL,
    gstin           VARCHAR(15),
    pan             VARCHAR(10),
    email           VARCHAR(255),
    phone           VARCHAR(20),
    billing_state_code CHAR(2) NOT NULL,
    credit_days     INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL,
    created_by      VARCHAR(36),
    updated_by      VARCHAR(36),
    deleted_at      TIMESTAMP
);

CREATE UNIQUE INDEX uq_customers_org_code ON customers (tenant_id, organization_id, code) WHERE deleted_at IS NULL;

CREATE TABLE products (
    id              VARCHAR(36) PRIMARY KEY,
    tenant_id       VARCHAR(36) NOT NULL REFERENCES tenants(id),
    organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id),
    sku             VARCHAR(50) NOT NULL,
    name            VARCHAR(300) NOT NULL,
    description     TEXT,
    hsn_sac         VARCHAR(10) NOT NULL,
    unit_id         VARCHAR(36) NOT NULL REFERENCES units(id),
    sale_price      DECIMAL(15,2) NOT NULL,
    tax_group_id    VARCHAR(36) NOT NULL REFERENCES tax_groups(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL,
    created_by      VARCHAR(36),
    updated_by      VARCHAR(36),
    deleted_at      TIMESTAMP
);

CREATE UNIQUE INDEX uq_products_org_sku ON products (tenant_id, organization_id, sku) WHERE deleted_at IS NULL;

-- Invoicing
CREATE TABLE invoice_series (
    id              VARCHAR(36) PRIMARY KEY,
    tenant_id       VARCHAR(36) NOT NULL REFERENCES tenants(id),
    organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id),
    name            VARCHAR(100) NOT NULL,
    prefix          VARCHAR(20) NOT NULL,
    fy_label        VARCHAR(10) NOT NULL,
    next_sequence   BIGINT NOT NULL DEFAULT 1,
    padding_width   SMALLINT NOT NULL DEFAULT 5,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL,
    deleted_at      TIMESTAMP
);

CREATE TABLE invoices (
    id              VARCHAR(36) PRIMARY KEY,
    tenant_id       VARCHAR(36) NOT NULL REFERENCES tenants(id),
    organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id),
    invoice_series_id VARCHAR(36) REFERENCES invoice_series(id),
    sequence_number BIGINT,
    display_number  VARCHAR(50),
    customer_id     VARCHAR(36) NOT NULL REFERENCES customers(id),
    customer_snapshot TEXT,
    invoice_date    DATE NOT NULL,
    due_date        DATE,
    place_of_supply_state CHAR(2) NOT NULL,
    supply_type     VARCHAR(20) NOT NULL DEFAULT 'B2B',
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    currency_code   CHAR(3) NOT NULL DEFAULT 'INR',
    subtotal        DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_total  DECIMAL(15,2) NOT NULL DEFAULT 0,
    taxable_amount  DECIMAL(15,2) NOT NULL DEFAULT 0,
    cgst_total      DECIMAL(15,2) NOT NULL DEFAULT 0,
    sgst_total      DECIMAL(15,2) NOT NULL DEFAULT 0,
    igst_total      DECIMAL(15,2) NOT NULL DEFAULT 0,
    cess_total      DECIMAL(15,2) NOT NULL DEFAULT 0,
    round_off       DECIMAL(15,2) NOT NULL DEFAULT 0,
    grand_total     DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    terms           TEXT,
    pdf_storage_key TEXT,
    issued_at       TIMESTAMP,
    cancelled_at    TIMESTAMP,
    cancellation_reason TEXT,
    version         INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL,
    created_by      VARCHAR(36) NOT NULL,
    updated_by      VARCHAR(36),
    issued_by       VARCHAR(36),
    cancelled_by    VARCHAR(36),
    deleted_at      TIMESTAMP
);

CREATE UNIQUE INDEX uq_invoices_display_number ON invoices (tenant_id, organization_id, display_number)
    WHERE display_number IS NOT NULL AND status IN ('ISSUED', 'CANCELLED');

CREATE INDEX idx_invoices_tenant_status_date ON invoices (tenant_id, organization_id, status, invoice_date DESC);

CREATE TABLE invoice_lines (
    id              VARCHAR(36) PRIMARY KEY,
    invoice_id      VARCHAR(36) NOT NULL REFERENCES invoices(id),
    line_number     SMALLINT NOT NULL,
    product_id      VARCHAR(36) REFERENCES products(id),
    product_snapshot TEXT,
    description     VARCHAR(500) NOT NULL,
    hsn_sac         VARCHAR(10) NOT NULL,
    quantity        DECIMAL(15,3) NOT NULL,
    unit_id         VARCHAR(36) NOT NULL REFERENCES units(id),
    unit_price      DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    taxable_amount  DECIMAL(15,2) NOT NULL DEFAULT 0,
    cgst_rate       DECIMAL(5,2) NOT NULL DEFAULT 0,
    sgst_rate       DECIMAL(5,2) NOT NULL DEFAULT 0,
    igst_rate       DECIMAL(5,2) NOT NULL DEFAULT 0,
    cess_rate       DECIMAL(5,2) NOT NULL DEFAULT 0,
    cgst_amount     DECIMAL(15,2) NOT NULL DEFAULT 0,
    sgst_amount     DECIMAL(15,2) NOT NULL DEFAULT 0,
    igst_amount     DECIMAL(15,2) NOT NULL DEFAULT 0,
    cess_amount     DECIMAL(15,2) NOT NULL DEFAULT 0,
    line_total      DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL,
    UNIQUE (invoice_id, line_number)
);

CREATE TABLE invoice_status_history (
    id              VARCHAR(36) PRIMARY KEY,
    invoice_id      VARCHAR(36) NOT NULL REFERENCES invoices(id),
    from_status     VARCHAR(20),
    to_status       VARCHAR(20) NOT NULL,
    changed_at      TIMESTAMP NOT NULL,
    changed_by      VARCHAR(36) NOT NULL,
    reason          TEXT,
    metadata        TEXT
);

CREATE TABLE audit_logs (
    id              VARCHAR(36) PRIMARY KEY,
    tenant_id       VARCHAR(36) NOT NULL REFERENCES tenants(id),
    organization_id VARCHAR(36),
    user_id         VARCHAR(36),
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       VARCHAR(36) NOT NULL,
    action          VARCHAR(50) NOT NULL,
    old_values      TEXT,
    new_values      TEXT,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_logs_tenant_entity ON audit_logs (tenant_id, entity_type, entity_id, created_at DESC);
