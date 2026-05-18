package com.siddhant.demo.modules.user.infrastructure.persistence;

import com.siddhant.demo.shared.persistence.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "organizations")
public class OrganizationJpaEntity extends AuditableEntity {

	@Column(name = "tenant_id", nullable = false, length = 36, updatable = false)
	private String tenantId;

	@Column(nullable = false, length = 30)
	private String code;

	@Column(name = "legal_name", nullable = false, length = 300)
	private String legalName;

	@Column(name = "trade_name", length = 300)
	private String tradeName;

	@Column(length = 15)
	private String gstin;

	@Column(length = 10)
	private String pan;

	@Column(name = "state_code", nullable = false, length = 2)
	private String stateCode;

	@Column(length = 255)
	private String email;

	@Column(length = 20)
	private String phone;

	@Column(name = "is_default", nullable = false)
	private boolean defaultOrganization;
}
