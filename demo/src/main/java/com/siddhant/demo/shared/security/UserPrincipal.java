package com.siddhant.demo.shared.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Getter
public class UserPrincipal implements UserDetails {

	private final String id;
	private final String email;
	private final String passwordHash;
	private final String organizationId;

	/**
	 * Transitional: equals organizationId until tenant tables are removed in Step 2.
	 * Other services call getTenantId() — keeping it avoids changing all of them now.
	 */
	private final String tenantId;

	private final Set<String> roles;
	private final Set<String> permissions;
	private final boolean enabled;

	public UserPrincipal(
			String id,
			String email,
			String passwordHash,
			String organizationId,
			Set<String> roles,
			Set<String> permissions,
			boolean enabled
	) {
		this.id = id;
		this.email = email;
		this.passwordHash = passwordHash;
		this.organizationId = organizationId;
		this.tenantId = organizationId;
		this.roles = roles;
		this.permissions = permissions;
		this.enabled = enabled;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return Stream.concat(
				permissions.stream().map(SimpleGrantedAuthority::new),
				roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r))
		).collect(Collectors.toSet());
	}

	@Override
	public String getPassword() {
		return passwordHash;
	}

	@Override
	public String getUsername() {
		return email;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return enabled;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return enabled;
	}
}
