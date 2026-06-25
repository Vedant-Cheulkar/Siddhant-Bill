package com.siddhant.demo.modules.user.application;

import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserJpaRepository;
import com.siddhant.demo.shared.security.UserPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

	// All authenticated users get full access. Permissions are simplified in Step 2.
	private static final Set<String> ALL_PERMISSIONS = Set.of(
			"CUSTOMER_READ", "CUSTOMER_WRITE",
			"PRODUCT_READ", "PRODUCT_WRITE",
			"INVOICE_READ", "INVOICE_WRITE",
			"REPORT_READ"
	);

	private final UserJpaRepository userRepository;
	private final OrganizationJpaRepository organizationRepository;

	public UserDetailsServiceImpl(
			UserJpaRepository userRepository,
			OrganizationJpaRepository organizationRepository
	) {
		this.userRepository = userRepository;
		this.organizationRepository = organizationRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		return loadUserByEmail(email);
	}

	@Transactional(readOnly = true)
	public UserPrincipal loadUserByEmail(String email) {
		UserJpaEntity user = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

		String organizationId = organizationRepository
				.findByUserIdAndDeletedAtIsNull(user.getId())
				.map(OrganizationJpaEntity::getId)
				.orElse(null);

		boolean enabled = "ACTIVE".equals(user.getStatus());

		return new UserPrincipal(
				user.getId(),
				user.getEmail(),
				user.getPasswordHash(),
				organizationId,
				Set.of("ADMIN"),
				ALL_PERMISSIONS,
				enabled
		);
	}
}
