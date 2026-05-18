package com.siddhant.demo.modules.product.api.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(
		String id,
		String sku,
		String name,
		String description,
		String hsnSac,
		String unitId,
		BigDecimal salePrice,
		String taxGroupId,
		boolean active,
		Instant createdAt,
		Instant updatedAt
) {
}
