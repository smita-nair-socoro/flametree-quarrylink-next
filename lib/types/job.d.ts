import { AddressType } from './address';
import { Customer } from './customer';
import { MEASURE_UNIT, PRODUCT_STATUS } from './product-enums';
import { Docket } from './docket';

export enum JOB_STATUS {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
}

export interface Job {
  id: number;
  job_number: string;
  job_type: string;
  customer: Customer;
  project_name: string;
  job_status: JOB_STATUS;
  address: AddressType;
  po_number: string;
  contact_person_name: string;
  contact_person_phone: string;
  docket_email: string;
  uninvoiced_dockets: string;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}

export interface jobItems {
  id: number;
  job_id: number;
  product_id: number;
  total_quantity_required: number;
  allocated_quantity: number;
  remaining_quantity: number;
  override_cost_price_per_tn: number;
  override_sell_price_per_tn: number;
  override_cost_price_per_m3: number;
  override_sell_price_per_m3: number;
  override_cost_price_per_20kg: number;
  override_sell_price_per_20kg: 0;
  override_cost_price_per_bulka: number;
  override_sell_price_per_bulka: number;
  override_tn_truck_cost_rate: number;
  override_m3_truck_cost_rate: number;
  override_hourly_truck_cost_rate: number;
  override_load_truck_cost_rate: number;
  override_tn_truck_sell_rate: number;
  override_m3_truck_sell_rate: number;
  override_hourly_truck_sell_rate: number;
  override_load_truck_sell_rate: number;
  selected_cost_unit: MEASURE_UNIT;
  selected_sell_unit: MEASURE_UNIT;
  selected_truck_rate_type: MEASURE_UNIT;
  job_item_status: PRODUCT_STATUS;
  notes: string;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}

export interface JobDetails extends Job {
  job_items: jobItems[];
  dockets: Docket[];
}
