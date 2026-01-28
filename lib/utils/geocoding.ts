import { getRuntimeConfig } from '@/app/stores/runtimeConfigStore';
import type { AddressType } from '@/lib/types/address';

interface GeocodingAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodingResult {
  formatted_address: string;
  place_id: string;
  address_components: GeocodingAddressComponent[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface GeocodingResponse {
  status: string;
  results: GeocodingResult[];
  error_message?: string;
}

/**
 * Extract address component by type from geocoding results
 */
function getAddressComponent(
  components: GeocodingAddressComponent[],
  type: string,
  useShortName = false
): string {
  const component = components.find((c) => c.types.includes(type));
  return component ? (useShortName ? component.short_name : component.long_name) : '';
}

/**
 * Build street address from components (street number + route)
 */
function buildStreetAddress(components: GeocodingAddressComponent[]): string {
  const streetNumber = getAddressComponent(components, 'street_number');
  const route = getAddressComponent(components, 'route');

  if (streetNumber && route) {
    return `${streetNumber} ${route}`;
  }
  if (route) {
    return route;
  }
  // Try subpremise or premise as fallback
  const subpremise = getAddressComponent(components, 'subpremise');
  const premise = getAddressComponent(components, 'premise');
  return subpremise || premise || '';
}

/**
 * Reverse geocode coordinates to address components
 * Returns a partial AddressType with available fields filled
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  try {
    const apiKey = getRuntimeConfig().GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        address: createFallbackAddress(lat, lng),
        error: 'Google Maps API key not configured',
      };
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Geocoding request failed:', response.status, response.statusText);
      return {
        success: false,
        address: createFallbackAddress(lat, lng),
        error: `Geocoding request failed: ${response.statusText}`,
      };
    }

    const data: GeocodingResponse = await response.json();

    if (data.status === 'ZERO_RESULTS' || !data.results || data.results.length === 0) {
      // Remote area with no address data
      return {
        success: true,
        address: createFallbackAddress(lat, lng),
      };
    }

    if (data.status !== 'OK') {
      console.error('Geocoding API error:', data.status, data.error_message);
      return {
        success: false,
        address: createFallbackAddress(lat, lng),
        error: data.error_message || `Geocoding failed: ${data.status}`,
      };
    }

    // Use the first (most specific) result
    const result = data.results[0];
    const components = result.address_components;

    // Extract address components
    const address1 = buildStreetAddress(components);
    const city =
      getAddressComponent(components, 'locality') ||
      getAddressComponent(components, 'sublocality_level_1') ||
      getAddressComponent(components, 'administrative_area_level_2');
    const region =
      getAddressComponent(components, 'administrative_area_level_1');
    const postalCode = getAddressComponent(components, 'postal_code');
    const country = getAddressComponent(components, 'country');

    // If we have very little address information, use fallback format
    const hasMinimalInfo = !address1 && !city && !region;

    return {
      success: true,
      address: {
        address1: address1 || '',
        address2: '',
        city: city || '',
        region: region || '',
        postalCode: postalCode || '',
        country: country || '',
        formattedAddress: hasMinimalInfo
          ? createFallbackFormattedAddress(lat, lng)
          : result.formatted_address,
        lat,
        lng,
        googlePlaceId: result.place_id || '',
      },
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      success: false,
      address: createFallbackAddress(lat, lng),
      error: error instanceof Error ? error.message : 'Unknown geocoding error',
    };
  }
}

/**
 * Create a fallback address for remote areas or when geocoding fails
 */
function createFallbackAddress(lat: number, lng: number): Partial<AddressType> {
  return {
    address1: '',
    address2: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    formattedAddress: createFallbackFormattedAddress(lat, lng),
    lat,
    lng,
    googlePlaceId: '',
  };
}

/**
 * Create a fallback formatted address string from coordinates
 */
export function createFallbackFormattedAddress(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Default map center coordinates by country code
 */
export const DEFAULT_MAP_CENTERS: Record<string, { lat: number; lng: number }> = {
  AU: { lat: -25.2744, lng: 133.7751 }, // Australia center
  US: { lat: 39.8283, lng: -98.5795 },  // USA center
  UK: { lat: 55.3781, lng: -3.4360 },   // UK center
  NZ: { lat: -40.9006, lng: 174.8860 }, // New Zealand center
  DEFAULT: { lat: -25.2744, lng: 133.7751 }, // Default to Australia
};

/**
 * Get default map center based on country or fallback
 */
export function getDefaultMapCenter(countryCode?: string): { lat: number; lng: number } {
  if (countryCode && DEFAULT_MAP_CENTERS[countryCode.toUpperCase()]) {
    return DEFAULT_MAP_CENTERS[countryCode.toUpperCase()];
  }
  return DEFAULT_MAP_CENTERS.DEFAULT;
}

/**
 * Check if coordinates are valid (not 0,0 and within valid range)
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  // Check for null island (0,0) which is often a default/invalid value
  if (lat === 0 && lng === 0) {
    return false;
  }
  // Check valid latitude range (-90 to 90)
  if (lat < -90 || lat > 90) {
    return false;
  }
  // Check valid longitude range (-180 to 180)
  if (lng < -180 || lng > 180) {
    return false;
  }
  return true;
}

/**
 * Result type for reverse geocoding
 */
export interface ReverseGeocodeResult {
  success: boolean;
  address: Partial<AddressType>;
  error?: string;
}

/**
 * Normalize address from map selection.
 *
 * IMPORTANT: Map selection is AUTHORITATIVE. This function creates a complete
 * AddressType where each field is explicitly set from the geocode result or
 * cleared to empty string. It does NOT merge with previous values (except for
 * explicitly preserved fields like country when specified).
 *
 * Policy:
 * - lat/lng: Always set from the pin location
 * - address1: Set from geocode OR "" (never keeps stale data)
 * - address2: Always "" (geocode doesn't return this)
 * - city: Set from geocode OR ""
 * - region: Set from geocode OR ""
 * - postalCode: Set from geocode OR ""
 * - country: Set from geocode OR "" (could optionally preserve previous)
 * - formattedAddress: Set from geocode OR fallback to "lat, lng"
 * - googlePlaceId: Set from geocode OR ""
 * - locationSource: Always 'MAP_PIN'
 */
export function normalizeAddressFromMapSelection(
  geocodeResult: ReverseGeocodeResult,
  lat: number,
  lng: number,
  options?: {
    /** If true, preserve previous country when geocode returns none */
    preserveCountryIfMissing?: boolean;
    previousCountry?: string;
  }
): AddressType {
  const geocoded = geocodeResult.address;

  // Determine country - optionally preserve previous if geocode returned nothing
  let country = geocoded.country || '';
  if (!country && options?.preserveCountryIfMissing && options.previousCountry) {
    country = options.previousCountry;
  }

  // Build formattedAddress - use geocoded if available, else fallback
  const hasAnyAddressInfo = !!(
    geocoded.address1 ||
    geocoded.city ||
    geocoded.region ||
    geocoded.postalCode
  );
  const formattedAddress = hasAnyAddressInfo && geocoded.formattedAddress
    ? geocoded.formattedAddress
    : createFallbackFormattedAddress(lat, lng);

  return {
    // Street-level fields: explicitly clear if not present
    address1: geocoded.address1 || '',
    address2: '', // Always clear - geocode never returns this

    // Location fields: explicitly clear if not present
    city: geocoded.city || '',
    region: geocoded.region || '',
    postalCode: geocoded.postalCode || '',
    country,

    // Formatted and IDs
    formattedAddress,
    googlePlaceId: geocoded.googlePlaceId || '',

    // Coordinates: always from the pin
    lat,
    lng,

    // Source tracking
    locationSource: 'MAP_PIN',
  };
}

/**
 * Forward geocode an address string to coordinates
 * Used for form → map sync when user edits address fields
 */
export async function forwardGeocode(
  addressComponents: {
    address1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  }
): Promise<{ success: boolean; lat: number; lng: number; error?: string }> {
  try {
    const apiKey = getRuntimeConfig().GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return { success: false, lat: 0, lng: 0, error: 'API key not configured' };
    }

    // Build address string from components
    const parts: string[] = [];
    if (addressComponents.address1?.trim()) {
      parts.push(addressComponents.address1.trim());
    }
    if (addressComponents.city?.trim()) {
      parts.push(addressComponents.city.trim());
    }
    if (addressComponents.region?.trim()) {
      parts.push(addressComponents.region.trim());
    }
    if (addressComponents.postalCode?.trim()) {
      parts.push(addressComponents.postalCode.trim());
    }
    if (addressComponents.country?.trim()) {
      parts.push(addressComponents.country.trim());
    }

    // Need at least country + (city or address1) for meaningful geocode
    const hasCountry = !!addressComponents.country?.trim();
    const hasLocation = !!(addressComponents.city?.trim() || addressComponents.address1?.trim());

    if (!hasCountry || !hasLocation) {
      return { success: false, lat: 0, lng: 0, error: 'Insufficient address data' };
    }

    const addressString = parts.join(', ');
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, lat: 0, lng: 0, error: 'Geocoding request failed' };
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return { success: false, lat: 0, lng: 0, error: 'No results found' };
    }

    const location = data.results[0].geometry.location;
    return {
      success: true,
      lat: location.lat,
      lng: location.lng,
    };
  } catch (error) {
    console.error('Forward geocoding error:', error);
    return {
      success: false,
      lat: 0,
      lng: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
