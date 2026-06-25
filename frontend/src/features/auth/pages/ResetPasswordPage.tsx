import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { Spinner } from '@shared/components/ui/Spinner';
import { resetPassword } from '../api/password.api';
import { getApiErrorMessage } from '@shared/utils/apiError';

const schema = z
  .object({
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string().min(8, 'At least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => resetPassword(token, data.newPassword),
    onSuccess: () => {
      toast.success('Password updated. Please sign in.');
      navigate('/login', { replace: true });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Unable to reset password.')),
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted">Invalid or missing reset link.</p>
          <Link to="/forgot-password" className="text-accent hover:underline text-sm">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Set new password</h1>
          <p className="text-sm text-muted mt-1">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Spinner className="w-4 h-4" /> : 'Update password'}
          </Button>
        </form>

        <p className="text-sm text-center text-muted">
          <Link to="/login" className="text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
