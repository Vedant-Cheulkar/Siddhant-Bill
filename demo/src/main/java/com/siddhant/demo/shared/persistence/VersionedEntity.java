package com.siddhant.demo.shared.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

/**
 * Opt-in optimistic locking for high-contention aggregates (e.g. invoices).
 */
@Getter
@Setter
@MappedSuperclass
public abstract class VersionedEntity extends AuditableEntity {

	@Version
	@Column(nullable = false)
	private int version;
}
