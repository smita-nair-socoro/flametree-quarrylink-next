import { Role, UserStatus } from './user-enums';

/**
 * Legacy User interface - kept for backward compatibility during migration
 * @deprecated Use User interface instead after migration is complete
 */
export interface UserLegacy {
  id: number;
  tenant_id: string;
  client_id: number;
  status: UserStatus;
  full_name: string;
  phone: string;
  email: string;
  role: Role;
  total_logins: number;
  quotation_created: number;
  jobs_managed: number;
  invited_by: number;
  deletion_reason: string;
  isDeleted: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

/**
 * User interface matching backend DTO structure
 */
export interface User {
  id: number;
  tenantId: number;
  clientId?: number;
  status: UserStatus;
  name: string;
  phone?: string;
  email: string;
  groups: string[]; // Array of group names like ["super_admin", "admin"]
  totalLogins?: number;
  quotationCreated?: number;
  lastLoginAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * @deprecated Use User interface instead. TeamMember is being phased out
 * as both team member management and client user management share the same backend structure.
 */
export interface TeamMember {
  id: number;
  tenant_id: string;
  user_name: string;
  email: string;
  role: Role;
  status: UserStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PendingInvitation {
  id: number;
  tenant_id: string;
  email: string;
  role: Role;
  invited_by: string;
  expires_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  invoice_amount: number;
  invoice_status: string;
}
