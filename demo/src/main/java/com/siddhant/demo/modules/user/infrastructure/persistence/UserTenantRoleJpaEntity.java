package com.siddhant.demo.modules.user.infrastructure.persistence;

import com.siddhant.demo.shared.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "user_tenant_roles")
public class UserTenantRoleJpaEntity extends BaseEntity {

	@Column(name = "user_id", nullable = false, length = 36)
	private String userId;

	@Column(name = "tenant_id", nullable = false, length = 36)
	private String tenantId;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "role_id", nullable = false)
	private RoleJpaEntity role;

	@Column(name = "default_organization_id", length = 36)
	private String defaultOrganizationId;

	@Column(nullable = false, length = 20)
	private String status;
}
