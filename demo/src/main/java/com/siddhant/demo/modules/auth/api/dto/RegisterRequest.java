package com.siddhant.demo.modules.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
		@NotBlank @Email @Size(max = 255) String email,
		@NotBlank
		@Size(min = 8, max = 128)
		@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
				message = "Password must contain upper, lower, and a digit")
		String password,
		@NotBlank @Size(min = 2, max = 200) String fullName,
		@NotBlank @Size(min = 2, max = 300) String businessName,
		@Size(max = 20) String phone
) {
}
