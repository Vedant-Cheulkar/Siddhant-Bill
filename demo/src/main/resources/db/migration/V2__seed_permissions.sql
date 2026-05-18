INSERT INTO permissions (id, code, module_name, description) VALUES
('p01', 'USER_READ', 'USER', 'View users'),
('p02', 'USER_WRITE', 'USER', 'Manage users'),
('p03', 'CUSTOMER_READ', 'CUSTOMER', 'View customers'),
('p04', 'CUSTOMER_WRITE', 'CUSTOMER', 'Manage customers'),
('p05', 'PRODUCT_READ', 'PRODUCT', 'View products'),
('p06', 'PRODUCT_WRITE', 'PRODUCT', 'Manage products'),
('p07', 'INVOICE_READ', 'INVOICE', 'View invoices'),
('p08', 'INVOICE_WRITE', 'INVOICE', 'Create and edit draft invoices'),
('p09', 'INVOICE_ISSUE', 'INVOICE', 'Issue invoices'),
('p10', 'INVOICE_CANCEL', 'INVOICE', 'Cancel issued invoices'),
('p11', 'REPORT_READ', 'REPORT', 'View reports'),
('p12', 'REPORT_EXPORT', 'REPORT', 'Export reports'),
('p13', 'ORG_SETTINGS_WRITE', 'ORG', 'Manage organization settings');
