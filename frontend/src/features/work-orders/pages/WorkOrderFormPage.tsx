import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Trash2, Plus, Minus, Wrench, ChevronRight, AlertCircle } from 'lucide-react';
import { typedZodResolver } from '@shared/utils/typedZodResolver';
import { format } from 'date-fns';
import { Card } from '@shared/components/ui/Card';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { Combobox, type ComboboxOption } from '@shared/components/ui/Combobox';
import { Spinner } from '@shared/components/ui/Spinner';
import { ConfirmDialog } from '@shared/components/ui/Modal';
import { useCustomers } from '@features/customers/hooks/useCustomers';
import { useProducts } from '@features/item-groups/hooks/useProducts';
import {
  useWorkOrder, useCreateWorkOrder, useUpdateWorkOrder,
  useUpdateWorkOrderStatus, useDeleteWorkOrder,
} from '../hooks/useWorkOrders';
import { formatCurrency } from '@shared/utils/format';
import { cn } from '@shared/utils/cn';
import type { WorkOrderStatus } from '../types/workOrder.types';

const lineItemSchema = z.object({
  productId:       z.string().optional(),
  description:     z.string().min(1, 'Required'),
  quantity:        z.number().min(0.01, 'Must be > 0'),
  unitPrice:       z.number().min(0),
  taxPercent:      z.number().min(0).max(100),
  discountPercent: z.number().min(0).max(100),
});

const schema = z.object({
  customerId:   z.string().min(1, 'Select a customer'),
  vehicleRef:   z.string().optional(),
  serviceDate:  z.string().min(1, 'Required'),
  description:  z.string().optional(),
  notes:        z.string().optional(),
  items:        z.array(lineItemSchema).min(1, 'At least one item required'),
});

type FormValues = z.infer<typeof schema>;

const defaultItem = {
  productId: undefined as string | undefined,
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxPercent: 18,
  discountPercent: 0,
};

function calcLineTotal(item: FormValues['items'][number]): number {
  const base = item.quantity * item.unitPrice;
  return base * (1 - item.discountPercent / 100) * (1 + item.taxPercent / 100);
}

function calcGrandTotal(items: FormValues['items']): number {
  return items.reduce((s, i) => s + calcLineTotal(i), 0);
}

const STATUS_TRANSITIONS: Partial<Record<WorkOrderStatus, { to: WorkOrderStatus; label: string; danger?: boolean }[]>> = {
  OPEN:        [{ to: 'IN_PROGRESS', label: 'Start Work' }],
  IN_PROGRESS: [{ to: 'COMPLETED', label: 'Mark Completed' }, { to: 'CANCELLED', label: 'Cancel', danger: true }],
  COMPLETED:   [{ to: 'CANCELLED', label: 'Cancel', danger: true }],
};

const STATUS_LABEL: Record<WorkOrderStatus, string> = {
  OPEN: 'Open', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed',
  INVOICED: 'Invoiced', CANCELLED: 'Cancelled',
};

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  OPEN:        'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  INVOICED:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  CANCELLED:   'bg-red-50 text-red-700 border-red-200',
};

