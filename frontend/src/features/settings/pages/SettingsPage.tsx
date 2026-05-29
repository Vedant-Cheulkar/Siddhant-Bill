import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Building2, FileText, BadgePercent, User, Lock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/Card';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { PageHeader } from '@shared/components/widgets/PageHeader';
import { useAuthStore } from '@features/auth/store/authStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { cn } from '@shared/utils/cn';

type Tab = 'company' | 'invoice' | 'tax' | 'profile';

const tabs: { label: string; value: Tab; icon: React.ReactNode }[] = [
  { label: 'Company',  value: 'company',  icon: <Building2 size={14} /> },
  { label: 'Invoice',  value: 'invoice',  icon: <FileText size={14} /> },
  { label: 'Tax',      value: 'tax',      icon: <BadgePercent size={14} /> },
  { label: 'Profile',  value: 'profile',  icon: <User size={14} /> },
];

/* ── Company schema ──────────────────────────────────────────── */
const companySchema = z.object({
  name:       z.string().min(2, 'Required'),
  gstin:      z.string().optional(),
  pan:        z.string().optional(),
  address:    z.string().optional(),
  city:       z.string().optional(),
  stateCode:  z.string().length(2, 'Must be 2 digits').optional().or(z.literal('')),
  phone:      z.string().optional(),
  email:      z.string().email('Invalid email').optional().or(z.literal('')),
});
type CompanyForm = z.infer<typeof companySchema>;

/* ── Invoice schema ──────────────────────────────────────────── */
const invoiceSchema = z.object({
  prefix:         z.string().min(1, 'Required').max(10),
  startingNumber: z.coerce.number().int().min(1),
  defaultDueDays: z.coerce.number().int().min(0).max(365),
  terms:          z.string().optional(),
});
type InvoiceForm = z.infer<typeof invoiceSchema>;

/* ── Tax schema ──────────────────────────────────────────────── */
const taxSchema = z.object({
  defaultRate: z.coerce.number().min(0).max(100),
});
type TaxForm = z.infer<typeof taxSchema>;

const GST_RATES = [0, 5, 12, 18, 28];

