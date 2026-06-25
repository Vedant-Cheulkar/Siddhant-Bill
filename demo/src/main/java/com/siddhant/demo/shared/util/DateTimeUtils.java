package com.siddhant.demo.shared.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

public final class DateTimeUtils {

	private DateTimeUtils() {
	}

	public static Instant startOfDayUtc(LocalDate date) {
		return date.atStartOfDay(ZoneOffset.UTC).toInstant();
	}

	public static Instant endOfDayUtc(LocalDate date) {
		return date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant().minusNanos(1);
	}

	public static LocalDate todayUtc() {
		return LocalDate.now(ZoneOffset.UTC);
	}
}
