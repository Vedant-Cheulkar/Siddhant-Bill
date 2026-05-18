package com.siddhant.demo.modules.user.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserTenantRoleJpaRepository extends JpaRepository<UserTenantRoleJpaEntity, String> {

	Optional<UserTenantRoleJpaEntity> findByUserIdAndTenantIdAndDeletedAtIsNull(String userId, String tenantId);
}
