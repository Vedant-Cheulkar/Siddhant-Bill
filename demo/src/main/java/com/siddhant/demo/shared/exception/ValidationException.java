package com.siddhant.demo.shared.exception;

import com.siddhant.demo.shared.api.FieldErrorDetail;
import lombok.Getter;

import java.util.List;

/**
 * Domain or service-level validation failure with optional field-level details.
 */
@Getter
public class ValidationException extends BusinessException {

	private final List<FieldErrorDetail> fieldErrors;

	public ValidationException(String message) {
		this(message, List.of());
	}

	public ValidationException(String message, List<FieldErrorDetail> fieldErrors) {
		super(ErrorCode.VALIDATION_FAILED, message);
		this.fieldErrors = fieldErrors == null ? List.of() : List.copyOf(fieldErrors);
	}

	public ValidationException(FieldErrorDetail fieldError) {
		this("Validation failed.", List.of(fieldError));
	}
}
