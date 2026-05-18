package com.siddhant.demo.modules.auth.application;

import com.siddhant.demo.modules.auth.api.dto.AuthTokenResponse;
import com.siddhant.demo.modules.auth.api.dto.LoginRequest;
import com.siddhant.demo.modules.auth.api.dto.RefreshTokenRequest;
import com.siddhant.demo.modules.auth.api.dto.UserProfileResponse;
import com.siddhant.demo.modules.user.application.UserDetailsServiceImpl;
import com.siddhant.demo.modules.user.infrastructure.persistence.RefreshTokenJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.RefreshTokenJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.TenantJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.TenantJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.UserJpaRepository;
import com.siddhant.demo.shared.config.JwtProperties;
import com.siddhant.demo.shared.exception.BusinessException;
import com.siddhant.demo.shared.exception.ErrorCode;
import com.siddhant.demo.shared.security.JwtTokenProvider;
import com.siddhant.demo.shared.security.SecurityUtils;
import com.siddhant.demo.shared.security.UserPrincipal;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AuthService {

	private final UserDetailsServiceImpl userDetailsService;
	private final JwtTokenProvider jwtTokenProvider;
	private final JwtProperties jwtProperties;
	private final UserJpaRepository userRepository;
	private final TenantJpaRepository tenantRepository;
	private final RefreshTokenJpaRepository refreshTokenRepository;
	private final PasswordEncoder passwordEncoder;

	public AuthService(
			UserDetailsServiceImpl userDetailsService,
			JwtTokenProvider jwtTokenProvider,
			JwtProperties jwtProperties,
			UserJpaRepository userRepository,
			TenantJpaRepository tenantRepository,
			RefreshTokenJpaRepository refreshTokenRepository,
			PasswordEncoder passwordEncoder
	) {
		this.userDetailsService = userDetailsService;
		this.jwtTokenProvider = jwtTokenProvider;
		this.jwtProperties = jwtProperties;
		this.userRepository = userRepository;
		this.tenantRepository = tenantRepository;
		this.refreshTokenRepository = refreshTokenRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional
	public AuthTokenResponse login(LoginRequest request) {
		UserPrincipal principal = userDetailsService.loadUserByEmailAndTenant(request.email(), request.tenantSlug());

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
		String hash = hashToken(request.refreshToken());
		RefreshTokenJpaEntity stored = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash)
				.orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid refresh token"));

		if (stored.isExpired()) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED, "Refresh token expired");
		}

		stored.setRevokedAt(Instant.now());
		refreshTokenRepository.save(stored);

		UserJpaEntity user = userRepository.findById(stored.getUserId())
				.orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "User not found"));

		TenantJpaEntity tenant = tenantRepository.findById(stored.getTenantId())
				.orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Tenant not found"));

		UserPrincipal principal = userDetailsService.loadUserByEmailAndTenant(user.getEmail(), tenant.getSlug());
		return buildTokenResponse(principal, user);
	}

	@Transactional
	public void logout(String refreshToken) {
		if (refreshToken == null || refreshToken.isBlank()) {
			return;
		}
		refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hashToken(refreshToken))
				.ifPresent(token -> {
					token.setRevokedAt(Instant.now());
					refreshTokenRepository.save(token);
				});
	}

	@Transactional(readOnly = true)
	public UserProfileResponse me() {
		UserPrincipal principal = SecurityUtils.currentUser();
		UserJpaEntity user = userRepository.findById(principal.getId()).orElseThrow();
		return toProfile(principal, user);
	}

	private AuthTokenResponse buildTokenResponse(UserPrincipal principal, UserJpaEntity user) {
		String accessToken = jwtTokenProvider.createAccessToken(principal);
		String refreshToken = UUID.randomUUID().toString();
		persistRefreshToken(principal.getId(), principal.getTenantId(), refreshToken);
		return new AuthTokenResponse(
				accessToken,
				refreshToken,
				jwtProperties.getAccessExpirationMinutes() * 60,
				"Bearer",
				toProfile(principal, user)
		);
	}

	private void persistRefreshToken(String userId, String tenantId, String rawToken) {
		RefreshTokenJpaEntity entity = new RefreshTokenJpaEntity();
		entity.setUserId(userId);
		entity.setTenantId(tenantId);
		entity.setTokenHash(hashToken(rawToken));
		entity.setExpiresAt(Instant.now().plusSeconds(jwtProperties.getRefreshExpirationDays() * 24 * 3600));
		refreshTokenRepository.save(entity);
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

	private String hashToken(String raw) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(hashed);
		} catch (NoSuchAlgorithmException ex) {
			throw new IllegalStateException("SHA-256 not available", ex);
		}
	}
}
