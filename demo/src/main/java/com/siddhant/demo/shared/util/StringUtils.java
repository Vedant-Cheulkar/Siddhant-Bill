package com.siddhant.demo.shared.util;

public final class StringUtils {

	private StringUtils() {
	}

	public static String blankToNull(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}

	public static String requireNonBlank(String value, String fieldName) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException(fieldName + " must not be blank");
		}
		return value.trim();
	}

	public static String normalizeEmail(String email) {
		return requireNonBlank(email, "email").toLowerCase();
	}
}
