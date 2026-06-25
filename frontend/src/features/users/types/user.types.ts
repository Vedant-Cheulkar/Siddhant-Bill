export type UserRole = 'ADMIN' | 'ACCOUNTANT';

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  fullName?: string;
  role?: UserRole;
  active?: boolean;
  password?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
