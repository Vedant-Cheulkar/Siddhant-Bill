package com.siddhant.demo.modules.auth.api.dto;

public record AuthTokenResponse(
		String accessToken,
		String refreshToken,
		long expiresIn,
		String tokenType,
		UserProfileResponse user
) {
}
