package com.siddhant.demo.shared.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.siddhant.demo.shared.util.CorrelationIds;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

import java.time.Instant;

/**
 * Standard success envelope for all REST endpoints.
 *
 * <pre>{@code
 * { "success": true, "data": { ... }, "message": null, "timestamp": "...", "correlationId": "..." }
 * }</pre>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Standard API success response wrapper")
public record ApiResponse<T>(
		@Schema(description = "Whether the request succeeded", example = "true")
		boolean success,
		@Schema(description = "Response payload")
		T data,
		@Schema(description = "Optional human-readable message")
		String message,
		@Schema(description = "Server timestamp (UTC)")
		Instant timestamp,
		@Schema(description = "Request correlation id for support and tracing")
		String correlationId
) {

	public static <T> ApiResponse<T> ok(T data) {
		return new ApiResponse<>(true, data, null, Instant.now(), CorrelationIds.current());
	}

	public static <T> ApiResponse<T> ok(T data, String message) {
		return new ApiResponse<>(true, data, message, Instant.now(), CorrelationIds.current());
	}

	public static <T> ApiResponse<PageResponse<T>> ok(Page<T> page) {
		return ok(PageResponse.from(page));
	}

	public static <S, T> ApiResponse<PageResponse<T>> ok(Page<S> page, java.util.function.Function<S, T> mapper) {
		return ok(PageResponse.from(page, mapper));
	}

	public static ApiResponse<Void> okMessage(String message) {
		return new ApiResponse<>(true, null, message, Instant.now(), CorrelationIds.current());
	}

	public static <T> ApiResponse<T> created(T data) {
		return ok(data, "Created successfully");
	}

	public static <T> ApiResponse<T> fail(String message) {
		return new ApiResponse<>(false, null, message, Instant.now(), CorrelationIds.current());
	}
}
