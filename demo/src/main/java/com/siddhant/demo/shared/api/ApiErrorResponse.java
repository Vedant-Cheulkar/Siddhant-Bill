package com.siddhant.demo.shared.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.siddhant.demo.shared.constant.ApiConstants;
import com.siddhant.demo.shared.exception.ErrorCode;
import com.siddhant.demo.shared.util.CorrelationIds;
import io.swagger.v3.oas.annotations.media.Schema;

import java.net.URI;
import java.time.Instant;
import java.util.List;

/**
 * Standard error body for non-validation failures (RFC 7807 aligned).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Standard API error response (RFC 7807 aligned)")
public record ApiErrorResponse(
		String type,
		String title,
		int status,
		String detail,
		String errorCode,
		String correlationId,
		Instant timestamp,
		List<FieldErrorDetail> errors
) {

	public static ApiErrorResponse of(ErrorCode errorCode, String detail) {
		return of(errorCode, detail, null);
	}

	public static ApiErrorResponse of(ErrorCode errorCode, String detail, List<FieldErrorDetail> errors) {
		return new ApiErrorResponse(
				ApiConstants.ERROR_TYPE_BASE_URI + errorCode.getCode(),
				errorCode.name(),
				errorCode.getStatus().value(),
				detail,
				errorCode.getCode(),
				CorrelationIds.currentOrNew(),
				Instant.now(),
				errors
		);
	}

	public URI typeUri() {
		return URI.create(type);
	}
}