/* ── Profile row ─────────────────────────────────────────────── */
function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-sm font-medium text-fg">{value || '—'}</p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore();
  const [activeTab, setActiveTab] = useState<Tab>('company');

  /* Company form */
  const companyForm = useForm<CompanyForm>({
    resolver: zodResolver(companySchema) as Resolver<CompanyForm>,
    defaultValues: settings.company,
  });

  /* Invoice form */
  const invoiceForm = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceForm>,
    defaultValues: {
      prefix:         settings.invoice.prefix,
      startingNumber: settings.invoice.startingNumber,
      defaultDueDays: settings.invoice.defaultDueDays,
      terms:          settings.invoice.terms,
    },
  });

  /* Tax form */
  const taxForm = useForm<TaxForm>({
    resolver: zodResolver(taxSchema) as Resolver<TaxForm>,
    defaultValues: { defaultRate: settings.tax.defaultRate },
  });

  const saveCompany = (data: CompanyForm) => {
    settings.updateCompany(data);
    toast.success('Company settings saved.');
  };

  const saveInvoice = (data: InvoiceForm) => {
    settings.updateInvoice({
      prefix:         data.prefix,
      startingNumber: Number(data.startingNumber),
      defaultDueDays: Number(data.defaultDueDays),
      terms:          data.terms ?? '',
    });
    toast.success('Invoice settings saved.');
  };

  const saveTax = (data: TaxForm) => {
    settings.updateTax({ defaultRate: Number(data.defaultRate) });
    toast.success('Tax settings saved.');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Configure your company, invoicing, and tax preferences." />

      {/* Tab bar */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.value
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-fg'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Company tab */}
      {activeTab === 'company' && (
        <form onSubmit={companyForm.handleSubmit(saveCompany)} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-muted" />
                <CardTitle>Company Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Company Name *"
                error={companyForm.formState.errors.name?.message}
                {...companyForm.register('name')}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="GSTIN"
                  hint="15-character GST Identification Number"
                  {...companyForm.register('gstin')}
                />
                <Input
                  label="PAN"
                  hint="Permanent Account Number"
                  {...companyForm.register('pan')}
                />
              </div>
              <Input
                label="Registered Address"
                {...companyForm.register('address')}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  {...companyForm.register('city')}
                />
                <Input
                  label="State Code"
                  hint="2-digit state code (e.g. 27)"
                  error={companyForm.formState.errors.stateCode?.message}
                  {...companyForm.register('stateCode')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  {...companyForm.register('phone')}
                />
                <Input
                  label="Email"
                  type="email"
                  error={companyForm.formState.errors.email?.message}
                  {...companyForm.register('email')}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={companyForm.formState.isSubmitting}>
              Save Company Settings
            </Button>
          </div>
        </form>
      )}

      {/* Invoice tab */}
      {activeTab === 'invoice' && (
        <form onSubmit={invoiceForm.handleSubmit(saveInvoice)} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-muted" />
                <CardTitle>Invoice Numbering</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Invoice Prefix *"
                  hint='e.g. "SL" generates SL-2026-001'
                  error={invoiceForm.formState.errors.prefix?.message}
                  {...invoiceForm.register('prefix')}
                />
                <Input
                  label="Starting Number"
                  type="number"
                  min={1}
                  error={invoiceForm.formState.errors.startingNumber?.message}
                  {...invoiceForm.register('startingNumber')}
                />
              </div>
              <Input
                label="Default Due Days"
                type="number"
                min={0}
                max={365}
                hint="Auto-fills due date when creating invoices"
                error={invoiceForm.formState.errors.defaultDueDays?.message}
                {...invoiceForm.register('defaultDueDays')}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Default Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                rows={4}
                className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none transition-colors"
                placeholder="Enter default payment terms that will appear on all invoices…"
                {...invoiceForm.register('terms')}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit">Save Invoice Settings</Button>
          </div>
        </form>
      )}

      {/* Tax tab */}
      {activeTab === 'tax' && (
        <form onSubmit={taxForm.handleSubmit(saveTax)} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BadgePercent size={15} className="text-muted" />
                <CardTitle>GST Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-fg mb-2">Default GST Rate</p>
                <p className="text-xs text-muted mb-3">Applied to new invoice line items. Can be overridden per item.</p>
                <div className="flex gap-2 flex-wrap">
                  {GST_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => taxForm.setValue('defaultRate', rate)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium border transition-colors',
                        taxForm.watch('defaultRate') === rate
                          ? 'bg-accent text-white border-accent'
                          : 'bg-surface text-fg border-border hover:bg-stone-50'
                      )}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
                {taxForm.formState.errors.defaultRate && (
                  <p className="text-xs text-red-500 mt-1">{taxForm.formState.errors.defaultRate.message}</p>
                )}
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-border text-xs text-muted">
                <p className="font-medium text-fg mb-0.5">GST Breakdown Logic</p>
                <p>CGST + SGST applies when customer's state code matches your company state code (intra-state). IGST applies for inter-state transactions.</p>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit">Save Tax Settings</Button>
          </div>
        </form>
      )}

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User size={15} className="text-muted" />
                <CardTitle>Your Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ProfileRow label="Full Name"  value={user?.fullName ?? ''} />
              <ProfileRow label="Email"      value={user?.email ?? ''} />
              <ProfileRow label="Roles"      value={user?.roles?.join(', ') ?? ''} />
              <ProfileRow label="Tenant ID"  value={user?.tenantId ?? ''} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-muted" />
                <CardTitle>Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <button className="flex items-center justify-between w-full py-3 text-sm text-fg hover:text-muted transition-colors group">
                <span>Change Password</span>
                <ChevronRight size={14} className="text-muted group-hover:text-fg transition-colors" />
              </button>
              <p className="text-xs text-muted mt-1">
                Password changes are managed through your identity provider.
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center gap-1.5 text-xs text-muted px-1">
            <span>Siddhant Logistics Billing Suite · v1.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
