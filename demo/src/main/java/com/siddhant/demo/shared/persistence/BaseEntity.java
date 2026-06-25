package com.siddhant.demo.shared.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Root persistence model for all tenant-scoped aggregates.
 * <ul>
 *   <li>UUID primary key (assigned on first persist)</li>
 *   <li>UTC {@code created_at} / {@code updated_at}</li>
 *   <li>Soft delete via {@code deleted_at}</li>
 * </ul>
 */
@Getter
@Setter
@MappedSuperclass
public abstract class BaseEntity implements SoftDeletable {

	@Id
	@Column(length = 36, nullable = false, updatable = false)
	private String id;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@Column(name = "deleted_at")
	private Instant deletedAt;

	@PrePersist
	protected void onPrePersist() {
		if (id == null) {
			id = UUID.randomUUID().toString();
		}
		Instant now = Instant.now();
		if (createdAt == null) {
			createdAt = now;
		}
		if (updatedAt == null) {
			updatedAt = now;
		}
	}

	@PreUpdate
	protected void onPreUpdate() {
		updatedAt = Instant.now();
	}

	public boolean isDeleted() {
		return deletedAt != null;
	}

	public void restore() {
		deletedAt = null;
		updatedAt = Instant.now();
	}

	public void softDelete() {
		deletedAt = Instant.now();
		updatedAt = Instant.now();
	}
}
