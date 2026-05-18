package com.siddhant.demo.modules.auth.api.dto;

import java.util.Set;

public record UserProfileResponse(
		String id,
		String email,
		String fullName,
		String tenantId,
		String organizationId,
		Set<String> roles,
		Set<String> permissions
) {
}
