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
  contactName: string;
  email: string;
  phone: string;
  subscription: SubscriptionPlan;
  subscriptionPaymentTerm: string;
  clientStatus: ClientStatus;
  abn: string;
  billingAddress: number; // Address.id
  nextBilling: string;
  invoices: BillingHistory;
  stripeProfile: string;
  totalUsers: number;
  totalQuarries: number;
  user?: User[];
  isDeleted: boolean;
  lastLoginAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
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
  subscriptions: Array<{
    subscriptionId: string;
    subscriptionPlan?: string;
    status: string;
    items: Array<{
      subscriptionItemId: string;
      productId: string;
      productName?: string;
      quantity: number;
      unitAmountInCents: number;
      currency: string;
    }>;
  }>;
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
  /** ISO 4217 currency code (lowercase), e.g. "aud", "nzd", "usd". Backfilled to "aud". */
  currency?: string;
  /** Tax rate as a percentage, e.g. 10. Backfilled to 10. */
  taxAmount?: number;
  /** Tax label, e.g. "GST". Backfilled to "GST". */
  taxType?: string;
}

export interface TenantCompleteDetails {
  tenantDetails: TenantDetails;
  subscriptionAndInvoices: SubscriptionsAndInvoices;
}

export interface TenantLogoUploadResponse {
  s3Key: string;
}

export interface TenantLogoResponse {
  logoPublicS3Url: string;
  tenantBusinessName: string;
}
