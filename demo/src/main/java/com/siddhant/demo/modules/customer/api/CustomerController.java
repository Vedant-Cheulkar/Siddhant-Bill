package com.siddhant.demo.modules.customer.api;

import com.siddhant.demo.modules.customer.api.dto.CustomerRequest;
import com.siddhant.demo.modules.customer.api.dto.CustomerResponse;
import com.siddhant.demo.modules.customer.api.dto.CustomerUpdateRequest;
import com.siddhant.demo.modules.customer.application.CustomerService;
import com.siddhant.demo.shared.api.ApiResponse;
import com.siddhant.demo.shared.api.PageResponse;
import com.siddhant.demo.shared.constant.PaginationConstants;
import com.siddhant.demo.shared.util.PageUtils;
import com.siddhant.demo.shared.config.OpenApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customers")
@Tag(name = "Customers", description = "Customer master data")
@SecurityRequirement(name = OpenApiConstants.BEARER_SCHEME)
public class CustomerController {

	private final CustomerService customerService;

	public CustomerController(CustomerService customerService) {
		this.customerService = customerService;
	}

	@GetMapping
	@Operation(summary = "List customers with search and pagination")
	public ApiResponse<PageResponse<CustomerResponse>> list(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Boolean isActive,
			@PageableDefault(size = PaginationConstants.DEFAULT_SIZE, sort = "name", direction = Sort.Direction.ASC)
			Pageable pageable
	) {
		Pageable safePageable = PageUtils.of(pageable.getPageNumber(), pageable.getPageSize(), pageable.getSort());
		return ApiResponse.ok(PageResponse.from(customerService.list(q, isActive, safePageable)));
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get customer by ID")
	public ApiResponse<CustomerResponse> get(@PathVariable String id) {
		return ApiResponse.ok(customerService.getById(id));
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@Operation(summary = "Create customer")
	public ApiResponse<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) {
		return ApiResponse.ok(customerService.create(request));
	}

	@PutMapping("/{id}")
	@Operation(summary = "Replace customer (full update)")
	public ApiResponse<CustomerResponse> replace(
			@PathVariable String id,
			@Valid @RequestBody CustomerRequest request
	) {
		return ApiResponse.ok(customerService.replace(id, request));
	}

	@PatchMapping("/{id}")
	@Operation(summary = "Partially update customer")
	public ApiResponse<CustomerResponse> patch(
			@PathVariable String id,
			@Valid @RequestBody CustomerUpdateRequest request
	) {
		return ApiResponse.ok(customerService.update(id, request));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@Operation(summary = "Soft-delete customer")
	public void delete(@PathVariable String id) {
		customerService.delete(id);
	}
}
