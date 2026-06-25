import {
  PublicQuoteLinkResponse,
  QuotationDisplayData,
  QuoteCurrencyTax,
  TenantProfileSnapshot,
} from '@/lib/types/quotation';
import {
  QUOTE_STATUS as QuoteStatus,
  QUOTE_ITEM_TYPE as QuoteItemType,
} from '@/lib/types/quotation-enums';
import { formatAustralianAddress } from '@/lib/utils/address-helper';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { formatDateWithOrdinal, formatTimeRange } from '@/lib/utils/date';
import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TAX_LABEL,
  DEFAULT_TAX_PERCENTAGE,
  getCurrencySymbol,
  getExTaxLabel,
  getTaxRateLabel,
} from '@/lib/utils/tenant-config-helper';

/**
 * Resolve the currency symbol and tax labels for the quote from the tenant
 * profile returned by the API. The public quote-review page can't read the
 * in-memory tenant store, so currency/tax come from `tenantProfile` here,
 * falling back to AUD/GST/10% when the profile (or a field) is missing.
 */
export function buildQuoteCurrencyTax(
  tenantProfile?: TenantProfileSnapshot,
): QuoteCurrencyTax {
  const currencyCode = (
    tenantProfile?.currency || DEFAULT_CURRENCY_CODE
  ).toUpperCase();
  const taxLabel = tenantProfile?.taxType || DEFAULT_TAX_LABEL;
  const parsedPercentage = parseFloat(tenantProfile?.taxAmount ?? '');
  const taxPercentage = isNaN(parsedPercentage)
    ? DEFAULT_TAX_PERCENTAGE
    : parsedPercentage;

  return {
    currencySymbol: getCurrencySymbol(currencyCode),
    taxLabel,
    taxPercentage,
    exTaxLabel: getExTaxLabel(taxLabel),
    taxRateLabel: getTaxRateLabel(taxLabel, taxPercentage),
  };
}

/**
 * Transform API response to display format
 */
