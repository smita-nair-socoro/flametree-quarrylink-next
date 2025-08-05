import { AddressType } from './address';
import { Job } from './job';
import { QuarriesWithPrice } from './quarry';

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

export interface Quotation {
  id: number;
  customer_id: number;
  job_id: number;
  quote_number: string;
  quote_type: QUOTE_TYPE;
  project_name: string;
  site_address: AddressType;
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
  job: Job;
  quarry_products: QuarriesWithPrice[];
}

interface QuotationDetailsResponse {
  items: QuotationDetails[];
}
