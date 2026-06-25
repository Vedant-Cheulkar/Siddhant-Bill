package com.siddhant.demo.modules.invoice.infrastructure.pdf;

import java.math.BigDecimal;

public record InvoicePdfLineModel(
		int lineNumber,
		String description,
		String hsnSac,
		BigDecimal quantity,
		BigDecimal unitPrice,
		BigDecimal discountAmount,
		BigDecimal taxableAmount,
		BigDecimal cgstRate,
		BigDecimal sgstRate,
		BigDecimal igstRate,
		BigDecimal cgstAmount,
		BigDecimal sgstAmount,
		BigDecimal igstAmount,
		BigDecimal lineTotal
) {
}
