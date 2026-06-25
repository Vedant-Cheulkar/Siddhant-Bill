package com.siddhant.demo.modules.product.api;

import com.siddhant.demo.modules.product.api.dto.ProductRequest;
import com.siddhant.demo.modules.product.api.dto.ProductResponse;
import com.siddhant.demo.modules.product.api.dto.ProductUpdateRequest;
import com.siddhant.demo.modules.product.application.ProductService;
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

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Products", description = "Product catalog with GST and stock")
@SecurityRequirement(name = OpenApiConstants.BEARER_SCHEME)
public class ProductController {

	private final ProductService productService;

	public ProductController(ProductService productService) {
		this.productService = productService;
	}

	@GetMapping
	@Operation(summary = "List products with search, filters, and pagination")
	public ApiResponse<PageResponse<ProductResponse>> list(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Boolean isActive,
			@RequestParam(required = false) BigDecimal gstPercentage,
			@RequestParam(required = false) Boolean lowStock,
			@PageableDefault(size = PaginationConstants.DEFAULT_SIZE, sort = "name", direction = Sort.Direction.ASC)
			Pageable pageable
	) {
		Pageable safePageable = PageUtils.of(pageable.getPageNumber(), pageable.getPageSize(), pageable.getSort());
		return ApiResponse.ok(PageResponse.from(
				productService.list(q, isActive, gstPercentage, lowStock, safePageable)));
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get product by ID")
	public ApiResponse<ProductResponse> get(@PathVariable String id) {
		return ApiResponse.ok(productService.getById(id));
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@Operation(summary = "Create product")
	public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
		return ApiResponse.ok(productService.create(request));
	}

	@PutMapping("/{id}")
	@Operation(summary = "Replace product (full update)")
	public ApiResponse<ProductResponse> replace(
			@PathVariable String id,
			@Valid @RequestBody ProductRequest request
	) {
		return ApiResponse.ok(productService.replace(id, request));
	}

	@PatchMapping("/{id}")
	@Operation(summary = "Partially update product")
	public ApiResponse<ProductResponse> patch(
			@PathVariable String id,
			@Valid @RequestBody ProductUpdateRequest request
	) {
		return ApiResponse.ok(productService.update(id, request));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@Operation(summary = "Soft-delete product")
	public void delete(@PathVariable String id) {
		productService.delete(id);
	}
}
