package com.siddhant.demo.modules.customer.api.dto;

import com.siddhant.demo.shared.validation.Gstin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Partial update — only non-null fields are applied.
 */
public record CustomerUpdateRequest(
		@Size(min = 2, max = 300)
		String name,

		@Pattern(regexp = "^[6-9]\\d{9}$", message = "Mobile must be a valid 10-digit Indian number")
		String mobile,

		@Email(message = "Invalid email format")
		@Size(max = 255)
		String email,

		@Size(min = 5, max = 500)
		String address,

		@Gstin
		@Size(max = 15)
		String gstNumber,

		Boolean active
) {
}
