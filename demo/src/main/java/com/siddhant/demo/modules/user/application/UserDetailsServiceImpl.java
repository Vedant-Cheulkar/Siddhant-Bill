package com.siddhant.demo.modules.user.application;

import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.PermissionJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.RoleJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.TenantJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.TenantJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserTenantRoleJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserTenantRoleJpaRepository;
import com.siddhant.demo.shared.exception.BusinessException;
import com.siddhant.demo.shared.exception.ErrorCode;
import com.siddhant.demo.shared.security.UserPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

	private final UserJpaRepository userRepository;
	private final TenantJpaRepository tenantRepository;
	private final UserTenantRoleJpaRepository userTenantRoleRepository;
	private final OrganizationJpaRepository organizationRepository;

	public UserDetailsServiceImpl(
			UserJpaRepository userRepository,
			TenantJpaRepository tenantRepository,
			UserTenantRoleJpaRepository userTenantRoleRepository,
			OrganizationJpaRepository organizationRepository
	) {
		this.userRepository = userRepository;
		this.tenantRepository = tenantRepository;
		this.userTenantRoleRepository = userTenantRoleRepository;
		this.organizationRepository = organizationRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		return loadUserByEmailAndTenant(username, "demo");
	}

	@Transactional(readOnly = true)
	public UserPrincipal loadUserByEmailAndTenant(String email, String tenantSlug) {
		UserJpaEntity user = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));

		TenantJpaEntity tenant = tenantRepository.findBySlugAndDeletedAtIsNull(tenantSlug)
				.orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Tenant not found"));

		UserTenantRoleJpaEntity membership = userTenantRoleRepository
				.findByUserIdAndTenantIdAndDeletedAtIsNull(user.getId(), tenant.getId())
				.orElseThrow(() -> new BusinessException(ErrorCode.ACCESS_DENIED, "User is not a member of this tenant"));

		RoleJpaEntity role = membership.getRole();
		Set<String> permissions = role.getPermissions().stream()
				.map(PermissionJpaEntity::getCode)
				.collect(Collectors.toSet());

		String organizationId = membership.getDefaultOrganizationId();
		if (organizationId == null) {
			organizationId = organizationRepository.findByTenantIdAndDefaultOrganizationTrueAndDeletedAtIsNull(tenant.getId())
					.map(OrganizationJpaEntity::getId)
					.orElse(null);
		}

		boolean enabled = "ACTIVE".equals(user.getStatus()) && "ACTIVE".equals(membership.getStatus());

		return new UserPrincipal(
				user.getId(),
				user.getEmail(),
				user.getPasswordHash(),
				tenant.getId(),
				organizationId,
				Set.of(role.getCode()),
				permissions,
				enabled
		);
	}
}
