package com.siddhant.demo.modules.report.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DashboardResponse(
		LocalDate fromDate,
		LocalDate toDate,
		long issuedInvoiceCount,
		long draftInvoiceCount,
		long cancelledInvoiceCount,
		BigDecimal grandTotal
) {
}
