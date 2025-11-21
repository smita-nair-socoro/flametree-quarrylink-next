import { QUOTE_TYPE, QUOTE_STATUS } from './quotation-enums';

// Re-export the enums with PascalCase aliases for backward compatibility
export { QUOTE_TYPE as QuoteType, QUOTE_STATUS as QuoteStatus };

// DTO type for API response (uses quote_status from backend)
export interface QuotationDTO {
  id: number;
  quote_number: string;
  quote_type: QuoteType;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  account_manager: number;
  account_manager_name: string;
  project_name: string;
  quote_status: QuoteStatus; // Backend uses quote_status
  delivery_address: string; // For display purposes (from API response)
  delivery_address_id: number; // Backend expects this for create/update
  job_id: number;
  delivery_start_date: string | null;
  expiry_date: string | null;
  delivery_window_start: string | null;
  delivery_window_end: string | null;
  total_cost_price: number;
  total_sell_price: number;
  total_truck_sell_price: number;
  total_truck_cost_price: number;
  gross_profit: number;
  gross_profit_percentage: number;
  line_items_count: number;
  converted_at?: string;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string | null;
  updated_at: string;
  last_modified_by: string;
  line_items: QuotationLineItem[];
}

// Frontend type (uses status for consistency with columns)
export interface Quotation {
  id: number;
  quote_number: string;
  quote_type: QuoteType;
  customer_id: number; // FK to Customer.id
  customer_name: string;
  customer_email: string;
  account_manager: number; // FK to User.id
  account_manager_name: string;
  project_name: string;
  status: QuoteStatus;
  delivery_address: string;
  delivery_address_id: number;
  job_id: number;
  delivery_start_date: string;
  expiry_date: string;
  delivery_window_start: string;
  delivery_window_end: string;
  total_cost_price: number;
  total_sell_price: number;
  total_truck_sell_price: number;
  total_truck_cost_price: number;
  gross_profit: number;
  gross_profit_percentage: number;
  line_items_count: number;
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
