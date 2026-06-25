-- Product billing fields: GST % and stock quantity

ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5, 2);

ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 0;

UPDATE products p
SET gst_percentage = (
    SELECT COALESCE(tg.cgst_rate + tg.sgst_rate, tg.igst_rate, 0)
    FROM tax_groups tg
    WHERE tg.id = p.tax_group_id
)
WHERE p.gst_percentage IS NULL AND p.tax_group_id IS NOT NULL;

UPDATE products SET gst_percentage = 0 WHERE gst_percentage IS NULL;

UPDATE products SET stock_quantity = 0 WHERE stock_quantity IS NULL;

ALTER TABLE products ALTER COLUMN hsn_sac DROP NOT NULL;

ALTER TABLE products ALTER COLUMN unit_id DROP NOT NULL;

ALTER TABLE products ALTER COLUMN tax_group_id DROP NOT NULL;

-- Default unit for legacy rows and app defaults
INSERT INTO units (id, tenant_id, code, name)
SELECT 'unit-pcs-default', NULL, 'PCS', 'Pieces'
WHERE NOT EXISTS (SELECT 1 FROM units WHERE id = 'unit-pcs-default');

UPDATE products SET unit_id = 'unit-pcs-default' WHERE unit_id IS NULL;

UPDATE products SET hsn_sac = '9999' WHERE hsn_sac IS NULL OR hsn_sac = '';

CREATE INDEX IF NOT EXISTS idx_products_gst
    ON products (tenant_id, organization_id, gst_percentage)
    WHERE deleted_at IS NULL;
