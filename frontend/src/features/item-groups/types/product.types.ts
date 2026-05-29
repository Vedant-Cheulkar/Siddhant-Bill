export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  description?: string;
  hsnSac?: string;
  unitId?: string;
  salePrice: number;
  taxGroupId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
