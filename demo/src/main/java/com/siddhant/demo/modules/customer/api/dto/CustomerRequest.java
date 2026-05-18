package com.siddhant.demo.modules.customer.api.dto;

import com.siddhant.demo.shared.validation.Gstin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
		@NotBlank @Size(min = 2, max = 30) @Pattern(regexp = "^[A-Za-z0-9_-]+$") String code,
		@NotBlank @Size(min = 2, max = 300) String name,
		@Gstin String gstin,
		@Size(max = 10) String pan,
		@Email @Size(max = 255) String email,
		@Size(max = 20) String phone,
		@NotBlank @Size(min = 2, max = 2) String billingStateCode,
		@Min(0) @Max(365) int creditDays,
		Boolean active,
		@Size(max = 2000) String notes
) {
}
