package com.siddhant.demo.modules.product.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface ProductJpaRepository extends JpaRepository<ProductJpaEntity, String> {

	Optional<ProductJpaEntity> findByIdAndTenantIdAndOrganizationIdAndDeletedAtIsNull(
			String id, String tenantId, String organizationId);

	Optional<ProductJpaEntity> findByTenantIdAndOrganizationIdAndSkuAndDeletedAtIsNull(
			String tenantId, String organizationId, String sku);

	@Query("""
			SELECT p FROM ProductJpaEntity p
			WHERE p.tenantId = :tenantId
			  AND p.organizationId = :organizationId
			  AND p.deletedAt IS NULL
			  AND (
			    :q IS NULL
			    OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
			    OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :q, '%'))
			    OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :q, '%'))
			  )
			  AND (:active IS NULL OR p.active = :active)
			  AND (:gstPercentage IS NULL OR p.gstPercentage = :gstPercentage)
			  AND (:lowStock IS NULL OR :lowStock = FALSE OR p.stockQuantity <= :lowStockThreshold)
			""")
	Page<ProductJpaEntity> search(
			@Param("tenantId") String tenantId,
			@Param("organizationId") String organizationId,
			@Param("q") String q,
			@Param("active") Boolean active,
			@Param("gstPercentage") BigDecimal gstPercentage,
			@Param("lowStock") Boolean lowStock,
			@Param("lowStockThreshold") int lowStockThreshold,
			Pageable pageable);
}
