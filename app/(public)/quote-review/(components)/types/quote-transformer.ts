import {
  PublicQuoteLinkResponse,
  QuotationDisplayData,
  QuoteCurrencyTax,
  QuoteContent,
  TenantProfileSnapshot,
} from '@/lib/types/quotation';
import { QuoteTermItem, QuoteDocument } from '@/lib/types/terms-conditions';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';
import {
  QUOTE_STATUS as QuoteStatus,
  QUOTE_ITEM_TYPE as QuoteItemType,
} from '@/lib/types/quotation-enums';
import { formatAustralianAddress } from '@/lib/utils/address-helper';
import {
  formatFileSize,
  formatNumberThousandSeparator,
} from '@/lib/utils/number';
import { formatDateWithOrdinal, formatTimeRange } from '@/lib/utils/date';
import { formatUomLabel } from '@/lib/utils/docket-helper';
import { RECOVERY_MODE } from '@/lib/types/fee-recovery-enums';
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
  const parsedPercentage = Number.parseFloat(tenantProfile?.taxAmount ?? '');
  const taxPercentage = Number.isNaN(parsedPercentage)
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

// Text template, then external link, then policy document; alphabetical by name within each type.
const CONTENT_TYPE_ORDER: Record<QuoteSettingItemType, number> = {
  [QuoteSettingItemType.TEXT_TEMPLATE]: 0,
  [QuoteSettingItemType.EXTERNAL_LINK]: 1,
  [QuoteSettingItemType.POLICY_DOCUMENT]: 2,
};

/**
 * Splits the quote content items (flat array, discriminated by
 * `contentType`) into the notes/terms/documents groups the quote-review
 * page renders.
 */
