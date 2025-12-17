import { QUOTE_STATUS, QUOTE_TYPE } from '../types/quotation-enums';
import type { QuotationDTO, QuotationLineItem } from '../types/quotation';
import type { Address, AddressType } from '../types/address';
import { toAddressPayload } from './address-helper';
import { toLocalDateTime } from './date';
import { centsToDollarsNum } from './currency';
import { notifyError } from '../toast';
import { formatPhoneNumber } from './phone-helper';

export const formatQuoteStatus = (status: QUOTE_STATUS | string): string => {
  switch (status) {
    case QUOTE_STATUS.CONVERTED_TO_JOB:
    case 'CONVERTED_TO_JOB':
      return 'CONVERTED TO JOB';
    case QUOTE_STATUS.DRAFT:
    case 'DRAFT':
      return 'DRAFT';
    case QUOTE_STATUS.PENDING:
    case 'PENDING':
      return 'PENDING';
    case QUOTE_STATUS.APPROVED:
    case 'APPROVED':
      return 'APPROVED';
    case QUOTE_STATUS.EXPIRED:
    case 'EXPIRED':
      return 'EXPIRED';
    case QUOTE_STATUS.DECLINED:
    case 'DECLINED':
      return 'DECLINED';
    case QUOTE_STATUS.ARCHIVED:
    case 'ARCHIVED':
      return 'ARCHIVED';
    default:
      return status.replace(/_/g, ' ');
  }
};

const combineDateAndTime = (
  date: Date | undefined,
  timeString: string
): string | null => {
  if (!date || !timeString) return null;

  const [hours, minutes] = timeString.split(':');
  const combined = new Date(date);
  combined.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  return toLocalDateTime(combined);
};

/**
 * Generates the next quote number based on the latest quote number.
 * Format: Q#### (e.g., Q0001, Q0016, Q0017)
 *
 * @param latestQuoteNumber - The current latest quote number (e.g., "Q0015")
 * @returns The next quote number (e.g., "Q0016")
 */
export const generateNextQuoteNumber = (
  latestQuoteNumber?: string | null
): string => {
  if (!latestQuoteNumber) {
    return 'Q0001';
  }

  const match = latestQuoteNumber.match(/Q(\d+)/);
  if (!match) {
    return 'Q0001';
  }

  const currentNumber = parseInt(match[1], 10);
  const nextNumber = currentNumber + 1;

  return `Q${String(nextNumber).padStart(4, '0')}`;
};

/**
 * Extracts the maximum quote number from a list of quotations.
 * This is a helper function for backwards compatibility.
 *
 * @param existingQuotes - Array of quotations with quoteNumber field
 * @returns The latest/maximum quote number string
 */
export const getLatestQuoteNumber = (
  existingQuotes: { quoteNumber: string }[]
): string | null => {
  if (!existingQuotes || existingQuotes.length === 0) {
    return null;
  }

  const numbers = existingQuotes
    .map((q) => {
      const match = q.quoteNumber.match(/Q(\d+)/);
      return match
        ? { num: parseInt(match[1], 10), original: q.quoteNumber }
        : null;
    })
    .filter(
      (n): n is { num: number; original: string } => n !== null && !isNaN(n.num)
    );

  if (numbers.length === 0) {
    return null;
  }

  const maxEntry = numbers.reduce((max, current) =>
    current.num > max.num ? current : max
  );

  return maxEntry.original;
};

