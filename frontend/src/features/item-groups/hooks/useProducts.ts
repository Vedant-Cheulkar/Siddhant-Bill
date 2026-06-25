import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductListParams,
  type ProductRequest,
} from '../api/products.api';
import { PRODUCT_KEYS } from '../queryKeys';
import { getApiErrorMessage } from '@shared/utils/apiError';

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => listProducts(params),
    placeholderData: (prev) => prev,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id ?? ''),
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: ProductRequest) => createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      toast.success('Product created');
      navigate(`/item-groups`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to create product')),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductRequest) => updateProduct(id, data),
    onSuccess: (product) => {
      qc.setQueryData(PRODUCT_KEYS.detail(id), product);
      qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      toast.success('Product updated');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to update product')),
  });
}

export function useDeleteProduct(id: string) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      toast.success('Product deleted.');
      navigate('/item-groups');
    },
    onError: () => toast.error('Failed to delete product.'),
  });
}
