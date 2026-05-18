package com.siddhant.demo.modules.user.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "permissions")
public class PermissionJpaEntity {

	@Id
	@Column(length = 36)
	private String id;

	@Column(nullable = false, length = 80, unique = true)
	private String code;

	@Column(name = "module_name", nullable = false, length = 40)
	private String moduleName;

	@Column(columnDefinition = "TEXT")
	private String description;
}
