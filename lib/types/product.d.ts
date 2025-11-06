import { BASE_UNIT, MEASURE_UNIT, PRODUCT_STATUS } from './product-enums';
import { Quotation } from './quotation';
import { JobDetails } from './job';
import { QuarriesWithProduct } from './quarry';

export interface Product {
  id: number;
  product_name: string;
  product_code: string;
  material: MaterialType;
  density_tonnage_per_m3: number;
  product_description: string;
  base_unit: BASE_UNIT;
  measure_unit: MEASURE_UNIT[];
  is_active: boolean;
  cost_price: number;
  sell_price: number;
  margin: number;
  status: PRODUCT_STATUS;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}

export interface MaterialType {
  id: number;
  name: string;
  version: number;
}

export interface ProductDetails extends Product {
  quarries: QuarriesWithProduct[];
  quotes: Quotation[];
  jobs: JobDetails[];
}
