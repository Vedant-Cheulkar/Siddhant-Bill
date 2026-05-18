package com.siddhant.demo.shared.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

	private SecurityUtils() {
	}

	public static UserPrincipal currentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
			throw new IllegalStateException("No authenticated user in context");
		}
		return principal;
	}

	public static String currentUserId() {
		return currentUser().getId();
	}
}
