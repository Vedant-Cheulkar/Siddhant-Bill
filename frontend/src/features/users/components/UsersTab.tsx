import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { UserPlus, KeyRound, UserX, UserCheck } from 'lucide-react';
import { typedZodResolver } from '@shared/utils/typedZodResolver';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/Card';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { Modal } from '@shared/components/ui/Modal';
import { Spinner } from '@shared/components/ui/Spinner';
import { useAuthStore } from '@features/auth/store/authStore';
import { useCreateUser, useUpdateUser, useUsers } from '@features/users/hooks/useUsers';
import type { UserRole, UserSummary } from '@features/users/types/user.types';
import { cn } from '@shared/utils/cn';

const inviteSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email:    z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Za-z]/, 'Include at least one letter')
    .regex(/[0-9]/, 'Include at least one number'),
  role: z.enum(['ADMIN', 'ACCOUNTANT']),
});
type InviteForm = z.infer<typeof inviteSchema>;

const resetSchema = z
  .object({
    password:        z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type ResetForm = z.infer<typeof resetSchema>;

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Admin',
  ACCOUNTANT: 'Accountant',
};

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium border',
        role === 'ADMIN'
          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
          : 'bg-stone-50 text-stone-700 border-stone-200',
      )}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

export function UsersTab() {
  const currentUser = useAuthStore((s) => s.user);
  const { data: users, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [resetUser, setResetUser] = useState<UserSummary | null>(null);

  const inviteForm = useForm<InviteForm>({
    resolver: typedZodResolver<InviteForm>(inviteSchema),
    defaultValues: { role: 'ACCOUNTANT' },
  });

  const resetForm = useForm<ResetForm>({
    resolver: typedZodResolver<ResetForm>(resetSchema),
  });

  const onInvite = (data: InviteForm) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setInviteOpen(false);
        inviteForm.reset({ role: 'ACCOUNTANT' });
      },
    });
  };

  const onResetPassword = (data: ResetForm) => {
    if (!resetUser) return;
    updateMutation.mutate(
      { id: resetUser.id, data: { password: data.password } },
      {
        onSuccess: () => {
          setResetUser(null);
          resetForm.reset();
        },
      },
    );
  };

  const toggleActive = (user: UserSummary) => {
    updateMutation.mutate({ id: user.id, data: { active: !user.active } });
  };

  const toggleRole = (user: UserSummary) => {
    const next: UserRole = user.role === 'ADMIN' ? 'ACCOUNTANT' : 'ADMIN';
    updateMutation.mutate({ id: user.id, data: { role: next } });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <CardTitle>Team members</CardTitle>
            <p className="text-xs text-muted mt-1">
              Create accounts for your accountant and staff. Share email and password with them to log in.
            </p>
          </div>
          <Button type="button" onClick={() => setInviteOpen(true)}>
            <UserPlus size={14} />
            Invite user
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {(users ?? []).map((u) => (
                <div key={u.id} className="flex flex-col gap-3 sm:flex-row sm:items-center py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                    {u.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-fg truncate">{u.fullName}</p>
                    <p className="text-xs text-muted truncate">{u.email}</p>
                  </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 sm:shrink-0">
                  <RoleBadge role={u.role} />
                  <span
                    className={cn(
                      'text-xs font-medium',
                      u.active ? 'text-emerald-600' : 'text-muted',
                    )}
                  >
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      title="Reset password"
                      onClick={() => setResetUser(u)}
                    >
                      <KeyRound size={13} />
                    </Button>
                    {u.id !== currentUser?.id && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          title={u.role === 'ADMIN' ? 'Make accountant' : 'Make admin'}
                          onClick={() => toggleRole(u)}
                          disabled={updateMutation.isPending}
                        >
                          {ROLE_LABEL[u.role === 'ADMIN' ? 'ACCOUNTANT' : 'ADMIN']}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          title={u.active ? 'Deactivate' : 'Activate'}
                          onClick={() => toggleActive(u)}
                          disabled={updateMutation.isPending}
                        >
                          {u.active ? <UserX size={13} /> : <UserCheck size={13} />}
                        </Button>
                      </>
                    )}
                  </div>
                  </div>
                </div>
              ))}
              {(users ?? []).length === 0 && (
                <p className="text-sm text-muted py-6 text-center">No users yet. Invite your first team member.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite team member"
        description="Set a temporary password and share it with them. They can change it after logging in."
      >
        <form onSubmit={inviteForm.handleSubmit(onInvite)} className="px-6 pb-6 space-y-4">
          <Input
            label="Full name *"
            error={inviteForm.formState.errors.fullName?.message}
            {...inviteForm.register('fullName')}
          />
          <Input
            label="Email *"
            type="email"
            placeholder="accountant@company.com"
            error={inviteForm.formState.errors.email?.message}
            {...inviteForm.register('email')}
          />
          <Input
            label="Temporary password *"
            type="password"
            placeholder="Min 8 chars, letter + number"
            error={inviteForm.formState.errors.password?.message}
            {...inviteForm.register('password')}
          />
          <div>
            <p className="text-sm font-medium text-fg mb-2">Role</p>
            <div className="flex gap-2">
              {(['ACCOUNTANT', 'ADMIN'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => inviteForm.setValue('role', role)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors',
                    inviteForm.watch('role') === role
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface border-border hover:bg-bg-subtle',
                  )}
                >
                  {ROLE_LABEL[role]}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">
              Accountants can manage customers, invoices, and reports. Admins can also manage users.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create user'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!resetUser}
        onClose={() => setResetUser(null)}
        title="Reset password"
        description={resetUser ? `Set a new password for ${resetUser.fullName}` : undefined}
      >
        <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="px-6 pb-6 space-y-4">
          <Input
            label="New password *"
            type="password"
            error={resetForm.formState.errors.password?.message}
            {...resetForm.register('password')}
          />
          <Input
            label="Confirm password *"
            type="password"
            error={resetForm.formState.errors.confirmPassword?.message}
            {...resetForm.register('confirmPassword')}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setResetUser(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Update password'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
