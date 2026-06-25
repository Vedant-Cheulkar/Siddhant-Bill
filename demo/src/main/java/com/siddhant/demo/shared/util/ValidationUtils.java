package com.siddhant.demo.shared.util;

import com.siddhant.demo.shared.api.FieldErrorDetail;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

public final class ValidationUtils {

	private ValidationUtils() {
	}

	public static FieldErrorDetail fieldError(String field, String message, Object rejectedValue) {
		return new FieldErrorDetail(field, message, rejectedValue);
	}

	public static List<FieldErrorDetail> singleFieldError(String field, String message) {
		return List.of(new FieldErrorDetail(field, message, null));
	}

	public static void require(boolean condition, Supplier<FieldErrorDetail> errorSupplier) {
		if (!condition) {
			throw new com.siddhant.demo.shared.exception.ValidationException(errorSupplier.get());
		}
	}

	public static List<FieldErrorDetail> merge(List<FieldErrorDetail> first, List<FieldErrorDetail> second) {
		List<FieldErrorDetail> merged = new ArrayList<>(first.size() + second.size());
		merged.addAll(first);
		merged.addAll(second);
		return List.copyOf(merged);
	}
}
