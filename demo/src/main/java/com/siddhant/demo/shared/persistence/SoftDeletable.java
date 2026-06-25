package com.siddhant.demo.shared.persistence;

/**
 * Marks entities that support soft delete via {@link BaseEntity#softDelete()}.
 */
public interface SoftDeletable {

	boolean isDeleted();

	void softDelete();

	void restore();
}