export function WorkOrderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useWorkOrder(id);
  const createMutation = useCreateWorkOrder();
  const updateMutation = useUpdateWorkOrder(id ?? '');
  const statusMutation = useUpdateWorkOrderStatus();
  const deleteMutation = useDeleteWorkOrder();

  const [customerSearch, setCustomerSearch] = useState('');
  const [activeProductSearch, setActiveProductSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: customerPage, isLoading: customersLoading } = useCustomers({
    q: customerSearch || undefined,
    size: 30,
  });

  const { data: productPage, isLoading: productsLoading } = useProducts({
    q: activeProductSearch || undefined,
    size: 50,
  });

  const customerOptions: ComboboxOption[] = (customerPage?.content ?? []).map((c) => ({
    value: c.id,
    label: c.name,
    sub: c.email ?? c.code,
  }));

  const productOptions: ComboboxOption[] = (productPage?.content ?? []).map((p) => ({
    value: p.id,
    label: p.name,
    sub: p.sku,
  }));

  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: typedZodResolver<FormValues>(schema),
    defaultValues: {
      customerId:  '',
      vehicleRef:  '',
      serviceDate: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      notes:       '',
      items:       [defaultItem],
    },
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: 'items' });
  const watched = watch();

  useEffect(() => {
    if (!existing) return;
    reset({
      customerId:  existing.customerId,
      vehicleRef:  existing.vehicleRef ?? '',
      serviceDate: existing.serviceDate,
      description: existing.description ?? '',
      notes:       existing.notes ?? '',
      items:       existing.items.map((i) => ({
        productId:       i.productId,
        description:     i.description,
        quantity:        i.quantity,
        unitPrice:       i.unitPrice,
        taxPercent:      i.taxPercent,
        discountPercent: i.discountPercent,
      })),
    });
  }, [existing, reset]);

  const isReadOnly = existing?.status === 'INVOICED' || existing?.status === 'CANCELLED';

  const onSubmit = (data: FormValues) => {
    const payload = {
      customerId:  data.customerId,
      vehicleRef:  data.vehicleRef || undefined,
      serviceDate: data.serviceDate,
      description: data.description || undefined,
      notes:       data.notes || undefined,
      items:       data.items.map((i) => ({
        productId:       i.productId || undefined,
        description:     i.description,
        quantity:        i.quantity,
        unitPrice:       i.unitPrice,
        taxPercent:      i.taxPercent,
        discountPercent: i.discountPercent,
      })),
    };
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleStatusChange = (to: WorkOrderStatus) => {
    if (!id) return;
    statusMutation.mutate({ id, status: to });
  };

  const handleProductSelect = useCallback(
    (idx: number, productId: string, option?: ComboboxOption) => {
      setValue(`items.${idx}.productId`, productId);
      if (option) {
        const product = productPage?.content.find((p) => p.id === productId);
        if (product) {
          setValue(`items.${idx}.description`, product.name);
          setValue(`items.${idx}.unitPrice`, product.salePrice);
        } else {
          setValue(`items.${idx}.description`, option.label);
        }
      }
    },
    [productPage, setValue]
  );

  if (isEdit && loadingExisting) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>;
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const transitions = existing ? STATUS_TRANSITIONS[existing.status] ?? [] : [];

  return (
    <div>
      {/* Breadcrumb + title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-1">
            <button onClick={() => navigate('/work-orders')} className="hover:text-fg transition-colors">
              Work Orders
            </button>
            <ChevronRight size={12} />
            <span className="text-fg font-medium">
              {isEdit ? (existing?.orderNumber ?? 'Work Order') : 'New Work Order'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? (existing?.orderNumber ?? 'Work Order') : 'New Work Order'}
            </h1>
            {existing && (
              <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', STATUS_COLORS[existing.status])}>
                {STATUS_LABEL[existing.status]}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {transitions.map((t) => (
            <Button
              key={t.to}
              variant={t.danger ? 'outline' : 'primary'}
              size="sm"
              onClick={() => handleStatusChange(t.to)}
              disabled={statusMutation.isPending}
              className={t.danger ? 'text-red-600 hover:bg-red-50 border-red-200' : ''}
            >
              {statusMutation.isPending ? <Spinner className="w-3 h-3" /> : null}
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {isReadOnly && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm mb-6">
          <AlertCircle size={15} />
          <span>
            {existing?.status === 'CANCELLED'
              ? 'This work order has been cancelled and cannot be edited.'
              : 'Invoiced work orders are read-only.'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-[1fr_360px] gap-6">
          {/* Left */}
          <div className="space-y-6">
            {/* Details */}
            <Card className="p-6 space-y-4">
              <h2 className="text-sm font-semibold text-fg">Work Order Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Controller
                    control={control}
                    name="customerId"
                    render={({ field }) => (
                      <Combobox
                        label="Customer *"
                        placeholder="Search customers…"
                        value={field.value}
                        onChange={field.onChange}
                        options={customerOptions}
                        isLoading={customersLoading}
                        onSearch={setCustomerSearch}
                        error={errors.customerId?.message}
                        disabled={isReadOnly}
                      />
                    )}
                  />
                </div>
                <Input
                  label="Vehicle / Asset Ref"
                  placeholder="e.g. MH-12-AB-1234"
                  hint="Truck registration or equipment ID"
                  disabled={isReadOnly}
                  {...register('vehicleRef')}
                />
                <Input
                  label="Service Date *"
                  type="date"
                  error={errors.serviceDate?.message}
                  disabled={isReadOnly}
                  {...register('serviceDate')}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-fg block mb-1.5">Job Description</label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  placeholder="Brief description of the maintenance work…"
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none disabled:opacity-70 transition-colors"
                  {...register('description')}
                />
              </div>
            </Card>

            {/* Line items */}
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-fg mb-4">Parts & Services</h2>

              <div className="grid grid-cols-[1fr_100px_90px_80px_80px_80px_36px] gap-2 px-1 mb-2">
                {['Description', 'Unit Price', 'Qty', 'Tax %', 'Disc %', 'Total', ''].map((h) => (
                  <span key={h} className="text-2xs font-semibold text-muted uppercase tracking-wider">{h}</span>
                ))}
              </div>

              <div className="space-y-2">
                {fields.map((field, idx) => {
                  const item = watched.items?.[idx] ?? field;
                  const total = calcLineTotal(item);
                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_100px_90px_80px_80px_80px_36px] gap-2 items-start bg-stone-50 rounded-xl p-3 border border-border"
                    >
                      <div className="space-y-1.5">
                        {!isReadOnly && (
                          <Controller
                            control={control}
                            name={`items.${idx}.productId`}
                            render={({ field: pf }) => (
                              <Combobox
                                placeholder="Link product/service…"
                                value={pf.value ?? ''}
                                onChange={(v, opt) => handleProductSelect(idx, v, opt)}
                                options={productOptions}
                                isLoading={productsLoading}
                                onSearch={setActiveProductSearch}
                                className="mb-1"
                              />
                            )}
                          />
                        )}
                        <input
                          {...register(`items.${idx}.description`)}
                          placeholder="Description"
                          disabled={isReadOnly}
                          className="w-full text-xs outline-none bg-transparent text-fg placeholder:text-muted disabled:opacity-70"
                        />
                        {errors.items?.[idx]?.description && (
                          <p className="text-2xs text-red-500">{errors.items[idx]?.description?.message}</p>
                        )}
                      </div>

                      <input
                        type="number" step="0.01"
                        {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })}
                        disabled={isReadOnly}
                        className="text-xs outline-none bg-surface border border-border rounded-lg px-2 py-1.5 w-full disabled:opacity-70"
                      />

                      <div className={`flex items-center gap-1 border border-border rounded-lg px-1.5 py-1 ${isReadOnly ? 'opacity-70' : ''}`}>
                        <button type="button" disabled={isReadOnly}
                          onClick={() => update(idx, { ...item, quantity: Math.max(0.01, (item.quantity ?? 1) - 1) })}
                          className="w-4 h-4 flex items-center justify-center text-muted hover:text-fg disabled:cursor-not-allowed">
                          <Minus size={9} />
                        </button>
                        <span className="flex-1 text-center text-xs font-medium">{item.quantity ?? 1}</span>
                        <button type="button" disabled={isReadOnly}
                          onClick={() => update(idx, { ...item, quantity: (item.quantity ?? 1) + 1 })}
                          className="w-4 h-4 flex items-center justify-center text-muted hover:text-fg disabled:cursor-not-allowed">
                          <Plus size={9} />
                        </button>
                      </div>

                      <div className={`flex items-center gap-1 border border-border rounded-lg px-1.5 py-1 ${isReadOnly ? 'opacity-70' : ''}`}>
                        <button type="button" disabled={isReadOnly}
                          onClick={() => update(idx, { ...item, taxPercent: Math.max(0, (item.taxPercent ?? 0) - 1) })}
                          className="w-4 h-4 flex items-center justify-center text-muted hover:text-fg disabled:cursor-not-allowed">
                          <Minus size={9} />
                        </button>
                        <span className="flex-1 text-center text-xs font-medium">{item.taxPercent ?? 0}%</span>
                        <button type="button" disabled={isReadOnly}
                          onClick={() => update(idx, { ...item, taxPercent: Math.min(100, (item.taxPercent ?? 0) + 1) })}
                          className="w-4 h-4 flex items-center justify-center text-muted hover:text-fg disabled:cursor-not-allowed">
                          <Plus size={9} />
                        </button>
                      </div>

                      <div className={`flex items-center gap-1 border border-border rounded-lg px-1.5 py-1 ${isReadOnly ? 'opacity-70' : ''}`}>
                        <button type="button" disabled={isReadOnly}
                          onClick={() => update(idx, { ...item, discountPercent: Math.max(0, (item.discountPercent ?? 0) - 0.5) })}
                          className="w-4 h-4 flex items-center justify-center text-muted hover:text-fg disabled:cursor-not-allowed">
                          <Minus size={9} />
                        </button>
                        <span className="flex-1 text-center text-xs font-medium">{item.discountPercent ?? 0}%</span>
                        <button type="button" disabled={isReadOnly}
                          onClick={() => update(idx, { ...item, discountPercent: Math.min(100, (item.discountPercent ?? 0) + 0.5) })}
                          className="w-4 h-4 flex items-center justify-center text-muted hover:text-fg disabled:cursor-not-allowed">
                          <Plus size={9} />
                        </button>
                      </div>

                      <span className="text-xs font-semibold pt-1.5">{formatCurrency(total)}</span>

                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        disabled={fields.length === 1 || isReadOnly}
                        className="p-1 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-muted disabled:opacity-30 mt-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {errors.items?.root && (
                <p className="text-xs text-red-500 mt-2">{errors.items.root.message}</p>
              )}

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => append(defaultItem)}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-fg transition-colors mt-3 px-1"
                >
                  <Plus size={12} /> Add line item
                </button>
              )}
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-fg mb-3">Internal Notes</h2>
              <textarea
                rows={3}
                disabled={isReadOnly}
                placeholder="Notes about this work order…"
                className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none disabled:opacity-70 transition-colors"
                {...register('notes')}
              />
            </Card>
          </div>

          {/* Right: summary */}
          <div className="space-y-4">
            <Card className="p-5 sticky top-4">
              <h2 className="text-sm font-semibold mb-4">Order Summary</h2>

              <div className="bg-stone-50 rounded-xl border border-border p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-sm">
                    {existing?.orderNumber ?? 'WO-NEW'}
                  </span>
                  <Wrench size={14} className="text-muted" />
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-muted mb-0.5">Customer</p>
                  <p className="font-medium text-fg">
                    {customerOptions.find((c) => c.value === watched.customerId)?.label ?? '—'}
                  </p>
                </div>

                {watched.vehicleRef && (
                  <div className="border-t border-border pt-3">
                    <p className="text-muted mb-0.5">Vehicle / Asset</p>
                    <p className="font-mono font-medium text-fg">{watched.vehicleRef}</p>
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <div className="grid grid-cols-[1fr_40px_60px] gap-1 text-muted mb-2">
                    <span>Item</span><span className="text-right">Qty</span><span className="text-right">Total</span>
                  </div>
                  {(watched.items ?? []).map((item, i) => (
                    <div key={i} className="grid grid-cols-[1fr_40px_60px] gap-1 py-1 border-t border-border items-center">
                      <span className="truncate">{item.description || 'Item'}</span>
                      <span className="text-right text-muted">{item.quantity}</span>
                      <span className="text-right font-medium">{formatCurrency(calcLineTotal(item))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-border mt-1 font-semibold">
                    <span>Grand Total</span>
                    <span className="text-accent">{formatCurrency(calcGrandTotal(watched.items ?? []))}</span>
                  </div>
                </div>
              </div>
            </Card>

            {isEdit && (existing?.status === 'OPEN' || existing?.status === 'CANCELLED') && (
              <Card className="p-4">
                <p className="text-xs font-medium text-fg mb-2">Danger Zone</p>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                >
                  Delete this work order
                </button>
              </Card>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
            <p className="text-xs text-muted">
              {isEdit
                ? `Last updated: ${existing?.updatedAt ? format(new Date(existing.updatedAt), 'MMM d, yyyy h:mma') : '—'}`
                : 'New work order — not yet saved'}
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" type="button" onClick={() => navigate('/work-orders')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Spinner className="w-4 h-4" />}
                {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Work Order'}
              </Button>
            </div>
          </div>
        )}
      </form>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => { deleteMutation.mutate(id!); setDeleteOpen(false); }}
        title="Delete Work Order"
        description={`Delete ${existing?.orderNumber ?? 'this work order'}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
