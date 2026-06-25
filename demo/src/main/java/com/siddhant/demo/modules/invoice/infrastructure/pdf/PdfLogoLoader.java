package com.siddhant.demo.modules.invoice.infrastructure.pdf;

import com.siddhant.demo.shared.config.PdfProperties;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

@Component
public class PdfLogoLoader {

	private final PdfProperties pdfProperties;
	private final ResourceLoader resourceLoader;

	public PdfLogoLoader(PdfProperties pdfProperties, ResourceLoader resourceLoader) {
		this.pdfProperties = pdfProperties;
		this.resourceLoader = resourceLoader;
	}

	public String loadLogoDataUri() {
		String logoPath = pdfProperties.logoPath();
		if (logoPath == null || logoPath.isBlank()) {
			return null;
		}
		try {
			Resource resource = resourceLoader.getResource(logoPath);
			if (!resource.exists() || !resource.isReadable()) {
				return null;
			}
			String mimeType = mimeTypeFor(logoPath);
			try (InputStream inputStream = resource.getInputStream()) {
				byte[] bytes = inputStream.readAllBytes();
				if (bytes.length == 0) {
					return null;
				}
				return "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(bytes);
			}
		} catch (IOException ex) {
			return null;
		}
	}

	private static String mimeTypeFor(String path) {
		String lower = path.toLowerCase();
		if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
			return "image/jpeg";
		}
		if (lower.endsWith(".gif")) {
			return "image/gif";
		}
		if (lower.endsWith(".webp")) {
			return "image/webp";
		}
		return "image/png";
	}
}
