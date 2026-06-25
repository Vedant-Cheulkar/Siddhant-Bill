package com.siddhant.demo.shared.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertTrue;

class IndianAmountInWordsTest {

	@Test
	void formatsRupeesAndPaise() {
		String words = IndianAmountInWords.format(new BigDecimal("1180.50"));
		assertTrue(words.contains("Rupees"));
		assertTrue(words.contains("Only"));
	}
}
