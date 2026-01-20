import type { AddressType } from '@/lib/types/address';
import { z } from 'zod';

/**
 * Checks if the autocomplete address is valid.
 */
export const isValidAutocomplete = (
  address: AddressType,
  searchInput: string
): boolean => {
  if (searchInput.trim() === '') {
    return true;
  }
  const AddressSchema = z.object({
    streetDetailsPrimary: z
      .string()
      .min(1, 'Address line 1 is required')
      .max(100, 'Address line 1 must be less than 100 characters')
      .regex(/^[a-zA-Z0-9\s,.&]+$/, 'Invalid address'),
    streetDetailsOptional: z.string().optional(),
    formattedAddress: z.string().min(1, 'Formatted address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(), // State/region may not be required for all countries
    postcode: z
      .string()
      .min(1, 'Postal code is required')
      // Global postal code format: allows alphanumeric, spaces, and hyphens (1-12 chars)
      // Covers formats like: AU "2000", US "90210" or "90210-1234", UK "SW1A 1AA", CA "K1A 0B1"
      .regex(/^[a-zA-Z0-9\s-]{1,12}$/, 'Invalid postal code format'),

    country: z.string().min(1, 'Country is required'),
    latitude: z.number().nonnegative(),
    longitude: z.number().nonnegative(),
  });
  const result = AddressSchema.safeParse(address);
  return result.success;
};
