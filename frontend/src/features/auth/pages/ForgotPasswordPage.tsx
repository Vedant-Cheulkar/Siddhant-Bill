import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { Spinner } from '@shared/components/ui/Spinner';
import { forgotPassword } from '../api/password.api';
import { getApiErrorMessage } from '@shared/utils/apiError';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => forgotPassword(data.email),
    onSuccess: (data) => {
      setResetUrl(data.resetUrl ?? null);
      toast.success(data.message);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Unable to process request.')),
  });

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Forgot password</h1>
          <p className="text-sm text-muted mt-1">
            Enter your account email. We will generate a one-time reset link (no email server required).
          </p>
        </div>

        <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Spinner className="w-4 h-4" /> : 'Generate reset link'}
          </Button>
        </form>

        {resetUrl && (
          <div className="rounded-xl border border-accent/30 bg-accent-bg p-4 space-y-2">
            <p className="text-sm font-medium text-fg">Reset link (valid 1 hour)</p>
            <a href={resetUrl} className="text-xs text-accent break-all hover:underline">
              {resetUrl}
            </a>
            <p className="text-xs text-muted">Open this link to set a new password.</p>
          </div>
        )}

        <p className="text-sm text-center text-muted">
          <Link to="/login" className="text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
