package com.siddhant.demo.modules.customer.api.mapper;

import com.siddhant.demo.modules.customer.api.dto.CustomerRequest;
import com.siddhant.demo.modules.customer.api.dto.CustomerResponse;
import com.siddhant.demo.modules.customer.infrastructure.persistence.CustomerJpaEntity;

public final class CustomerMapper {

	private CustomerMapper() {
	}

	public static CustomerResponse toResponse(CustomerJpaEntity entity) {
		return new CustomerResponse(
				entity.getId(),
				entity.getCode(),
				entity.getName(),
				entity.getGstin(),
				entity.getPan(),
				entity.getEmail(),
				entity.getPhone(),
				entity.getBillingStateCode(),
				entity.getCreditDays(),
				entity.isActive(),
				entity.getNotes(),
				entity.getCreatedAt(),
				entity.getUpdatedAt()
		);
	}

	public static void applyRequest(CustomerJpaEntity entity, CustomerRequest request) {
		entity.setCode(request.code().trim().toUpperCase());
		entity.setName(request.name().trim());
		entity.setGstin(request.gstin() != null ? request.gstin().trim().toUpperCase() : null);
		entity.setPan(request.pan() != null ? request.pan().trim().toUpperCase() : null);
		entity.setEmail(request.email());
		entity.setPhone(request.phone());
		entity.setBillingStateCode(request.billingStateCode());
		entity.setCreditDays(request.creditDays());
		if (request.active() != null) {
			entity.setActive(request.active());
		}
		entity.setNotes(request.notes());
	}
}
