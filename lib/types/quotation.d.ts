import {
  QUOTE_TYPE as QuoteType,
  QUOTE_STATUS as QuoteStatus,
} from './quotation-enums';
import { CustomerWithAddressResponseDTO } from './customer';
import { CustomerDeliveryAddress } from './address';

// DTO type for API response (uses camelCase from backend)
export interface QuotationDTO {
  id: number;
  quoteNumber: string;
  quoteType: QuoteType;
  customerId: number;
  customerName: string;
  email: string;
  phone: string;
  customerWithAddressResponseDto: CustomerWithAddressResponseDTO;
  accountManagerSub: string;
  accountManagerName: string;
  projectName: string;
  quoteStatus: QuoteStatus;
  jobId: number;
  deliveryStartDate: string | null;
  expiryDate: string | null;
  deliveryWindowStart: string | null;
  deliveryWindowEnd: string | null;
  totalCostPrice: number;
  totalSellPrice: number;
  totalTruckSellPrice: number;
  totalTruckCostPrice: number;
  grossProfit: number;
  grossProfitPercentage: number;
  lineItemsCount: number;
  inclDeliveryCost: boolean;
  convertedAt?: string;
  version: number;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string | null;
  updatedAt: string;
  lastModifiedBy: string;
  quoteItems: QuotationLineItem[];
}

export type Quotation = QuotationDTO;

export interface QuotationLineItem {
  id?: number;
  quoteId: number;
  productId: number;
  quarrySupplierId: number;
  customerDeliveryAddressId?: number;
  customerDeliveryAddress?: CustomerDeliveryAddress;
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
  truckCostUom: string;0
  truckCostQty: number;
  truckCostPrice: number;
  totalTruckCostPrice: number;
  truckSellUom: string;
  truckSellQty: number;
  truckSellPrice: number;
  totalTruckSellPrice: number;
  grossProfit: number;
  totalQuantityRequired: number;
  allocatedQuantity: number;
  remainingQuantity: number;
  requiredLoads?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  version: number;
  isDeleted: boolean;
}

export interface StripeTenantDetailsSnapshot {
  tenantName: string;
  businessName: string;
  abn: string;
  billingAddress: string;
  website: string;
  email: string;
  contactNumber: string;
}

export interface PublicQuoteLinkResponse {
  quoteDto: QuotationDTO;
  stripeTenantDetailsSnapshot?: StripeTenantDetailsSnapshot;
}

export interface QuotationDisplayData {
  inclDeliveryCost: boolean;
  navbar: {
    quoteNumber: string;
    dateIssued: string;
    validUntil: string;
    accountManager: string;
    status: QuoteStatus;
    tenantDetails?: StripeTenantDetailsSnapshot;
  };
  customer: {
    customerName: string;
    email: string;
    phone: string;
    billingAddress: {
      line1: string;
      line2: string;
      line3: string;
    };
  };
  project: {
    type: QuoteType;
    projectName: string;
    deliveryDate: string;
    deliveryWindow: string;
  };
  products: Array<{
    name: string;
    deliveryAddress: string;
    truckType: string;
    capacity: string;
    quantity: string;
    totalPrice: number;
    deliveryPrice?: number;
  }>;
  summary: {
    totalProducts: number;
    totalQuantity: string;
    estimatedDelivery: string;
    termsAndConditions: string[];
    subtotal: number;
    gst: number;
    total: number;
    productSubtotal?: number;
    deliverySubtotal?: number;
  };
  proceedActions: {
    validUntil: string;
    accountManager: string;
  };
  footer: {
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    website: string;
    businessName: string;
    abn: string;
  };
}

interface QuotationReporting {
  totalQuotesRaisedThisMonth: number;
  totalValueOfQuotesRaisedThisMonth: number;
  totalPendingQuotes: number;
  totalQuotesExpiringIn7Days: number;
  totalQuotesPercentageChangeVsLastMonth: number;
  totalQuotesValuePercentageChangeVsLastMonth: 0;
}
