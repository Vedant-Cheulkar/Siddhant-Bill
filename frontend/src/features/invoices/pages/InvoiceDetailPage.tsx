import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller, type Control, type FieldArrayWithId, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import { ChevronRight, AlertCircle, Printer } from 'lucide-react';
import { typedZodResolver } from '@shared/utils/typedZodResolver';
import { format, addDays, parseISO } from 'date-fns';
import { Card } from '@shared/components/ui/Card';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { Combobox, type ComboboxOption } from '@shared/components/ui/Combobox';
import { InvoiceStatusBadge } from '@shared/components/ui/Badge';
import { Spinner } from '@shared/components/ui/Spinner';
import { ConfirmDialog } from '@shared/components/ui/Modal';
import { useCustomers } from '@features/customers/hooks/useCustomers';
import { useProducts } from '@features/item-groups/hooks/useProducts';
import {
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  useUpdateInvoiceStatus,
  useDeleteInvoice,
} from '../hooks/useInvoices';
import { formatCurrency } from '@shared/utils/format';
import { getWorkOrder } from '@features/work-orders/api/workOrders.api';
import { downloadInvoicePdf } from '../api/invoices.api';
import { getApiErrorMessage } from '@shared/utils/apiError';
import { toast } from 'sonner';
import { useSettingsStore } from '@features/settings/store/useSettingsStore';
import { LineItemEditor, calcLineTotal, type LineItemFormShape } from '@shared/components/widgets/LineItemEditor';
import type { InvoiceStatus } from '../types/invoice.types';

/* ── Zod schema ───────────────────────────────────────────── */
const lineItemSchema = z.object({
  productId:       z.string().optional(),
  description:     z.string().min(1, 'Required'),
  quantity:        z.number().min(0.01, 'Must be > 0'),
  unitPrice:       z.number().min(0, 'Cannot be negative'),
  taxPercent:      z.number().min(0).max(100),
  discountPercent: z.number().min(0).max(100),
});

