package com.siddhant.demo.modules.user.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserJpaEntity, String> {

	Optional<UserJpaEntity> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);
}
