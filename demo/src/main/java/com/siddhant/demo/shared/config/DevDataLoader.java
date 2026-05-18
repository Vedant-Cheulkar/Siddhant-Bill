package com.siddhant.demo.shared.config;

import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.PermissionJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.PermissionJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.RoleJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.RoleJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.TenantJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.TenantJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserTenantRoleJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserTenantRoleJpaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

@Configuration
@Profile("dev")
public class DevDataLoader {

	@Bean
	CommandLineRunner seedDevData(
			TenantJpaRepository tenantRepository,
			OrganizationJpaRepository organizationRepository,
			UserJpaRepository userRepository,
			RoleJpaRepository roleRepository,
			PermissionJpaRepository permissionRepository,
			UserTenantRoleJpaRepository userTenantRoleRepository,
			PasswordEncoder passwordEncoder
	) {
		return args -> seed(
				tenantRepository,
				organizationRepository,
				userRepository,
				roleRepository,
				permissionRepository,
				userTenantRoleRepository,
				passwordEncoder
		);
	}

	@Transactional
	void seed(
			TenantJpaRepository tenantRepository,
			OrganizationJpaRepository organizationRepository,
			UserJpaRepository userRepository,
			RoleJpaRepository roleRepository,
			PermissionJpaRepository permissionRepository,
			UserTenantRoleJpaRepository userTenantRoleRepository,
			PasswordEncoder passwordEncoder
	) {
		if (tenantRepository.findBySlugAndDeletedAtIsNull("demo").isPresent()) {
			return;
		}

		TenantJpaEntity tenant = new TenantJpaEntity();
		tenant.setName("Demo Billing Co");
		tenant.setSlug("demo");
		tenant.setStatus("ACTIVE");
		tenant.setPlanCode("TRIAL");
		tenantRepository.save(tenant);

		OrganizationJpaEntity organization = new OrganizationJpaEntity();
		organization.setTenantId(tenant.getId());
		organization.setCode("MAIN");
		organization.setLegalName("Demo Billing Co Pvt Ltd");
		organization.setTradeName("Demo Billing");
		organization.setGstin("27AAAAA0000A1Z5");
		organization.setStateCode("27");
		organization.setEmail("billing@demo.local");
		organization.setDefaultOrganization(true);
		organizationRepository.save(organization);

		RoleJpaEntity adminRole = new RoleJpaEntity();
		adminRole.setTenantId(tenant.getId());
		adminRole.setCode("ADMIN");
		adminRole.setName("Administrator");
		adminRole.setSystemRole(true);
		adminRole.setPermissions(new HashSet<>(permissionRepository.findAll()));
		roleRepository.save(adminRole);

		UserJpaEntity admin = new UserJpaEntity();
		admin.setEmail("admin@demo.local");
		admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
		admin.setFullName("Demo Admin");
		admin.setStatus("ACTIVE");
		userRepository.save(admin);

		UserTenantRoleJpaEntity membership = new UserTenantRoleJpaEntity();
		membership.setUserId(admin.getId());
		membership.setTenantId(tenant.getId());
		membership.setRole(adminRole);
		membership.setDefaultOrganizationId(organization.getId());
		membership.setStatus("ACTIVE");
		userTenantRoleRepository.save(membership);
	}
}
