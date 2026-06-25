package com.siddhant.demo.modules.customer.api.dto;

import com.siddhant.demo.shared.validation.Gstin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
		@NotBlank(message = "Customer name is required")
		@Size(min = 2, max = 300, message = "Name must be between 2 and 300 characters")
		String name,

		@NotBlank(message = "Mobile number is required")
		@Pattern(regexp = "^[6-9]\\d{9}$", message = "Mobile must be a valid 10-digit Indian number")
		String mobile,

		@Email(message = "Invalid email format")
		@Size(max = 255)
		String email,

		@NotBlank(message = "Address is required")
		@Size(min = 5, max = 500, message = "Address must be between 5 and 500 characters")
		String address,

		@Gstin
		@Size(max = 15)
		String gstNumber,

		Boolean active
) {
}
