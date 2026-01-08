import { CUSTOMER_STATUS, CUSTOMER_TYPE } from './customer-enums';
import { Address } from './address';

export interface Customer {
  id: number;
  customer_type: CUSTOMER_TYPE;
  business_name: string;
  business_email: string;
  business_phone: string;
  abn: string;
  acn: string;
  contact_name: string;
  phone: string;
  email: string;
  billing_address_id: number;
  credit_limit: number;
  remaining_credit: number;
  payment_type: string;
  payment_terms_day: number;
  payment_term_type: string;
  invoice_due_date: number;
  payment_terms: string;
  account_manager: string;
  customer_status: CUSTOMER_STATUS;
  jobs_count: number;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}

export interface CustomerDTO {
  id?: number; // Optional for create, required for update
  customerType: CUSTOMER_TYPE;
  contactName: string;
  phone: string;
  email: string;
  billingAddressId?: number;
  billingAddress: Address;
  creditLimit: number;
  accountManagerSub: string;
  invoiceDueDate: number;
  paymentTermType: string;
  customerStatus: CUSTOMER_STATUS;
  jobsCount: number;
  paymentType: string;
  version: number;

  // Optional metadata fields
  accountManagerName?: string;
  accountManagerEmail?: string;
  remainingCredit?: number;
  isDeleted?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  lastModifiedBy?: string;

  // BUSINESS type specific fields
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  legalName?: string;
  tradingName?: string;
  abn?: string;
  acn?: string;
  vatNumber?: string;

  // INDIVIDUAL type specific fields
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  govId?: string;
}

export interface CustomerDetails extends Customer {
  jobs: Job[];
}

export interface CustomerReporting {
  totalCustomers: number;
  totalCustomersChangePercentThisMonth: number;
  totalActiveCustomers: number;
  activeCustomersPercentOfTotal: number;
  totalActiveBusinessCustomers: number;
  businessCustomerQuotesPercent: number;
  totalActiveIndividualCustomers: number;
  individualCustomerQuotesPercent: number;
}
