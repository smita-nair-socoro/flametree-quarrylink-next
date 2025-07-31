export enum CUSTOMER_TYPE {
  BUSINESS = 'BUSINESS',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum CUSTOMER_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

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