const schema = z.object({
  customerId:  z.string().min(1, 'Select a customer'),
  invoiceDate: z.string().min(1, 'Required'),
  dueDate:     z.string().optional(),
  currency:    z.string().min(1),
  notes:       z.string().optional(),
  items:       z.array(lineItemSchema).min(1, 'At least one item required'),
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

/* ── Calculations ─────────────────────────────────────────── */

const STATUS_TRANSITIONS: Partial<Record<InvoiceStatus, { to: InvoiceStatus; label: string; danger?: boolean }[]>> = {
  DRAFT:   [{ to: 'ISSUED', label: 'Issue Invoice' }],
  ISSUED:  [{ to: 'CANCELLED', label: 'Cancel Invoice', danger: true }],
};

/* ── Component ────────────────────────────────────────────── */
export function InvoiceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useInvoice(id);
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice(id ?? '');
  const statusMutation = useUpdateInvoiceStatus();
  const deleteMutation = useDeleteInvoice();

  const [customerSearch, setCustomerSearch] = useState('');
  const [activeProductSearch, setActiveProductSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pendingWorkOrderId = useRef<string | undefined>(undefined);
  const companyStateCode = useSettingsStore((s) => s.company.stateCode);
  const defaultDueDays = useSettingsStore((s) => s.invoice.defaultDueDays);

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
      customerId: '',
      invoiceDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: '',
      currency: 'INR',
      notes: '',
      items: [defaultItem],
    },
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: 'items' });
  const watched = watch();

  useEffect(() => {
    if (isEdit) return;
    const raw = sessionStorage.getItem('workOrderConvert');
    if (!raw) return;

    sessionStorage.removeItem('workOrderConvert');
    try {
      const parsed = JSON.parse(raw) as {
        workOrderId?: string;
        customerId?: string;
        workOrderRef?: string;
      };
      if (parsed.workOrderId) pendingWorkOrderId.current = parsed.workOrderId;

      if (parsed.customerId) {
        setValue('customerId', parsed.customerId);
      }
      if (parsed.workOrderRef) {
        setValue('notes', `Converted from work order ${parsed.workOrderRef}`);
      }

      if (parsed.workOrderId) {
        getWorkOrder(parsed.workOrderId)
          .then((wo) => {
            reset({
              customerId: wo.customerId,
              invoiceDate: format(new Date(), 'yyyy-MM-dd'),
              dueDate: format(addDays(new Date(), defaultDueDays), 'yyyy-MM-dd'),
              currency: 'INR',
              notes: `Converted from work order ${wo.orderNumber}`,
              items: wo.items.map((item) => ({
                productId: item.productId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxPercent: item.taxPercent,
                discountPercent: item.discountPercent,
              })),
            });
          })
          .catch(() => toast.error('Could not load work order details.'));
      }
    } catch {
      // ignore invalid session payload
    }
  }, [isEdit, setValue, reset, defaultDueDays]);

  useEffect(() => {
    if (!existing) return;
    reset({
      customerId: existing.customerId,
      invoiceDate: existing.invoiceDate,
      dueDate: existing.dueDate ?? '',
      currency: existing.currency,
      notes: existing.notes ?? '',
      items: existing.items.map((i) => ({
        productId: i.productId ?? undefined,
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        taxPercent: i.taxPercent,
        discountPercent: i.discountPercent,
      })),
    });
  }, [existing, reset]);

  const isViewMode = isEdit && existing?.status === 'ISSUED';
  const isCancelled = existing?.status === 'CANCELLED';
  const isReadOnly = isViewMode || isCancelled;

  const onSubmit = (data: FormValues) => {
    const payload = {
      customerId: data.customerId,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate || undefined,
      currency: data.currency,
      notes: data.notes || undefined,
      workOrderId: pendingWorkOrderId.current,
      items: data.items.map((i) => ({
        productId: i.productId || undefined,
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        taxPercent: i.taxPercent,
        discountPercent: i.discountPercent,
      })),
    };
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleStatusChange = (to: InvoiceStatus) => {
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

  const handleDownloadPdf = async () => {
    if (!existing) return;
    setPdfLoading(true);
    try {
      await downloadInvoicePdf(existing.id, existing.displayNumber);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to download PDF.'));
    } finally {
      setPdfLoading(false);
    }
  };

  if (isEdit && loadingExisting) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const transitions = existing ? STATUS_TRANSITIONS[existing.status] ?? [] : [];

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted mb-1">
            <button onClick={() => navigate('/invoices')} className="hover:text-fg transition-colors">
              Invoices
            </button>
            <ChevronRight size={12} />
            <span className="text-fg font-medium">
              {isEdit ? (existing?.displayNumber ?? 'Invoice') : 'New Invoice'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? (existing?.displayNumber ?? 'Invoice') : 'New Invoice'}
            </h1>
            {existing && <InvoiceStatusBadge status={existing.status} />}
          </div>
        </div>

        {/* Status action buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isEdit && (
            <>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="print:hidden"
              >
                {pdfLoading ? <Spinner className="w-3 h-3" /> : <Printer size={13} />}
                PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => window.print()}
                className="print:hidden"
              >
                <Printer size={13} /> Print
              </Button>
            </>
          )}
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
            {isCancelled
              ? 'This invoice has been cancelled and cannot be edited.'
              : 'Issued invoices are read-only. Cancel the invoice to make changes.'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          {/* Left: form */}
          <div className="space-y-6">
            {/* Customer + dates */}
            <Card className="p-6 space-y-4">
              <h2 className="text-sm font-semibold text-fg">Invoice Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Controller
                    control={control}
                    name="customerId"
                    render={({ field }) => (
                      <Combobox
                        label="Customer *"
                        placeholder="Search customers…"
                        value={field.value}
                        onChange={(v) => {
                          field.onChange(v);
                          const customer = customerPage?.content.find((c) => c.id === v);
                          const days = customer?.creditDays ?? defaultDueDays;
                          const invoiceDate = watch('invoiceDate');
                          if (invoiceDate) {
                            try {
                              setValue('dueDate', format(addDays(parseISO(invoiceDate), days), 'yyyy-MM-dd'));
                            } catch { /* invalid date */ }
                          }
                        }}
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
                  label="Invoice Date *"
                  type="date"
                  error={errors.invoiceDate?.message}
                  disabled={isReadOnly}
                  {...register('invoiceDate')}
                />
                <Input
                  label="Due Date"
                  type="date"
                  disabled={isReadOnly}
                  {...register('dueDate')}
                />
                <Input
                  label="Currency"
                  disabled={isReadOnly}
                  {...register('currency')}
                />
              </div>
            </Card>

            {/* Line items */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-fg mb-4">Line Items</h2>
              <LineItemEditor
                fields={fields as FieldArrayWithId<LineItemFormShape, 'items', 'id'>[]}
                watchedItems={watched.items ?? []}
                register={register as UseFormRegister<LineItemFormShape>}
                control={control as unknown as Control<LineItemFormShape>}
                errors={errors as FieldErrors<LineItemFormShape>}
                isReadOnly={isReadOnly}
                productOptions={productOptions}
                productsLoading={productsLoading}
                onProductSearch={setActiveProductSearch}
                onProductSelect={handleProductSelect}
                onUpdate={(idx, item) => update(idx, item)}
                onRemove={remove}
                onAppend={() => append(defaultItem)}
              />
            </Card>

            {/* Notes */}
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-fg mb-3">Notes</h2>
              <textarea
                rows={3}
                disabled={isReadOnly}
                placeholder="Internal notes for this invoice…"
                className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none disabled:opacity-70 transition-colors"
                {...register('notes')}
              />
            </Card>
          </div>

          {/* Right: invoice preview / summary */}
          <div className="space-y-4">
            <Card className="p-5 xl:sticky xl:top-4">
              <h2 className="text-sm font-semibold mb-4">Invoice Summary</h2>

              <div className="bg-stone-50 rounded-xl border border-border p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-sm">
                    {existing?.displayNumber ?? 'INV-NEW'}
                  </span>
                  {existing && <InvoiceStatusBadge status={existing.status} />}
                </div>

                <div className="border-t border-border pt-3 grid grid-cols-2 gap-1 text-muted">
                  <span>Invoice date</span>
                  <span className="text-right">Due date</span>
                  <span className="text-fg font-medium">{watched.invoiceDate || '—'}</span>
                  <span className="text-fg font-medium text-right">{watched.dueDate || '—'}</span>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-muted mb-0.5">Billed to</p>
                  <p className="font-medium text-fg">
                    {customerOptions.find((c) => c.value === watched.customerId)?.label ?? (watched.customerId ? watched.customerId : '—')}
                  </p>
                </div>

                {/* Items table */}
                <div className="border-t border-border pt-3">
                  <div className="grid grid-cols-[1fr_40px_60px] gap-1 text-muted mb-2">
                    <span>Description</span><span className="text-right">Qty</span><span className="text-right">Total</span>
                  </div>
                  {(watched.items ?? []).map((item, i) => {
                    const total = calcLineTotal(item);
                    return (
                      <div key={i} className="grid grid-cols-[1fr_40px_60px] gap-1 py-1 border-t border-border items-center">
                        <span className="truncate">{item.description || 'Item'}</span>
                        <span className="text-right text-muted">{item.quantity}</span>
                        <span className="text-right font-medium">{formatCurrency(total)}</span>
                      </div>
                    );
                  })}
                  {(() => {
                    const items = watched.items ?? [];
                    const subtotal = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
                    const totalDiscount = items.reduce((s, i) => s + (i.quantity * i.unitPrice * (i.discountPercent / 100)), 0);
                    const taxable = subtotal - totalDiscount;
                    const totalTax = items.reduce((s, i) => {
                      const base = i.quantity * i.unitPrice * (1 - i.discountPercent / 100);
                      return s + base * (i.taxPercent / 100);
                    }, 0);
                    const custStateCode = customerPage?.content.find((c) => c.id === watched.customerId)?.billingStateCode;
                    const isIntraState = !!custStateCode && custStateCode === companyStateCode;
                    const grandTotal = taxable + totalTax;
                    return (
                      <>
                        <div className="flex justify-between py-1 text-muted">
                          <span>Subtotal</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {totalDiscount > 0 && (
                          <div className="flex justify-between py-1 text-muted">
                            <span>Discount</span>
                            <span className="text-red-500">−{formatCurrency(totalDiscount)}</span>
                          </div>
                        )}
                        {isIntraState ? (
                          <>
                            <div className="flex justify-between py-1 text-muted">
                              <span>CGST</span><span>{formatCurrency(totalTax / 2)}</span>
                            </div>
                            <div className="flex justify-between py-1 text-muted">
                              <span>SGST</span><span>{formatCurrency(totalTax / 2)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between py-1 text-muted">
                            <span>IGST</span><span>{formatCurrency(totalTax)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-border mt-1 font-semibold">
                          <span>Grand Total</span>
                          <span className="text-accent">{formatCurrency(grandTotal)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {watched.notes && (
                <div className="mt-3 px-3 py-2.5 bg-stone-50 rounded-lg border border-border text-xs text-muted">
                  <p className="font-medium text-fg mb-0.5">Notes</p>
                  <p>{watched.notes}</p>
                </div>
              )}
            </Card>

            {/* Danger zone */}
            {isEdit && existing?.status === 'DRAFT' && (
              <Card className="p-4">
                <p className="text-xs font-medium text-fg mb-2">Danger Zone</p>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                >
                  Delete this invoice
                </button>
              </Card>
            )}
          </div>
        </div>

        {/* Footer actions */}
        {!isReadOnly && (
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-4 border-t border-border">
            <p className="text-xs text-muted">
              {isEdit
                ? `Last updated: ${existing?.updatedAt ? format(new Date(existing.updatedAt), 'MMM d, yyyy h:mma') : '—'}`
                : 'New invoice — not yet saved'}
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" type="button" onClick={() => navigate('/invoices')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Spinner className="w-4 h-4" />}
                {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Invoice'}
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => { deleteMutation.mutate(id!); setDeleteOpen(false); }}
        title="Delete Invoice"
        description={`Are you sure you want to delete ${existing?.displayNumber ?? 'this invoice'}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
