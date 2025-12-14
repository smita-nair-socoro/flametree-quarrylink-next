import { BASE_UNIT, MEASURE_UNIT, PRODUCT_STATUS } from './product-enums';
import { Quotation } from './quotation';
import { JobDetails } from './job';
import { QuarrySupplierProduct } from './quarry';

export interface Product {
  id: number;
  productName: string;
  productCode: string;
  material: MaterialType;
  materialId: number;
  densityTonnagePerM3: number;
  productDescription: string;
  baseUnit: BASE_UNIT;
  measureUnit: MEASURE_UNIT[];
  isActive: boolean;
  costPrice: number;
  sellPrice: number;
  margin: number;
  status: PRODUCT_STATUS;
  version: number;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
}

export interface MaterialType {
  id: number;
  name: string;
  version: number;
}

export interface ProductDetails extends Product {
  quarry_supplier_products: QuarrySupplierProduct[];
  quotes: Quotation[];
  jobs: JobDetails[];
}
