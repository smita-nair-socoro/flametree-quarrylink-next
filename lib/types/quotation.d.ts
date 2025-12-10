import {
  QUOTE_TYPE as QuoteType,
  QUOTE_STATUS as QuoteStatus,
} from './quotation-enums';
import { CustomerDTO } from './customer';
import { AddressType } from './address';

// DTO type for API response (uses camelCase from backend)
export interface QuotationDTO {
  id: number;
  quoteNumber: string;
  quoteType: QuoteType;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDto: CustomerDTO;
  accountManager: number;
  accountManagerName: string;
  projectName: string;
  quoteStatus: QuoteStatus;
  deliveryAddress: AddressType;
  deliveryAddressId: number;
  jobId: number;
  deliveryStartDate: string | null;
  expiryDate: string | null;
  deliveryWindowStart: string | null;
  deliveryWindowEnd: string | null;
  totalCostPrice: number;
  totalSellPrice: number;
  totalTruckSellPrice: number;
  totalTruckCostPrice: number;
  lineItemsCount: number;
  quoteItems: QuotationLineItem[];
  version: number;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string | null;
  updatedAt: string;
  lastModifiedBy: string;
}

// Frontend type (same as DTO, uses camelCase)
export interface Quotation {
  id: number;
  quoteNumber: string;
  quoteType: QuoteType;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDto: CustomerDTO;
  accountManager: number;
  accountManagerName: string;
  projectName: string;
  status: QuoteStatus;
  deliveryAddress: DeliveryAddressDTO;
  deliveryAddressId: number;
  jobId: number;
  deliveryStartDate: string;
  expiryDate: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  totalCostPrice: number;
  totalSellPrice: number;
  totalTruckSellPrice: number;
  totalTruckCostPrice: number;
  lineItemsCount: number;
  quoteItems: QuotationLineItem[];
  version: number;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
}

export interface QuotationLineItem {
  id: number;
  quoteId: number;
  productId: number;
  quarrySupplierId: number;
  quarryProductId?: number;
  productName: string;
  quarryName: string;
  supplierProductName: string;
  productCostUom: string;
  productCostQty: number;
  productCostPrice: number;
  totalProductCostPrice: number;
  productSellUom: string;
  productSellQty: number;
  productSellPrice: number;
  totalProductSellPrice: number;
  truckType: string;
  truckCostUom: string;
  truckCostQty: number;
  truckCostPrice: number;
  totalTruckCostPrice: number;
  truckSellUom: string;
  truckSellQty: number;
  truckSellPrice: number;
  totalTruckSellPrice: number;
  requiredLoads: number;
  grossProfit: number;
  totalQuantityRequired: number;
  allocatedQuantity: number;
  remainingQuantity: number;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
}
