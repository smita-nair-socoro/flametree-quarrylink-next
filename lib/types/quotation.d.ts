export enum QuoteType {
  COLLECTION = 'COLLECTION',
  DELIVERY = 'DELIVERY',
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CONVERTED_TO_JOB = 'CONVERTED_TO_JOB',
  EXPIRED = 'EXPIRED',
  DECLINED = 'DECLINED',
  ARCHIVED = 'ARCHIVED',
}

export interface Quotation {
  id: number;
  quote_number: string;
  quote_type: QuoteType;
  customer_id: number; // FK to Customer.id
  customer_name: string;
  account_manager: number; // FK to User.id
  account_manager_name: string;
  project_name: string;
  status: QuoteStatus;
  delivery_address: string; // FK to Address.id (String for now; will change it later)
  job_id: number; // FK to Job.id (if converted)
  delivery_start_date: string;
  expiry_date: string;
  delivery_window_start: string;
  delivery_window_end: string;
  total_cost_price: number;
  total_sell_price: number;
  converted_at?: string;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
  line_items: QuotationLineItem[];
}

export interface QuotationLineItem {
  id: number;
  quote_id: number; // FK to Quote.id
  product_id: number; // FK to Product.id
  quarry_id: number; // FK to Quarry.id
  quarry_product_id: number; // FK to QuarryProduct.id
  product_name: string;
  quarry_name: string;
  supplier_product_name: string;
  product_cost_uom: string;
  product_cost_qty: number;
  product_cost_price: number;
  total_product_cost_price: number;
  product_sell_uom: string;
  product_sell_qty: number;
  product_sell_price: number;
  total_product_sell_price: number;
  truck_type: string;
  truck_cost_uom: string;
  truck_cost_qty: number;
  truck_cost_price: number;
  total_truck_cost_price: number;
  truck_sell_uom: string;
  truck_sell_qty: number;
  truck_sell_price: number;
  total_truck_sell_price: number;
  required_loads: number;
  gross_profit: number;
  total_quantity_required: number;
  allocated_quantity: number;
  remaining_quantity: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}
