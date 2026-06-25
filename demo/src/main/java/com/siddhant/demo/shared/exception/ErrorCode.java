package com.siddhant.demo.shared.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

	VALIDATION_FAILED("VAL_001", HttpStatus.BAD_REQUEST),
	CONCURRENT_MODIFICATION("VAL_002", HttpStatus.CONFLICT),
	DATA_INTEGRITY_VIOLATION("VAL_003", HttpStatus.CONFLICT),
	RESOURCE_NOT_FOUND("RES_001", HttpStatus.NOT_FOUND),
	UNAUTHORIZED("AUTH_001", HttpStatus.UNAUTHORIZED),
	ACCESS_DENIED("AUTH_002", HttpStatus.FORBIDDEN),
	INVALID_CREDENTIALS("AUTH_003", HttpStatus.UNAUTHORIZED),
	DUPLICATE_EMAIL("AUTH_004", HttpStatus.CONFLICT),
	TENANT_NOT_FOUND("AUTH_005", HttpStatus.NOT_FOUND),
	DUPLICATE_CUSTOMER_CODE("CUS_001", HttpStatus.CONFLICT),
	DUPLICATE_MOBILE("CUS_002", HttpStatus.CONFLICT),
	DUPLICATE_GSTIN("CUS_003", HttpStatus.CONFLICT),
	DUPLICATE_PRODUCT_SKU("PRD_001", HttpStatus.CONFLICT),
	INVOICE_ALREADY_ISSUED("INV_001", HttpStatus.CONFLICT),
	INVOICE_NOT_DRAFT("INV_002", HttpStatus.CONFLICT),
	PDF_GENERATION_FAILED("DOC_001", HttpStatus.INTERNAL_SERVER_ERROR),
	INTERNAL_ERROR("SYS_001", HttpStatus.INTERNAL_SERVER_ERROR);

	private final String code;
	private final HttpStatus status;

	ErrorCode(String code, HttpStatus status) {
		this.code = code;
		this.status = status;
	}
}
