import { Role, UserStatus } from './user-enums';

export interface User {
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
