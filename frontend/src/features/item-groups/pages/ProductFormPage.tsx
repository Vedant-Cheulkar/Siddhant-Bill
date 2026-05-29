import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { Spinner } from '@shared/components/ui/Spinner';
import { ConfirmDialog } from '@shared/components/ui/Modal';
import { useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';

const schema = z.object({
  sku:         z.string().min(1, 'Required').max(50, 'Max 50 chars'),
  name:        z.string().min(1, 'Required').max(300, 'Max 300 chars'),
  description: z.string().max(1000).optional(),
  hsnSac:      z.string().max(20).optional(),
  salePrice:   z.string().refine(
    (v) => !isNaN(Number(v)) && Number(v) >= 0,
    { message: 'Must be a non-negative number' }
  ),
  active: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: existing, isLoading: loadingExisting } = useProduct(id);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(id ?? '');
  const deleteMutation = useDeleteProduct(id ?? '');
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { salePrice: '0', active: true },
  });

  useEffect(() => {
    if (!existing) return;
    reset({
      sku: existing.sku,
      name: existing.name,
      description: existing.description ?? '',
      hsnSac: existing.hsnSac ?? '',
      salePrice: String(existing.salePrice),
      active: existing.active,
    });
  }, [existing, reset]);

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      sku: data.sku,
      name: data.name,
      description: data.description || undefined,
      hsnSac: data.hsnSac || undefined,
      salePrice: Number(data.salePrice),
      active: data.active ?? true,
    });
  };

  if (isEdit && loadingExisting) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
        <button onClick={() => navigate('/item-groups')} className="hover:text-fg transition-colors">
          Item Groups
        </button>
        <ChevronRight size={12} />
        <span className="text-fg font-medium">{isEdit ? 'Edit Product' : 'New Product'}</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-6">
        {isEdit ? 'Edit Product' : 'New Product'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-fg">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU *"
              hint="Unique stock keeping unit"
              error={errors.sku?.message}
              {...register('sku')}
            />
            <Input
              label="Product Name *"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fg block mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Optional product description…"
              className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none transition-colors"
              {...register('description')}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-fg">Pricing & Compliance</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sale Price *"
              type="number"
              step="0.01"
              min={0}
              hint="Base price before tax"
              error={errors.salePrice?.message}
              {...register('salePrice')}
            />
            <Input
              label="HSN / SAC Code"
              hint="For GST compliance"
              error={errors.hsnSac?.message}
              {...register('hsnSac')}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-fg mb-4">Status</h2>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded accent-indigo-600"
              {...register('active')}
            />
            <div>
              <p className="text-sm font-medium text-fg">Active</p>
              <p className="text-xs text-muted">Inactive products won't appear in invoice line items</p>
            </div>
          </label>
        </Card>

        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/item-groups')}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Spinner className="w-4 h-4" />}
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
          {isEdit && (
            <Button
              variant="danger"
              type="button"
              className="ml-auto"
              onClick={() => setDeleteOpen(true)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Product'}
            </Button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => { deleteMutation.mutate(); setDeleteOpen(false); }}
        title="Delete Product"
        description={`Delete ${existing?.name ?? 'this product'}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
