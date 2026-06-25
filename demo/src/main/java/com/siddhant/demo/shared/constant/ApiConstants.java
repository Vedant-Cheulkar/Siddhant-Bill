package com.siddhant.demo.shared.constant;

public final class ApiConstants {

	public static final String API_V1_PREFIX = "/api/v1";
	public static final String MDC_CORRELATION_ID = "correlationId";
	public static final String HEADER_CORRELATION_ID = "X-Correlation-Id";
	public static final String ERROR_TYPE_BASE_URI = "https://api.billing.local/errors/";
	public static final String PROBLEM_ERROR_CODE = "errorCode";
	public static final String PROBLEM_CORRELATION_ID = "correlationId";
	public static final String PROBLEM_FIELD_ERRORS = "errors";

	private ApiConstants() {
	}
}
