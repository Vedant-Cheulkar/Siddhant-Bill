package com.siddhant.demo.modules.auth.application;

import com.siddhant.demo.modules.auth.infrastructure.security.TokenHashUtil;
import com.siddhant.demo.modules.user.infrastructure.persistence.RefreshTokenJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.RefreshTokenJpaRepository;
import com.siddhant.demo.shared.config.JwtProperties;
import com.siddhant.demo.shared.exception.BusinessException;
import com.siddhant.demo.shared.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {

	private final RefreshTokenJpaRepository refreshTokenRepository;
	private final JwtProperties jwtProperties;

	public RefreshTokenService(RefreshTokenJpaRepository refreshTokenRepository, JwtProperties jwtProperties) {
		this.refreshTokenRepository = refreshTokenRepository;
		this.jwtProperties = jwtProperties;
	}

	@Transactional
	public String issue(String userId) {
		String raw = UUID.randomUUID().toString();
		RefreshTokenJpaEntity entity = new RefreshTokenJpaEntity();
		entity.setUserId(userId);
		entity.setTokenHash(TokenHashUtil.sha256(raw));
		entity.setExpiresAt(Instant.now().plusSeconds(jwtProperties.getRefreshExpirationDays() * 24L * 3600));
		refreshTokenRepository.save(entity);
		return raw;
	}

	@Transactional
	public RefreshTokenJpaEntity validateAndRotate(String rawRefreshToken) {
		String hash = TokenHashUtil.sha256(rawRefreshToken);
		RefreshTokenJpaEntity stored = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash)
				.orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid refresh token"));

		if (stored.isExpired()) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED, "Refresh token expired");
		}

		stored.setRevokedAt(Instant.now());
		refreshTokenRepository.save(stored);
		return stored;
	}

	@Transactional
	public void revoke(String rawRefreshToken) {
		if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
			return;
		}
		refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(TokenHashUtil.sha256(rawRefreshToken))
				.ifPresent(token -> {
					token.setRevokedAt(Instant.now());
					refreshTokenRepository.save(token);
				});
	}
}
