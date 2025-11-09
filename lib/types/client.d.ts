import { ClientStatus, InvoiceStatus, SubscriptionPlan } from './client-enums';
import { TeamMember } from './user';

export interface ClientsOverview {
  total_client: number;
  active_client: number;
  mmr: number;
}

export interface Client {
  id: number;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  subscription: SubscriptionPlan;
  subscription_payment_term: string;
  client_status: ClientStatus;
  abn: string;
  billing_address: number; // Address.id
  next_billing: string;
  invoices: BillingHistory;
  stripe_profile: string;
  total_users: number;
  total_quarries: number;
  user?: TeamMember[];
  isDeleted: boolean;
  last_login_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}

export interface BillingHistory {
  invoice: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  stripe_link: string;
}
