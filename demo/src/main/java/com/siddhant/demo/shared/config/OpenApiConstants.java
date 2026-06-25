package com.siddhant.demo.shared.config;

public final class OpenApiConstants {

	public static final String BEARER_SCHEME = "bearer-jwt";
	public static final String API_TITLE = "Billing Management API";
	public static final String API_DESCRIPTION = """
			REST API for invoice billing, GST-compliant invoicing, customers, products, and reports.
			Authenticate via **POST /api/v1/auth/login**, then use **Authorize** with the access token (Bearer JWT).
			""";

	private OpenApiConstants() {
	}
}
