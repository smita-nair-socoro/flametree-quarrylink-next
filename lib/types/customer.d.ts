import { CUSTOMER_STATUS, CUSTOMER_TYPE } from './customer-enums';

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
  id: number;
  customerType: CUSTOMER_TYPE;
  contactName: string;
  phone: string;
  email: string;
  billingAddressId: number;
  creditLimit: number;
  invoiceDueDate: number;
  paymentTermType: string;
  accountManagerName?: string;
  accountManagerSub: string;
  customerStatus: CUSTOMER_STATUS;
  jobsCount: number;
  paymentType: string;
  version: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  lastModifiedBy?: string;

  // BUSINESS type specific fields
  businessName?: string;
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

  // Come back to this; Currently below are not included in the DTO
  remainingCredit?: number;
}

export interface CustomerDetails extends Customer {
  jobs: Job[];
}
