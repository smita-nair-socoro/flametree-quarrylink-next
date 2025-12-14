import { QUOTE_STATUS as QuoteStatus } from '@/lib/types/quotation-enums';

export interface QuotePayload {
  status?: string;
  quote_status?: string;
  account_manager_email?: string;
  business_email?: string;
}

export interface ParsedQuoteData {
  currentQuoteStatus: QuoteStatus;
  parsedPayload: QuotePayload | null;
}

export function parseQuotePayload(
  payloadParam: string | null,
  defaultStatus: QuoteStatus
): ParsedQuoteData {
  let currentQuoteStatus: QuoteStatus = defaultStatus;
  let parsedPayload: QuotePayload | null = null;

  if (payloadParam) {
    try {
      const decodedPayload = decodeURIComponent(payloadParam);
      parsedPayload = JSON.parse(decodedPayload) as QuotePayload;

      const payloadStatus = parsedPayload.status || parsedPayload.quote_status;
      if (payloadStatus) {
        const upperStatus = payloadStatus.toUpperCase();
        if (Object.values(QuoteStatus).includes(upperStatus as QuoteStatus)) {
          currentQuoteStatus = upperStatus as QuoteStatus;
        }
      }
    } catch (error) {
      console.error('Failed to decode quotation payload:', error);
    }
  }

  return {
    currentQuoteStatus,
    parsedPayload,
  };
}

export function parseStatusParam(
  statusParam: string | null,
  currentStatus: QuoteStatus
): QuoteStatus {
  if (statusParam) {
    const upperStatus = statusParam.toUpperCase();
    if (Object.values(QuoteStatus).includes(upperStatus as QuoteStatus)) {
      return upperStatus as QuoteStatus;
    }
  }
  return currentStatus;
}
