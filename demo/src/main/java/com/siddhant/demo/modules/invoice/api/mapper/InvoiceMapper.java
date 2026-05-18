package com.siddhant.demo.modules.invoice.api.mapper;

import com.siddhant.demo.modules.invoice.api.dto.InvoiceSummaryResponse;
import com.siddhant.demo.modules.invoice.infrastructure.persistence.InvoiceJpaEntity;

public final class InvoiceMapper {

	private InvoiceMapper() {
	}

	public static InvoiceSummaryResponse toSummary(InvoiceJpaEntity entity) {
		return new InvoiceSummaryResponse(
				entity.getId(),
				entity.getDisplayNumber(),
				entity.getStatus(),
				entity.getCustomerId(),
				entity.getInvoiceDate(),
				entity.getGrandTotal(),
				entity.getCreatedAt()
		);
	}
}
