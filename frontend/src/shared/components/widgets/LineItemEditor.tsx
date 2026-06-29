import { Controller, type Control, type FieldArrayWithId, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Combobox, type ComboboxOption } from '@shared/components/ui/Combobox';
import { formatCurrency } from '@shared/utils/format';

export interface LineItemValues {
  productId?: string;
  hsnSac?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discountPercent: number;
}

export interface LineItemFormShape {
  items: LineItemValues[];
}

export function calcLineTotal(item: LineItemValues): number {
  const base = item.quantity * item.unitPrice;
  const afterDiscount = base * (1 - item.discountPercent / 100);
  return afterDiscount * (1 + item.taxPercent / 100);
}

interface LineItemEditorProps {
  fields: FieldArrayWithId<LineItemFormShape, 'items', 'id'>[];
  watchedItems: LineItemValues[];
  register: UseFormRegister<LineItemFormShape>;
  control: Control<LineItemFormShape>;
  errors: FieldErrors<LineItemFormShape>;
  isReadOnly: boolean;
  productOptions: ComboboxOption[];
  productsLoading: boolean;
  onProductSearch: (q: string) => void;
  onProductSelect: (idx: number, value: string, opt?: ComboboxOption) => void;
  onUpdate: (idx: number, item: LineItemValues) => void;
  onRemove: (idx: number) => void;
  onAppend: () => void;
  productPlaceholder?: string;
}

