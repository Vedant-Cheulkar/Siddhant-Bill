package com.siddhant.demo.modules.product.infrastructure.persistence;

import com.siddhant.demo.shared.persistence.TenantScopedEntity;
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
public class ProductJpaEntity extends TenantScopedEntity {

	@Column(name = "organization_id", nullable = false, length = 36, updatable = false)
	private String organizationId;

	@Column(nullable = false, length = 50)
	private String sku;

	@Column(nullable = false, length = 300)
	private String name;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(name = "hsn_sac", nullable = false, length = 10)
	private String hsnSac;

	@Column(name = "unit_id", nullable = false, length = 36)
	private String unitId;

	@Column(name = "sale_price", nullable = false, precision = 15, scale = 2)
	private BigDecimal salePrice;

	@Column(name = "tax_group_id", nullable = false, length = 36)
	private String taxGroupId;

	@Column(name = "is_active", nullable = false)
	private boolean active;
}
