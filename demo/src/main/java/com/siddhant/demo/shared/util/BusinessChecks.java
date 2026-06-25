package com.siddhant.demo.shared.util;

import com.siddhant.demo.shared.exception.ErrorCode;
import com.siddhant.demo.shared.exception.ResourceNotFoundException;
import com.siddhant.demo.shared.exception.UnauthorizedException;
import com.siddhant.demo.shared.exception.ValidationException;

import java.util.Objects;
import java.util.function.Supplier;

/**
 * Guard clauses for application services (tenant scope, existence, state).
 */
public final class BusinessChecks {

	private BusinessChecks() {
	}

	public static void requireFound(boolean exists, String resourceName) {
		if (!exists) {
			throw new ResourceNotFoundException(resourceName + " not found");
		}
	}

	public static <T> T requireFound(java.util.Optional<T> optional, String resourceName) {
		return optional.orElseThrow(() -> new ResourceNotFoundException(resourceName + " not found"));
	}

	public static void requireSameTenant(String entityTenantId, String currentTenantId) {
		if (!Objects.equals(entityTenantId, currentTenantId)) {
			throw new UnauthorizedException("Resource does not belong to the current tenant.");
		}
	}

	public static void requireSameOrganization(String entityOrgId, String currentOrgId) {
		if (!Objects.equals(entityOrgId, currentOrgId)) {
			throw new UnauthorizedException("Resource does not belong to the current organization.");
		}
	}

	public static void requireState(boolean valid, ErrorCode errorCode, String message) {
		if (!valid) {
			throw new com.siddhant.demo.shared.exception.ConflictException(errorCode, message);
		}
	}

	public static void requireArgument(boolean valid, String message) {
		if (!valid) {
			throw new ValidationException(message);
		}
	}

	public static void requireArgument(boolean valid, Supplier<String> messageSupplier) {
		if (!valid) {
			throw new ValidationException(messageSupplier.get());
		}
	}
}
