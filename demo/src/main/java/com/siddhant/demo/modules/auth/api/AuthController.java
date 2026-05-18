package com.siddhant.demo.modules.auth.api;

import com.siddhant.demo.modules.auth.api.dto.AuthTokenResponse;
import com.siddhant.demo.modules.auth.api.dto.LoginRequest;
import com.siddhant.demo.modules.auth.api.dto.RefreshTokenRequest;
import com.siddhant.demo.modules.auth.api.dto.UserProfileResponse;
import com.siddhant.demo.modules.auth.application.AuthService;
import com.siddhant.demo.shared.api.ApiResponse;
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
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/login")
	@ResponseStatus(HttpStatus.OK)
	public ApiResponse<AuthTokenResponse> login(@Valid @RequestBody LoginRequest request) {
		return ApiResponse.ok(authService.login(request));
	}

	@PostMapping("/refresh")
	public ApiResponse<AuthTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
		return ApiResponse.ok(authService.refresh(request));
	}

	@PostMapping("/logout")
	public ApiResponse<Void> logout(@RequestBody(required = false) RefreshTokenRequest request) {
		String token = request != null ? request.refreshToken() : null;
		authService.logout(token);
		return ApiResponse.okMessage("Logged out successfully");
	}

	@GetMapping("/me")
	public ApiResponse<UserProfileResponse> me() {
		return ApiResponse.ok(authService.me());
	}
}
