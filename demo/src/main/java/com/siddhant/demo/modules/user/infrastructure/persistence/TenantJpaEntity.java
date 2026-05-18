package com.siddhant.demo.modules.user.infrastructure.persistence;

import com.siddhant.demo.shared.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "tenants")
public class TenantJpaEntity extends BaseEntity {

	@Column(nullable = false, length = 200)
	private String name;

	@Column(nullable = false, length = 80)
	private String slug;

	@Column(nullable = false, length = 20)
	private String status;

	@Column(name = "plan_code", length = 50)
	private String planCode;
}
