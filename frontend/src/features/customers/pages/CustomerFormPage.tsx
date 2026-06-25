import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@shared/components/ui/Input';
import { typedZodResolver } from '@shared/utils/typedZodResolver';
import { Button } from '@shared/components/ui/Button';
import { Spinner } from '@shared/components/ui/Spinner';
import { ConfirmDialog } from '@shared/components/ui/Modal';
import { useCreateCustomer, useUpdateCustomer, useDeleteCustomer, useCustomer } from '../hooks/useCustomers';
import type { CustomerRequest } from '../types/customer.types';
import { cn } from '@shared/utils/cn';
import {
  refineIndianTaxIds,
  zIndianStateCode,
  zOptionalEmail,
  zOptionalGstin,
  zOptionalIndianPhone,
  zOptionalPan,
} from '@shared/validation/india.schemas';

const schema = refineIndianTaxIds(
  z.object({
    code:             z.string().min(2).max(30).regex(/^[A-Za-z0-9_-]+$/, 'Letters, numbers, _ and - only'),
    name:             z.string().min(2).max(300),
    billingStateCode: zIndianStateCode,
    gstin:            zOptionalGstin,
    pan:              zOptionalPan,
    email:            zOptionalEmail,
    phone:            zOptionalIndianPhone,
    creditDays:       z.string()
                       .optional()
                       .refine(
                         (v) => v === undefined || v === '' || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 365),
                         { message: 'Must be a number between 0 and 365' }
                       ),
    active:           z.boolean().optional(),
    notes:            z.string().max(2000).optional(),
  }),
);

type FormData = z.infer<typeof schema>;
type Tab = 'basic' | 'billing' | 'other';

export function CustomerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: existing, isLoading: loadingExisting } = useCustomer(id);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer(id ?? '');
  const deleteMutation = useDeleteCustomer(id ?? '');
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: typedZodResolver<FormData>(schema),
    defaultValues: { creditDays: '30', billingStateCode: '27', active: true },
  });

  useEffect(() => {
    if (existing) {
      reset({
        code:             existing.code,
        name:             existing.name,
        billingStateCode: existing.billingStateCode ?? '27',
        gstin:            existing.gstin ?? '',
        pan:              existing.pan ?? '',
        email:            existing.email ?? '',
        phone:            existing.phone ?? '',
        creditDays:       String(existing.creditDays),
        active:           existing.active,
        notes:            existing.notes ?? '',
      });
    }
  }, [existing, reset]);

  const onSubmit = (data: FormData) => {
    const payload: CustomerRequest = {
      code:             data.code,
      name:             data.name,
      billingStateCode: data.billingStateCode,
      gstin:            data.gstin || undefined,
      pan:              data.pan || undefined,
      email:            data.email || undefined,
      phone:            data.phone || undefined,
      creditDays:       data.creditDays !== undefined && data.creditDays !== ''
                          ? Number(data.creditDays)
                          : 30,
      active:           data.active ?? true,
      notes:            data.notes || undefined,
    };
    mutation.mutate(payload);
  };

  const tabs: { label: string; value: Tab }[] = [
    { label: 'Basic Info', value: 'basic'   },
    { label: 'Billing',    value: 'billing' },
    { label: 'Other',      value: 'other'   },
  ];

  if (isEdit && loadingExisting) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">
        {isEdit ? 'Edit Customer' : 'New Customer'}
      </h1>
      <div className="border-b border-border mb-6" />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === tab.value
                    ? 'border-fg text-fg'
                    : 'border-transparent text-muted hover:text-fg'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Customer Code *"
                hint="Letters, numbers, _ and - only"
                error={errors.code?.message}
                {...register('code')}
              />
              <Input
                label="Full Name *"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="E-mail Address"
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Phone"
                hint="10-digit Indian mobile (starts with 6–9)"
                error={errors.phone?.message}
                inputMode="tel"
                maxLength={14}
                {...register('phone')}
              />
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Billing State Code *"
                hint="2-digit GST state code (e.g. 27 = Maharashtra)"
                error={errors.billingStateCode?.message}
                maxLength={2}
                inputMode="numeric"
                {...register('billingStateCode')}
              />
              <Input
                label="Credit Days"
                type="number"
                min={0}
                max={365}
                error={errors.creditDays?.message}
                {...register('creditDays')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="GSTIN"
                placeholder="27AABCM1234F1Z5"
                error={errors.gstin?.message}
                maxLength={15}
                className="uppercase font-mono"
                {...register('gstin')}
              />
              <Input
                label="PAN"
                placeholder="ABCDE1234F"
                error={errors.pan?.message}
                maxLength={10}
                className="uppercase font-mono"
                {...register('pan')}
              />
            </div>
          </div>
        )}

        {activeTab === 'other' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-fg block mb-1.5">Notes</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2.5 bg-surface border border-border rounded-input text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none transition-colors"
                placeholder="Optional notes about this customer…"
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer group mt-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-indigo-600"
                {...register('active')}
              />
              <div>
                <p className="text-sm font-medium text-fg">Active</p>
                <p className="text-xs text-muted">Inactive customers won't appear in invoice dropdowns</p>
              </div>
            </label>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate('/customers')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Spinner className="w-4 h-4" />}
            {mutation.isPending ? 'Saving…' : 'Save'}
          </Button>
          {isEdit && (
            <Button
              variant="danger"
              type="button"
              className="ml-auto"
              onClick={() => setDeleteOpen(true)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Customer'}
            </Button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => { deleteMutation.mutate(); setDeleteOpen(false); }}
        title="Delete Customer"
        description={`Delete ${existing?.name ?? 'this customer'}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
