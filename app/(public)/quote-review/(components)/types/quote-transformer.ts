import {
  PublicQuoteLinkResponse,
  QuotationDisplayData,
} from '@/lib/types/quotation';
import {
  QUOTE_STATUS as QuoteStatus,
  QUOTE_TYPE as QuoteType,
} from '@/lib/types/quotation-enums';

/**
 * Format date to readable string like "15th July, 2026"
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();

    // Add ordinal suffix (st, nd, rd, th)
    const suffix =
      day === 1 || day === 21 || day === 31
        ? 'st'
        : day === 2 || day === 22
          ? 'nd'
          : day === 3 || day === 23
            ? 'rd'
            : 'th';

    return `${day}${suffix} ${month}, ${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Format delivery window time range
 */
function formatDeliveryWindow(
  windowStart: string | null | undefined,
  windowEnd: string | null | undefined
): string {
  if (!windowStart || !windowEnd) return 'N/A';

  try {
    const start = new Date(windowStart);
    const end = new Date(windowEnd);

    const formatTime = (date: Date) => {
      return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  } catch {
    return 'N/A';
  }
}

/**
 * Transform API response to display format
 */
export function transformQuoteData(
  apiResponse: PublicQuoteLinkResponse
): QuotationDisplayData {
  const { quoteDto, stripeTenantDetailsSnapshot } = apiResponse;
  const {
    quoteNumber,
    quoteType,
    customerName,
    customerEmail,
    customerPhone,
    customerDto,
    projectName,
    deliveryAddress,
    deliveryStartDate,
    deliveryWindowStart,
    deliveryWindowEnd,
    expiryDate,
    totalCostPrice,
    totalSellPrice,
    accountManagerName,
    quoteStatus,
    quoteItems,
    createdAt,
  } = quoteDto;

  // Transform products from quoteItems
  const products =
    quoteItems?.map((item) => ({
      name: item.productName || 'Unknown Product',
      code: `P-${item.productId}`,
      truckType: item.truckType || 'N/A',
      capacity: `${item.totalQuantityRequired || 0} ${item.productSellUom || 'units'} per delivery`,
      quantity: `${item.productSellQty || 0} ${item.productSellUom || ''}`,
      totalPrice: item.totalProductSellPrice || 0,
    })) || [];

  // Calculate totals (prices are in cents from backend)
  const subtotal = totalCostPrice || 0;
  const gst =
    totalSellPrice && totalCostPrice ? totalSellPrice - totalCostPrice : 0;
  const total = totalSellPrice || 0;

  // Total quantity calculation from all products
  const totalQuantity = quoteItems
    ? `${quoteItems.reduce((sum, item) => sum + (item.productSellQty || 0), 0)} ${quoteItems[0]?.productSellUom || 'units'}`
    : '0 units';

  // Format billing address from stripeTenantDetailsSnapshot
  const billingAddressParts =
    stripeTenantDetailsSnapshot?.billingAddress?.split(',') || [];
  const billingAddressLine1 =
    billingAddressParts[0] || 'Suite 1102/132 Arthur St';
  const billingAddressLine2 = billingAddressParts
    .slice(1)
    .join(',')
    .replace(/,?\s*AU\s*$/i, '')
    .trim() || 'North Sydney NSW 2060';

  return {
    navbar: {
      quoteNumber: quoteNumber || 'N/A',
      dateIssued: formatDate(createdAt),
      validUntil: formatDate(expiryDate),
      accountManager: accountManagerName || 'N/A',
      status: (quoteStatus as QuoteStatus) || QuoteStatus.PENDING,
      tenantDetails: stripeTenantDetailsSnapshot,
    },
    customer: {
      customerName: customerDto?.contactName || customerName || 'N/A',
      email: customerEmail || customerDto?.email || 'N/A',
      phone: customerPhone || customerDto?.phone || 'N/A',
      billingAddress: {
        line1: billingAddressLine1,
        line2: billingAddressLine2,
        country: 'Australia',
      },
    },
    project: {
      type: (quoteType as QuoteType) || QuoteType.DELIVERY,
      projectName: projectName || 'N/A',
      deliveryAddress: deliveryAddress?.formattedAddress || 'N/A',
      deliveryDate: formatDate(deliveryStartDate),
      deliveryWindow: formatDeliveryWindow(
        deliveryWindowStart,
        deliveryWindowEnd
      ),
    },
    products,
    summary: {
      totalProducts: quoteItems?.length || 0,
      totalQuantity,
      estimatedDelivery: formatDate(deliveryStartDate),
      termsAndConditions: [
        'Delivery subject to weather conditions',
        'Quote valid for 14 days from issue date',
      ],
      subtotal,
      gst,
      total,
    },
    proceedActions: {
      validUntil: formatDate(expiryDate),
      accountManager: accountManagerName || 'N/A',
    },
    footer: {
      email:
        stripeTenantDetailsSnapshot?.email || 'support@quarrylink.com.au',
      phone: stripeTenantDetailsSnapshot?.contactNumber || '(02) 7229 1427',
      addressLine1:
        stripeTenantDetailsSnapshot?.billingAddress?.split(',')[0] ||
        'Suite 1102/132 Arthur St,',
      addressLine2:
        stripeTenantDetailsSnapshot?.billingAddress
          ?.split(',')
          .slice(1)
          .join(',') || 'North Sydney NSW 2060',
      website:
        stripeTenantDetailsSnapshot?.website || 'www.quarrylink.com.au',
      businessName:
        stripeTenantDetailsSnapshot?.businessName ||
        stripeTenantDetailsSnapshot?.tenantName ||
        'QuarryLink',
    },
  };
}
