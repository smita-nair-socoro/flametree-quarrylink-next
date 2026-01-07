import { BASE_UNIT, MEASURE_UNIT, PRODUCT_STATUS } from './product-enums';
import { Quotation } from './quotation';
import { JobDetails } from './job';
import { QuarrySupplierProduct } from './quarry';
import { QuarryType } from './quarry-enums';

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

export interface LinkedProductMaterialProduct {
  id: number;
  productName: string;
  productCode: string;
  materialId: number;
  densityTonnagePerM3: number;
  productDescription: string;
  isActive: boolean;
  version: number;
}

export interface LinkedProductMaterial {
  id: number;
  name: string;
  products: LinkedProductMaterialProduct[];
  version: number;
}

export interface LinkedProductProduct {
  id: number;
  productName: string;
  productCode: string;
  material: LinkedProductMaterial;
  densityTonnagePerM3: number;
  productDescription: string;
  isActive: boolean;
  version: number;
}

export interface LinkedQuarrySupplierProduct {
  quarrySupplierId: number;
  productId: number;
  supplierProductName: string;
  supplierProductCode: string;
  availableUnits: string[];

  perM3CostPrice: number;
  perM3SellPrice: number;
  perTnCostPrice: number;
  perTnSellPrice: number;
  per20kgCostPrice: number;
  per20kgSellPrice: number;
  perBulkaCostPrice: number;
  perBulkaSellPrice: number;

  tnTruckRate: number;
  m3TruckRate: number;
  hourlyTruckRate: number;
  loadTruckRate: number;

  availableForSaleTn: boolean;
  availableForSaleM3: boolean;
  availableForSale20kg: boolean;
  availableForSaleBulka: boolean;

  availableForTruckRateTn: boolean;
  availableForTruckRateM3: boolean;
  availableForTruckRateHour: boolean;
  availableForTruckRateLoad: boolean;

  isActive: boolean;
  version: number;

  product: LinkedProductProduct;
}

export interface LinkedProduct {
  id: number;
  name: string;
  quarrySupplierType: QuarryType;
  email: string;
  phone: string;
  addressId: number;
  openingClosingInfo: string;
  notes: string;
  weighbridgeInfo: string;
  isActive: boolean;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  website: string;
  version: number;
  quarrySupplierProducts: LinkedQuarrySupplierProduct[];
}

export interface ProductDetails extends Product {
  quarrySupplierProducts: QuarrySupplierProduct[];
  quotes: Quotation[];
  jobs: JobDetails[];
}
