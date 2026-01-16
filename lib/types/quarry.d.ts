import { QuarryStatus, QuarryType } from './quarry-enums';
import { Address } from './address';

export interface Quarry {
  id: number;
  name: string;
  status: QuarryStatus;
  quarrySupplierType: QuarryType;
  website: string;
  email: string;
  phone: string;
  address: Address;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  openingClosingInfo: string;
  weighbridgeInfo: string;
  notes: string;
  version: number;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  // Computed property for table display (extracted from address.suburb)
  suburb?: string;
}

export interface QuarrySupplierProduct {
  quarrySupplier?: {
    id: number;
    name: string;
    addressDto?: Address;
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
  kmTruckRate: number;
  availableForTruckRateTn: boolean;
  availableForTruckRateM3: boolean;
  availableForTruckRateHour: boolean;
  availableForTruckRateLoad: boolean;
  availableForTruckRateKm: boolean;

  isActive: boolean;
  availableUnits: string[];
  version: number;
}

export interface QuarrySupplierProductDetail {
  quarrySupplier?: {
    id: number;
    name: string;
  };
  quarrySupplierId: number;
  supplierProductName: string;
  availableForSaleTn: boolean;
  availableForSaleM3: boolean;
  availableForSale20kg: boolean;
  availableForSaleBulka: boolean;
  perTnCostPrice: number;
  perM3CostPrice: number;
  per20kgCostPrice: number;
  perBulkaCostPrice: number;
  perTnSellPrice?: number;
  perM3SellPrice?: number;
  per20kgSellPrice?: number;
  perBulkaSellPrice?: number;
  tnTruckRate: number;
  m3TruckRate: number;
  hourlyTruckRate: number;
  loadTruckRate: number;
  kmTruckRate: number;
  availableForTruckRateTn: boolean;
  availableForTruckRateM3: boolean;
  availableForTruckRateHour: boolean;
  availableForTruckRateLoad: boolean;
  availableForTruckRateKm: boolean;
}

export type QuarriesWithProduct = QuarrySupplierProduct;

export interface QuarryReporting {
  supplierTotalMonthlyProfitValueOfQuotedProducts: number;
  suppliersMonthlyProfitValueChangePercent: number;
  topSupplierOfTheMonth: string;
  topSupplierQuotedProfitValueThisMonth: number;
  quarriesTotalMonthlyProfitValueOfQuotedProducts: number;
  quarriesMonthlyProfitValueChangePercent: number;
  topQuarryOfTheMonth: string;
  topQuarryQuotedProfitValueThisMonth: number;
}
