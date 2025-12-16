import { ClientStatus, InvoiceStatus, SubscriptionPlan } from './client-enums';
import { User } from './user';

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
  user?: User[];
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

export interface Subscriptions {
  stripeCustomerId: string;
  subscriptions: [
    {
      subscriptionId: string;
      subscriptionPlan?: string;
      status: string;
      items: [
        {
          subscriptionItemId: string;
          productId: string;
          productName?: string;
          quantity: number;
          unitAmountInCents: number;
          currency: string;
        }
      ];
    }
  ];
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber?: string;
  hostedInvoiceUrl?: string;
  invoicePdfUrl?: string;
  status: string;
  amountDueInCents: number;
  amountPaidInCents: number;
  amountRemainingInCents: number;
  currency: string;
  createdAt?: string;
  createdAtEpochSeconds: number;
  dueDateEpochSeconds?: number;
}

export interface SubscriptionsAndInvoices {
  subscriptions: Subscriptions;
  invoices: Invoice[];
}

export interface TenantDetails {
  tenantName: string;
  tenantInitials?: string;
  businessName?: string;
  email: string;
}

export interface TenantCompleteDetails {
  tenantDetails: TenantDetails;
  subscriptionAndInvoices: SubscriptionsAndInvoices;
}
