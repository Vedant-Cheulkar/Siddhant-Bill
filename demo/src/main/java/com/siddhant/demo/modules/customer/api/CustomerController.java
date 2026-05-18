package com.siddhant.demo.modules.customer.api;

import com.siddhant.demo.modules.customer.api.dto.CustomerRequest;
import com.siddhant.demo.modules.customer.api.dto.CustomerResponse;
import com.siddhant.demo.modules.customer.application.CustomerService;
import com.siddhant.demo.shared.api.ApiResponse;
import com.siddhant.demo.shared.api.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
public class CustomerController {

	private final CustomerService customerService;

	public CustomerController(CustomerService customerService) {
		this.customerService = customerService;
	}

	@GetMapping
	public ApiResponse<PageResponse<CustomerResponse>> list(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Boolean isActive,
			@PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
	) {
		return ApiResponse.ok(PageResponse.from(customerService.list(q, isActive, pageable)));
	}

	@GetMapping("/{id}")
	public ApiResponse<CustomerResponse> get(@PathVariable String id) {
		return ApiResponse.ok(customerService.getById(id));
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResponse<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) {
		return ApiResponse.ok(customerService.create(request));
	}

	@PutMapping("/{id}")
	public ApiResponse<CustomerResponse> update(@PathVariable String id, @Valid @RequestBody CustomerRequest request) {
		return ApiResponse.ok(customerService.update(id, request));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String id) {
		customerService.delete(id);
	}
}
