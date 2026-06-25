package com.siddhant.demo.modules.auth.api;

import com.siddhant.demo.modules.auth.api.dto.AuthTokenResponse;
import com.siddhant.demo.modules.auth.api.dto.LoginRequest;
import com.siddhant.demo.modules.auth.api.dto.RefreshTokenRequest;
import com.siddhant.demo.modules.auth.api.dto.RegisterRequest;
import com.siddhant.demo.modules.auth.api.dto.UserProfileResponse;
import com.siddhant.demo.modules.auth.application.AuthService;
import com.siddhant.demo.shared.api.ApiResponse;
import com.siddhant.demo.shared.config.OpenApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Login, register, refresh, and session APIs")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	@Operation(summary = "Register a new user — creates account and business in one step", security = {})
	public ApiResponse<AuthTokenResponse> register(@Valid @RequestBody RegisterRequest request) {
		return ApiResponse.ok(authService.register(request));
	}

	@PostMapping("/login")
	@Operation(summary = "Login with email and password", security = {})
	public ApiResponse<AuthTokenResponse> login(@Valid @RequestBody LoginRequest request) {
		return ApiResponse.ok(authService.login(request));
	}

	@PostMapping("/refresh")
	@Operation(summary = "Rotate refresh token and issue new access token", security = {})
	public ApiResponse<AuthTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
		return ApiResponse.ok(authService.refresh(request));
	}

	@PostMapping("/logout")
	@Operation(summary = "Revoke refresh token")
	@SecurityRequirement(name = OpenApiConstants.BEARER_SCHEME)
	public ApiResponse<Void> logout(@RequestBody(required = false) RefreshTokenRequest request) {
		String token = request != null ? request.refreshToken() : null;
		authService.logout(token);
		return ApiResponse.okMessage("Logged out successfully");
	}

	@GetMapping("/me")
	@Operation(summary = "Current authenticated user profile")
	@SecurityRequirement(name = OpenApiConstants.BEARER_SCHEME)
	public ApiResponse<UserProfileResponse> me() {
		return ApiResponse.ok(authService.me());
	}
}
