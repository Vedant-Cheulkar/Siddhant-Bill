package com.siddhant.demo.shared.api;

public record FieldErrorDetail(
		String field,
		String message,
		Object rejectedValue
) {
}
