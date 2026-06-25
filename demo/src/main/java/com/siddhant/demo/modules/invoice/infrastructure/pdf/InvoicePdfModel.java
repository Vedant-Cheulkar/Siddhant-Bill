package com.siddhant.demo.modules.invoice.infrastructure.pdf;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record InvoicePdfModel(
		String invoiceNumber,
		String statusLabel,
		LocalDate invoiceDate,
		LocalDate dueDate,
		String supplyType,
		String placeOfSupplyState,
		String companyName,
		String companyTradeName,
		String companyGstin,
		String companyPan,
		String companyEmail,
		String companyPhone,
		String companyAddressLine1,
		String companyAddressLine2,
		String companyCityStatePin,
		String logoDataUri,
		String customerName,
		String customerGstin,
		String customerEmail,
		String customerMobile,
		String customerAddress,
		String customerStateCode,
		List<InvoicePdfLineModel> lines,
		BigDecimal subtotal,
		BigDecimal discountTotal,
		BigDecimal taxableAmount,
		BigDecimal cgstTotal,
		BigDecimal sgstTotal,
		BigDecimal igstTotal,
		BigDecimal cessTotal,
		BigDecimal roundOff,
		BigDecimal grandTotal,
		String amountInWords,
		String notes,
		String terms,
		boolean intraState
) {
}
