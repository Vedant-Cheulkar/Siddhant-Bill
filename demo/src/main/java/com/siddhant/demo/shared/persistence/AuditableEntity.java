package com.siddhant.demo.shared.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public abstract class AuditableEntity extends BaseEntity {

	@Column(name = "created_by", length = 36)
	private String createdBy;

	@Column(name = "updated_by", length = 36)
	private String updatedBy;
}
