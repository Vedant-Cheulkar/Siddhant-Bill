package com.siddhant.demo.modules.invoice.infrastructure.pdf;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.siddhant.demo.modules.customer.infrastructure.persistence.CustomerJpaEntity;
import com.siddhant.demo.modules.customer.infrastructure.persistence.CustomerJpaRepository;
import com.siddhant.demo.modules.invoice.domain.InvoiceStatus;
import com.siddhant.demo.modules.invoice.infrastructure.persistence.InvoiceJpaEntity;
import com.siddhant.demo.modules.invoice.infrastructure.persistence.InvoiceLineJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationAddressJpaEntity;
import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationAddressJpaRepository;
import com.siddhant.demo.modules.user.infrastructure.persistence.OrganizationJpaEntity;
import com.siddhant.demo.shared.exception.ResourceNotFoundException;
import com.siddhant.demo.shared.util.IndianAmountInWords;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Component
public class InvoicePdfModelAssembler {

	private final OrganizationAddressJpaRepository organizationAddressRepository;
	private final CustomerJpaRepository customerRepository;
	private final PdfLogoLoader pdfLogoLoader;
	private final ObjectMapper objectMapper;

	public InvoicePdfModelAssembler(
			OrganizationAddressJpaRepository organizationAddressRepository,
			CustomerJpaRepository customerRepository,
			PdfLogoLoader pdfLogoLoader,
			ObjectMapper objectMapper
	) {
		this.organizationAddressRepository = organizationAddressRepository;
		this.customerRepository = customerRepository;
		this.pdfLogoLoader = pdfLogoLoader;
		this.objectMapper = objectMapper;
	}

	public InvoicePdfModel assemble(
			InvoiceJpaEntity invoice,
			OrganizationJpaEntity organization
	) {
		CustomerView customer = resolveCustomer(invoice);
		OrganizationAddressView orgAddress = resolveOrganizationAddress(organization.getId());
		boolean intraState = Objects.equals(organization.getStateCode(), invoice.getPlaceOfSupplyState());

		List<InvoicePdfLineModel> lines = invoice.getLines().stream()
				.sorted(Comparator.comparing(InvoiceLineJpaEntity::getLineNumber))
				.map(this::toLineModel)
				.toList();

		String invoiceNumber = invoice.getDisplayNumber() != null
				? invoice.getDisplayNumber()
				: "DRAFT-" + invoice.getId().substring(0, 8).toUpperCase();

		return new InvoicePdfModel(
				invoiceNumber,
				invoice.getStatus().name(),
				invoice.getInvoiceDate(),
				invoice.getDueDate(),
				invoice.getSupplyType(),
				invoice.getPlaceOfSupplyState(),
				organization.getLegalName(),
				organization.getTradeName(),
				organization.getGstin(),
				organization.getPan(),
				organization.getEmail(),
				organization.getPhone(),
				orgAddress.line1(),
				orgAddress.line2(),
				orgAddress.cityStatePin(),
				pdfLogoLoader.loadLogoDataUri(),
				customer.name(),
				customer.gstin(),
				customer.email(),
				customer.mobile(),
				customer.address(),
				customer.stateCode(),
				lines,
				invoice.getSubtotal(),
				invoice.getDiscountTotal(),
				invoice.getTaxableAmount(),
				invoice.getCgstTotal(),
				invoice.getSgstTotal(),
				invoice.getIgstTotal(),
				invoice.getCessTotal(),
				invoice.getRoundOff(),
				invoice.getGrandTotal(),
				IndianAmountInWords.format(invoice.getGrandTotal()),
				invoice.getNotes(),
				invoice.getTerms(),
				intraState
		);
	}

	private InvoicePdfLineModel toLineModel(InvoiceLineJpaEntity line) {
		return new InvoicePdfLineModel(
				line.getLineNumber(),
				line.getDescription(),
				line.getHsnSac(),
				line.getQuantity(),
				line.getUnitPrice(),
				line.getDiscountAmount(),
				line.getTaxableAmount(),
				line.getCgstRate(),
				line.getSgstRate(),
				line.getIgstRate(),
				line.getCgstAmount(),
				line.getSgstAmount(),
				line.getIgstAmount(),
				line.getLineTotal()
		);
	}

	private CustomerView resolveCustomer(InvoiceJpaEntity invoice) {
		if (invoice.getCustomerSnapshot() != null && !invoice.getCustomerSnapshot().isBlank()) {
			try {
				JsonNode node = objectMapper.readTree(invoice.getCustomerSnapshot());
				return new CustomerView(
						text(node, "name"),
						text(node, "gstin"),
						text(node, "email"),
						text(node, "mobile"),
						text(node, "address"),
						text(node, "billingStateCode", "stateCode")
				);
			} catch (Exception ignored) {
				// fall through to live customer
			}
		}
		CustomerJpaEntity customer = customerRepository
				.findByIdAndTenantIdAndOrganizationIdAndDeletedAtIsNull(
						invoice.getCustomerId(), invoice.getTenantId(), invoice.getOrganizationId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found for invoice"));
		return new CustomerView(
				customer.getName(),
				customer.getGstin(),
				customer.getEmail(),
				customer.getMobile(),
				customer.getAddress(),
				customer.getBillingStateCode()
		);
	}

	private OrganizationAddressView resolveOrganizationAddress(String organizationId) {
		List<OrganizationAddressJpaEntity> addresses = organizationAddressRepository.findByOrganizationId(organizationId);
		OrganizationAddressJpaEntity address = addresses.stream()
				.filter(OrganizationAddressJpaEntity::isDefaultAddress)
				.findFirst()
				.or(() -> addresses.stream().findFirst())
				.orElse(null);

		if (address == null) {
			return new OrganizationAddressView("", "", "");
		}

		String cityStatePin = address.getCity() + ", " + address.getStateCode() + " - " + address.getPincode();
		return new OrganizationAddressView(address.getLine1(), address.getLine2(), cityStatePin);
	}

	private static String text(JsonNode node, String... fields) {
		for (String field : fields) {
			JsonNode value = node.get(field);
			if (value != null && !value.isNull() && !value.asText().isBlank()) {
				return value.asText();
			}
		}
		return "";
	}

	private record CustomerView(
			String name,
			String gstin,
			String email,
			String mobile,
			String address,
			String stateCode
	) {
	}

	private record OrganizationAddressView(String line1, String line2, String cityStatePin) {
	}
}
