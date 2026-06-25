package com.siddhant.demo.shared.api;

import org.springframework.data.domain.Page;

import java.util.Collections;
import java.util.List;
import java.util.function.Function;

/**
 * Stable pagination contract for list endpoints.
 */
public record PageResponse<T>(
		List<T> content,
		int page,
		int size,
		long totalElements,
		int totalPages,
		boolean first,
		boolean last,
		boolean empty
) {

	public static <T> PageResponse<T> from(Page<T> page) {
		return new PageResponse<>(
				page.getContent(),
				page.getNumber(),
				page.getSize(),
				page.getTotalElements(),
				page.getTotalPages(),
				page.isFirst(),
				page.isLast(),
				page.isEmpty()
		);
	}

	public static <S, T> PageResponse<T> from(Page<S> page, Function<S, T> mapper) {
		List<T> mapped = page.getContent().stream().map(mapper).toList();
		return new PageResponse<>(
				mapped,
				page.getNumber(),
				page.getSize(),
				page.getTotalElements(),
				page.getTotalPages(),
				page.isFirst(),
				page.isLast(),
				mapped.isEmpty()
		);
	}

	public static <T> PageResponse<T> emptyPage() {
		return new PageResponse<>(Collections.emptyList(), 0, 0, 0, 0, true, true, true);
	}
}
