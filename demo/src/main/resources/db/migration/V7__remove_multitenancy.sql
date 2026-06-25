-- V7: Remove all multi-tenancy infrastructure and clean up schema

-- 1. Drop tables that have FK to tenants (child tables first)
DROP TABLE IF EXISTS user_organization_access;
DROP TABLE IF EXISTS report_daily_sales;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS invoice_status_history;
DROP TABLE IF EXISTS organization_addresses;
DROP TABLE IF EXISTS customer_addresses;

-- 2. Invoices: drop invoice_series FK and related columns, add invoice_number
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_invoice_series_id_fkey;
ALTER TABLE invoices DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE invoices DROP COLUMN IF EXISTS invoice_series_id;
ALTER TABLE invoices DROP COLUMN IF EXISTS sequence_number;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50);

DROP TABLE IF EXISTS invoice_series;

-- 3. Organizations: remove tenant_id (user_id already present from V6)
ALTER TABLE organizations DROP COLUMN IF EXISTS tenant_id;

-- 4. Customers: remove tenant_id; rebuild mobile unique index without tenant_id
DROP INDEX IF EXISTS uq_customers_org_mobile_active;
ALTER TABLE customers DROP COLUMN IF EXISTS tenant_id;
CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_org_mobile
    ON customers (organization_id, mobile)
    WHERE deleted_at IS NULL AND mobile IS NOT NULL;

-- 5. Products: remove tenant_id and FK columns, add unit column
DROP INDEX IF EXISTS idx_products_gst;
DROP INDEX IF EXISTS uq_products_org_sku;
ALTER TABLE products DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE products DROP COLUMN IF EXISTS unit_id;
ALTER TABLE products DROP COLUMN IF EXISTS tax_group_id;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(20) NOT NULL DEFAULT 'PCS';
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_org_sku
    ON products (organization_id, sku)
    WHERE deleted_at IS NULL;

-- 6. Refresh tokens: drop tenant_id (already nullable in V6)
ALTER TABLE refresh_tokens DROP COLUMN IF EXISTS tenant_id;

-- 7. Drop multi-tenant tables (order: most-dependent first)
DROP TABLE IF EXISTS user_tenant_roles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS tax_groups;
DROP TABLE IF EXISTS units;
DROP TABLE IF EXISTS tenants;
