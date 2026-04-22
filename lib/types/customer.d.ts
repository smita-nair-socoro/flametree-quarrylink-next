import {
  CUSTOMER_STATUS,
  CUSTOMER_TYPE,
  PAYMENT_TYPE,
  PAYMENT_TERM_TYPE,
} from './customer-enums';
import { Address } from './address';

export interface CustomerDTO {
  id?: number;
  customerType: CUSTOMER_TYPE;

  businessName?: string;
  individualContactName?: string;

  businessPhone?: string;
  businessEmail?: string;

  billingAddressId?: number;
  billingAddress?: AddressDTO;

  creditLimit: number;
  accountManagerName?: string;
  accountManagerSub: string;
  invoiceDueDateDayCount?: number;
  paymentTermType?: PAYMENT_TERM_TYPE;
  customerStatus?: CUSTOMER_STATUS;
  paymentType: PAYMENT_TYPE;

  contactPersonFirstName?: string;
  contactPersonLastName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;

  abn?: string;
  acn?: string;
  vatNumber?: string;

  dateOfBirth?: string;
  govId?: string;

  version: number;

  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  lastModifiedBy?: string;
  isDeleted?: boolean;
}

/** Response type for create/update — extends CustomerDTO with server-generated fields */
export interface CustomerResponseDTO extends CustomerDTO {
  accSoftwareNotes?: string;
}

export interface CustomerWithAddressResponseDTO {
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
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;

  // Optional metadata fields
  accountManagerName?: string;
  accountManagerEmail?: string;
  remainingCredit?: number;

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
