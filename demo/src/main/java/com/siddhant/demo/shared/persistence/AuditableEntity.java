package com.siddhant.demo.shared.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Adds user audit columns populated by {@link AuditingEntityListener}.
 */
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AuditableEntity extends BaseEntity {

	@CreatedBy
	@Column(name = "created_by", length = 36, updatable = false)
	private String createdBy;

	@LastModifiedBy
	@Column(name = "updated_by", length = 36)
	private String updatedBy;
}
