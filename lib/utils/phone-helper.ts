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
 * Automatically detects and normalizes all fields ending with "phone" (case-insensitive)
 * Useful for normalizing API responses that contain phone number fields
 *
 * @param obj - Object containing any phone fields (e.g., phone, contact_person_phone, businessPhone, MOBILE_PHONE, etc.)
 * @returns Object with all phone number fields normalized to E.164 format
 *
 * @example
 * normalizeObjectPhoneNumbers({ phone: "0412345678", contact_person_phone: "0498765432", businessPhone: "0387654321" })
 * // Returns { phone: "+61412345678", contact_person_phone: "+61498765432", businessPhone: "+61387654321" }
 */
export function normalizeObjectPhoneNumbers<T>(
  obj: T
): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result = { ...obj } as Record<string, unknown>;
  // Regex pattern to match any field ending with "phone" (case-insensitive)
  const phoneFieldPattern = /phone$/i;

  // Iterate through all keys in the object
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      // Check if the key ends with "phone" (case-insensitive)
      if (phoneFieldPattern.test(key)) {
        const value = result[key];
        // Only normalize if it's a string value
        if (typeof value === 'string') {
          result[key] = normalizePhoneNumber(value);
        }
      }
    }
  }

  return result as T;
}
