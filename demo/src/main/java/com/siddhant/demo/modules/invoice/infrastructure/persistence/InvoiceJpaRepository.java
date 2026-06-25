package com.siddhant.demo.modules.invoice.infrastructure.persistence;

import com.siddhant.demo.modules.invoice.domain.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

public interface InvoiceJpaRepository extends JpaRepository<InvoiceJpaEntity, String> {

	Optional<InvoiceJpaEntity> findByIdAndTenantIdAndOrganizationIdAndDeletedAtIsNull(
			String id, String tenantId, String organizationId);

	@Query("""
			SELECT i FROM InvoiceJpaEntity i
			LEFT JOIN FETCH i.lines
			WHERE i.id = :id
			  AND i.tenantId = :tenantId
			  AND i.organizationId = :organizationId
			  AND i.deletedAt IS NULL
			""")
	Optional<InvoiceJpaEntity> findDetailedByIdAndTenantIdAndOrganizationIdAndDeletedAtIsNull(
			@Param("id") String id,
			@Param("tenantId") String tenantId,
			@Param("organizationId") String organizationId);

	@Query("""
			SELECT i FROM InvoiceJpaEntity i
			WHERE i.tenantId = :tenantId
			  AND i.organizationId = :organizationId
			  AND i.deletedAt IS NULL
			  AND (:status IS NULL OR i.status = :status)
			  AND (:customerId IS NULL OR i.customerId = :customerId)
			  AND (:fromDate IS NULL OR i.invoiceDate >= :fromDate)
			  AND (:toDate IS NULL OR i.invoiceDate <= :toDate)
			  AND (:q IS NULL OR LOWER(COALESCE(i.displayNumber, '')) LIKE LOWER(CONCAT('%', :q, '%')))
			""")
	Page<InvoiceJpaEntity> search(
			@Param("tenantId") String tenantId,
			@Param("organizationId") String organizationId,
			@Param("status") InvoiceStatus status,
			@Param("customerId") String customerId,
			@Param("fromDate") LocalDate fromDate,
			@Param("toDate") LocalDate toDate,
			@Param("q") String q,
			Pageable pageable);

	long countByTenantIdAndOrganizationIdAndStatusAndDeletedAtIsNull(
			String tenantId, String organizationId, InvoiceStatus status);

	@Query("""
			SELECT COALESCE(SUM(i.grandTotal), 0) FROM InvoiceJpaEntity i
			WHERE i.tenantId = :tenantId
			  AND i.organizationId = :organizationId
			  AND i.status = :status
			  AND i.deletedAt IS NULL
			  AND i.invoiceDate BETWEEN :fromDate AND :toDate
			""")
	BigDecimal sumIssuedGrandTotal(
			@Param("tenantId") String tenantId,
			@Param("organizationId") String organizationId,
			@Param("status") InvoiceStatus status,
			@Param("fromDate") LocalDate fromDate,
			@Param("toDate") LocalDate toDate);
}
