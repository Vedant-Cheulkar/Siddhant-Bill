package com.siddhant.demo.shared.util;

import com.siddhant.demo.shared.constant.ApiConstants;
import org.slf4j.MDC;

import java.util.UUID;

public final class CorrelationIds {

	private CorrelationIds() {
	}

	public static String currentOrNew() {
		String id = MDC.get(ApiConstants.MDC_CORRELATION_ID);
		return id == null || id.isBlank() ? UUID.randomUUID().toString() : id;
	}

	public static String current() {
		return MDC.get(ApiConstants.MDC_CORRELATION_ID);
	}
}
