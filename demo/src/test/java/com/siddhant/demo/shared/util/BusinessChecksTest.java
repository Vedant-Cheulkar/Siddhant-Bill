package com.siddhant.demo.shared.util;

import com.siddhant.demo.shared.exception.ResourceNotFoundException;
import com.siddhant.demo.shared.exception.UnauthorizedException;
import com.siddhant.demo.shared.exception.ValidationException;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class BusinessChecksTest {

	@Test
	void requireFoundThrowsWhenMissing() {
		assertThrows(ResourceNotFoundException.class, () -> BusinessChecks.requireFound(false, "Customer"));
	}

	@Test
	void requireFoundReturnsValue() {
		String value = BusinessChecks.requireFound(Optional.of("ok"), "Customer");
		assertEquals("ok", value);
	}

	@Test
	void requireSameTenantRejectsMismatch() {
		assertThrows(UnauthorizedException.class, () -> BusinessChecks.requireSameTenant("t1", "t2"));
	}

	@Test
	void requireArgumentThrowsValidationException() {
		assertThrows(ValidationException.class, () -> BusinessChecks.requireArgument(false, "bad"));
	}
}
