import { QuarryStatus, QuarryType } from './quarry-enums';
import { Address } from './address';
import type { AccountCode } from './accounting';
import type { Department } from './department';

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
  accountingSoftwareAccountingCode?: AccountCode | null;
  // Computed property for table display (extracted from address.suburb)
  suburb?: string;
}

export interface QuarrySupplierProduct {
  quarrySupplier?: {
    id: number;
    name: string;
    address?: Address;
  };
  quarrySupplierId: number;
  productId: number;
  supplierProductName: string;
  supplierProductCode: string;
  densityTonnagePerM3?: number;
  department?: Department | null;
  quarryName?: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;

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
  kg20TruckRate: number;
  bulkaTruckRate: number;
  availableForTruckRateTn: boolean;
  availableForTruckRateM3: boolean;
  availableForTruckRateHour: boolean;
  availableForTruckRateLoad: boolean;
  availableForTruckRateKm: boolean;
  availableForTruckRate20kg: boolean;
  availableForTruckRateBulka: boolean;
  isActive: boolean;
  availableUnits: string[];
  version: number;
}

export type QuarriesWithProduct = QuarrySupplierProduct;

export interface QuarryReporting {
  supplierTotalMonthlyProfitValueOfQuotedProducts: number;
  suppliersMonthlyProfitValueChangeVsLastMonth: number;
  topSupplierOfTheMonth: string;
  topSupplierQuotedProfitValueThisMonth: number;
  quarriesTotalMonthlyProfitValueOfQuotedProducts: number;
  quarriesMonthlyProfitValueChangeVsLastMonth: number;
  topQuarryOfTheMonth: string;
  topQuarryQuotedProfitValueThisMonth: number;
}
