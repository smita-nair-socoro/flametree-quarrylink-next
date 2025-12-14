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
  quarrySupplier?: {
    id: number;
    name: string;
  };
  quarrySupplierId: number;
  productId: number;
  supplierProductName: string;
  supplierProductCode: string;
  quarryName?: string;

  perTnCostPrice: number;
  perTnSellPrice: number;
  perM3CostPrice: number;
  perM3SellPrice: number;
  per20kgCostPrice: number;
  per20kgSellPrice: number;
  perBulkaCostPrice: number;
  perBulkaSellPrice: number;

  availableForSaleTn: boolean;
  availableForSaleM3: boolean;
  availableForSale20kg: boolean;
  availableForSaleBulka: boolean;

  tnTruckRate: number;
  m3TruckRate: number;
  hourlyTruckRate: number;
  loadTruckRate: number;
  availableForTruckRateTn: boolean;
  availableForTruckRateM3: boolean;
  availableForTruckRateHour: boolean;
  availableForTruckRateLoad: boolean;

  isActive: boolean;
  availableUnits: string[];
  version: number;
}

export type QuarriesWithProduct = QuarrySupplierProduct;
