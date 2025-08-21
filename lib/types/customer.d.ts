export interface Customer {
  id: number;
  customer_type: CUSTOMER_TYPE;
  business_name: string;
  business_email: string;
  business_phone: string;
  contact_name: string;
  phone: string;
  email: string;
  billing_address: string;
  credit_limit: number;
  remaining_credit: number;
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

export interface CustomerDetails extends Customer {
  jobs: Job[];
}
