package com.siddhant.demo.modules.invoice.api;

import com.siddhant.demo.modules.invoice.api.dto.InvoiceSummaryResponse;
import com.siddhant.demo.modules.invoice.application.InvoiceService;
import com.siddhant.demo.modules.invoice.domain.InvoiceStatus;
import com.siddhant.demo.shared.api.ApiResponse;
import com.siddhant.demo.shared.api.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {

	private final InvoiceService invoiceService;

	public InvoiceController(InvoiceService invoiceService) {
		this.invoiceService = invoiceService;
	}

	@GetMapping
	public ApiResponse<PageResponse<InvoiceSummaryResponse>> list(
			@RequestParam(required = false) InvoiceStatus status,
			@RequestParam(required = false) String customerId,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
			@RequestParam(required = false) String q,
			@PageableDefault(size = 20, sort = "invoiceDate", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return ApiResponse.ok(PageResponse.from(
				invoiceService.list(status, customerId, fromDate, toDate, q, pageable)));
	}
}
