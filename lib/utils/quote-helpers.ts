import { QUOTE_STATUS } from '../types/quotation-enums';
import type { QuotationDTO, QuoteType } from '../types/quotation';
import { toLocalDateTime } from './date';

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

const combineDateAndTime = (date: Date | undefined, timeString: string): string | null => {
  if (!date || !timeString) return null;

  const [hours, minutes] = timeString.split(':');
  const combined = new Date(date);
  combined.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  return toLocalDateTime(combined);
};

/**
 * Generates the next quote number based on existing quotes.
 * Format: Q#### (e.g., Q0001, Q0016, Q0017)
 */
export const generateNextQuoteNumber = (existingQuotes: { quote_number: string }[]): string => {
  if (!existingQuotes || existingQuotes.length === 0) {
    return 'Q0001';
  }

  const numbers = existingQuotes
    .map((q) => {
      const match = q.quote_number.match(/Q(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  const maxNumber = Math.max(...numbers, 0);
  const nextNumber = maxNumber + 1;

  return `Q${String(nextNumber).padStart(4, '0')}`;
};

export const transformFormDataToQuoteDto = (
  formData: Record<string, unknown>,
  additionalData: {
    customerName: string;
    accountManagerName: string;
    quoteNumber: string;
    deliveryAddressId?: number;
  }
): Partial<QuotationDTO> => {
  const deliveryDate = formData.delivery_start_date as Date | undefined;
  const expiryDate = formData.expiry_date as Date | undefined;

  if (!expiryDate) {
    throw new Error('Expiry date is required');
  }

  const transformed: Record<string, unknown> = {
    quoteNumber: additionalData.quoteNumber,
    quoteType: formData.quote_type as QuoteType,
    customerId: formData.customer_id as number,
    customerName: additionalData.customerName,
    projectName: formData.project_name as string,
    quoteStatus: QUOTE_STATUS.DRAFT,
    deliveryAddressId: additionalData.deliveryAddressId || 1,
    expiryDate: toLocalDateTime(expiryDate),
    accountManager: formData.account_manager as number,
    accountManagerName: additionalData.accountManagerName,
    version: 1,
  };

  if (deliveryDate) {
    transformed.deliveryStartDate = toLocalDateTime(deliveryDate);
  }

  const windowStart = combineDateAndTime(
    deliveryDate,
    formData.delivery_window_start as string
  );
  if (windowStart) {
    transformed.deliveryWindowStart = windowStart;
  }

  const windowEnd = combineDateAndTime(
    deliveryDate,
    formData.delivery_window_end as string
  );
  if (windowEnd) {
    transformed.deliveryWindowEnd = windowEnd;
  }

  return transformed as Partial<QuotationDTO>;
};
