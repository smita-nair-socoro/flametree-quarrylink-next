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

export interface TeamMember {
  id: number;
  tenant_id: string;
  user_name: string;
  full_name?: string | null;
  email: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  last_login_at: string | null;
  joined_at?: string | null;
  total_logins?: number | null;
  quotation_created?: number | null;
  jobs_managed?: number | null;
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
