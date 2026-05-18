package com.siddhant.demo.modules.user.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PermissionJpaRepository extends JpaRepository<PermissionJpaEntity, String> {

	List<PermissionJpaEntity> findAll();
}
