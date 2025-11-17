import { QUOTE_STATUS } from '../types/quotation-enums';
import { QuotationDTO, QuoteType, QuoteStatus } from '@/lib/types/quotation';

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
export const transformFormDataToQuoteDto = (
  formData: Record<string, unknown>
): Partial<QuotationDTO> => {
  return {
    quote_type: formData.quote_type as QuoteType,
    customer_id: formData.customer_id as number,
    account_manager: formData.account_manager as number,
    project_name: formData.project_name as string,
    quote_status: QuoteStatus.DRAFT, // Always DRAFT on creation
    delivery_address: formData.delivery_address as string,
    delivery_start_date: formData.delivery_start_date
      ? (formData.delivery_start_date as Date).toISOString()
      : null,
    delivery_window_start: (formData.delivery_window_start as string) || null,
    delivery_window_end: (formData.delivery_window_end as string) || null,
    expiry_date: formData.expiry_date
      ? (formData.expiry_date as Date).toISOString()
      : null,
    line_items: [], // Empty on creation, added separately
  };
};
