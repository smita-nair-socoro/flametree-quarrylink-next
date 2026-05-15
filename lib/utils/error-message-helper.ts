import { DocketDTO } from '../types/docket';
import {
  EligibilityBlockingDependencies,
} from '../types/eligibility-check';
import { JobDTO, JobItem } from '../types/job';
import { QuotationDTO } from '../types/quotation';

/**
 * Safely extract error response data from unknown errors.
 */
export function extractErrorData(error: unknown): unknown {
  // Try to extract from error.response.data
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: unknown } }).response
  ) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (response && 'data' in response) {
      return response.data;
    }
  }

  // Try to extract from error.data
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    (error as { data?: unknown }).data
  ) {
    return (error as { data: unknown }).data;
  }

  return null;
}

/**
 * Extract all eligibility blocking dependencies from either a success payload or an error payload.
 */
export function extractEligibilityBlockingDependencies(
  data: unknown,
): EligibilityBlockingDependencies {
  if (!data || typeof data !== 'object') {
    return {
      blockingQuotations: [],
      blockingJobs: [],
      blockingDockets: [],
      blockingJobItems: [],
      hasBlockingDependencies: false,
    };
  }

  const record = data as {
    blockingQuotations?: unknown;
    blockingJobs?: unknown;
    blockingDockets?: unknown;
    blockingJobItems?: unknown;
  };

  const blockingQuotations = Array.isArray(record.blockingQuotations)
    ? record.blockingQuotations.filter(
        (quotation): quotation is QuotationDTO =>
          typeof quotation === 'object' &&
          quotation !== null &&
          'id' in quotation &&
          'quoteNumber' in quotation &&
          'lineItemsCount' in quotation,
      )
    : [];
  const blockingJobs = Array.isArray(record.blockingJobs)
    ? record.blockingJobs.filter(
        (job): job is JobDTO =>
          typeof job === 'object' && job !== null && 'id' in job,
      )
    : [];
  const blockingDockets = Array.isArray(record.blockingDockets)
    ? record.blockingDockets.filter(
        (docket): docket is DocketDTO =>
          typeof docket === 'object' && docket !== null && 'id' in docket,
      )
    : [];
  const blockingJobItems = Array.isArray(record.blockingJobItems)
    ? record.blockingJobItems.filter(
        (jobItem): jobItem is JobItem =>
          typeof jobItem === 'object' && jobItem !== null && 'id' in jobItem,
      )
    : [];

  return {
    blockingQuotations,
    blockingJobs,
    blockingDockets,
    blockingJobItems,
    hasBlockingDependencies:
      blockingQuotations.length > 0 ||
      blockingJobs.length > 0 ||
      blockingDockets.length > 0 ||
      blockingJobItems.length > 0,
  };
}

function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function joinValidationMessages(messages: Record<string, unknown>): string {
  return Object.entries(messages)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .map(([field, msg]) => `${formatFieldName(field)}: ${msg}`)
    .join(', ');
}

/**
 * Safely extract a human-readable message from unknown errors.
 */
export function extractErrorMessage(error: unknown): string {
  // Handle fetch/HTTP client errors: Error with response.data.errors
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: unknown } }).response?.data
  ) {
    const responseData = (error as { response?: { data?: unknown } }).response
      ?.data;

    // Handle validation shape: { messages: { field: string }, error: string }
    if (
      responseData &&
      typeof responseData === 'object' &&
      'messages' in responseData &&
      typeof (responseData as { messages?: unknown }).messages === 'object' &&
      (responseData as { messages?: unknown }).messages !== null
    ) {
      const messages = (responseData as { messages: Record<string, unknown> }).messages;
      const joined = joinValidationMessages(messages);
      if (joined) return joined;
    }

    if (
      responseData &&
      typeof responseData === 'object' &&
      'errors' in responseData &&
      Array.isArray((responseData as { errors: unknown }).errors)
    ) {
      const firstError = (responseData as { errors: unknown[] }).errors[0];
      if (
        firstError &&
        typeof firstError === 'object' &&
        'message' in firstError
      ) {
        const maybeMessage = (firstError as { message?: unknown }).message;
        if (typeof maybeMessage === 'string') return maybeMessage;
      }
    }

    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof (responseData as { message?: unknown }).message === 'string'
    ) {
      return (responseData as { message: string }).message;
    }
  }

  // Handle top-level validation shape: { messages: { field: string }, error: string }
  if (
    typeof error === 'object' &&
    error !== null &&
    'messages' in error &&
    typeof (error as { messages?: unknown }).messages === 'object' &&
    (error as { messages?: unknown }).messages !== null
  ) {
    const messages = (error as { messages: Record<string, unknown> }).messages;
    const joined = joinValidationMessages(messages);
    if (joined) return joined;
  }

  // Handle backend error shape: { errors: [{ message: string }] }
  if (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as { errors: unknown }).errors)
  ) {
    const firstError = (error as { errors: unknown[] }).errors[0];
    if (
      firstError &&
      typeof firstError === 'object' &&
      'message' in firstError
    ) {
      const maybeMessage = (firstError as { message?: unknown }).message;
      if (typeof maybeMessage === 'string') return maybeMessage;
    }
  }

  // Fall back to native Error/message fields
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string') return maybeMessage;
  }

  return 'Unknown error occurred';
}

/**
 * Extract a normalized error response shape from unknown errors.
 * Attempts to read `{ code, status, message }` directly or from the first entry of `.errors[]`.
 */
export function extractErrorResponse(
  error: unknown
): { code?: string; status?: string; message?: string } | null {
  const data = extractErrorData(error);
  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;

  // Prefer top-level fields
  const topCode =
    typeof record.code === 'string'
      ? record.code
      : typeof record.code === 'number'
      ? String(record.code)
      : undefined;
  const topStatus =
    typeof record.status === 'string' ? record.status : undefined;
  const topMessage =
    typeof record.message === 'string' ? record.message : undefined;

  // Fallback to first errors[] entry
  let nestedCode: string | undefined;
  let nestedMessage: string | undefined;
  if (Array.isArray(record.errors) && record.errors.length > 0) {
    const first = record.errors[0];
    if (first && typeof first === 'object') {
      const e = first as Record<string, unknown>;
      nestedCode =
        typeof e.code === 'string'
          ? e.code
          : typeof e.code === 'number'
          ? String(e.code)
          : undefined;
      nestedMessage = typeof e.message === 'string' ? e.message : undefined;
    }
  }

  const code = topCode ?? nestedCode;
  const status = topStatus;
  const message = topMessage ?? nestedMessage;

  if (code || status || message) {
    return { code, status, message };
  }
  return null;
}
