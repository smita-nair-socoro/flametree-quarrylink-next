import { normalizePhoneNumber } from './phone-helper';
import { parseCalendarDate } from './date';
import type { Quotation } from '../types/quotation';

/**
 * Transform quotation data to form values
 * Handles date formatting and field normalization for the quotation form
 */
export function quotationToFormValues(
  quotation: Quotation | null,
  isEditing: boolean
) {
  if (!quotation && !isEditing) {
    // New quotation defaults
    return {
      customerId: 0,
      accountManagerSub: '',
      projectName: '',
      deliveryStartDate: undefined,
      deliveryWindowStart: '',
      deliveryWindowEnd: '',
      expiryDate: undefined,
      phone: '',
      receiptEmail: '',
    };
  }

  const formatTimeString = (timeStr?: string | null) => {
    if (!timeStr) return '';

    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
      return timeStr.substring(0, 5);
    }

    if (timeStr.includes('T')) {
      return timeStr.split('T')[1]?.substring(0, 5) ?? '';
    }

    if (timeStr.includes(' ')) {
      return timeStr.split(' ')[1]?.substring(0, 5) ?? '';
    }

    return timeStr.substring(0, 5);
  };

  return {
    customerId: quotation?.customerId || 0,
    accountManagerSub: quotation?.accountManagerSub || '',
    projectName: quotation?.projectName || '',
    deliveryStartDate: quotation?.deliveryStartDate
      ? parseCalendarDate(quotation.deliveryStartDate)
      : undefined,
    deliveryWindowStart: formatTimeString(quotation?.deliveryWindowStart),
    deliveryWindowEnd: formatTimeString(quotation?.deliveryWindowEnd),
    expiryDate: quotation?.expiryDate
      ? parseCalendarDate(quotation.expiryDate)
      : undefined,
    receiptEmail: (quotation?.emailRecipients || []).join(','),
    phone: normalizePhoneNumber(
      quotation?.phone || quotation?.customerWithAddressResponseDto?.phone || ''
    ),
  };
}
