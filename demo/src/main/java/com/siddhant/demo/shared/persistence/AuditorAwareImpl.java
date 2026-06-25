package com.siddhant.demo.shared.persistence;

import com.siddhant.demo.shared.constant.SecurityConstants;
import com.siddhant.demo.shared.security.SecurityUtils;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AuditorAwareImpl implements AuditorAware<String> {

	@Override
	public Optional<String> getCurrentAuditor() {
		try {
			return Optional.of(SecurityUtils.currentUserId());
		} catch (IllegalStateException ex) {
			return Optional.of(SecurityConstants.SYSTEM_AUDITOR);
		}
	}
}
