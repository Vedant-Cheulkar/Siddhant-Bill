package com.siddhant.demo.shared.security;

import com.siddhant.demo.shared.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Set;

@Component
public class JwtTokenProvider {

	private final JwtProperties jwtProperties;
	private final SecretKey secretKey;

	public JwtTokenProvider(JwtProperties jwtProperties) {
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

	public Claims parseToken(String token) {
		return Jwts.parser()
				.verifyWith(secretKey)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	@SuppressWarnings("unchecked")
	public UserPrincipal toPrincipal(Claims claims, String passwordPlaceholder) {
		return new UserPrincipal(
				claims.getSubject(),
				claims.get("email", String.class),
				passwordPlaceholder,
				claims.get("tenantId", String.class),
				claims.get("organizationId", String.class),
				Set.copyOf((List<String>) claims.get("roles", List.class)),
				Set.copyOf((List<String>) claims.get("permissions", List.class)),
				true
		);
	}
}
