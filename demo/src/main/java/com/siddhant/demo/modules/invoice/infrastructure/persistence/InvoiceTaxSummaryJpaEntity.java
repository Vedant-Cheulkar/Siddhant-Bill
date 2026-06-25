package com.siddhant.demo.modules.invoice.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "invoice_tax_summary")
public class InvoiceTaxSummaryJpaEntity {

	@Id
	@Column(length = 36)
	private String id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "invoice_id", nullable = false)
	private InvoiceJpaEntity invoice;

	@Column(name = "tax_type", nullable = false, length = 10)
	private String taxType;

	@Column(nullable = false, precision = 5, scale = 2)
	private BigDecimal rate;

	@Column(name = "taxable_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal taxableAmount;

	@Column(name = "tax_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal taxAmount;

	@PrePersist
	void onPrePersist() {
		if (id == null) {
			id = UUID.randomUUID().toString();
		}
	}
}
