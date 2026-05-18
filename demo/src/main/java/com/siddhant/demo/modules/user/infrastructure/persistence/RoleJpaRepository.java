package com.siddhant.demo.modules.user.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleJpaRepository extends JpaRepository<RoleJpaEntity, String> {

	Optional<RoleJpaEntity> findByTenantIdAndCodeAndDeletedAtIsNull(String tenantId, String code);
}
