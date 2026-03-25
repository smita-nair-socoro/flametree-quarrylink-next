import { normalizePhoneNumber } from './phone-helper';
import { parseAsUTC } from './date';
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
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Jay Woo Choi',
      lastModifiedBy: 'Armin Menhaji',
    };
  }

  // Helper to format Date to HH:MM time string
  const formatTimeString = (dateString?: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    customerId: quotation?.customerId || 0,
    accountManagerSub: quotation?.accountManagerSub || '',
    projectName: quotation?.projectName || '',
    deliveryStartDate: quotation?.deliveryStartDate
      ? parseAsUTC(quotation.deliveryStartDate)
      : undefined,
    deliveryWindowStart: formatTimeString(quotation?.deliveryWindowStart),
    deliveryWindowEnd: formatTimeString(quotation?.deliveryWindowEnd),
    expiryDate: quotation?.expiryDate
      ? parseAsUTC(quotation.expiryDate)
      : undefined,
    receiptEmail: (() => {
      const customerEmail = quotation?.email || quotation?.customerWithAddressResponseDto?.email;
      return (quotation?.additionalEmailRecipients || [])
        .filter((e) => e !== customerEmail)
        .join(',');
    })(),
    phone: normalizePhoneNumber(
      quotation?.phone || quotation?.customerWithAddressResponseDto?.phone || ''
    ),
    createdAt: quotation?.createdAt
      ? new Date(quotation.createdAt)
      : new Date(),
    updatedAt: quotation?.updatedAt
      ? new Date(quotation.updatedAt)
      : new Date(),
    createdBy: isEditing ? quotation?.createdBy || 'Unknown' : 'Jaywoo Choi',
    lastModifiedBy: isEditing
      ? quotation?.lastModifiedBy || 'Unknown'
      : 'Armin Menhaji',
  };
}
