package com.siddhant.demo.modules.user.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrganizationJpaRepository extends JpaRepository<OrganizationJpaEntity, String> {

	List<OrganizationJpaEntity> findByTenantIdAndDeletedAtIsNull(String tenantId);

	Optional<OrganizationJpaEntity> findByIdAndTenantIdAndDeletedAtIsNull(String id, String tenantId);

	Optional<OrganizationJpaEntity> findByTenantIdAndDefaultOrganizationTrueAndDeletedAtIsNull(String tenantId);
}
