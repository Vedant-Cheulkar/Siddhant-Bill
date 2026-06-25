package com.siddhant.demo.modules.invoice.api.dto;

public record InvoicePdfMetadataResponse(
		String invoiceId,
		String storageKey,
		int version,
		boolean generated,
		String filename
) {
}
