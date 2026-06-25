package com.siddhant.demo.modules.report.api;

import com.siddhant.demo.modules.report.api.dto.DashboardResponse;
import com.siddhant.demo.modules.report.application.ReportService;
import com.siddhant.demo.shared.api.ApiResponse;
import com.siddhant.demo.shared.config.OpenApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports", description = "Sales dashboard and analytics")
@SecurityRequirement(name = OpenApiConstants.BEARER_SCHEME)
public class ReportController {

	private final ReportService reportService;

	public ReportController(ReportService reportService) {
		this.reportService = reportService;
	}

	@GetMapping("/dashboard")
	@Operation(summary = "Dashboard totals for issued invoices in a date range")
	public ApiResponse<DashboardResponse> dashboard(
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
	) {
		return ApiResponse.ok(reportService.dashboard(fromDate, toDate));
	}
}
