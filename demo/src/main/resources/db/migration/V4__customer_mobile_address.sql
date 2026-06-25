-- Align customers table with billing customer fields (mobile, address)

ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);

UPDATE customers SET mobile = phone WHERE mobile IS NULL AND phone IS NOT NULL;

-- billing_state_code optional (default applied in app for GST invoices)
ALTER TABLE customers ALTER COLUMN billing_state_code DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_org_mobile_active
    ON customers (tenant_id, organization_id, mobile)
    WHERE deleted_at IS NULL AND mobile IS NOT NULL;
