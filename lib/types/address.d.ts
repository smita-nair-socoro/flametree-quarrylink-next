// Backend Address structure (from API Get All Quarry and Suppliers)
export interface Address {
  id?: number;
  suburb: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  streetDetailsPrimary: string;
  streetDetailsOptional?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  googlePlaceId: string | number; // Google Place ID from Places API
  version: number;
}

export interface CustomerDeliveryAddress {
  id?: number;
  address?: Address;
  customerId: number;
  addressId?: number;
  address: Address;
  inUse: boolean;
  lastUsedAt?: string;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
}

/**
 * How the address location was determined.
 * - AUTOCOMPLETE_PLACE: Selected from Google Places autocomplete suggestions
 * - MAP_PIN: User placed/dragged pin on map
 * - MANUAL: Manually entered by user (no coordinates or geocoded)
 *
 * Note: This field is frontend-only and not sent to backend.
 */
export type LocationSource = 'AUTOCOMPLETE_PLACE' | 'MAP_PIN' | 'MANUAL';

// Legacy address type (keep for compatibility)
export interface AddressType {
  address1: string;
  address2: string;
  formattedAddress: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
  googlePlaceId?: string | number; // Optional Google Place ID from Places API
  /** Frontend-only field to track how location was determined. Not sent to backend. */
  locationSource?: LocationSource;
}
