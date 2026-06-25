package com.siddhant.demo.modules.invoice.application;

import com.siddhant.demo.modules.invoice.api.dto.InvoicePdfMetadataResponse;
import com.siddhant.demo.modules.invoice.domain.InvoiceStatus;
import com.siddhant.demo.modules.invoice.infrastructure.pdf.InvoiceHtmlRenderer;
import com.siddhant.demo.modules.invoice.infrastructure.pdf.InvoicePdfModel;
import com.siddhant.demo.modules.invoice.infrastructure.pdf.InvoicePdfModelAssembler;
import com.siddhant.demo.modules.invoice.infrastructure.pdf.InvoicePdfRenderer;
import com.siddhant.demo.modules.invoice.infrastructure.persistence.DocumentJpaEntity;
import com.siddhant.demo.modules.invoice.infrastructure.persistence.DocumentJpaRepository;
import com.siddhant.demo.modules.invoice.infrastructure.persistence.InvoiceJpaEntity;
import com.siddhant.demo.modules.invoice.infrastructure.persistence.InvoiceJpaRepository;
import com.siddhant.demo.modules.invoice.infrastructure.storage.FileDocumentStorageService;
import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationJpaRepository;
import com.siddhant.demo.shared.domain.enums.EntityType;
import com.siddhant.demo.shared.exception.BusinessException;
import com.siddhant.demo.shared.exception.ErrorCode;
import com.siddhant.demo.shared.exception.ResourceNotFoundException;
import com.siddhant.demo.shared.security.SecurityUtils;
import com.siddhant.demo.shared.security.UserPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InvoicePdfService {

	private static final String FILE_TYPE_PDF = "PDF";

	private final InvoiceJpaRepository invoiceRepository;
	private final OrganizationJpaRepository organizationRepository;
	private final DocumentJpaRepository documentRepository;
	private final InvoicePdfModelAssembler modelAssembler;
	private final InvoiceHtmlRenderer htmlRenderer;
	private final InvoicePdfRenderer pdfRenderer;
	private final FileDocumentStorageService documentStorage;

	public InvoicePdfService(
			InvoiceJpaRepository invoiceRepository,
			OrganizationJpaRepository organizationRepository,
			DocumentJpaRepository documentRepository,
			InvoicePdfModelAssembler modelAssembler,
			InvoiceHtmlRenderer htmlRenderer,
			InvoicePdfRenderer pdfRenderer,
			FileDocumentStorageService documentStorage
	) {
		this.invoiceRepository = invoiceRepository;
		this.organizationRepository = organizationRepository;
		this.documentRepository = documentRepository;
		this.modelAssembler = modelAssembler;
		this.htmlRenderer = htmlRenderer;
		this.pdfRenderer = pdfRenderer;
		this.documentStorage = documentStorage;
	}

	@Transactional
	@PreAuthorize("hasAuthority('INVOICE_READ')")
	public InvoicePdfResult getOrGeneratePdf(String invoiceId, boolean regenerate) {
		UserPrincipal user = SecurityUtils.currentUser();
		InvoiceJpaEntity invoice = loadInvoiceWithLines(invoiceId, user);

		if (!regenerate) {
			DocumentJpaEntity existing = documentRepository
					.findFirstByTenantIdAndEntityTypeAndEntityIdAndFileTypeOrderByVersionDesc(
							user.getTenantId(), EntityType.INVOICE.name(), invoiceId, FILE_TYPE_PDF)
					.orElse(null);
			if (existing != null && documentStorage.exists(existing.getStorageKey())) {
				byte[] bytes = documentStorage.read(existing.getStorageKey());
				return new InvoicePdfResult(bytes, filename(invoice), false);
			}
		}

		return generateAndStore(invoice, user, regenerate);
	}

	@Transactional
	@PreAuthorize("hasAuthority('INVOICE_WRITE') or hasAuthority('INVOICE_ISSUE')")
	public InvoicePdfMetadataResponse generatePdf(String invoiceId, boolean regenerate) {
		UserPrincipal user = SecurityUtils.currentUser();
		InvoiceJpaEntity invoice = loadInvoiceWithLines(invoiceId, user);
		InvoicePdfResult result = generateAndStore(invoice, user, regenerate);
		DocumentJpaEntity document = documentRepository
				.findFirstByTenantIdAndEntityTypeAndEntityIdAndFileTypeOrderByVersionDesc(
						user.getTenantId(), EntityType.INVOICE.name(), invoiceId, FILE_TYPE_PDF)
				.orElseThrow();
		return new InvoicePdfMetadataResponse(
				invoiceId,
				document.getStorageKey(),
				document.getVersion(),
				result.generated(),
				filename(invoice)
		);
	}

	private InvoicePdfResult generateAndStore(InvoiceJpaEntity invoice, UserPrincipal user, boolean regenerate) {
		OrganizationJpaEntity organization = organizationRepository.findById(invoice.getOrganizationId())
				.orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

		InvoicePdfModel model = modelAssembler.assemble(invoice, organization);
		String html = htmlRenderer.render(model);
		byte[] pdfBytes = pdfRenderer.renderPdf(html);

		int nextVersion = documentRepository
				.findFirstByTenantIdAndEntityTypeAndEntityIdAndFileTypeOrderByVersionDesc(
						user.getTenantId(), EntityType.INVOICE.name(), invoice.getId(), FILE_TYPE_PDF)
				.map(document -> document.getVersion() + 1)
				.orElse(1);

		String storageKey = buildStorageKey(user.getTenantId(), invoice.getId(), nextVersion);
		documentStorage.store(storageKey, pdfBytes);

		DocumentJpaEntity document = new DocumentJpaEntity();
		document.setTenantId(user.getTenantId());
		document.setEntityType(EntityType.INVOICE.name());
		document.setEntityId(invoice.getId());
		document.setFileType(FILE_TYPE_PDF);
		document.setStorageKey(storageKey);
		document.setVersion(nextVersion);
		document.setCreatedBy(user.getId());
		documentRepository.save(document);

		invoice.setPdfStorageKey(storageKey);
		invoice.setUpdatedBy(user.getId());
		invoiceRepository.save(invoice);

		return new InvoicePdfResult(pdfBytes, filename(invoice), true);
	}

	private InvoiceJpaEntity loadInvoiceWithLines(String invoiceId, UserPrincipal user) {
		InvoiceJpaEntity invoice = invoiceRepository.findDetailedByIdAndTenantIdAndOrganizationIdAndDeletedAtIsNull(
						invoiceId, user.getTenantId(), user.getOrganizationId())
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));
		if (invoice.getLines().isEmpty()) {
			throw new BusinessException(ErrorCode.VALIDATION_FAILED, "Invoice has no line items for PDF generation");
		}
		return invoice;
	}

	private static String buildStorageKey(String tenantId, String invoiceId, int version) {
		return tenantId + "/invoices/" + invoiceId + "/v" + version + ".pdf";
	}

	private static String filename(InvoiceJpaEntity invoice) {
		String number = invoice.getDisplayNumber() != null ? invoice.getDisplayNumber() : invoice.getId();
		return "invoice-" + number.replace("/", "-") + ".pdf";
	}

	public record InvoicePdfResult(byte[] bytes, String filename, boolean generated) {
	}
}
