package com.siddhant.demo.modules.invoice.infrastructure.pdf;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Component
public class InvoiceHtmlRenderer {

	private static final String TEMPLATE = "invoice";

	private final SpringTemplateEngine invoicePdfTemplateEngine;

	public InvoiceHtmlRenderer(@Qualifier("invoicePdfTemplateEngine") SpringTemplateEngine invoicePdfTemplateEngine) {
		this.invoicePdfTemplateEngine = invoicePdfTemplateEngine;
	}

	public String render(InvoicePdfModel model) {
		Context context = new Context();
		context.setVariable("invoice", model);
		return invoicePdfTemplateEngine.process(TEMPLATE, context);
	}
}
