package com.siddhant.demo.shared.security;

import com.siddhant.demo.modules.auth.infrastructure.security.JwtTokenUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtTokenUtil jwtTokenUtil;

	public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil) {
		this.jwtTokenUtil = jwtTokenUtil;
	}

	@Override
	protected void doFilterInternal(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain
	) throws ServletException, IOException {
		try {
			resolveToken(request).ifPresent(token -> authenticate(request, token));
			filterChain.doFilter(request, response);
		} finally {
			TenantContext.clear();
		}
	}

	private java.util.Optional<String> resolveToken(HttpServletRequest request) {
		String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (header != null && header.startsWith("Bearer ")) {
			return java.util.Optional.of(header.substring(7).trim());
		}
		return java.util.Optional.empty();
	}

	private void authenticate(HttpServletRequest request, String token) {
		try {
			Claims claims = jwtTokenUtil.parseAndValidate(token);
			UserPrincipal principal = jwtTokenUtil.toPrincipal(claims);
			TenantContext.set(principal.getTenantId(), principal.getOrganizationId());

			UsernamePasswordAuthenticationToken authentication =
					new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
			authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
			SecurityContextHolder.getContext().setAuthentication(authentication);
		} catch (JwtException ex) {
			SecurityContextHolder.clearContext();
		}
	}
}
