package com.siddhant.demo.shared.security;

public final class TenantContext {

	private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();
	private static final ThreadLocal<String> ORGANIZATION_ID = new ThreadLocal<>();

	private TenantContext() {
	}

	public static void set(String tenantId, String organizationId) {
		TENANT_ID.set(tenantId);
		ORGANIZATION_ID.set(organizationId);
	}

	public static String getTenantId() {
		return TENANT_ID.get();
	}

	public static String getOrganizationId() {
		return ORGANIZATION_ID.get();
	}

	public static void clear() {
		TENANT_ID.remove();
		ORGANIZATION_ID.remove();
	}
}
