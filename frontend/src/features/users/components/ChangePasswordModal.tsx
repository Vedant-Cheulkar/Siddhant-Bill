import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { Modal } from '@shared/components/ui/Modal';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { changePassword } from '@features/users/api/users.api';
import { useAuthStore } from '@features/auth/store/authStore';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const logout = useAuthStore((s) => s.logout);

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
  });

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password updated. Please sign in again.');
      form.reset();
      onClose();
      logout();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.replace('/login');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to change password');
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Change password" description="Enter your current password and choose a new one.">
      <form
        onSubmit={form.handleSubmit((d) =>
          mutation.mutate({ currentPassword: d.currentPassword, newPassword: d.newPassword }),
        )}
        className="px-6 pb-6 space-y-4"
      >
        <Input
          label="Current password"
          type="password"
          error={form.formState.errors.currentPassword?.message}
          {...form.register('currentPassword')}
        />
        <Input
          label="New password"
          type="password"
          error={form.formState.errors.newPassword?.message}
          {...form.register('newPassword')}
        />
        <Input
          label="Confirm new password"
          type="password"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Updating…' : 'Update password'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
