package com.siddhant.demo.modules.product.infrastructure.persistence;

import com.siddhant.demo.shared.persistence.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "products")
public class ProductJpaEntity extends AuditableEntity {

	@Column(name = "organization_id", nullable = false, length = 36, updatable = false)
	private String organizationId;

	@Column(nullable = false, length = 50)
	private String sku;

	@Column(nullable = false, length = 300)
	private String name;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(name = "hsn_sac", length = 10)
	private String hsnSac;

	@Column(length = 20, nullable = false)
	private String unit = "PCS";

	@Column(name = "sale_price", nullable = false, precision = 15, scale = 2)
	private BigDecimal salePrice = BigDecimal.ZERO;

	@Column(name = "gst_percentage", nullable = false, precision = 5, scale = 2)
	private BigDecimal gstPercentage = BigDecimal.ZERO;

	@Column(name = "stock_quantity", nullable = false)
	private int stockQuantity = 0;

	@Column(name = "is_active", nullable = false)
	private boolean active = true;
}
