import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Building2, FileText, BadgePercent, User, Lock, ChevronRight, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/Card';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { PageHeader } from '@shared/components/widgets/PageHeader';
import { useAuthStore } from '@features/auth/store/authStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useOrgSettings, useSaveSettings } from '../hooks/useOrgSettings';
import { getApiErrorMessage } from '@shared/utils/apiError';
import { cn } from '@shared/utils/cn';
import {
  refineIndianTaxIds,
  zIndianStateCode,
  zOptionalEmail,
  zOptionalGstin,
  zOptionalIndianPhone,
  zOptionalIndianStateCode,
  zOptionalPan,
} from '@shared/validation/india.schemas';
import { UsersTab } from '@features/users/components/UsersTab';
import { ChangePasswordModal } from '@features/users/components/ChangePasswordModal';

type Tab = 'company' | 'invoice' | 'tax' | 'users' | 'profile';

const baseTabs: { label: string; value: Tab; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { label: 'Company',  value: 'company',  icon: <Building2 size={14} /> },
  { label: 'Invoice',  value: 'invoice',  icon: <FileText size={14} /> },
  { label: 'Tax',      value: 'tax',      icon: <BadgePercent size={14} /> },
  { label: 'Users',    value: 'users',    icon: <Users size={14} />, adminOnly: true },
  { label: 'Profile',  value: 'profile',  icon: <User size={14} /> },
];

/* ── Company schema ──────────────────────────────────────────── */
const companySchema = refineIndianTaxIds(
  z.object({
    name:      z.string().min(2, 'Company name is required'),
    gstin:     zOptionalGstin,
    pan:       zOptionalPan,
    address:   z.string().max(500, 'Max 500 characters').optional(),
    city:      z.string().max(100, 'Max 100 characters').optional(),
    stateCode: zOptionalIndianStateCode,
    phone:     zOptionalIndianPhone,
    email:     zOptionalEmail,
  }),
);
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
  const isAdmin = user?.roles?.includes('ADMIN') ?? false;
  const tabs = baseTabs.filter((t) => !t.adminOnly || isAdmin);
  const settings = useSettingsStore();
  const { isLoading: settingsLoading } = useOrgSettings();
  const saveSettings = useSaveSettings();
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [passwordOpen, setPasswordOpen] = useState(false);

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

  const saveCompany = async (data: CompanyForm) => {
    try {
      await saveSettings.mutateAsync({ company: data });
      settings.updateCompany(data);
      toast.success('Company settings saved.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save company settings.'));
    }
  };

  const saveInvoice = async (data: InvoiceForm) => {
    const invoice = {
      prefix: data.prefix,
      startingNumber: Number(data.startingNumber),
      defaultDueDays: Number(data.defaultDueDays),
      terms: data.terms ?? '',
    };
    try {
      await saveSettings.mutateAsync({ invoice });
      settings.updateInvoice(invoice);
      toast.success('Invoice settings saved.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save invoice settings.'));
    }
  };

  const saveTax = async (data: TaxForm) => {
    const tax = { defaultRate: Number(data.defaultRate) };
    try {
      await saveSettings.mutateAsync({ tax });
      settings.updateTax(tax);
      toast.success('Tax settings saved.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save tax settings.'));
    }
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
                  placeholder="27AABCM1234F1Z5"
                  error={companyForm.formState.errors.gstin?.message}
                  maxLength={15}
                  className="uppercase font-mono"
                  {...companyForm.register('gstin')}
                />
                <Input
                  label="PAN"
                  placeholder="ABCDE1234F"
                  error={companyForm.formState.errors.pan?.message}
                  maxLength={10}
                  className="uppercase font-mono"
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
                  hint="2-digit GST state code (e.g. 27 = Maharashtra)"
                  error={companyForm.formState.errors.stateCode?.message}
                  maxLength={2}
                  inputMode="numeric"
                  {...companyForm.register('stateCode')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  hint="10-digit Indian mobile (starts with 6–9)"
                  error={companyForm.formState.errors.phone?.message}
                  inputMode="tel"
                  maxLength={14}
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
            <Button type="submit" disabled={companyForm.formState.isSubmitting || settingsLoading || saveSettings.isPending}>
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

      {/* Users tab (admin only) */}
      {activeTab === 'users' && isAdmin && <UsersTab />}

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
              <button
                type="button"
                onClick={() => setPasswordOpen(true)}
                className="flex items-center justify-between w-full py-3 text-sm text-fg hover:text-muted transition-colors group"
              >
                <span>Change Password</span>
                <ChevronRight size={14} className="text-muted group-hover:text-fg transition-colors" />
              </button>
              <p className="text-xs text-muted mt-1">
                Update your password. You will be signed out after changing it.
              </p>
            </CardContent>
          </Card>

          <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />

          <div className="flex items-center gap-1.5 text-xs text-muted px-1">
            <span>Siddhant Logistics Billing Suite · v1.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
