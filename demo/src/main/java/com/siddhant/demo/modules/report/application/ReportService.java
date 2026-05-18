package com.siddhant.demo.modules.report.application;

import com.siddhant.demo.modules.invoice.domain.InvoiceStatus;
import com.siddhant.demo.modules.invoice.infrastructure.persistence.InvoiceJpaRepository;
import com.siddhant.demo.modules.report.api.dto.DashboardResponse;
import com.siddhant.demo.shared.security.SecurityUtils;
import com.siddhant.demo.shared.security.UserPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;

@Service
public class ReportService {

	private final InvoiceJpaRepository invoiceRepository;

	public ReportService(InvoiceJpaRepository invoiceRepository) {
		this.invoiceRepository = invoiceRepository;
	}

	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('REPORT_READ')")
	public DashboardResponse dashboard(LocalDate fromDate, LocalDate toDate) {
		UserPrincipal user = SecurityUtils.currentUser();
		LocalDate from = fromDate != null ? fromDate : YearMonth.now().atDay(1);
		LocalDate to = toDate != null ? toDate : LocalDate.now();

		long issued = invoiceRepository.countByTenantIdAndOrganizationIdAndStatusAndDeletedAtIsNull(
				user.getTenantId(), user.getOrganizationId(), InvoiceStatus.ISSUED);
		long draft = invoiceRepository.countByTenantIdAndOrganizationIdAndStatusAndDeletedAtIsNull(
				user.getTenantId(), user.getOrganizationId(), InvoiceStatus.DRAFT);
		long cancelled = invoiceRepository.countByTenantIdAndOrganizationIdAndStatusAndDeletedAtIsNull(
				user.getTenantId(), user.getOrganizationId(), InvoiceStatus.CANCELLED);

		BigDecimal total = invoiceRepository.sumIssuedGrandTotal(
				user.getTenantId(), user.getOrganizationId(), InvoiceStatus.ISSUED, from, to);

		return new DashboardResponse(from, to, issued, draft, cancelled, total);
	}
}
