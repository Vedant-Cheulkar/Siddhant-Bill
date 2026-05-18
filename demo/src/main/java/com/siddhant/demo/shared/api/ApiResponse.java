package com.siddhant.demo.shared.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.slf4j.MDC;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
		boolean success,
		T data,
		String message,
		Instant timestamp,
		String correlationId
) {

	public static <T> ApiResponse<T> ok(T data) {
		return new ApiResponse<>(true, data, null, Instant.now(), resolveCorrelationId());
	}

	public static <T> ApiResponse<T> ok(T data, String message) {
		return new ApiResponse<>(true, data, message, Instant.now(), resolveCorrelationId());
	}

	public static ApiResponse<Void> okMessage(String message) {
		return new ApiResponse<>(true, null, message, Instant.now(), resolveCorrelationId());
	}

	private static String resolveCorrelationId() {
		return MDC.get(CorrelationIdFilter.MDC_KEY);
	}
}