export function transformQuoteData(
  apiResponse: PublicQuoteLinkResponse,
): QuotationDisplayData {
  const { quoteDto, stripeTenantDetailsSnapshot, tenantLogoDto, tenantProfile } =
    apiResponse;
  const currencyTax = buildQuoteCurrencyTax(tenantProfile);
  const {
    quoteNumber,
    customerName,
    customerWithAddressResponseDto,
    projectName,
    deliveryStartDate,
    deliveryWindowStart,
    deliveryWindowEnd,
    expiryDate,
    totalSellPrice,
    accountManagerName,
    quoteStatus,
    quoteItems,
    createdAt,
    inclDeliveryCost,
  } = quoteDto;

  // Transform products from quoteItems
  const products =
    quoteItems?.map((item) => {
      const rawType =
        item.quoteItemType || (item as { type?: string }).type || 'None';
      const type = String(rawType).toUpperCase();
      return {
        name: item.productName || 'Unknown Product',
        type,
        deliveryAddress:
          item.customerDeliveryAddress?.address?.formattedAddress || 'N/A',
        truckType: item.truckType || 'N/A',
        capacity: `${formatNumberThousandSeparator(item.totalQuantityRequired)} ${
          item.productSellUom === 'KG_20'
            ? 'x 20kg'
            : item.productSellUom || 'units'
        } per delivery`,
        quantity: `${formatNumberThousandSeparator(item.productSellQty)} ${item.productSellUom === 'KG_20' ? 'x 20kg' : item.productSellUom || ''}`,
        totalPrice: item.totalProductSellPrice || 0, // Product price only
        deliveryPrice: item.totalTruckSellPrice || 0, // Delivery price separate
      };
    }) || [];

  // Calculate totals (prices are in cents from backend)
  // Calculate product subtotal (sum of all totalProductSellPrice)
  const productSubtotal = quoteItems
    ? quoteItems.reduce(
        (sum, item) => sum + (item.totalProductSellPrice || 0),
        0,
      )
    : 0;

  // Calculate delivery subtotal (sum of all totalTruckSellPrice)
  const deliverySubtotal = quoteItems
    ? quoteItems.reduce((sum, item) => sum + (item.totalTruckSellPrice || 0), 0)
    : 0;

  // Subtotal is the total sell price (ex-tax) - should be product + delivery
  const subtotal = totalSellPrice || 0;
  // Tax is the tenant's tax percentage of the subtotal (defaults to 10%)
  const gst = Math.round(subtotal * (currencyTax.taxPercentage / 100));
  // Total is subtotal + tax
  const total = subtotal + gst;

  const customerBillingAddress = formatAustralianAddress(
    customerWithAddressResponseDto?.billingAddress?.formattedAddress,
  );

  // Determine customer display name based on customer type
  let customerDisplayName: string;
  if (customerWithAddressResponseDto?.customerType === 'BUSINESS') {
    // For business: use businessName, fallback to contactName
    customerDisplayName =
      customerWithAddressResponseDto.businessName ||
      customerWithAddressResponseDto.contactName ||
      customerName ||
      'N/A';
  } else if (customerWithAddressResponseDto?.customerType === 'INDIVIDUAL') {
    // For individual: use contactName
    customerDisplayName =
      customerWithAddressResponseDto.contactName || customerName || 'N/A';
  } else {
    // Default: use top-level customerName
    customerDisplayName = customerName || 'N/A';
  }
  return {
    inclDeliveryCost: inclDeliveryCost ?? false,
    currencyTax,
    navbar: {
      quoteNumber: quoteNumber || 'N/A',
      dateIssued: formatDateWithOrdinal(createdAt),
      validUntil: formatDateWithOrdinal(expiryDate),
      accountManager: accountManagerName || 'N/A',
      status: (quoteStatus as QuoteStatus) || QuoteStatus.PENDING,
      tenantDetails: stripeTenantDetailsSnapshot,
      logoUrl: tenantLogoDto?.logoPublicS3Url,
    },
    customer: {
      customerName: customerDisplayName,
      email:
        quoteDto?.customerWithAddressResponseDto?.contactPersonEmail || 'N/A',
      phone: quoteDto?.phone || 'N/A',
      billingAddress: {
        line1: customerBillingAddress?.line1 || 'N/A',
        line2: customerBillingAddress?.line2 || 'N/A',
        line3: customerBillingAddress?.line3 || 'N/A',
      },
    },
    project: {
      type:
        products.length > 0 &&
        products.every((item) => item.type === QuoteItemType.COLLECTION)
          ? QuoteItemType.COLLECTION
          : products.length > 0 &&
              products.every((item) => item.type === QuoteItemType.DELIVERY)
            ? QuoteItemType.DELIVERY
            : undefined,
      projectName: projectName || 'N/A',
      deliveryDate: formatDateWithOrdinal(deliveryStartDate),
      deliveryWindow: formatTimeRange(deliveryWindowStart, deliveryWindowEnd),
    },
    products,
    summary: {
      totalProducts: quoteItems?.length || 0,
      estimatedDelivery: formatDateWithOrdinal(deliveryStartDate),
      subtotal,
      gst,
      total,
      productSubtotal,
      deliverySubtotal,
    },
    proceedActions: {
      validUntil: formatDateWithOrdinal(expiryDate),
      accountManager: accountManagerName || 'N/A',
    },
    footer: (() => {
      // Format footer address using Australian standard (same as billing address)
      const footerAddressFormatted = formatAustralianAddress(
        stripeTenantDetailsSnapshot?.billingAddress,
      );
      return {
        email:
          stripeTenantDetailsSnapshot?.email || 'support@quarrylink.com.au',
        phone: stripeTenantDetailsSnapshot?.contactNumber || '(02) 7229 1427',
        addressLine1:
          footerAddressFormatted?.line1 || 'Suite 1102/132 Arthur St',
        addressLine2: footerAddressFormatted?.line2 || 'NORTH SYDNEY NSW 2060',
        addressLine3: footerAddressFormatted?.line3 || 'AUSTRALIA',
        website:
          stripeTenantDetailsSnapshot?.website || 'www.quarrylink.com.au',
        businessName:
          stripeTenantDetailsSnapshot?.businessName ||
          stripeTenantDetailsSnapshot?.tenantName ||
          'QuarryLink',
        abn: stripeTenantDetailsSnapshot?.abn || '12 345 678 901',
      };
    })(),
  };
}
