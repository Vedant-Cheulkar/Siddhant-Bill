package com.siddhant.demo.modules.customer.infrastructure.persistence;

import com.siddhant.demo.shared.persistence.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "customers")
public class CustomerJpaEntity extends AuditableEntity {

	@Column(name = "organization_id", nullable = false, length = 36, updatable = false)
	private String organizationId;

	@Column(nullable = false, length = 300)
	private String name;

	@Column(length = 20)
	private String mobile;

	@Column(length = 255)
	private String email;

	@Column(columnDefinition = "TEXT")
	private String address;

	@Column(length = 15)
	private String gstin;

	@Column(length = 10)
	private String pan;

	@Column(name = "billing_state_code", length = 2)
	private String billingStateCode;

	@Column(name = "credit_days", nullable = false)
	private int creditDays = 0;

	@Column(name = "is_active", nullable = false)
	private boolean active = true;

	@Column(columnDefinition = "TEXT")
	private String notes;
}
