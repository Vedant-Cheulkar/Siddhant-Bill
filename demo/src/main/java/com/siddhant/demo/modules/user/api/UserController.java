package com.siddhant.demo.modules.user.api;

import com.siddhant.demo.modules.user.api.dto.UserSummaryResponse;
import com.siddhant.demo.modules.user.application.UserService;
import com.siddhant.demo.shared.api.ApiResponse;
import com.siddhant.demo.shared.config.OpenApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "Tenant user directory")
@SecurityRequirement(name = OpenApiConstants.BEARER_SCHEME)
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	@Operation(summary = "List users in the current tenant")
	public ApiResponse<List<UserSummaryResponse>> list() {
		return ApiResponse.ok(userService.listTenantUsers());
	}
}
