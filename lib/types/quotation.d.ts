export enum QUOTE_TYPE {
  COLLECTION = 'COLLECTION',
  DELIVERY = 'DELIVERY',
}

export enum QUOTE_STATUS {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CONVERTED_TO_JOB = 'CONVERTED TO JOB',
  EXPIRED = 'EXPIRED',
  DECLINED = 'DECLINED',
  ARCHIVED = 'ARCHIVED',
}

export enum CUSTOMER_TYPE {
  BUSINESS = 'BUSINESS',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum CUSTOMER_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Quotation {
  id: number;
  customer_id: number;
  job_id: number;
  quote_number: string;
  quote_type: QUOTE_TYPE;
  project_name: string;
  site_address: string;
  delivery_date: string;
  expiry_date: string;
  delivery_window_start: string;
  delivery_window_end: string;
  job_name: string;
  total_cost_price: number;
  total_sell_price: number;
  quote_status: QUOTE_STATUS;
  account_manager: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
  converted_at: string;
}

export interface QuotationDetails extends Quotation {
  customer: Customer;
  quarry_products: QuarriesWithPrice[];
}

interface QuotationDetailsResponse {
  items: QuotationDetails[];
}

//TODO: This is temporary we need proper schema for customer, job and products (line items)...
//
// dummy customer schema
export interface Customer {
  id: number;
  customer_type: CUSTOMER_TYPE;
  business_name: string;
  contact_name: string;
  phone: string;
  email: string;
  billing_address: string;
  credit_limit: number;
  payment_terms: string;
  account_manager: string;
  customer_status: CUSTOMER_STATUS;
  jobs_count: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}
