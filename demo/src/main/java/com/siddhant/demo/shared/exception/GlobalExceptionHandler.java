package com.siddhant.demo.shared.exception;

import com.siddhant.demo.shared.api.CorrelationIdFilter;
import com.siddhant.demo.shared.api.FieldErrorDetail;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final String ERROR_CODE_KEY = "errorCode";
	private static final String CORRELATION_ID_KEY = "correlationId";
	private static final String ERRORS_KEY = "errors";

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
		List<FieldErrorDetail> errors = ex.getBindingResult().getFieldErrors().stream()
				.map(this::toFieldError)
				.toList();
		ProblemDetail problem = buildProblem(ErrorCode.VALIDATION_FAILED, "One or more fields are invalid.");
		problem.setProperty(ERRORS_KEY, errors);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
	}

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<ProblemDetail> handleBusiness(BusinessException ex) {
		ErrorCode code = ex.getErrorCode();
		ProblemDetail problem = buildProblem(code, ex.getMessage());
		return ResponseEntity.status(code.getStatus()).body(problem);
	}

	@ExceptionHandler(BadCredentialsException.class)
	public ResponseEntity<ProblemDetail> handleBadCredentials(BadCredentialsException ex) {
		ProblemDetail problem = buildProblem(ErrorCode.INVALID_CREDENTIALS, "Invalid email or password.");
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem);
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ProblemDetail> handleAccessDenied(AccessDeniedException ex) {
		ProblemDetail problem = buildProblem(ErrorCode.ACCESS_DENIED, "You do not have permission to perform this action.");
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(problem);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ProblemDetail> handleGeneral(Exception ex, HttpServletRequest request) {
		ProblemDetail problem = buildProblem(ErrorCode.INTERNAL_ERROR, "An unexpected error occurred.");
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
	}

	private FieldErrorDetail toFieldError(FieldError fieldError) {
		return new FieldErrorDetail(
				fieldError.getField(),
				fieldError.getDefaultMessage(),
				fieldError.getRejectedValue()
		);
	}

	private ProblemDetail buildProblem(ErrorCode errorCode, String detail) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(errorCode.getStatus(), detail);
		problem.setTitle(errorCode.name());
		problem.setType(URI.create("https://api.billing.local/errors/" + errorCode.getCode()));
		problem.setProperty(ERROR_CODE_KEY, errorCode.getCode());
		problem.setProperty(CORRELATION_ID_KEY, MDC.get(CorrelationIdFilter.MDC_KEY));
		return problem;
	}
}