export function mapQuoteContent(content?: QuoteContent): {
  notes: string[];
  terms: QuoteTermItem[];
  documents: QuoteDocument[];
} {
  const notes = (content?.customerNotesHtml ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const orderedItems = [...(content?.items ?? [])].sort((a, b) => {
    const typeDiff =
      CONTENT_TYPE_ORDER[a.contentType] - CONTENT_TYPE_ORDER[b.contentType];
    return typeDiff !== 0 ? typeDiff : a.name.localeCompare(b.name);
  });

  const terms: QuoteTermItem[] = [];
  const documents: QuoteDocument[] = [];

  orderedItems.forEach((item, index) => {
    const id = `${item.contentType}-${index}`;
    if (item.contentType === QuoteSettingItemType.TEXT_TEMPLATE) {
      terms.push({ id, name: item.name, content: item.contentHtml ?? '' });
      return;
    }
    if (item.contentType === QuoteSettingItemType.EXTERNAL_LINK) {
      documents.push({
        id,
        type: 'link',
        name: item.name,
        url: item.externalUrl ?? '#',
      });
      return;
    }
    if (item.contentType === QuoteSettingItemType.POLICY_DOCUMENT) {
      documents.push({
        id,
        type: 'file',
        name: item.name,
        fileType: item.mimeType?.split('/')[1]?.toUpperCase() || 'FILE',
        fileName: item.originalFileName ?? item.name,
        fileSizeLabel: formatFileSize(item.fileSizeBytes ?? 0),
        url: item.viewUrl ?? '#',
      });
    }
  });

  return { notes, terms, documents };
}

/**
 * Transform API response to display format
 */
export function transformQuoteData(
  apiResponse: PublicQuoteLinkResponse,
): QuotationDisplayData {
  const {
    quoteDto,
    stripeTenantDetailsSnapshot,
    tenantLogoDto,
    tenantProfile,
    content,
    feeRecoveryPreview,
  } = apiResponse;
  const currencyTax = buildQuoteCurrencyTax(tenantProfile);
  const { notes, terms, documents } = mapQuoteContent(content);

  // TEMP FIX: Flametree Quarry and MYOB Acumatica tenants store a dedicated
  // quote-page logo variant alongside the standard one in S3 (same folder,
  // different filename). Scoped to these tenants only until the backend
  // returns a proper quote-page logo URL for all tenants.
  const isFlametreeQuarry =
    tenantProfile?.email === 'flametree@gmail.com' ||
    tenantProfile?.tenantId?.includes('flametree-quarry');
  const isMyobAcumatica =
    tenantProfile?.tenantId?.toLowerCase().includes('myob-acumatica') ||
    tenantProfile?.tenantName?.toLowerCase().includes('myob acumatica');
  const rawLogoUrl = tenantLogoDto?.logoPublicS3Url;
  const logoUrl =
    (isFlametreeQuarry || isMyobAcumatica) && rawLogoUrl?.includes('logo.png')
      ? rawLogoUrl.replace('logo.png', 'quote-page-logo.png')
      : rawLogoUrl;
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
      const uomLabel = formatUomLabel(item.productSellUom || '');
      return {
        name: item.productName || 'Unknown Product',
        type,
        deliveryAddress:
          item.customerDeliveryAddress?.address?.formattedAddress || 'N/A',
        truckType: item.truckType || 'N/A',
        capacity: `${formatNumberThousandSeparator(item.totalQuantityRequired)} ${formatUomLabel(item.productSellUom || 'units')} per delivery`,
        unit: uomLabel,
        quantity: `${formatNumberThousandSeparator(item.productSellQty)} ${uomLabel}`,
        rawQty: item.productSellQty || 0,
        unitPrice: item.productSellPrice || 0,
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

  const showDigitalPlatformFee =
    feeRecoveryPreview?.mode === RECOVERY_MODE.RECOVER;
  const digitalPlatformFeeLabel =
    feeRecoveryPreview?.invoiceLineDescription || 'digital platform fee';
  const digitalPlatformFeeAmount = feeRecoveryPreview?.feeAmount || 0;

  const customerBillingAddress = formatAustralianAddress(
    customerWithAddressResponseDto?.billingAddress?.formattedAddress,
  );

  // Determine customer display name based on customer type
  let customerDisplayName: string;
  if (customerWithAddressResponseDto?.customerType === 'BUSINESS') {
    // For business: use businessName, fallback to the contact person's name
    // (business customers don't have individualContactName).
    const contactPersonName = [
      customerWithAddressResponseDto.contactPersonFirstName,
      customerWithAddressResponseDto.contactPersonLastName,
    ]
      .filter(Boolean)
      .join(' ');
    customerDisplayName =
      customerWithAddressResponseDto.businessName ||
      contactPersonName ||
      customerName ||
      'N/A';
  } else if (customerWithAddressResponseDto?.customerType === 'INDIVIDUAL') {
    // For individual: use individualContactName
    customerDisplayName =
      customerWithAddressResponseDto.individualContactName ||
      customerName ||
      'N/A';
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
      status: (quoteStatus as QuoteStatus) || QuoteStatus.PENDING,
      tenantDetails: stripeTenantDetailsSnapshot,
      logoUrl,
      logoSize: tenantProfile?.logoSize,
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
      type: (() => {
        if (
          products.length > 0 &&
          products.every((item) => item.type === QuoteItemType.COLLECTION)
        )
          return QuoteItemType.COLLECTION;
        if (
          products.length > 0 &&
          products.every((item) => item.type === QuoteItemType.DELIVERY)
        )
          return QuoteItemType.DELIVERY;
        return undefined;
      })(),
      projectName: projectName || 'N/A',
      deliveryDate: deliveryStartDate
        ? formatDateWithOrdinal(deliveryStartDate)
        : undefined,
      deliveryWindow:
        formatTimeRange(deliveryWindowStart, deliveryWindowEnd, {
          hour12: true,
        }) || undefined,
      timeZone: tenantProfile?.timeZoneId,
    },
    products,
    summary: {
      totalProducts: quoteItems?.length || 0,
      estimatedDelivery: deliveryStartDate
        ? formatDateWithOrdinal(deliveryStartDate)
        : '',
      subtotal,
      gst,
      total,
      productSubtotal,
      deliverySubtotal,
      showDigitalPlatformFee,
      digitalPlatformFeeLabel,
      digitalPlatformFeeAmount,
    },
    proceedActions: {
      validUntil: formatDateWithOrdinal(expiryDate),
    },
    notes,
    terms,
    documents,
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
