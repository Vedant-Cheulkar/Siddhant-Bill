export interface CustomerResponse {
  id: string;
  code: string;
  name: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
  billingStateCode?: string;
  creditDays: number;
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Matches CustomerRequest.java validation constraints */
export interface CustomerRequest {
  code: string;              // NotBlank, 2-30, [A-Za-z0-9_-]
  name: string;              // NotBlank, 2-300
  billingStateCode: string;  // NotBlank, exactly 2 chars
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
  creditDays?: number;
  active?: boolean;
  notes?: string;
}
