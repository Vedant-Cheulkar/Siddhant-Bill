package com.siddhant.demo.shared.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public abstract class TenantScopedEntity extends AuditableEntity {

	@Column(name = "tenant_id", length = 36, nullable = false, updatable = false)
	private String tenantId;
}
