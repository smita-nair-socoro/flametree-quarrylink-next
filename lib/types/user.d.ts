import { Role, UserStatus } from './user-enums';

/**
 * User interface matching backend DTO structure
 */
export interface User {
  sub: string; // AWS Cognito user ID (UUID) - this is the primary user identifier
  username: string; // Same as sub
  email: string;
  enabled: boolean;
  status: string; // "ACTIVE", "INACTIVE", "PENDING", etc.
  name: string;
  tenantId?: string;
  phone?: string;
  groups: string[]; // Array of group names like ["super_admin", "admin"]

  // Optional fields
  id?: number; // For backward compatibility
  clientId?: number;
  deletedReason?: string;
  isDeleted?: boolean;
  jobsManaged?: number;
  totalLogins?: number;
  quotationCreated?: number;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO for creating a new user (invite user)
 * Backend expects this structure for POST /api/users
 */
export interface UserCreateDTO {
  email: string;
  name: string;
  phone?: string;
  role: string; // "USER", "ADMIN", or "SUPER_ADMIN"
  confirmed: boolean; // false for new invitations
}

/**
 * DTO for updating an existing user
 * Backend expects this structure for PUT /api/users/:id
 */
export interface UserUpdateDTO {
  name: string;
  phone?: string;
  role: string; // "USER", "ADMIN", or "SUPER_ADMIN"
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
