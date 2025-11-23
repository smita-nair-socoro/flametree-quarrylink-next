/**
 * Phone number utility functions for normalizing phone numbers
 * from backend format to E.164 format required by react-phone-number-input
 */

/**
 * Transforms phone numbers from backend format to E.164 format
 * Adds +61 country code if the number doesn't already have it
 *
 * @param phone - The phone number from the backend (e.g., "0412345678")
 * @returns E.164 formatted phone number (e.g., "+61412345678") or empty string if invalid
 *
 * @example
 * normalizePhoneNumber("0412345678") // Returns "+61412345678"
 * normalizePhoneNumber("+61412345678") // Returns "+61412345678"
 * normalizePhoneNumber("412345678") // Returns "+61412345678"
 * normalizePhoneNumber("") // Returns ""
 * normalizePhoneNumber(null) // Returns ""
 */
export function normalizePhoneNumber(
  phone: string | undefined | null
): string {
  if (!phone) return '';

  // Trim whitespace
  const trimmedPhone = phone.trim();
  if (!trimmedPhone) return '';

  // If it already starts with +, return as is
  if (trimmedPhone.startsWith('+')) return trimmedPhone;

  // If it starts with 0, remove the 0 and add +61
  if (trimmedPhone.startsWith('0')) {
    return `+61${trimmedPhone.slice(1)}`;
  }

  // If it's just digits without 0, add +61
  return `+61${trimmedPhone}`;
}

/**
 * Transforms an object's phone number fields to E.164 format
 * Useful for normalizing API responses that contain phone number fields
 *
 * @param obj - Object containing phone and/or contact_person_phone fields
 * @returns Object with normalized phone numbers
 */
export function normalizeObjectPhoneNumbers<
  T extends {
    phone?: string | null;
    contact_person_phone?: string | null;
  }
>(obj: T): T {
  return {
    ...obj,
    ...(obj.phone !== undefined && { phone: normalizePhoneNumber(obj.phone) }),
    ...(obj.contact_person_phone !== undefined && {
      contact_person_phone: normalizePhoneNumber(obj.contact_person_phone),
    }),
  };
}
