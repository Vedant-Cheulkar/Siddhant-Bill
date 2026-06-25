package com.siddhant.demo.modules.product.api.mapper;

import com.siddhant.demo.modules.product.api.dto.ProductRequest;
import com.siddhant.demo.modules.product.api.dto.ProductResponse;
import com.siddhant.demo.modules.product.api.dto.ProductUpdateRequest;
import com.siddhant.demo.modules.product.domain.ProductConstants;
import com.siddhant.demo.modules.product.infrastructure.persistence.ProductJpaEntity;
import com.siddhant.demo.shared.util.MoneyUtils;

public final class ProductMapper {

	private ProductMapper() {
	}

	public static ProductResponse toResponse(ProductJpaEntity entity) {
		return new ProductResponse(
				entity.getId(),
				entity.getSku(),
				entity.getName(),
				entity.getDescription(),
				entity.getSalePrice(),
				entity.getGstPercentage(),
				entity.getStockQuantity(),
				entity.getStockQuantity() <= ProductConstants.LOW_STOCK_THRESHOLD,
				entity.isActive(),
				entity.getCreatedAt(),
				entity.getUpdatedAt()
		);
	}

	public static void applyCreate(ProductJpaEntity entity, ProductRequest request) {
		entity.setSku(normalizeSku(request.sku()));
		entity.setName(request.name().trim());
		entity.setDescription(blankToNull(request.description()));
		entity.setSalePrice(MoneyUtils.scale(request.price()));
		entity.setGstPercentage(MoneyUtils.scale(request.gstPercentage()));
		entity.setStockQuantity(request.stockQuantity());
		entity.setActive(request.active() == null || request.active());
	}

	public static void applyUpdate(ProductJpaEntity entity, ProductUpdateRequest request) {
		if (request.sku() != null) {
			entity.setSku(normalizeSku(request.sku()));
		}
		if (request.name() != null) {
			entity.setName(request.name().trim());
		}
		if (request.description() != null) {
			entity.setDescription(blankToNull(request.description()));
		}
		if (request.price() != null) {
			entity.setSalePrice(MoneyUtils.scale(request.price()));
		}
		if (request.gstPercentage() != null) {
			entity.setGstPercentage(MoneyUtils.scale(request.gstPercentage()));
		}
		if (request.stockQuantity() != null) {
			entity.setStockQuantity(request.stockQuantity());
		}
		if (request.active() != null) {
			entity.setActive(request.active());
		}
	}

	private static String normalizeSku(String sku) {
		return sku == null ? null : sku.trim().toUpperCase();
	}

	private static String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
