package com.siddhant.demo.shared.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.siddhant.demo.shared.exception.ErrorCode;
import com.siddhant.demo.shared.util.CorrelationIds;
import org.springframework.validation.FieldError;
import jakarta.validation.ConstraintViolation;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.time.Instant;
import java.util.List;
import java.util.Set;

/**
 * Dedicated validation error payload (400) with per-field details.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ValidationErrorResponse(
		int status,
		String errorCode,
		String title,
		String detail,
		List<FieldErrorDetail> errors,
		String correlationId,
		Instant timestamp
) {

	public static ValidationErrorResponse from(MethodArgumentNotValidException ex) {
		List<FieldErrorDetail> errors = ex.getBindingResult().getFieldErrors().stream()
				.map(ValidationErrorResponse::toFieldError)
				.toList();
		return new ValidationErrorResponse(
				ErrorCode.VALIDATION_FAILED.getStatus().value(),
				ErrorCode.VALIDATION_FAILED.getCode(),
				ErrorCode.VALIDATION_FAILED.name(),
				"One or more fields are invalid.",
				errors,
				CorrelationIds.current(),
				Instant.now()
		);
	}

	public static ValidationErrorResponse from(List<FieldErrorDetail> errors, String detail) {
		return new ValidationErrorResponse(
				ErrorCode.VALIDATION_FAILED.getStatus().value(),
				ErrorCode.VALIDATION_FAILED.getCode(),
				ErrorCode.VALIDATION_FAILED.name(),
				detail,
				errors == null ? List.of() : List.copyOf(errors),
				CorrelationIds.current(),
				Instant.now()
		);
	}

	public static ValidationErrorResponse fromConstraintViolations(
			Set<? extends ConstraintViolation<?>> violations
	) {
		List<FieldErrorDetail> errors = violations.stream()
				.map(v -> new FieldErrorDetail(
						v.getPropertyPath().toString(),
						v.getMessage(),
						v.getInvalidValue()))
				.toList();
		return new ValidationErrorResponse(
				ErrorCode.VALIDATION_FAILED.getStatus().value(),
				ErrorCode.VALIDATION_FAILED.getCode(),
				ErrorCode.VALIDATION_FAILED.name(),
				"One or more parameters are invalid.",
				errors,
				CorrelationIds.current(),
				Instant.now()
		);
	}

	private static FieldErrorDetail toFieldError(FieldError fieldError) {
		return new FieldErrorDetail(
				fieldError.getField(),
				fieldError.getDefaultMessage(),
				fieldError.getRejectedValue()
		);
	}
}
