package com.siddhant.demo.modules.user.infrastructure.persistence;

import com.siddhant.demo.shared.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "users")
public class UserJpaEntity extends BaseEntity {

	@Column(nullable = false, length = 255)
	private String email;

	@Column(name = "password_hash", nullable = false, length = 255)
	private String passwordHash;

	@Column(name = "full_name", nullable = false, length = 200)
	private String fullName;

	@Column(length = 20)
	private String phone;

	@Column(nullable = false, length = 20)
	private String status;

	@Column(name = "last_login_at")
	private Instant lastLoginAt;
}
