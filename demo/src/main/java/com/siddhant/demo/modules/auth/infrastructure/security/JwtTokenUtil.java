package com.siddhant.demo.modules.auth.infrastructure.security;

import com.siddhant.demo.shared.config.JwtProperties;
import com.siddhant.demo.shared.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Set;

/**
 * JWT utility: access-token creation and validation (stateless auth).
 */
@Component
public class JwtTokenUtil {

	private final JwtProperties jwtProperties;
	private final SecretKey secretKey;

	public JwtTokenUtil(JwtProperties jwtProperties) {
		this.jwtProperties = jwtProperties;
		this.secretKey = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
	}

	public String createAccessToken(UserPrincipal principal) {
		Instant now = Instant.now();
		Instant expiry = now.plusSeconds(jwtProperties.getAccessExpirationMinutes() * 60);
		return Jwts.builder()
				.subject(principal.getId())
				.claim("email", principal.getEmail())
				.claim("tenantId", principal.getTenantId())
				.claim("organizationId", principal.getOrganizationId())
				.claim("roles", principal.getRoles().stream().toList())
				.claim("permissions", principal.getPermissions().stream().toList())
				.issuedAt(Date.from(now))
				.expiration(Date.from(expiry))
				.signWith(secretKey)
				.compact();
	}

	public Claims parseAndValidate(String token) {
		try {
			return Jwts.parser()
					.verifyWith(secretKey)
					.build()
					.parseSignedClaims(token)
					.getPayload();
		} catch (ExpiredJwtException ex) {
			throw ex;
		} catch (JwtException ex) {
			throw new JwtException("Invalid JWT token", ex);
		}
	}

	@SuppressWarnings("unchecked")
	public UserPrincipal toPrincipal(Claims claims) {
		return new UserPrincipal(
				claims.getSubject(),
				claims.get("email", String.class),
				"",
				claims.get("organizationId", String.class),
				Set.copyOf((List<String>) claims.get("roles", List.class)),
				Set.copyOf((List<String>) claims.get("permissions", List.class)),
				true
		);
	}

	public long accessTokenExpiresInSeconds() {
		return jwtProperties.getAccessExpirationMinutes() * 60;
	}
}
