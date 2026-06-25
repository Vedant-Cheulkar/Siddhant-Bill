package com.siddhant.demo.modules.invoice.api;

import com.siddhant.demo.modules.invoice.api.dto.InvoicePdfMetadataResponse;
import com.siddhant.demo.modules.invoice.api.dto.InvoiceSummaryResponse;
import com.siddhant.demo.modules.invoice.application.InvoicePdfService;
import com.siddhant.demo.modules.invoice.application.InvoiceService;
import com.siddhant.demo.modules.invoice.domain.InvoiceStatus;
import com.siddhant.demo.shared.api.ApiResponse;
import com.siddhant.demo.shared.api.PageResponse;
import com.siddhant.demo.shared.config.OpenApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/invoices")
@Tag(name = "Invoices", description = "Invoice management and PDF export")
@SecurityRequirement(name = OpenApiConstants.BEARER_SCHEME)
public class InvoiceController {

	private final InvoiceService invoiceService;
	private final InvoicePdfService invoicePdfService;

	public InvoiceController(InvoiceService invoiceService, InvoicePdfService invoicePdfService) {
		this.invoiceService = invoiceService;
		this.invoicePdfService = invoicePdfService;
	}

	@GetMapping
	@Operation(summary = "List invoices")
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

	@GetMapping("/{id}/pdf")
	@Operation(summary = "Download invoice PDF (generates if missing)")
	public ResponseEntity<byte[]> downloadPdf(
			@PathVariable String id,
			@RequestParam(defaultValue = "false") boolean regenerate
	) {
		InvoicePdfService.InvoicePdfResult result = invoicePdfService.getOrGeneratePdf(id, regenerate);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.filename() + "\"")
				.contentType(MediaType.APPLICATION_PDF)
				.body(result.bytes());
	}

	@PostMapping("/{id}/pdf")
	@Operation(summary = "Generate or regenerate invoice PDF")
	public ApiResponse<InvoicePdfMetadataResponse> generatePdf(
			@PathVariable String id,
			@RequestParam(defaultValue = "false") boolean regenerate
	) {
		return ApiResponse.ok(invoicePdfService.generatePdf(id, regenerate));
	}
}