function Stepper({
  value,
  suffix = '',
  disabled,
  onDecrement,
  onIncrement,
  label,
}: {
  value: number | string;
  suffix?: string;
  disabled?: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
  label: string;
}) {
  return (
    <div>
      <span className="text-2xs font-medium text-muted mb-1 block md:hidden">{label}</span>
      <div className={`flex items-center gap-1 border border-border rounded-lg px-1.5 py-1 ${disabled ? 'opacity-70' : ''}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={onDecrement}
          className="w-4 h-4 flex items-center justify-center text-muted hover:text-fg disabled:cursor-not-allowed"
        >
          <Minus size={9} />
        </button>
        <span className="flex-1 text-center text-xs font-medium">{value}{suffix}</span>
        <button
          type="button"
          disabled={disabled}
          onClick={onIncrement}
          className="w-4 h-4 flex items-center justify-center text-muted hover:text-fg disabled:cursor-not-allowed"
        >
          <Plus size={9} />
        </button>
      </div>
    </div>
  );
}

export function LineItemEditor({
  fields,
  watchedItems,
  register,
  control,
  errors,
  isReadOnly,
  productOptions,
  productsLoading,
  onProductSearch,
  onProductSelect,
  onUpdate,
  onRemove,
  onAppend,
  productPlaceholder = 'Link product…',
}: LineItemEditorProps) {
  const itemErrors = errors.items;

  return (
    <>
      <div className="hidden md:grid grid-cols-[1fr_100px_90px_80px_80px_80px_36px] gap-2 px-1 mb-2">
        {['Description', 'Unit Price', 'Qty', 'Tax %', 'Disc %', 'Total', ''].map((h) => (
          <span key={h} className="text-2xs font-semibold text-muted uppercase tracking-wider">{h}</span>
        ))}
      </div>

      <div className="space-y-2">
        {fields.map((field, idx) => {
          const item = watchedItems?.[idx] ?? field;
          const total = calcLineTotal(item as LineItemValues);
          const rowError = itemErrors?.[idx];

          return (
            <div key={field.id}>
              <div className="hidden md:grid grid-cols-[1fr_100px_90px_80px_80px_80px_36px] gap-2 items-start bg-stone-50 rounded-xl p-3 border border-border">
                <div className="space-y-1.5">
                  {!isReadOnly && (
                    <Controller
                      control={control}
                      name={`items.${idx}.productId`}
                      render={({ field: pf }) => (
                        <Combobox
                          placeholder={productPlaceholder}
                          value={pf.value ?? ''}
                          onChange={(v, opt) => onProductSelect(idx, v, opt)}
                          options={productOptions}
                          isLoading={productsLoading}
                          onSearch={onProductSearch}
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
                  {rowError?.description && (
                    <p className="text-2xs text-red-500">{rowError.description.message}</p>
                  )}
                  <input
                    {...register(`items.${idx}.hsnSac`)}
                    placeholder="HSN/SAC code"
                    disabled={isReadOnly}
                    className="w-full text-2xs outline-none bg-transparent text-muted placeholder:text-muted/50 disabled:opacity-70"
                  />
                </div>

                <input
                  type="number"
                  step="0.01"
                  {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })}
                  disabled={isReadOnly}
                  className="text-xs outline-none bg-surface border border-border rounded-lg px-2 py-1.5 w-full disabled:opacity-70"
                />

                <Stepper
                  label="Qty"
                  value={item.quantity ?? 1}
                  disabled={isReadOnly}
                  onDecrement={() => onUpdate(idx, { ...(item as LineItemValues), quantity: Math.max(0.01, (item.quantity ?? 1) - 1) })}
                  onIncrement={() => onUpdate(idx, { ...(item as LineItemValues), quantity: (item.quantity ?? 1) + 1 })}
                />

                <Stepper
                  label="Tax %"
                  value={item.taxPercent ?? 0}
                  suffix="%"
                  disabled={isReadOnly}
                  onDecrement={() => onUpdate(idx, { ...(item as LineItemValues), taxPercent: Math.max(0, (item.taxPercent ?? 0) - 1) })}
                  onIncrement={() => onUpdate(idx, { ...(item as LineItemValues), taxPercent: Math.min(100, (item.taxPercent ?? 0) + 1) })}
                />

                <Stepper
                  label="Disc %"
                  value={item.discountPercent ?? 0}
                  suffix="%"
                  disabled={isReadOnly}
                  onDecrement={() => onUpdate(idx, { ...(item as LineItemValues), discountPercent: Math.max(0, (item.discountPercent ?? 0) - 0.5) })}
                  onIncrement={() => onUpdate(idx, { ...(item as LineItemValues), discountPercent: Math.min(100, (item.discountPercent ?? 0) + 0.5) })}
                />

                <span className="text-xs font-semibold pt-1.5">{formatCurrency(total)}</span>

                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  disabled={fields.length === 1 || isReadOnly}
                  className="p-1 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-muted disabled:opacity-30 mt-0.5"
                  aria-label="Remove item"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="md:hidden relative bg-stone-50 rounded-xl p-3 border border-border space-y-3">
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  disabled={fields.length === 1 || isReadOnly}
                  className="absolute top-2 right-2 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-muted disabled:opacity-30"
                  aria-label="Remove item"
                >
                  <Trash2 size={14} />
                </button>

                <div className="space-y-1.5 pr-8">
                  {!isReadOnly && (
                    <Controller
                      control={control}
                      name={`items.${idx}.productId`}
                      render={({ field: pf }) => (
                        <Combobox
                          placeholder={productPlaceholder}
                          value={pf.value ?? ''}
                          onChange={(v, opt) => onProductSelect(idx, v, opt)}
                          options={productOptions}
                          isLoading={productsLoading}
                          onSearch={onProductSearch}
                        />
                      )}
                    />
                  )}
                  <input
                    {...register(`items.${idx}.description`)}
                    placeholder="Description"
                    disabled={isReadOnly}
                    className="w-full text-sm outline-none bg-surface border border-border rounded-lg px-3 py-2 text-fg placeholder:text-muted disabled:opacity-70"
                  />
                  {rowError?.description && (
                    <p className="text-2xs text-red-500">{rowError.description.message}</p>
                  )}
                  <input
                    {...register(`items.${idx}.hsnSac`)}
                    placeholder="HSN/SAC code"
                    disabled={isReadOnly}
                    className="w-full text-xs outline-none bg-surface border border-border rounded-lg px-3 py-1.5 text-muted placeholder:text-muted/50 disabled:opacity-70"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-2xs font-medium text-muted mb-1 block">Unit Price</span>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })}
                      disabled={isReadOnly}
                      className="w-full text-xs outline-none bg-surface border border-border rounded-lg px-2 py-1.5 disabled:opacity-70"
                    />
                  </div>
                  <Stepper
                    label="Qty"
                    value={item.quantity ?? 1}
                    disabled={isReadOnly}
                    onDecrement={() => onUpdate(idx, { ...(item as LineItemValues), quantity: Math.max(0.01, (item.quantity ?? 1) - 1) })}
                    onIncrement={() => onUpdate(idx, { ...(item as LineItemValues), quantity: (item.quantity ?? 1) + 1 })}
                  />
                  <Stepper
                    label="Tax %"
                    value={item.taxPercent ?? 0}
                    suffix="%"
                    disabled={isReadOnly}
                    onDecrement={() => onUpdate(idx, { ...(item as LineItemValues), taxPercent: Math.max(0, (item.taxPercent ?? 0) - 1) })}
                    onIncrement={() => onUpdate(idx, { ...(item as LineItemValues), taxPercent: Math.min(100, (item.taxPercent ?? 0) + 1) })}
                  />
                  <Stepper
                    label="Disc %"
                    value={item.discountPercent ?? 0}
                    suffix="%"
                    disabled={isReadOnly}
                    onDecrement={() => onUpdate(idx, { ...(item as LineItemValues), discountPercent: Math.max(0, (item.discountPercent ?? 0) - 0.5) })}
                    onIncrement={() => onUpdate(idx, { ...(item as LineItemValues), discountPercent: Math.min(100, (item.discountPercent ?? 0) + 0.5) })}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-2xs font-medium text-muted uppercase">Line total</span>
                  <span className="text-sm font-semibold">{formatCurrency(total)}</span>
                </div>
              </div>
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
          onClick={onAppend}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-fg transition-colors mt-3 px-1"
        >
          <Plus size={12} /> Add line item
        </button>
      )}
    </>
  );
}
