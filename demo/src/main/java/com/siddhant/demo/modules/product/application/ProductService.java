package com.siddhant.demo.modules.product.application;

import com.siddhant.demo.modules.product.api.dto.ProductRequest;
import com.siddhant.demo.modules.product.api.dto.ProductResponse;
import com.siddhant.demo.modules.product.api.mapper.ProductMapper;
import com.siddhant.demo.modules.product.infrastructure.persistence.ProductJpaEntity;
import com.siddhant.demo.modules.product.infrastructure.persistence.ProductJpaRepository;
import com.siddhant.demo.shared.exception.ResourceNotFoundException;
import com.siddhant.demo.shared.security.SecurityUtils;
import com.siddhant.demo.shared.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

	private final ProductJpaRepository productRepository;

	public ProductService(ProductJpaRepository productRepository) {
		this.productRepository = productRepository;
	}

	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('PRODUCT_READ')")
	public Page<ProductResponse> list(String q, Boolean active, Pageable pageable) {
		UserPrincipal user = SecurityUtils.currentUser();
		return productRepository.search(user.getTenantId(), user.getOrganizationId(), blankToNull(q), active, pageable)
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
		ProductJpaEntity entity = new ProductJpaEntity();
		entity.setTenantId(user.getTenantId());
		entity.setOrganizationId(user.getOrganizationId());
		entity.setCreatedBy(user.getId());
		entity.setUpdatedBy(user.getId());
		entity.setActive(request.active() == null || request.active());
		ProductMapper.applyRequest(entity, request);
		return ProductMapper.toResponse(productRepository.save(entity));
	}

	@Transactional
	@PreAuthorize("hasAuthority('PRODUCT_WRITE')")
	public ProductResponse update(String id, ProductRequest request) {
		ProductJpaEntity entity = findScoped(id);
		entity.setUpdatedBy(SecurityUtils.currentUserId());
		ProductMapper.applyRequest(entity, request);
		return ProductMapper.toResponse(productRepository.save(entity));
	}

	private ProductJpaEntity findScoped(String id) {
		UserPrincipal user = SecurityUtils.currentUser();
		return productRepository
				.findByIdAndTenantIdAndOrganizationIdAndDeletedAtIsNull(id, user.getTenantId(), user.getOrganizationId())
				.orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
