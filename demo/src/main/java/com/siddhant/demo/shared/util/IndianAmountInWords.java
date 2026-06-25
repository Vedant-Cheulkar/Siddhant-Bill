package com.siddhant.demo.shared.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class IndianAmountInWords {

	private static final String[] BELOW_TWENTY = {
			"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
			"Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
	};

	private static final String[] TENS = {
			"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
	};

	private IndianAmountInWords() {
	}

	public static String format(BigDecimal amount) {
		if (amount == null) {
			return "Zero Rupees Only";
		}
		BigDecimal normalized = amount.setScale(2, RoundingMode.HALF_UP);
		long rupees = normalized.longValue();
		int paise = normalized.remainder(BigDecimal.ONE).movePointRight(2).intValue();

		StringBuilder words = new StringBuilder();
		if (rupees == 0) {
			words.append("Zero");
		} else {
			words.append(convert(rupees));
		}
		words.append(rupees == 1 ? " Rupee" : " Rupees");

		if (paise > 0) {
			words.append(" and ").append(convert(paise)).append(paise == 1 ? " Paise" : " Paise");
		}
		words.append(" Only");
		return words.toString();
	}

	private static String convert(long number) {
		if (number < 20) {
			return BELOW_TWENTY[(int) number];
		}
		if (number < 100) {
			return TENS[(int) (number / 10)] + (number % 10 == 0 ? "" : " " + BELOW_TWENTY[(int) (number % 10)]);
		}
		if (number < 1000) {
			return BELOW_TWENTY[(int) (number / 100)] + " Hundred"
					+ (number % 100 == 0 ? "" : " " + convert(number % 100));
		}
		if (number < 100_000) {
			return convert(number / 1000) + " Thousand" + (number % 1000 == 0 ? "" : " " + convert(number % 1000));
		}
		if (number < 10_000_000) {
			return convert(number / 100_000) + " Lakh" + (number % 100_000 == 0 ? "" : " " + convert(number % 100_000));
		}
		return convert(number / 10_000_000) + " Crore"
				+ (number % 10_000_000 == 0 ? "" : " " + convert(number % 10_000_000));
	}
}
