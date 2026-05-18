package com.siddhant.demo.modules.product.api.mapper;

import com.siddhant.demo.modules.product.api.dto.ProductRequest;
import com.siddhant.demo.modules.product.api.dto.ProductResponse;
import com.siddhant.demo.modules.product.infrastructure.persistence.ProductJpaEntity;

public final class ProductMapper {

	private ProductMapper() {
	}

	public static ProductResponse toResponse(ProductJpaEntity entity) {
		return new ProductResponse(
				entity.getId(),
				entity.getSku(),
				entity.getName(),
				entity.getDescription(),
				entity.getHsnSac(),
				entity.getUnitId(),
				entity.getSalePrice(),
				entity.getTaxGroupId(),
				entity.isActive(),
				entity.getCreatedAt(),
				entity.getUpdatedAt()
		);
	}

	public static void applyRequest(ProductJpaEntity entity, ProductRequest request) {
		entity.setSku(request.sku().trim().toUpperCase());
		entity.setName(request.name().trim());
		entity.setDescription(request.description());
		entity.setHsnSac(request.hsnSac());
		entity.setUnitId(request.unitId());
		entity.setSalePrice(request.salePrice());
		entity.setTaxGroupId(request.taxGroupId());
		if (request.active() != null) {
			entity.setActive(request.active());
		}
	}
}
