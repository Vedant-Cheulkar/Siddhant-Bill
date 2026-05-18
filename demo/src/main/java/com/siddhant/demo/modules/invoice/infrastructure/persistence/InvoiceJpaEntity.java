package com.siddhant.demo.modules.invoice.infrastructure.persistence;

import com.siddhant.demo.modules.invoice.domain.InvoiceStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "invoices")
public class InvoiceJpaEntity {

	@Id
	@Column(length = 36)
	private String id;

	@Column(name = "tenant_id", nullable = false, length = 36, updatable = false)
	private String tenantId;

	@Column(name = "organization_id", nullable = false, length = 36, updatable = false)
	private String organizationId;

	@Column(name = "invoice_series_id", length = 36)
	private String invoiceSeriesId;

	@Column(name = "sequence_number")
	private Long sequenceNumber;

	@Column(name = "display_number", length = 50)
	private String displayNumber;

	@Column(name = "customer_id", nullable = false, length = 36)
	private String customerId;

	@Column(name = "customer_snapshot", columnDefinition = "TEXT")
	private String customerSnapshot;

	@Column(name = "invoice_date", nullable = false)
	private LocalDate invoiceDate;

	@Column(name = "due_date")
	private LocalDate dueDate;

	@Column(name = "place_of_supply_state", nullable = false, length = 2)
	private String placeOfSupplyState;

	@Column(name = "supply_type", nullable = false, length = 20)
	private String supplyType;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private InvoiceStatus status;

	@Column(name = "currency_code", nullable = false, length = 3)
	private String currencyCode = "INR";

	@Column(nullable = false, precision = 15, scale = 2)
	private BigDecimal subtotal = BigDecimal.ZERO;

	@Column(name = "discount_total", nullable = false, precision = 15, scale = 2)
	private BigDecimal discountTotal = BigDecimal.ZERO;

	@Column(name = "taxable_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal taxableAmount = BigDecimal.ZERO;

	@Column(name = "cgst_total", nullable = false, precision = 15, scale = 2)
	private BigDecimal cgstTotal = BigDecimal.ZERO;

	@Column(name = "sgst_total", nullable = false, precision = 15, scale = 2)
	private BigDecimal sgstTotal = BigDecimal.ZERO;

	@Column(name = "igst_total", nullable = false, precision = 15, scale = 2)
	private BigDecimal igstTotal = BigDecimal.ZERO;

	@Column(name = "cess_total", nullable = false, precision = 15, scale = 2)
	private BigDecimal cessTotal = BigDecimal.ZERO;

	@Column(name = "round_off", nullable = false, precision = 15, scale = 2)
	private BigDecimal roundOff = BigDecimal.ZERO;

	@Column(name = "grand_total", nullable = false, precision = 15, scale = 2)
	private BigDecimal grandTotal = BigDecimal.ZERO;

	@Column(columnDefinition = "TEXT")
	private String notes;

	@Column(columnDefinition = "TEXT")
	private String terms;

	@Column(name = "issued_at")
	private Instant issuedAt;

	@Column(name = "cancelled_at")
	private Instant cancelledAt;

	@Column(name = "cancellation_reason", columnDefinition = "TEXT")
	private String cancellationReason;

	@Version
	private int version;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@Column(name = "created_by", nullable = false, length = 36)
	private String createdBy;

	@Column(name = "updated_by", length = 36)
	private String updatedBy;

	@Column(name = "issued_by", length = 36)
	private String issuedBy;

	@Column(name = "cancelled_by", length = 36)
	private String cancelledBy;

	@Column(name = "deleted_at")
	private Instant deletedAt;

	@OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<InvoiceLineJpaEntity> lines = new ArrayList<>();

	@PrePersist
	void onPrePersist() {
		if (id == null) {
			id = UUID.randomUUID().toString();
		}
		Instant now = Instant.now();
		createdAt = now;
		updatedAt = now;
	}

	@PreUpdate
	void onPreUpdate() {
		updatedAt = Instant.now();
	}
}
