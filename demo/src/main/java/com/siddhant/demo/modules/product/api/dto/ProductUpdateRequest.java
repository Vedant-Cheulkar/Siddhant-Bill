package com.siddhant.demo.modules.product.api.dto;

import com.siddhant.demo.shared.validation.ValidGstPercentage;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductUpdateRequest(
		@Size(min = 2, max = 50)
		@Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "SKU may only contain letters, numbers, hyphen, and underscore")
		String sku,

		@Size(min = 2, max = 300)
		String name,

		@Size(max = 2000)
		String description,

		@DecimalMin(value = "0.00", message = "Price must be zero or positive")
		BigDecimal price,

		@ValidGstPercentage
		BigDecimal gstPercentage,

		@Min(value = 0, message = "Stock quantity cannot be negative")
		Integer stockQuantity,

		Boolean active
) {
}
