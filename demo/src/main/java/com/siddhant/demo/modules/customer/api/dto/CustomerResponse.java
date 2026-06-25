package com.siddhant.demo.modules.customer.api.dto;

import java.time.Instant;

public record CustomerResponse(
		String id,
		String code,
		String name,
		String mobile,
		String email,
		String address,
		String gstNumber,
		boolean active,
		Instant createdAt,
		Instant updatedAt
) {
}
