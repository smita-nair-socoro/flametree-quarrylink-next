import {
  QUOTE_ITEM_TYPE as QuoteItemType,
  QUOTE_STATUS as QuoteStatus,
  LOGO_SIZE as LogoSize,
} from './quotation-enums';
import { CUSTOMER_STATUS, CUSTOMER_TYPE } from './customer-enums';
import { CustomerWithAddressResponseDTO } from './customer';
import { Address, CustomerDeliveryAddress } from './address';
import { TenantLogoResponse } from './client';
import { QuoteSettingItemType } from './term-conditions-enums';
import { QuoteTermItem, QuoteDocument } from './terms-conditions';
import { RECOVERY_MODE, EFFECTIVE_SOURCE } from './fee-recovery-enums';

// DTO type for API response (uses camelCase from backend)
export interface QuotationDTO {
  id: number;
  quoteNumber: string;
  customerId: number;
  customerName: string;
  decisionMakerName?: string;
  poNumber?: string;
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
  jobNumber?: string;
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
  densityTonnagePerM3: number;
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

/**
 * Nested customer shape returned ONLY by GET /quote/{id}/preview (and the
 * public link equivalent) — distinct from `CustomerWithAddressResponseDTO`,
 * which is the shape used by the regular quotation CRUD endpoints
 * (getById/getAll/getWithQuoteItems/create). Do not merge these: the two
 * endpoints currently serialize the customer differently.
 */
export interface QuotePreviewCustomerDTO {
  id?: number;
  customerType: CUSTOMER_TYPE;
  businessName?: string;
  individualContactName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  contactPersonFirstName?: string;
  contactPersonLastName?: string;
  billingAddressId?: number;
  billingAddress: Address;
  creditLimit: number;
  accountManagerName?: string;
  accountManagerSub: string;
  accountManagerEmail?: string;
  invoiceDueDateDayCount: number;
  paymentTermType: string;
  customerStatus: CUSTOMER_STATUS;
  businessEmail?: string;
  businessPhone?: string;
  remainingCredit?: number;
  paymentType: string;
  abn?: string;
  accSoftwareNotes?: string;
  accSoftwareContactId?: string;
  lastAccSoftwareSyncDirection?: string;
  lastAccSoftwareSyncStatus?: string;
  lastSyncedAt?: string;
  version: number;
  deleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
}

/** Line item shape returned by GET /quote/{id}/preview (and the public link equivalent). */
export interface QuotePreviewLineItem
  extends Omit<QuotationLineItem, 'isDeleted'> {
  quarrySupplierProductId?: number;
  requiredLoads: number;
  isDeleted: boolean;
  deleted?: boolean;
}

/** Quote DTO shape returned by GET /quote/{id}/preview (and the public link equivalent). */
export interface QuotePreviewDto
  extends Omit<
    QuotationDTO,
    | 'email'
    | 'customerWithAddressResponseDto'
    | 'totalTruckSellPrice'
    | 'totalTruckCostPrice'
    | 'grossProfit'
    | 'grossProfitPercentage'
    | 'quoteItems'
  > {
  customerWithAddressResponseDto: QuotePreviewCustomerDTO;
  accountManagerEmail?: string;
  quoteItems: QuotePreviewLineItem[];
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

/**
 * Tenant currency/tax profile returned alongside the quote on the public/
 * preview endpoints. Used to render the correct currency symbol and tax label
 * on the public quote-review page, where the in-memory tenant store is not
 * populated. `currency` is an ISO code (e.g. "AUD"), `taxType` a label (e.g.
 * "GST") and `taxAmount` a percentage as a string (e.g. "10").
 */
export interface TenantProfileSnapshot {
  tenantId?: string;
  tenantName?: string;
  businessName?: string;
  address?: string;
  email?: string;
  phone?: string;
  abn?: string;
  website?: string;
  currency?: string;
  taxType?: string;
  taxAmount?: string;
  timeZoneId?: string;
  logoSize?: LogoSize;
  unitPriceDecimalPlaces?: number;
}

export interface QuoteContentItem {
  contentType: QuoteSettingItemType;
  name: string;
  sortOrder: number;
  contentHtml?: string;
  externalUrl?: string;
  externalLinkText?: string;
  originalFileName?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  viewUrl?: string;
}

export interface QuoteContent {
  customerNotesHtml?: string;
  items: QuoteContentItem[];
}

/** Fee-recovery preview for this quote's customer, shown on the public quote-review page. */
export interface QuoteFeeRecoveryPreviewDto {
  recoveredFromCustomer: boolean;
  feeAmount: number;
  invoiceLineDescription: string;
  customerFacingNote: string;
  mode: RECOVERY_MODE;
  source: EFFECTIVE_SOURCE;
}

export interface PublicQuoteLinkResponse {
  quoteDto: QuotePreviewDto;
  stripeTenantDetailsSnapshot?: StripeTenantDetailsSnapshot;
  tenantLogoDto?: TenantLogoResponse;
  tenantProfile?: TenantProfileSnapshot;
  content?: QuoteContent;
  feeRecoveryPreview?: QuoteFeeRecoveryPreviewDto;
}

/** Quote summary returned after a public approve/decline decision. */
export interface PublicQuoteDecisionResponse {
  id: number;
  quoteNumber: string;
  customerId: number;
  customerName: string;
  phone: string;
  projectName: string;
  quoteStatus: QuoteStatus;
  declineReason?: string;
  decisionMakerName?: string;
  poNumber?: string;
  customerResponseAt?: string;
  deliveryStartDate: string | null;
  expiryDate: string | null;
  deliveryWindowStart: string | null;
  deliveryWindowEnd: string | null;
  totalCostPrice: number;
  totalSellPrice: number;
  accountManagerName: string;
  lineItemsCount: number;
  inclDeliveryCost: boolean;
  emailRecipients: string[];
  version: number;
  createdBy: string;
  createdAt: string | null;
  updatedAt: string;
  lastModifiedBy: string;
  deleted: boolean;
}

/** Currency symbol + tax labels resolved for rendering a quote. */
export interface QuoteCurrencyTax {
  currencySymbol: string;
  taxLabel: string;
  taxPercentage: number;
  /** e.g. "(ex-GST)" */
  exTaxLabel: string;
  /** e.g. "GST (10%)" */
  taxRateLabel: string;
}

export interface QuotationDisplayData {
  inclDeliveryCost: boolean;
  currencyTax: QuoteCurrencyTax;
  navbar: {
    quoteNumber: string;
    dateIssued: string;
    validUntil: string;
    status: QuoteStatus;
    tenantDetails?: StripeTenantDetailsSnapshot;
    logoUrl?: string;
    logoSize?: LogoSize;
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
    /** Omitted (undefined) when the quote has no estimated start date. */
    deliveryDate?: string;
    /** Omitted (undefined) when neither delivery window bound is set. */
    deliveryWindow?: string;
    /** IANA timezone id from the tenant profile, e.g. "Australia/Sydney". */
    timeZone?: string;
  };
  products: Array<{
    name: string;
    type?: QuoteItemType | string;
    deliveryAddress: string;
    truckType: string;
    capacity: string;
    unit: string;
    quantity: string;
    rawQty: number;
    unitPrice: number;
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
    showDigitalPlatformFee: boolean;
    digitalPlatformFeeLabel: string;
    digitalPlatformFeeAmount: number;
  };
  proceedActions: {
    validUntil: string;
  };
  notes: string[];
  terms: QuoteTermItem[];
  documents: QuoteDocument[];
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
  totalQuotesChangeVsLastMonth: number;
  totalQuotesValueChangeVsLastMonth: number;
}
