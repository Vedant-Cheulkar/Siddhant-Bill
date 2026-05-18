package com.siddhant.demo.modules.product.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductJpaRepository extends JpaRepository<ProductJpaEntity, String> {

	Optional<ProductJpaEntity> findByIdAndTenantIdAndOrganizationIdAndDeletedAtIsNull(
			String id, String tenantId, String organizationId);

	@Query("""
			SELECT p FROM ProductJpaEntity p
			WHERE p.tenantId = :tenantId
			  AND p.organizationId = :organizationId
			  AND p.deletedAt IS NULL
			  AND (:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
			       OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :q, '%')))
			  AND (:active IS NULL OR p.active = :active)
			""")
	Page<ProductJpaEntity> search(
			@Param("tenantId") String tenantId,
			@Param("organizationId") String organizationId,
			@Param("q") String q,
			@Param("active") Boolean active,
			Pageable pageable);
}
