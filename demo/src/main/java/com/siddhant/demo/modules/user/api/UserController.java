package com.siddhant.demo.modules.user.api;

import com.siddhant.demo.modules.user.api.dto.UserSummaryResponse;
import com.siddhant.demo.modules.user.application.UserService;
import com.siddhant.demo.shared.api.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	public ApiResponse<List<UserSummaryResponse>> list() {
		return ApiResponse.ok(userService.listTenantUsers());
	}
}
