package com.siddhant.demo.modules.product.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequest(
		@NotBlank @Size(min = 2, max = 50) @Pattern(regexp = "^[A-Za-z0-9_-]+$") String sku,
		@NotBlank @Size(min = 2, max = 300) String name,
		@Size(max = 2000) String description,
		@NotBlank @Size(min = 4, max = 10) @Pattern(regexp = "^[0-9]+$") String hsnSac,
		@NotBlank String unitId,
		@NotNull @DecimalMin("0.00") BigDecimal salePrice,
		@NotBlank String taxGroupId,
		Boolean active
) {
}
