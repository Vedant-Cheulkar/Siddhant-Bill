package com.siddhant.demo.modules.user.api.dto;

import java.time.Instant;

public record UserSummaryResponse(
		String id,
		String email,
		String fullName,
		String status,
		Instant lastLoginAt
) {
}
