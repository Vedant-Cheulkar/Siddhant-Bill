package com.siddhant.demo.modules.invoice.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "invoice_lines")
public class InvoiceLineJpaEntity {

	@Id
	@Column(length = 36)
	private String id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "invoice_id", nullable = false)
	private InvoiceJpaEntity invoice;

	@Column(name = "line_number", nullable = false)
	private short lineNumber;

	@Column(name = "product_id", length = 36)
	private String productId;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "product_snapshot", columnDefinition = "json")
	private String productSnapshot;

	@Column(nullable = false, length = 500)
	private String description;

	@Column(name = "hsn_sac", nullable = false, length = 10)
	private String hsnSac;

	@Column(nullable = false, precision = 15, scale = 3)
	private BigDecimal quantity;

	@Column(name = "unit_id", nullable = false, length = 36)
	private String unitId;

	@Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
	private BigDecimal unitPrice;

	@Column(name = "discount_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal discountAmount;

	@Column(name = "taxable_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal taxableAmount;

	@Column(name = "cgst_rate", nullable = false, precision = 5, scale = 2)
	private BigDecimal cgstRate;

	@Column(name = "sgst_rate", nullable = false, precision = 5, scale = 2)
	private BigDecimal sgstRate;

	@Column(name = "igst_rate", nullable = false, precision = 5, scale = 2)
	private BigDecimal igstRate;

	@Column(name = "cess_rate", nullable = false, precision = 5, scale = 2)
	private BigDecimal cessRate;

	@Column(name = "cgst_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal cgstAmount;

	@Column(name = "sgst_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal sgstAmount;

	@Column(name = "igst_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal igstAmount;

	@Column(name = "cess_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal cessAmount;

	@Column(name = "line_total", nullable = false, precision = 15, scale = 2)
	private BigDecimal lineTotal;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

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
