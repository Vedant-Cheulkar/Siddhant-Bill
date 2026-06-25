package com.siddhant.demo.modules.auth.application;

import com.siddhant.demo.modules.auth.api.dto.AuthTokenResponse;
import com.siddhant.demo.modules.auth.api.dto.LoginRequest;
import com.siddhant.demo.modules.auth.api.dto.RefreshTokenRequest;
import com.siddhant.demo.modules.auth.api.dto.RegisterRequest;
import com.siddhant.demo.modules.auth.api.dto.UserProfileResponse;
import com.siddhant.demo.modules.auth.infrastructure.security.JwtTokenUtil;
import com.siddhant.demo.modules.user.application.UserDetailsServiceImpl;
import com.siddhant.demo.modules.user.domain.UserStatus;
import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.RefreshTokenJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserJpaRepository;
import com.siddhant.demo.shared.exception.BusinessException;
import com.siddhant.demo.shared.exception.ErrorCode;
import com.siddhant.demo.shared.security.SecurityUtils;
import com.siddhant.demo.shared.security.UserPrincipal;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {

	private final UserDetailsServiceImpl userDetailsService;
	private final JwtTokenUtil jwtTokenUtil;
	private final RefreshTokenService refreshTokenService;
	private final UserJpaRepository userRepository;
	private final OrganizationJpaRepository organizationRepository;
	private final PasswordEncoder passwordEncoder;

	public AuthService(
			UserDetailsServiceImpl userDetailsService,
			JwtTokenUtil jwtTokenUtil,
			RefreshTokenService refreshTokenService,
			UserJpaRepository userRepository,
			OrganizationJpaRepository organizationRepository,
			PasswordEncoder passwordEncoder
	) {
		this.userDetailsService = userDetailsService;
		this.jwtTokenUtil = jwtTokenUtil;
		this.refreshTokenService = refreshTokenService;
		this.userRepository = userRepository;
		this.organizationRepository = organizationRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional
	public AuthTokenResponse register(RegisterRequest request) {
		if (userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(request.email()).isPresent()) {
			throw new BusinessException(ErrorCode.DUPLICATE_EMAIL, "Email is already registered");
		}

		// 1. Create the user account
		UserJpaEntity user = new UserJpaEntity();
		user.setEmail(request.email().trim().toLowerCase());
		user.setPasswordHash(passwordEncoder.encode(request.password()));
		user.setFullName(request.fullName().trim());
		user.setPhone(request.phone());
		user.setStatus(UserStatus.ACTIVE.name());
		userRepository.save(user);

		// 2. Create the user's business organization
		OrganizationJpaEntity organization = new OrganizationJpaEntity();
		organization.setUserId(user.getId());
		organization.setTenantId(user.getId()); // transitional: will be removed in Step 2
		organization.setCode("ORG");
		organization.setLegalName(request.businessName().trim());
		organization.setStateCode("MH"); // default state; user updates this in their profile
		organization.setDefaultOrganization(true);
		organization.setCreatedBy(user.getId());
		organization.setUpdatedBy(user.getId());
		organizationRepository.save(organization);

		UserPrincipal principal = userDetailsService.loadUserByEmail(user.getEmail());
		return buildTokenResponse(principal, user);
	}

	@Transactional
	public AuthTokenResponse login(LoginRequest request) {
		UserPrincipal principal = userDetailsService.loadUserByEmail(request.email().trim().toLowerCase());

		if (!passwordEncoder.matches(request.password(), principal.getPassword())) {
			throw new BadCredentialsException("Invalid email or password");
		}

		UserJpaEntity user = userRepository.findById(principal.getId()).orElseThrow();
		user.setLastLoginAt(Instant.now());
		userRepository.save(user);

		return buildTokenResponse(principal, user);
	}

	@Transactional
	public AuthTokenResponse refresh(RefreshTokenRequest request) {
		RefreshTokenJpaEntity rotated = refreshTokenService.validateAndRotate(request.refreshToken());

		UserJpaEntity user = userRepository.findById(rotated.getUserId())
				.orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "User not found"));

		UserPrincipal principal = userDetailsService.loadUserByEmail(user.getEmail());
		return buildTokenResponse(principal, user);
	}

	@Transactional
	public void logout(String refreshToken) {
		refreshTokenService.revoke(refreshToken);
	}

	@Transactional(readOnly = true)
	public UserProfileResponse me() {
		UserPrincipal principal = SecurityUtils.currentUser();
		UserJpaEntity user = userRepository.findById(principal.getId()).orElseThrow();
		return toProfile(principal, user);
	}

	private AuthTokenResponse buildTokenResponse(UserPrincipal principal, UserJpaEntity user) {
		String accessToken = jwtTokenUtil.createAccessToken(principal);
		String refreshToken = refreshTokenService.issue(principal.getId());
		return new AuthTokenResponse(
				accessToken,
				refreshToken,
				jwtTokenUtil.accessTokenExpiresInSeconds(),
				"Bearer",
				toProfile(principal, user)
		);
	}

	private UserProfileResponse toProfile(UserPrincipal principal, UserJpaEntity user) {
		return new UserProfileResponse(
				principal.getId(),
				principal.getEmail(),
				user.getFullName(),
				principal.getTenantId(),
				principal.getOrganizationId(),
				principal.getRoles(),
				principal.getPermissions()
		);
	}
}
