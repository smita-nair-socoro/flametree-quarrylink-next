import { AddressType } from './address';
import { Job } from './job';
import {
  COST_UNIT,
  QUOTE_ITEM_STATUS,
  QUOTE_STATUS,
  TRUCK_RATE_TYPE,
} from './quotation-enums';

export interface QuoteItem {
  id: number;
  quote_id: number;
  product_id: number;
  total_quantity_required: number;
  remaining_quantity: number;
  override_cost_price_per_tn: number;
  override_sell_price_per_tn: number;
  override_cost_price_per_m3: number;
  override_sell_price_per_m3: number;
  override_cost_price_per_20kg: number;
  override_sell_price_per_20kg: number;
  override_cost_price_per_bulka: number;
  override_sell_price_per_bulka: number;
  override_tn_truck_cost_rate: number;
  override_m3_truck_cost_rate: number;
  override_hourly_truck_cost_rate: number;
  override_load_truck_cost_rate: number;
  override_tn_truck_sell_rate: number;
  override_m3_truck_sell_rate: number;
  override_hourly_truck_sell_rate: number;
  selected_cost_unit: COST_UNIT;
  selected_sell_unit: COST_UNIT;
  selected_truck_rate_type: TRUCK_RATE_TYPE;
  quote_item_status: QUOTE_ITEM_STATUS;
  notes: string;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}

export enum QUOTE_ITEM_STATUS {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum COST_UNIT {
  TN = 'TN',
  M3 = 'M3',
  KG_20 = 'KG_20',
  BULKA = 'BULKA',
}

export enum TRUCK_RATE_TYPE {
  TN = 'TN',
  HOURLY = 'HOURLY',
  M3 = 'M3',
  LOAD = 'LOAD',
}

export interface QuoteItem {
  id: number;
  quote_id: number;
  product_id: number;
  total_quantity_required: number;
  remaining_quantity: number;
  override_cost_price_per_tn: number;
  override_sell_price_per_tn: number;
  override_cost_price_per_m3: number;
  override_sell_price_per_m3: number;
  override_cost_price_per_20kg: number;
  override_sell_price_per_20kg: number;
  override_cost_price_per_bulka: number;
  override_sell_price_per_bulka: number;
  override_tn_truck_cost_rate: number;
  override_m3_truck_cost_rate: number;
  override_hourly_truck_cost_rate: number;
  override_load_truck_cost_rate: number;
  override_tn_truck_sell_rate: number;
  override_m3_truck_sell_rate: number;
  override_hourly_truck_sell_rate: number;
  selected_cost_unit: COST_UNIT;
  selected_sell_unit: COST_UNIT;
  selected_truck_rate_type: TRUCK_RATE_TYPE;
  quote_item_status: QUOTE_ITEM_STATUS;
  notes: string;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
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
  quote_items: QuoteItem[];
}

interface QuotationDetailsResponse {
  items: QuotationDetails[];
}
