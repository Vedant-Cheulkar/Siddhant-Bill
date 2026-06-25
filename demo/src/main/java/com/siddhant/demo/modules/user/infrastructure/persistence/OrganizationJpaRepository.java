package com.siddhant.demo.modules.user.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizationJpaRepository extends JpaRepository<OrganizationJpaEntity, String> {

	Optional<OrganizationJpaEntity> findByUserIdAndDeletedAtIsNull(String userId);
}
