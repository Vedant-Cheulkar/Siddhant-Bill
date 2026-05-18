package com.siddhant.demo.modules.customer.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerJpaRepository extends JpaRepository<CustomerJpaEntity, String> {

	Optional<CustomerJpaEntity> findByIdAndTenantIdAndOrganizationIdAndDeletedAtIsNull(
			String id, String tenantId, String organizationId);

	Optional<CustomerJpaEntity> findByTenantIdAndOrganizationIdAndCodeAndDeletedAtIsNull(
			String tenantId, String organizationId, String code);

	@Query("""
			SELECT c FROM CustomerJpaEntity c
			WHERE c.tenantId = :tenantId
			  AND c.organizationId = :organizationId
			  AND c.deletedAt IS NULL
			  AND (:q IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%'))
			       OR LOWER(c.code) LIKE LOWER(CONCAT('%', :q, '%'))
			       OR LOWER(COALESCE(c.gstin, '')) LIKE LOWER(CONCAT('%', :q, '%')))
			  AND (:active IS NULL OR c.active = :active)
			""")
	Page<CustomerJpaEntity> search(
			@Param("tenantId") String tenantId,
			@Param("organizationId") String organizationId,
			@Param("q") String q,
			@Param("active") Boolean active,
			Pageable pageable);
}
