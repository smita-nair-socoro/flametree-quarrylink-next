import type { AddressType } from '@/lib/types/address';
import { z } from 'zod';

// Default values for missing address fields
const DEFAULT_ADDRESS_VALUES = {
  city: 'Sydney',
  region: 'NSW',
  postalCode: '',
  country: 'Australia',
} as const;

/**
 * Fills in missing address fields with default values.
 * Used when Google Places API doesn't return complete address data.
 */
export const fillMissingAddressFields = (address: AddressType): AddressType => {
  return {
    ...address,
    city: address.city?.trim() || DEFAULT_ADDRESS_VALUES.city,
    region: address.region?.trim() || DEFAULT_ADDRESS_VALUES.region,
    postalCode: address.postalCode?.trim() || DEFAULT_ADDRESS_VALUES.postalCode,
    country: address.country?.trim() || DEFAULT_ADDRESS_VALUES.country,
    googlePlaceId: address.googlePlaceId,
  };
};

/**
 * Checks if the autocomplete address is valid.
 */
export const isValidAutocomplete = (
  address: AddressType,
  searchInput: string,
): boolean => {
  if (searchInput.trim() === '') {
    return true;
  }
  const AddressSchema = z.object({
    streetDetailsPrimary: z
      .union([
        z
          .string()
          .min(1, 'Address line 1 is required')
          .max(100, 'Address line 1 must be less than 100 characters')
          .regex(/^[a-zA-Z0-9\s,.&/()\-]+$/, 'Invalid address'),
        z.literal(''),
      ])
      .optional(),
    streetDetailsOptional: z.string().optional(),
    formattedAddress: z.string().min(1, 'Formatted address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(), // State/region may not be required for all countries
    postcode: z
      .union([
        z
          .string()
          .min(1, 'Postal code is required')
          // Global postal code format: allows alphanumeric, spaces, and hyphens (1-12 chars)
          // Covers formats like: AU "2000", US "90210" or "90210-1234", UK "SW1A 1AA", CA "K1A 0B1"
          .regex(/^[a-zA-Z0-9\s-]{1,12}$/, 'Invalid postal code format'),
        z.literal(''),
      ])
      .optional(),

    country: z.string().min(1, 'Country is required'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    googlePlaceId: z.union([z.string(), z.number()]).optional(),
  });
  const result = AddressSchema.safeParse(address);
  return result.success;
};
