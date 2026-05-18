package com.siddhant.demo.modules.invoice.application;

import com.siddhant.demo.modules.invoice.api.dto.InvoiceSummaryResponse;
import com.siddhant.demo.modules.invoice.api.mapper.InvoiceMapper;
import com.siddhant.demo.modules.invoice.domain.InvoiceStatus;
import com.siddhant.demo.modules.invoice.infrastructure.persistence.InvoiceJpaRepository;
import com.siddhant.demo.shared.security.SecurityUtils;
import com.siddhant.demo.shared.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class InvoiceService {

	private final InvoiceJpaRepository invoiceRepository;

	public InvoiceService(InvoiceJpaRepository invoiceRepository) {
		this.invoiceRepository = invoiceRepository;
	}

	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('INVOICE_READ')")
	public Page<InvoiceSummaryResponse> list(
			InvoiceStatus status,
			String customerId,
			LocalDate fromDate,
			LocalDate toDate,
			String q,
			Pageable pageable
	) {
		UserPrincipal user = SecurityUtils.currentUser();
		return invoiceRepository.search(
						user.getTenantId(),
						user.getOrganizationId(),
						status,
						blankToNull(customerId),
						fromDate,
						toDate,
						blankToNull(q),
						pageable
				)
				.map(InvoiceMapper::toSummary);
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
