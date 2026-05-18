package com.siddhant.demo.modules.user.application;

import com.siddhant.demo.modules.user.api.dto.UserSummaryResponse;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserTenantRoleJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserTenantRoleJpaRepository;
import com.siddhant.demo.shared.security.SecurityUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

	private final UserTenantRoleJpaRepository userTenantRoleRepository;
	private final UserJpaRepository userRepository;

	public UserService(UserTenantRoleJpaRepository userTenantRoleRepository, UserJpaRepository userRepository) {
		this.userTenantRoleRepository = userTenantRoleRepository;
		this.userRepository = userRepository;
	}

	@Transactional(readOnly = true)
	@PreAuthorize("hasAuthority('USER_READ')")
	public List<UserSummaryResponse> listTenantUsers() {
		String tenantId = SecurityUtils.currentUser().getTenantId();
		return userTenantRoleRepository.findAll().stream()
				.filter(m -> tenantId.equals(m.getTenantId()) && m.getDeletedAt() == null)
				.map(this::toSummary)
				.toList();
	}

	private UserSummaryResponse toSummary(UserTenantRoleJpaEntity membership) {
		UserJpaEntity user = userRepository.findById(membership.getUserId()).orElseThrow();
		return new UserSummaryResponse(
				user.getId(),
				user.getEmail(),
				user.getFullName(),
				user.getStatus(),
				user.getLastLoginAt()
		);
	}
}
