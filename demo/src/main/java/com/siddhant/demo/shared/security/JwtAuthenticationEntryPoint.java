package com.siddhant.demo.shared.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siddhant.demo.shared.api.CorrelationIdFilter;
import com.siddhant.demo.shared.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

	private final ObjectMapper objectMapper;

	public JwtAuthenticationEntryPoint(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
			throws IOException {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, "Authentication required.");
		problem.setTitle(ErrorCode.UNAUTHORIZED.name());
		problem.setType(URI.create("https://api.billing.local/errors/" + ErrorCode.UNAUTHORIZED.getCode()));
		problem.setProperty("errorCode", ErrorCode.UNAUTHORIZED.getCode());
		problem.setProperty("correlationId", MDC.get(CorrelationIdFilter.MDC_KEY));
		response.setStatus(HttpStatus.UNAUTHORIZED.value());
		response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
		objectMapper.writeValue(response.getOutputStream(), problem);
	}
}
