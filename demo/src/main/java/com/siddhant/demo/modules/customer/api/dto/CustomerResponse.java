package com.siddhant.demo.modules.customer.api.dto;

import java.time.Instant;

public record CustomerResponse(
		String id,
		String code,
		String name,
		String gstin,
		String pan,
		String email,
		String phone,
		String billingStateCode,
		int creditDays,
		boolean active,
		String notes,
		Instant createdAt,
		Instant updatedAt
) {
}
