package com.siddhant.demo.modules.product.api;

import com.siddhant.demo.modules.product.api.dto.ProductRequest;
import com.siddhant.demo.modules.product.api.dto.ProductResponse;
import com.siddhant.demo.modules.product.application.ProductService;
import com.siddhant.demo.shared.api.ApiResponse;
import com.siddhant.demo.shared.api.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/v1/products")
public class ProductController {

	private final ProductService productService;

	public ProductController(ProductService productService) {
		this.productService = productService;
	}

	@GetMapping
	public ApiResponse<PageResponse<ProductResponse>> list(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Boolean isActive,
			@PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
	) {
		return ApiResponse.ok(PageResponse.from(productService.list(q, isActive, pageable)));
	}

	@GetMapping("/{id}")
	public ApiResponse<ProductResponse> get(@PathVariable String id) {
		return ApiResponse.ok(productService.getById(id));
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
		return ApiResponse.ok(productService.create(request));
	}

	@PutMapping("/{id}")
	public ApiResponse<ProductResponse> update(@PathVariable String id, @Valid @RequestBody ProductRequest request) {
		return ApiResponse.ok(productService.update(id, request));
	}
}
