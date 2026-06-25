-- Step 1: Allow refresh_tokens to exist without a tenant (transitional)
ALTER TABLE refresh_tokens ALTER COLUMN tenant_id DROP NOT NULL;

-- Step 1: Organizations now belong directly to a user (no tenant required)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS user_id VARCHAR(36) REFERENCES users(id);
