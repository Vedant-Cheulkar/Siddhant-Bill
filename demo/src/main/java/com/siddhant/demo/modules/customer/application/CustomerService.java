package com.siddhant.demo.modules.customer.application;

import com.siddhant.demo.modules.customer.api.dto.CustomerRequest;
import com.siddhant.demo.modules.customer.api.dto.CustomerResponse;
import com.siddhant.demo.modules.customer.api.dto.CustomerUpdateRequest;
import com.siddhant.demo.modules.customer.api.mapper.CustomerMapper;
import com.siddhant.demo.modules.customer.domain.CustomerConstants;
import com.siddhant.demo.modules.customer.infrastructure.persistence.CustomerJpaEntity;
import com.siddhant.demo.modules.customer.infrastructure.persistence.CustomerJpaRepository;
import com.siddhant.demo.shared.exception.BusinessException;
import com.siddhant.demo.shared.exception.ErrorCode;
import com.siddhant.demo.shared.exception.ResourceNotFoundException;
import com.siddhant.demo.shared.security.SecurityUtils;
import com.siddhant.demo.shared.security.UserPrincipal;
import com.siddhant.demo.shared.util.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

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
		return customerRepository.search(
						user.getTenantId(),
						user.getOrganizationId(),
						StringUtils.blankToNull(q),
						active,
						pageable
				)
				.map(CustomerMapper::toResponse);
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
		String mobile = request.mobile().replaceAll("\\s+", "");

		ensureMobileUnique(user.getTenantId(), user.getOrganizationId(), mobile, null);
		ensureGstinUnique(user.getTenantId(), user.getOrganizationId(), request.gstNumber(), null);

		CustomerJpaEntity entity = new CustomerJpaEntity();
		entity.setTenantId(user.getTenantId());
		entity.setOrganizationId(user.getOrganizationId());
		entity.setCode(generateCustomerCode());
		entity.setCreatedBy(user.getId());
		entity.setUpdatedBy(user.getId());
		CustomerMapper.applyCreate(entity, request);
		entity.setMobile(mobile);

		return CustomerMapper.toResponse(customerRepository.save(entity));
	}

	@Transactional
	@PreAuthorize("hasAuthority('CUSTOMER_WRITE')")
	public CustomerResponse update(String id, CustomerUpdateRequest request) {
		UserPrincipal user = SecurityUtils.currentUser();
		CustomerJpaEntity entity = findScoped(id);

		if (request.mobile() != null) {
			String mobile = request.mobile().replaceAll("\\s+", "");
			ensureMobileUnique(user.getTenantId(), user.getOrganizationId(), mobile, id);
			entity.setMobile(mobile);
		}
		if (request.gstNumber() != null) {
			ensureGstinUnique(user.getTenantId(), user.getOrganizationId(), request.gstNumber(), id);
		}

		entity.setUpdatedBy(user.getId());
		CustomerMapper.applyUpdate(entity, request);
		return CustomerMapper.toResponse(customerRepository.save(entity));
	}

	@Transactional
	@PreAuthorize("hasAuthority('CUSTOMER_WRITE')")
	public CustomerResponse replace(String id, CustomerRequest request) {
		UserPrincipal user = SecurityUtils.currentUser();
		CustomerJpaEntity entity = findScoped(id);
		String mobile = request.mobile().replaceAll("\\s+", "");

		ensureMobileUnique(user.getTenantId(), user.getOrganizationId(), mobile, id);
		ensureGstinUnique(user.getTenantId(), user.getOrganizationId(), request.gstNumber(), id);

		entity.setUpdatedBy(user.getId());
		CustomerMapper.applyCreate(entity, request);
		entity.setMobile(mobile);

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

	private void ensureMobileUnique(String tenantId, String organizationId, String mobile, String excludeId) {
		customerRepository.findByTenantIdAndOrganizationIdAndMobileAndDeletedAtIsNull(tenantId, organizationId, mobile)
				.filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
				.ifPresent(existing -> {
					throw new BusinessException(ErrorCode.DUPLICATE_MOBILE, "Mobile number already registered: " + mobile);
				});
	}

	private void ensureGstinUnique(String tenantId, String organizationId, String gstNumber, String excludeId) {
		String gstin = gstNumber == null || gstNumber.isBlank() ? null : gstNumber.trim().toUpperCase();
		if (gstin == null) {
			return;
		}
		customerRepository.findByTenantIdAndOrganizationIdAndGstinAndDeletedAtIsNull(tenantId, organizationId, gstin)
				.filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
				.ifPresent(existing -> {
					throw new BusinessException(ErrorCode.DUPLICATE_GSTIN, "GST number already registered: " + gstin);
				});
	}

	private String generateCustomerCode() {
		return CustomerConstants.CODE_PREFIX + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
	}
}
