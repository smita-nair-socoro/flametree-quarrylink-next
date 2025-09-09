import { QUARRY_STATUS } from './quarry-enums';

export interface Quarry {
  id: number;
  quarry_name: string;
  status: QUARRY_STATUS;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}

export interface QuarryProductPrice {
  product_id: number;
  quarry_id: number;
  TN_cost_price: number;
  TN_sell_price: number;
  M3_cost_price: number;
  M3_sell_price: number;
  KG_20_cost_price: number;
  KG_20_sell_price: number;
  BULKA_cost_price: number;
  BULKA_sell_price: number;
  margin_TN: number;
  margin_M3: number;
  margin_KG: number;
  margin_BULK: number;
  available_for_sale_TN: boolean;
  available_for_sale_M3: boolean;
  available_for_sale_KG: boolean;
  available_for_sale_Bulk: boolean;
  truck_TN_rate: number;
  truck_M3_rate: number;
  truck_hourly_rate: number;
  truck_load_rate: number;
  available_truck_TN_rate: boolean;
  available_truck_M3_rate: boolean;
  available_truck_hourly_rate: boolean;
  available_truck_load_rate: boolean;
}

export interface QuarriesWithProduct {
  id: number;
  quarry_name: string;
  supplier_product_name: string;
  supplier_product_code: string;
  price: QuarryProductPrice;
}
