import {
  PublicQuoteLinkResponse,
  QuotationDisplayData,
} from '@/lib/types/quotation';
import {
  QUOTE_STATUS as QuoteStatus,
  QUOTE_TYPE as QuoteType,
} from '@/lib/types/quotation-enums';
import { formatAustralianAddress } from '@/lib/utils/address-helper';

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
  windowEnd: string | null | undefined,
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
  apiResponse: PublicQuoteLinkResponse,
): QuotationDisplayData {
  const { quoteDto, stripeTenantDetailsSnapshot } = apiResponse;
  const {
    quoteNumber,
    quoteType,
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
    quoteItems?.map((item) => ({
      name: item.productName || 'Unknown Product',
      deliveryAddress:
        item.customerDeliveryAddress?.address?.formattedAddress || 'N/A',
      truckType: item.truckType || 'N/A',
      capacity: `${item.totalQuantityRequired || 0} ${
        item.productSellUom || 'units'
      } per delivery`,
      quantity: `${item.productSellQty || 0} ${item.productSellUom || ''}`,
      totalPrice: item.totalProductSellPrice || 0, // Product price only
      deliveryPrice: item.totalTruckSellPrice || 0, // Delivery price separate
    })) || [];

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

  // Subtotal is the total sell price (ex-GST) - should be product + delivery
  const subtotal = totalSellPrice || 0;
  // GST is 10% of the subtotal
  const gst = Math.round(subtotal * 0.1);
  // Total is subtotal + GST
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
    navbar: {
      quoteNumber: quoteNumber || 'N/A',
      dateIssued: formatDate(createdAt),
      validUntil: formatDate(expiryDate),
      accountManager: accountManagerName || 'N/A',
      status: (quoteStatus as QuoteStatus) || QuoteStatus.PENDING,
      tenantDetails: stripeTenantDetailsSnapshot,
    },
    customer: {
      customerName: customerDisplayName,
      email: quoteDto?.email || 'N/A',
      phone: quoteDto?.phone || 'N/A',
      billingAddress: {
        line1: customerBillingAddress?.line1 || 'N/A',
        line2: customerBillingAddress?.line2 || 'N/A',
        line3: customerBillingAddress?.line3 || 'N/A',
      },
    },
    project: {
      type: (quoteType as QuoteType) || QuoteType.DELIVERY,
      projectName: projectName || 'N/A',
      deliveryDate: formatDate(deliveryStartDate),
      deliveryWindow: formatDeliveryWindow(
        deliveryWindowStart,
        deliveryWindowEnd,
      ),
    },
    products,
    summary: {
      totalProducts: quoteItems?.length || 0,
      estimatedDelivery: formatDate(deliveryStartDate),
      subtotal,
      gst,
      total,
      productSubtotal,
      deliverySubtotal,
    },
    proceedActions: {
      validUntil: formatDate(expiryDate),
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
