export enum QUOTE_TYPE {
  COLLECTION = 'Collection',
  DELIVERY = 'Delivery',
}

export enum QUOTE_STATUS {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  CONVERTED_TO_JOB = 'Converted to Job',
  EXPIRED = 'Expired',
  DECLINED = 'Declined',
  ARCHIVED = 'Archived',
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
  total_cost_price: string;
  total_sell_price: string;
  status: QUOTE_STATUS;
  account_manager: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
  converted_at: string;
}

export interface QuotationDetails extends Quotation {
  customer: Customer;
  quarryProducts: QuarriesWithPrice[];
}

//TODO: This is temporary we need proper schema for customer, job and products (line items)...
//
// dummy customer schema
export interface Customer {
  id: number;
  name: string;
}
