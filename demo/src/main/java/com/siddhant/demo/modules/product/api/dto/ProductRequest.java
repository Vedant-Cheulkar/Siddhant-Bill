package com.siddhant.demo.modules.product.api.dto;

import com.siddhant.demo.shared.validation.ValidGstPercentage;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequest(
		@NotBlank(message = "SKU is required")
		@Size(min = 2, max = 50, message = "SKU must be between 2 and 50 characters")
		@Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "SKU may only contain letters, numbers, hyphen, and underscore")
		String sku,

		@NotBlank(message = "Product name is required")
		@Size(min = 2, max = 300, message = "Name must be between 2 and 300 characters")
		String name,

		@Size(max = 2000, message = "Description cannot exceed 2000 characters")
		String description,

		@NotNull(message = "Price is required")
		@DecimalMin(value = "0.00", message = "Price must be zero or positive")
		BigDecimal price,

		@NotNull(message = "GST percentage is required")
		@ValidGstPercentage
		BigDecimal gstPercentage,

		@NotNull(message = "Stock quantity is required")
		@Min(value = 0, message = "Stock quantity cannot be negative")
		Integer stockQuantity,

		Boolean active
) {
}
