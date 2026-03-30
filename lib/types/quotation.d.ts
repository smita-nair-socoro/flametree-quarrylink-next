import {
  QUOTE_ITEM_TYPE as QuoteItemType,
  QUOTE_STATUS as QuoteStatus,
} from './quotation-enums';
import { CustomerWithAddressResponseDTO } from './customer';
import { CustomerDeliveryAddress } from './address';
import { TenantLogoResponse } from './client';

// DTO type for API response (uses camelCase from backend)
export interface QuotationDTO {
  id: number;
  quoteNumber: string;
  customerId: number;
  customerName: string;
  decisionMakerName?: string;
  email: string;
  phone: string;
  customerWithAddressResponseDto: CustomerWithAddressResponseDTO;
  accountManagerSub: string;
  accountManagerName: string;
  projectName: string;
  quoteStatus: QuoteStatus;
  declineReason?: string;
  customerResponseAt?: string;
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
  emailRecipients?: string[];
}

export type Quotation = QuotationDTO;

export interface QuotationLineItem {
  id?: number;
  quoteId: number;
  productId: number;
  quarrySupplierId: number;
  quoteItemType: QuoteItemType;
  customerDeliveryAddressId?: number;
  customerDeliveryAddress?: Partial<CustomerDeliveryAddress>;
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
  grossProfit: number;
  totalQuantityRequired: number;
  allocatedQuantity: number;
  remainingQuantity: number;
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
  tenantLogoDto?: TenantLogoResponse;
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
    logoUrl?: string;
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
    type?: QuoteItemType;
    projectName: string;
    deliveryDate: string;
    deliveryWindow: string;
  };
  products: Array<{
    name: string;
    type?: QuoteItemType | string;
    deliveryAddress: string;
    truckType: string;
    capacity: string;
    quantity: string;
    totalPrice: number;
    deliveryPrice?: number;
  }>;
  summary: {
    totalProducts: number;
    estimatedDelivery: string;
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
