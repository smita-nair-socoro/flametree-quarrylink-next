import { normalizePhoneNumber } from './phone-helper';
import { parseCalendarDate } from './date';
import {
  normalizeDeliveryTimeWindowEnd,
  normalizeDeliveryTimeWindowStart,
} from './time';
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

  return {
    customerId: quotation?.customerId || 0,
    accountManagerSub: quotation?.accountManagerSub || '',
    projectName: quotation?.projectName || '',
    deliveryStartDate: quotation?.deliveryStartDate
      ? parseCalendarDate(quotation.deliveryStartDate)
      : undefined,
    deliveryWindowStart: normalizeDeliveryTimeWindowStart(
      quotation?.deliveryWindowStart,
    ),
    deliveryWindowEnd: normalizeDeliveryTimeWindowEnd(
      quotation?.deliveryWindowEnd,
    ),
    expiryDate: quotation?.expiryDate
      ? parseCalendarDate(quotation.expiryDate)
      : undefined,
    receiptEmail: (quotation?.emailRecipients || []).join(','),
    phone: normalizePhoneNumber(
      quotation?.phone || quotation?.customerWithAddressResponseDto?.phone || ''
    ),
  };
}
