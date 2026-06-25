package com.siddhant.demo.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI billingOpenApi(
			@Value("${spring.application.name:billing-api}") String applicationName,
			@Value("${server.port:8080}") int serverPort
	) {
		return new OpenAPI()
				.info(new Info()
						.title(OpenApiConstants.API_TITLE)
						.description(OpenApiConstants.API_DESCRIPTION)
						.version("v1")
						.contact(new Contact()
								.name("Billing Platform Team")
								.email("support@example.com"))
						.license(new License()
								.name("Proprietary")
								.url("https://example.com/license")))
				.servers(List.of(
						new Server()
								.url("http://localhost:" + serverPort)
								.description("Local (" + applicationName + ")"),
						new Server()
								.url("/")
								.description("Relative (same host)")
				))
				.components(new Components()
						.addSecuritySchemes(OpenApiConstants.BEARER_SCHEME, bearerJwtScheme()));
	}

	@Bean
	public GroupedOpenApi authGroup() {
		return GroupedOpenApi.builder()
				.group("01-auth")
				.displayName("Authentication")
				.pathsToMatch("/api/v1/auth/**")
				.build();
	}

	@Bean
	public GroupedOpenApi customersGroup() {
		return GroupedOpenApi.builder()
				.group("02-customers")
				.displayName("Customers")
				.pathsToMatch("/api/v1/customers/**")
				.build();
	}

	@Bean
	public GroupedOpenApi productsGroup() {
		return GroupedOpenApi.builder()
				.group("03-products")
				.displayName("Products")
				.pathsToMatch("/api/v1/products/**")
				.build();
	}

	@Bean
	public GroupedOpenApi invoicesGroup() {
		return GroupedOpenApi.builder()
				.group("04-invoices")
				.displayName("Invoices")
				.pathsToMatch("/api/v1/invoices/**")
				.build();
	}

	@Bean
	public GroupedOpenApi reportsGroup() {
		return GroupedOpenApi.builder()
				.group("05-reports")
				.displayName("Reports")
				.pathsToMatch("/api/v1/reports/**")
				.build();
	}

	@Bean
	public GroupedOpenApi usersGroup() {
		return GroupedOpenApi.builder()
				.group("06-users")
				.displayName("Users")
				.pathsToMatch("/api/v1/users/**")
				.build();
	}

	@Bean
	public GroupedOpenApi allApisGroup() {
		return GroupedOpenApi.builder()
				.group("00-all")
				.displayName("All APIs")
				.pathsToMatch("/api/v1/**")
				.build();
	}

	private static SecurityScheme bearerJwtScheme() {
		return new SecurityScheme()
				.name(OpenApiConstants.BEARER_SCHEME)
				.type(SecurityScheme.Type.HTTP)
				.scheme("bearer")
				.bearerFormat("JWT")
				.description("JWT access token from POST /api/v1/auth/login");
	}
}
