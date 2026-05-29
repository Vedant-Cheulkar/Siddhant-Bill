import { apiClient } from '@infra/http/apiClient';
import type { ProductResponse } from '../types/product.types';
import type { PageResponse } from '@shared/types';

export interface ProductListParams {
  q?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
}

export interface ProductRequest {
  sku: string;
  name: string;
  description?: string;
  hsnSac?: string;
  unitId?: string;
  salePrice: number;
  taxGroupId?: string;
  active?: boolean;
}

export const listProducts = async (params: ProductListParams = {}): Promise<PageResponse<ProductResponse>> => {
  const res = await apiClient.get('/products', { params });
  return res.data.data;
};

export const getProduct = async (id: string): Promise<ProductResponse> => {
  const res = await apiClient.get(`/products/${id}`);
  return res.data.data;
};

export const createProduct = async (data: ProductRequest): Promise<ProductResponse> => {
  const res = await apiClient.post('/products', data);
  return res.data.data;
};

export const updateProduct = async (id: string, data: ProductRequest): Promise<ProductResponse> => {
  const res = await apiClient.put(`/products/${id}`, data);
  return res.data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};