export const transformFormDataToQuoteDto = (
  formData: Record<string, unknown>,
  additionalData: {
    customerName: string;
    accountManagerName: string;
    quoteNumber: string;
    lineItemsCount?: number;
    deliveryAddress: AddressType | null;
  }
): Partial<QuotationDTO> => {
  const deliveryDate = formData.deliveryStartDate as Date | undefined;
  const expiryDate = formData.expiryDate as Date | undefined;

  if (!expiryDate) {
    throw new Error('Expiry date is required');
  }

  const transformed: Record<string, unknown> = {
    quoteNumber: additionalData.quoteNumber,
    quoteType: formData.quoteType as QUOTE_TYPE,
    customerId: formData.customerId as number,
    customerName: additionalData.customerName,
    customerEmail: (formData.email as string) || '',
    customerPhone: formatPhoneNumber(formData.phone as string) || '',
    projectName: formData.projectName as string,
    quoteStatus: QUOTE_STATUS.DRAFT,
    expiryDate: toLocalDateTime(expiryDate),
    accountManager: formData.accountManager as number,
    accountManagerName: additionalData.accountManagerName,
    version: 1,
    lineItemsCount: additionalData.lineItemsCount ?? 0,
    deliveryAddress: additionalData.deliveryAddress,
    // TEMPORARY: Mock data for backend testing
    createdBy: 'admin',
    createdAt: '2025-12-01T22:19:50.710',
    updatedAt: '2025-12-01T22:19:50.710',
    lastModifiedBy: 'admin',
    totalCostPrice: 1200.0,
    totalSellPrice: 1800.0,
  };

  // Map UI address shape (AddressType) to backend Address payload
  const mappedAddress = toAddressPayload(additionalData.deliveryAddress);
  if (!mappedAddress) {
    notifyError('⚠️ Address may be missing!');
  } else {
    transformed.deliveryAddress = mappedAddress as Address;
  }

  if (deliveryDate) {
    transformed.deliveryStartDate = toLocalDateTime(deliveryDate);
  }

  const windowStart = combineDateAndTime(
    deliveryDate,
    formData.deliveryWindowStart as string
  );
  if (windowStart) {
    transformed.deliveryWindowStart = windowStart;
  }

  const windowEnd = combineDateAndTime(
    deliveryDate,
    formData.deliveryWindowEnd as string
  );
  if (windowEnd) {
    transformed.deliveryWindowEnd = windowEnd;
  }

  return transformed as Partial<QuotationDTO>;
};

/**
 * Quotation pricing breakdown interface
 */

export interface QuotationPricingBreakdown {
  totalProductCostPrice: number;
  totalTruckCostPrice: number;
  totalProductSellPrice: number;
  totalTruckSellPrice: number;
  totalInvoice: number;
  grossProfit: number;
  grossProfitPercentage: number;
}

export const calculateQuotationPricing = (
  lineItems: QuotationLineItem[] | undefined | null
): QuotationPricingBreakdown => {
  // Handle empty or null line items
  if (!lineItems || lineItems.length === 0) {
    return {
      totalProductCostPrice: 0,
      totalTruckCostPrice: 0,
      totalProductSellPrice: 0,
      totalTruckSellPrice: 0,
      totalInvoice: 0,
      grossProfit: 0,
      grossProfitPercentage: 0,
    };
  }

  // Sum up the values (in cents)
  const totalProductCostCents = lineItems.reduce(
    (sum, item) => sum + (item.totalProductCostPrice || 0),
    0
  );
  const totalTruckCostCents = lineItems.reduce(
    (sum, item) => sum + (item.totalTruckCostPrice || 0),
    0
  );
  const totalProductSellCents = lineItems.reduce(
    (sum, item) => sum + (item.totalProductSellPrice || 0),
    0
  );
  const totalTruckSellCents = lineItems.reduce(
    (sum, item) => sum + (item.totalTruckSellPrice || 0),
    0
  );

  const totalCostCents = totalProductCostCents + totalTruckCostCents;
  const totalInvoiceCents = totalProductSellCents + totalTruckSellCents;
  const grossProfitCents = totalInvoiceCents - totalCostCents;
  const grossProfitPercentage =
    totalInvoiceCents > 0 ? (grossProfitCents / totalInvoiceCents) * 100 : 0;

  // Convert cents to dollars for display
  return {
    totalProductCostPrice: centsToDollarsNum(totalProductCostCents),
    totalTruckCostPrice: centsToDollarsNum(totalTruckCostCents),
    totalProductSellPrice: centsToDollarsNum(totalProductSellCents),
    totalTruckSellPrice: centsToDollarsNum(totalTruckSellCents),
    totalInvoice: centsToDollarsNum(totalInvoiceCents),
    grossProfit: centsToDollarsNum(grossProfitCents),
    grossProfitPercentage: grossProfitPercentage,
  };
};
