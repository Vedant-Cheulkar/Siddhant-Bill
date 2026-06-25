package com.siddhant.demo.shared.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class MoneyUtils {

	private static final int SCALE = 2;
	private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

	private MoneyUtils() {
	}

	public static BigDecimal scale(BigDecimal value) {
		if (value == null) {
			return BigDecimal.ZERO.setScale(SCALE, ROUNDING);
		}
		return value.setScale(SCALE, ROUNDING);
	}

	public static BigDecimal zero() {
		return BigDecimal.ZERO.setScale(SCALE, ROUNDING);
	}
}
