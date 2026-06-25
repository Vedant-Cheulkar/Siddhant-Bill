package com.siddhant.demo.shared.exception;

/**
 * Authentication or cross-tenant access failure (HTTP 401).
 */
public class UnauthorizedException extends BusinessException {

	public UnauthorizedException(String message) {
		super(ErrorCode.UNAUTHORIZED, message);
	}

	public UnauthorizedException() {
		super(ErrorCode.UNAUTHORIZED, "Authentication required.");
	}
}
