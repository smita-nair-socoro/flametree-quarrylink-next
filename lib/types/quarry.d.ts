import { QUARRY_STATUS } from './quarry-enums';

export interface Quarry {
  id: number;
  name: string;
  status: QuarryStatus;
  type: QuarryType;
  website: string;
  email: string;
  phone: string;
  // address: number; // FK to Address.id - to be implemented
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  opening_closing_times: string;
  // weighbridge_info: string;
  notes: string;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
  suburb: string;
}

export interface QuarryProductPrice {
  product_id: number;
  quarry_id: number;
  tn_cost_price: number;
  tn_sell_price: number;
  m3_cost_price: number;
  m3_sell_price: number;
  kg_cost_price: number;
  kg_sell_price: number;
  bulka_cost_price: number;
  bulka_sell_price: number;
  margin_tn: number;
  margin_m3: number;
  margin_kg: number;
  margin_bulka: number;
  available_for_sale_tn: boolean;
  available_for_sale_m3: boolean;
  available_for_sale_kg: boolean;
  available_for_sale_bulka: boolean;
  truck_tn_rate: number;
  truck_m3_rate: number;
  truck_hourly_rate: number;
  truck_load_rate: number;
  available_truck_tn_rate: boolean;
  available_truck_m3_rate: boolean;
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
