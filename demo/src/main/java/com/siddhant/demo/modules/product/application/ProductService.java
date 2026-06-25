package com.siddhant.demo.modules.product.application;

import com.siddhant.demo.modules.product.api.dto.ProductRequest;
import com.siddhant.demo.modules.product.api.dto.ProductResponse;
import com.siddhant.demo.modules.product.api.dto.ProductUpdateRequest;
import com.siddhant.demo.modules.product.api.mapper.ProductMapper;
import com.siddhant.demo.modules.product.domain.ProductConstants;
import com.siddhant.demo.modules.product.infrastructure.persistence.ProductJpaEntity;
import com.siddhant.demo.modules.product.infrastructure.persistence.ProductJpaRepository;
import com.siddhant.demo.shared.exception.BusinessException;
import com.siddhant.demo.shared.exception.ErrorCode;
import com.siddhant.demo.shared.exception.ResourceNotFoundException;
import com.siddhant.demo.shared.security.SecurityUtils;
import com.siddhant.demo.shared.security.UserPrincipal;
import com.siddhant.demo.shared.util.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class ProductService {

	private final ProductJpaRepository productRepository;

	public ProductService(ProductJpaRepository productRepository) {
		this.productRepository = productRepository;
	}

	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('PRODUCT_READ')")
	public Page<ProductResponse> list(
			String q,
			Boolean active,
			BigDecimal gstPercentage,
			Boolean lowStock,
			Pageable pageable
	) {
		UserPrincipal user = SecurityUtils.currentUser();
		return productRepository.search(
						user.getTenantId(),
						user.getOrganizationId(),
						StringUtils.blankToNull(q),
						active,
						gstPercentage,
						lowStock,
						ProductConstants.LOW_STOCK_THRESHOLD,
						pageable
				)
				.map(ProductMapper::toResponse);
	}

	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('PRODUCT_READ')")
	public ProductResponse getById(String id) {
		return ProductMapper.toResponse(findScoped(id));
	}

	@Transactional
	@PreAuthorize("hasAuthority('PRODUCT_WRITE')")
	public ProductResponse create(ProductRequest request) {
		UserPrincipal user = SecurityUtils.currentUser();
		String sku = request.sku().trim().toUpperCase();
		ensureSkuUnique(user.getTenantId(), user.getOrganizationId(), sku, null);

		ProductJpaEntity entity = new ProductJpaEntity();
		entity.setTenantId(user.getTenantId());
		entity.setOrganizationId(user.getOrganizationId());
		entity.setCreatedBy(user.getId());
		entity.setUpdatedBy(user.getId());
		ProductMapper.applyCreate(entity, request);
		entity.setSku(sku);

		return ProductMapper.toResponse(productRepository.save(entity));
	}

	@Transactional
	@PreAuthorize("hasAuthority('PRODUCT_WRITE')")
	public ProductResponse update(String id, ProductUpdateRequest request) {
		UserPrincipal user = SecurityUtils.currentUser();
		ProductJpaEntity entity = findScoped(id);

		if (request.sku() != null) {
			String sku = request.sku().trim().toUpperCase();
			ensureSkuUnique(user.getTenantId(), user.getOrganizationId(), sku, id);
			entity.setSku(sku);
		}

		entity.setUpdatedBy(user.getId());
		ProductMapper.applyUpdate(entity, request);
		return ProductMapper.toResponse(productRepository.save(entity));
	}

	@Transactional
	@PreAuthorize("hasAuthority('PRODUCT_WRITE')")
	public ProductResponse replace(String id, ProductRequest request) {
		UserPrincipal user = SecurityUtils.currentUser();
		ProductJpaEntity entity = findScoped(id);
		String sku = request.sku().trim().toUpperCase();

		ensureSkuUnique(user.getTenantId(), user.getOrganizationId(), sku, id);

		entity.setUpdatedBy(user.getId());
		ProductMapper.applyCreate(entity, request);
		entity.setSku(sku);

		return ProductMapper.toResponse(productRepository.save(entity));
	}

	@Transactional
	@PreAuthorize("hasAuthority('PRODUCT_WRITE')")
	public void delete(String id) {
		ProductJpaEntity entity = findScoped(id);
		entity.softDelete();
		entity.setUpdatedBy(SecurityUtils.currentUserId());
		productRepository.save(entity);
	}

	private ProductJpaEntity findScoped(String id) {
		UserPrincipal user = SecurityUtils.currentUser();
		return productRepository
				.findByIdAndTenantIdAndOrganizationIdAndDeletedAtIsNull(
						id, user.getTenantId(), user.getOrganizationId())
				.orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
	}

	private void ensureSkuUnique(String tenantId, String organizationId, String sku, String excludeId) {
		productRepository.findByTenantIdAndOrganizationIdAndSkuAndDeletedAtIsNull(tenantId, organizationId, sku)
				.filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
				.ifPresent(existing -> {
					throw new BusinessException(ErrorCode.DUPLICATE_PRODUCT_SKU, "SKU already exists: " + sku);
				});
	}
}
