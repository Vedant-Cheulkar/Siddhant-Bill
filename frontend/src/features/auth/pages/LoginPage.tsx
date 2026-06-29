import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, TrendingUp, Users } from 'lucide-react';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { Spinner } from '@shared/components/ui/Spinner';
import { login as apiLogin, getProfile } from '../api/auth.api';
import { getSettings } from '@features/settings/api/settings.api';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '@features/settings/store/useSettingsStore';
import { getApiErrorMessage } from '@shared/utils/apiError';
import { AppLogo } from '@shared/components/brand/AppLogo';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const FEATURES = [
  { icon: <FileText size={16} />, title: 'Invoices & work orders', desc: 'Create, issue, and track billing from quote to payment.' },
  { icon: <Users size={16} />, title: 'Customers & catalog', desc: 'Customer directory, item groups, and GST-ready line items.' },
  { icon: <TrendingUp size={16} />, title: 'Reports & dashboard', desc: 'Revenue trends and invoice status at a glance.' },
];

export function LoginPage() {
  const navigate  = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const hydrateSettings = useSettingsStore((s) => s.hydrate);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ email, password }: FormData) => {
      const tokens = await apiLogin(email, password);
      setTokens(tokens.accessToken, tokens.refreshToken);
      const profile = await getProfile();
      setUser(profile);
      const settings = await getSettings();
      hydrateSettings(settings);
    },
    onSuccess: () => navigate('/', { replace: true }),
    onError: (err) => toast.error(getApiErrorMessage(err, 'Invalid email or password.')),
  });

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-12 py-14 shrink-0">
        <div>
          <div className="mb-16">
            <div className="inline-flex rounded-2xl bg-white px-4 py-3">
              <AppLogo className="h-14" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Billing made<br />beautifully simple.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-10">
            Manage invoices, customers, and financial insights in one place.
          </p>

          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 text-white mt-0.5">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} Siddhant Logistics · All rights reserved
        </p>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <AppLogo className="h-10" />
          </div>

          <h1 className="text-2xl font-bold text-fg mb-1">Welcome back</h1>
          <p className="text-sm text-muted mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex justify-end -mt-2">
              <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isPending}>
              {isPending && <Spinner className="w-4 h-4" />}
              {isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="text-xs text-muted text-center mt-8">
            Protected by enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
}
