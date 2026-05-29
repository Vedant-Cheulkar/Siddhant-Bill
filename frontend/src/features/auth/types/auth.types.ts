export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Matches UserProfileResponse.java */
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  tenantId: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
}
