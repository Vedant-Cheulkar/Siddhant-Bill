package com.siddhant.demo.modules.invoice.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceTaxSummaryJpaRepository extends JpaRepository<InvoiceTaxSummaryJpaEntity, String> {

	List<InvoiceTaxSummaryJpaEntity> findByInvoice_Id(String invoiceId);
}
