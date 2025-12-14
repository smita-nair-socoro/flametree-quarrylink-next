import { QuarryStatus, QuarryType } from './quarry-enums';
import { Address } from './address';

export interface Quarry {
  id: number;
  name: string;
  status: QuarryStatus;
  quarry_supplier_type: QuarryType;
  website: string;
  email: string;
  phone: string;
  address: Address;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  opening_closing_info: string;
  weighbridge_info: string;
  notes: string;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
  // Computed property for table display (extracted from address.suburb)
  suburb?: string;
}

export interface QuarrySupplierProduct {
  quarry_supplier?: {
    id: number;
    name: string;
  };
  quarry_supplier_id: number;
  product_id: number;
  supplier_product_name: string;
  supplier_product_code: string;
  quarry_name?: string;

  per_tn_cost_price: number;
  per_tn_sell_price: number;
  per_m3_cost_price: number;
  per_m3_sell_price: number;
  per20kg_cost_price: number;
  per20kg_sell_price: number;
  per_bulka_cost_price: number;
  per_bulka_sell_price: number;

  available_for_sale_tn: boolean;
  available_for_sale_m3: boolean;
  available_for_sale20kg: boolean;
  available_for_sale_bulka: boolean;

  tn_truck_rate: number;
  m3_truck_rate: number;
  hourly_truck_rate: number;
  load_truck_rate: number;
  available_for_truck_rate_tn: boolean;
  available_for_truck_rate_m3: boolean;
  available_for_truck_rate_hour: boolean;
  available_for_truck_rate_load: boolean;

  is_active: boolean;
  available_units: string; // e.g. "[\"TN\", \"M3\"]"
  version: number;
}

export interface ArchiveDeleteSummaryDto {
  id: number;
  message?: string;
  deletedCount?: number;
  affectedEntities?: string[];
}
export type QuarriesWithProduct = QuarrySupplierProduct;
