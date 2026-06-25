package com.siddhant.demo.shared.exception;

/**
 * Business rule violation that maps to HTTP 409 Conflict.
 */
public class ConflictException extends BusinessException {

	public ConflictException(ErrorCode errorCode, String message) {
		super(errorCode, message);
	}

	public ConflictException(ErrorCode errorCode) {
		super(errorCode);
	}
}
