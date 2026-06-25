package com.siddhant.demo.shared.util;

import com.siddhant.demo.shared.constant.PaginationConstants;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PageUtils {

	private PageUtils() {
	}

	public static Pageable of(int page, int size) {
		return PageRequest.of(safePage(page), safeSize(size));
	}

	public static Pageable of(int page, int size, Sort sort) {
		return PageRequest.of(safePage(page), safeSize(size), sort);
	}

	public static int safePage(int page) {
		return Math.max(page, PaginationConstants.DEFAULT_PAGE);
	}

	public static int safeSize(int size) {
		if (size < 1) {
			return PaginationConstants.DEFAULT_SIZE;
		}
		return Math.min(size, PaginationConstants.MAX_PAGE_SIZE);
	}
}
