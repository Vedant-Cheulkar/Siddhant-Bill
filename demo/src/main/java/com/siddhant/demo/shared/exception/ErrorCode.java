package com.siddhant.demo.shared.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

	VALIDATION_FAILED("VAL_001", HttpStatus.BAD_REQUEST),
	RESOURCE_NOT_FOUND("RES_001", HttpStatus.NOT_FOUND),
	UNAUTHORIZED("AUTH_001", HttpStatus.UNAUTHORIZED),
	ACCESS_DENIED("AUTH_002", HttpStatus.FORBIDDEN),
	INVALID_CREDENTIALS("AUTH_003", HttpStatus.UNAUTHORIZED),
	DUPLICATE_CUSTOMER_CODE("CUS_001", HttpStatus.CONFLICT),
	DUPLICATE_PRODUCT_SKU("PRD_001", HttpStatus.CONFLICT),
	INVOICE_ALREADY_ISSUED("INV_001", HttpStatus.CONFLICT),
	INVOICE_NOT_DRAFT("INV_002", HttpStatus.CONFLICT),
	INTERNAL_ERROR("SYS_001", HttpStatus.INTERNAL_SERVER_ERROR);

	private final String code;
	private final HttpStatus status;

	ErrorCode(String code, HttpStatus status) {
		this.code = code;
		this.status = status;
	}
}
