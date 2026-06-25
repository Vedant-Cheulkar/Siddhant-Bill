package com.siddhant.demo.modules.invoice.infrastructure.pdf;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.siddhant.demo.shared.exception.BusinessException;
import com.siddhant.demo.shared.exception.ErrorCode;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Component
public class InvoicePdfRenderer {

	public byte[] renderPdf(String html) {
		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
			String baseUri = new ClassPathResource("static/").getURL().toExternalForm();
			PdfRendererBuilder builder = new PdfRendererBuilder();
			builder.useFastMode();
			builder.withHtmlContent(html, baseUri);
			builder.toStream(outputStream);
			builder.run();
			return outputStream.toByteArray();
		} catch (IOException ex) {
			throw new BusinessException(ErrorCode.PDF_GENERATION_FAILED, "Failed to render invoice PDF");
		}
	}
}
