package com.siddhant.demo.modules.customer.api.mapper;

import com.siddhant.demo.modules.customer.api.dto.CustomerRequest;
import com.siddhant.demo.modules.customer.api.dto.CustomerResponse;
import com.siddhant.demo.modules.customer.api.dto.CustomerUpdateRequest;
import com.siddhant.demo.modules.customer.infrastructure.persistence.CustomerJpaEntity;

public final class CustomerMapper {

	private CustomerMapper() {
	}

	public static CustomerResponse toResponse(CustomerJpaEntity entity) {
		return new CustomerResponse(
				entity.getId(),
				entity.getCode(),
				entity.getName(),
				entity.getMobile(),
				entity.getEmail(),
				entity.getAddress(),
				entity.getGstin(),
				entity.isActive(),
				entity.getCreatedAt(),
				entity.getUpdatedAt()
		);
	}

	public static void applyCreate(CustomerJpaEntity entity, CustomerRequest request) {
		entity.setName(request.name().trim());
		entity.setMobile(normalizeMobile(request.mobile()));
		entity.setEmail(blankToNull(request.email()));
		entity.setAddress(request.address().trim());
		entity.setGstin(normalizeGstin(request.gstNumber()));
		entity.setActive(request.active() == null || request.active());
	}

	public static void applyUpdate(CustomerJpaEntity entity, CustomerUpdateRequest request) {
		if (request.name() != null) {
			entity.setName(request.name().trim());
		}
		if (request.mobile() != null) {
			entity.setMobile(normalizeMobile(request.mobile()));
		}
		if (request.email() != null) {
			entity.setEmail(blankToNull(request.email()));
		}
		if (request.address() != null) {
			entity.setAddress(request.address().trim());
		}
		if (request.gstNumber() != null) {
			entity.setGstin(normalizeGstin(request.gstNumber()));
		}
		if (request.active() != null) {
			entity.setActive(request.active());
		}
	}

	private static String normalizeMobile(String mobile) {
		return mobile == null ? null : mobile.replaceAll("\\s+", "");
	}

	private static String normalizeGstin(String gstin) {
		if (gstin == null || gstin.isBlank()) {
			return null;
		}
		return gstin.trim().toUpperCase();
	}

	private static String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
