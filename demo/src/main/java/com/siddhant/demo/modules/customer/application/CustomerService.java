package com.siddhant.demo.modules.customer.application;

import com.siddhant.demo.modules.customer.api.dto.CustomerRequest;
import com.siddhant.demo.modules.customer.api.dto.CustomerResponse;
import com.siddhant.demo.modules.customer.api.mapper.CustomerMapper;
import com.siddhant.demo.modules.customer.infrastructure.persistence.CustomerJpaEntity;
import com.siddhant.demo.modules.customer.infrastructure.persistence.CustomerJpaRepository;
import com.siddhant.demo.shared.exception.BusinessException;
import com.siddhant.demo.shared.exception.ErrorCode;
import com.siddhant.demo.shared.exception.ResourceNotFoundException;
import com.siddhant.demo.shared.security.SecurityUtils;
import com.siddhant.demo.shared.security.TenantContext;
import com.siddhant.demo.shared.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

	private final CustomerJpaRepository customerRepository;

	public CustomerService(CustomerJpaRepository customerRepository) {
		this.customerRepository = customerRepository;
	}

	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('CUSTOMER_READ')")
	public Page<CustomerResponse> list(String q, Boolean active, Pageable pageable) {
		UserPrincipal user = SecurityUtils.currentUser();
		Page<CustomerJpaEntity> page = customerRepository.search(
				user.getTenantId(),
				user.getOrganizationId(),
				blankToNull(q),
				active,
				pageable
		);
		return page.map(CustomerMapper::toResponse);
	}

	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('CUSTOMER_READ')")
	public CustomerResponse getById(String id) {
		return CustomerMapper.toResponse(findScoped(id));
	}

	@Transactional
	@PreAuthorize("hasAuthority('CUSTOMER_WRITE')")
	public CustomerResponse create(CustomerRequest request) {
		UserPrincipal user = SecurityUtils.currentUser();
		String code = request.code().trim().toUpperCase();
		if (customerRepository.findByTenantIdAndOrganizationIdAndCodeAndDeletedAtIsNull(
				user.getTenantId(), user.getOrganizationId(), code).isPresent()) {
			throw new BusinessException(ErrorCode.DUPLICATE_CUSTOMER_CODE, "Customer code already exists: " + code);
		}

		CustomerJpaEntity entity = new CustomerJpaEntity();
		entity.setTenantId(user.getTenantId());
		entity.setOrganizationId(user.getOrganizationId());
		entity.setCreatedBy(user.getId());
		entity.setUpdatedBy(user.getId());
		entity.setActive(request.active() == null || request.active());
		CustomerMapper.applyRequest(entity, request);
		return CustomerMapper.toResponse(customerRepository.save(entity));
	}

	@Transactional
	@PreAuthorize("hasAuthority('CUSTOMER_WRITE')")
	public CustomerResponse update(String id, CustomerRequest request) {
		UserPrincipal user = SecurityUtils.currentUser();
		CustomerJpaEntity entity = findScoped(id);
		String code = request.code().trim().toUpperCase();
		customerRepository.findByTenantIdAndOrganizationIdAndCodeAndDeletedAtIsNull(
						user.getTenantId(), user.getOrganizationId(), code)
				.filter(existing -> !existing.getId().equals(id))
				.ifPresent(existing -> {
					throw new BusinessException(ErrorCode.DUPLICATE_CUSTOMER_CODE, "Customer code already exists: " + code);
				});

		entity.setUpdatedBy(user.getId());
		CustomerMapper.applyRequest(entity, request);
		return CustomerMapper.toResponse(customerRepository.save(entity));
	}

	@Transactional
	@PreAuthorize("hasAuthority('CUSTOMER_WRITE')")
	public void delete(String id) {
		CustomerJpaEntity entity = findScoped(id);
		entity.softDelete();
		entity.setUpdatedBy(SecurityUtils.currentUserId());
		customerRepository.save(entity);
	}

	private CustomerJpaEntity findScoped(String id) {
		UserPrincipal user = SecurityUtils.currentUser();
		return customerRepository
				.findByIdAndTenantIdAndOrganizationIdAndDeletedAtIsNull(
						id, user.getTenantId(), user.getOrganizationId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
