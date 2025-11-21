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

/**
 * Transforms form data to the format expected by the backend API for creating quotations.
 * Strips form-only fields (phone, email, audit fields) and sets defaults.
 *
 * @param formData - The form data from the quotation form
 * @returns A partial QuotationDTO ready for POST request
 */
/**
 * Combines a date and time string to create an ISO DateTime string.
 * @param date - The date object
 * @param timeString - Time in HH:mm format
 * @returns ISO DateTime string or null
 */
const combineDateAndTime = (date: Date | undefined, timeString: string): string | null => {
  if (!date || !timeString) return null;

  const [hours, minutes] = timeString.split(':');
  const combined = new Date(date);
  combined.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  return toLocalDateTime(combined);
};

/**
 * Generates the next quote number based on existing quotes.
 * Format: Q#### (e.g., Q0100, Q0101, Q0102)
 * Starts from Q0100 to avoid conflicts with existing quotes
 */
export const generateNextQuoteNumber = (existingQuotes: { quote_number: string }[]): string => {
  const MIN_QUOTE_NUMBER = 100; // Start from Q0100

  if (!existingQuotes || existingQuotes.length === 0) {
    return `Q${String(MIN_QUOTE_NUMBER).padStart(4, '0')}`;
  }

  // Extract numbers from existing quote numbers and find the max
  const numbers = existingQuotes
    .map((q) => {
      const match = q.quote_number.match(/Q(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  const maxNumber = Math.max(...numbers, MIN_QUOTE_NUMBER - 1);
  const nextNumber = maxNumber + 1;

  const generatedNumber = `Q${String(nextNumber).padStart(4, '0')}`;
  console.log(`📋 Generated quote number: ${generatedNumber} (max found: Q${String(maxNumber).padStart(4, '0')})`);

  return generatedNumber;
};

export const transformFormDataToQuoteDto = (
  formData: Record<string, unknown>,
  additionalData: {
    customerName: string;
    accountManagerName: string;
    quoteNumber: string;
  }
): Partial<QuotationDTO> => {
  const deliveryDate = formData.delivery_start_date as Date | undefined;
  const expiryDate = formData.expiry_date as Date | undefined;

  // Validate required fields
  if (!expiryDate) {
    throw new Error('Expiry date is required');
  }

  const transformed: Record<string, unknown> = {
    quoteNumber: additionalData.quoteNumber,
    quoteType: formData.quote_type as QuoteType,
    customerId: formData.customer_id as number,
    customerName: additionalData.customerName,
    projectName: formData.project_name as string,
    quoteStatus: QUOTE_STATUS.DRAFT, // Always DRAFT on creation
    deliveryAddressId: 1, // TEMPORARY: Hardcoded - need address management
    expiryDate: toLocalDateTime(expiryDate), // Required field - LocalDateTime format
    accountManager: formData.account_manager as number,
    accountManagerName: additionalData.accountManagerName,
    lineItemsCount: 0, // Empty on creation
    version: 1, // Default version for new quotes
  };

  // Add optional fields only if they have values
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

  console.log('📤 Transforming form data to DTO:', formData);
  console.log('📤 Transformed DTO:', transformed);

  return transformed as Partial<QuotationDTO>;
};
