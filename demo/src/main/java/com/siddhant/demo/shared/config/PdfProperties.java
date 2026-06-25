package com.siddhant.demo.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.pdf")
public record PdfProperties(
		String storagePath,
		String logoPath
) {
}
