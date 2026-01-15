import { normalizePhoneNumber } from './phone-helper';
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
      quoteType: 'DELIVERY' as const,
      customerId: 0,
      accountManagerSub: '',
      projectName: '',
      deliveryStartDate: undefined,
      deliveryWindowStart: '',
      deliveryWindowEnd: '',
      expiryDate: undefined,
      deliveryAddress: '',
      phone: '',
      email: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Jay Woo Choi',
      lastModifiedBy: 'Armin Menhaji',
    };
  }

  // Helper to format Date to HH:MM time string
  const formatTimeString = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    quoteType: quotation?.quoteType || 'DELIVERY',
    customerId: quotation?.customerId || 0,
    accountManagerSub: quotation?.accountManagerSub || '',
    projectName: quotation?.projectName || '',
    deliveryStartDate: quotation?.deliveryStartDate
      ? new Date(quotation.deliveryStartDate)
      : undefined,
    deliveryWindowStart: formatTimeString(quotation?.deliveryWindowStart),
    deliveryWindowEnd: formatTimeString(quotation?.deliveryWindowEnd),
    expiryDate: quotation?.expiryDate
      ? new Date(quotation.expiryDate)
      : undefined,
    deliveryAddress: quotation?.deliveryAddress?.formattedAddress || '',
    email: quotation?.email || quotation?.customerDto?.email || '',
    phone: normalizePhoneNumber(
      quotation?.phone || quotation?.customerDto?.phone || ''
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
