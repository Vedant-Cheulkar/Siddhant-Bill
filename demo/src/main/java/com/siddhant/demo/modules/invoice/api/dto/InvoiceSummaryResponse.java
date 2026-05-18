package com.siddhant.demo.modules.invoice.api.dto;

import com.siddhant.demo.modules.invoice.domain.InvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record InvoiceSummaryResponse(
		String id,
		String displayNumber,
		InvoiceStatus status,
		String customerId,
		LocalDate invoiceDate,
		BigDecimal grandTotal,
		Instant createdAt
) {
}
