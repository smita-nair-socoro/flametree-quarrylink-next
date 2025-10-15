/**
 * Normalize a phone number to E.164 format by removing spaces.
 * This is required for react-phone-number-input component which expects
 * phone numbers in strict E.164 format (e.g., "+61413245678" not "+61 413 245 678").
 *
 * @param value - The phone number string from storage (may contain spaces or be "N/A")
 * @returns E.164 formatted phone number or empty string if invalid/empty
 *
 * @example
 * normalizePhoneE164("+61 413 245 678") // "+61413245678"
 * normalizePhoneE164("N/A") // ""
 * normalizePhoneE164(null) // ""
 */
export function normalizePhoneE164(
  value: string | undefined | null
): string {
  // Return empty string for null, undefined, or "N/A"
  if (!value || value === 'N/A') {
    return '';
  }

  // Remove all whitespace characters to make E.164 compliant
  // E.164 format: +[country code][subscriber number] with no spaces
  return value.replace(/\s+/g, '');
}

/**
 * Format a phone number for display with spaces for better readability.
 * Converts E.164 format to human-readable format with spaces.
 *
 * @param value - The phone number in E.164 format (no spaces)
 * @returns Formatted phone number with spaces or empty string
 *
 * @example
 * formatPhoneDisplay("+61413245678") // "+61 413 245 678"
 * formatPhoneDisplay("") // ""
 */
export function formatPhoneDisplay(
  value: string | undefined | null
): string {
  if (!value || value === 'N/A') {
    return '';
  }

  // Australian phone number format: +61 XXX XXX XXX
  // Match pattern: + followed by country code, then groups of digits
  const match = value.match(/^(\+\d{1,3})(\d{3})(\d{3})(\d{3})$/);

  if (match) {
    // Format as: +XX XXX XXX XXX
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }

  // If pattern doesn't match (different country or format), return as-is
  return value;
}

/**
 * Validate if a phone number is either empty (acceptable) or valid E.164 format.
 * Used for form validation to allow optional phone fields.
 *
 * @param value - The phone number to validate
 * @returns true if empty or valid E.164 format, false otherwise
 *
 * @example
 * isValidPhoneOrEmpty("") // true
 * isValidPhoneOrEmpty("+61413245678") // true
 * isValidPhoneOrEmpty("+61 413 245 678") // false (has spaces)
 */
export function isValidPhoneOrEmpty(
  value: string | undefined | null
): boolean {
  // Empty values are acceptable for optional fields
  if (!value || value === '') {
    return true;
  }

  // E.164 format: starts with +, followed by 1-15 digits, no spaces
  const e164Pattern = /^\+\d{1,15}$/;
  return e164Pattern.test(value);
}

/**
 * Convert a phone number to E.164 format for API submission,
 * or return null if empty (for optional fields in database).
 *
 * @param value - The phone number to convert
 * @returns E.164 formatted phone or null if empty
 *
 * @example
 * phoneToE164OrNull("+61413245678") // "+61413245678"
 * phoneToE164OrNull("") // null
 * phoneToE164OrNull("N/A") // null
 */
export function phoneToE164OrNull(
  value: string | undefined | null
): string | null {
  const normalized = normalizePhoneE164(value);

  // Return null for empty values (backend can store as NULL or "N/A")
  if (!normalized || normalized === '') {
    return null;
  }

  return normalized;
}

/**
 * Convert "N/A" or empty phone numbers to empty string.
 * This is a specialized helper for forms that need to display
 * empty fields instead of "N/A" placeholders.
 *
 * @param value - The phone number that might be "N/A"
 * @returns Empty string if N/A, otherwise the original value
 *
 * @example
 * phoneNAtoEmpty("N/A") // ""
 * phoneNAtoEmpty("+61413245678") // "+61413245678"
 */
export function phoneNAtoEmpty(value: string | undefined | null): string {
  if (!value || value === 'N/A') {
    return '';
  }
  return value;
}
