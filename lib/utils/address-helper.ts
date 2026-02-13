import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { Address, AddressType } from '@/lib/types/address';
import { Country, State } from 'country-state-city';

// Convert backend Address shape to legacy AddressType used by autocomplete/forms
export function toAddressType(address?: Address | null): AddressType {
  if (!address) {
    return {
      address1: '',
      address2: '',
      formattedAddress: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
      lat: 0,
      lng: 0,
      googlePlaceId: '',
    };
  }

  return {
    address1: address.streetDetailsPrimary ?? '',
    address2: address.streetDetailsOptional ?? '',
    formattedAddress: address.formattedAddress ?? '',
    city: address.city ?? '',
    region: address.state ?? '',
    postalCode: address.postcode ?? '',
    country: address.country ?? '',
    lat: address.latitude ?? 0,
    lng: address.longitude ?? 0,
    googlePlaceId: address.googlePlaceId ?? '',
  };
}

/**
 * Returns true if two AddressType values refer to the same place (same formattedAddress, googlePlaceId, lat, lng).
 * Use when updating address state from AddressAutoComplete: only replace state if the address actually changed,
 * to avoid unnecessary re-renders and to keep referential equality when the user didn't pick a new place.
 */
export function isSameAddress(
  prev: AddressType | null | undefined,
  next: AddressType | null | undefined,
): boolean {
  if (prev == null || next == null) return prev === next;
  return (
    (prev.formattedAddress ?? '') === (next.formattedAddress ?? '') &&
    (prev.googlePlaceId == null ? '' : String(prev.googlePlaceId)) ===
      (next.googlePlaceId == null ? '' : String(next.googlePlaceId)) &&
    (prev.lat ?? 0) === (next.lat ?? 0) &&
    (prev.lng ?? 0) === (next.lng ?? 0)
  );
}

// Convert legacy AddressType back to backend Address payload
export function toAddressPayload(
  address?: AddressType | null,
  originalAddress?: Address | null,
): Address | undefined {
  if (!address) return undefined;

  // Use the real googlePlaceId from the address object
  const googlePlaceId = address.googlePlaceId || '';

  // Check if address has changed compared to original
  const addressChanged =
    originalAddress &&
    (address.address1 !== (originalAddress.streetDetailsPrimary || '') ||
      address.address2 !== (originalAddress.streetDetailsOptional || '') ||
      address.city !== (originalAddress.city || '') ||
      address.region !== (originalAddress.state || '') ||
      address.postalCode !== (originalAddress.postcode || '') ||
      address.country !== (originalAddress.country || '') ||
      address.formattedAddress !== (originalAddress.formattedAddress || ''));

  return {
    // Only include id if address hasn't changed (backend doesn't accept id for updates)
    ...(!addressChanged && originalAddress?.id
      ? { id: originalAddress.id }
      : {}),
    googlePlaceId,
    formattedAddress: address.formattedAddress || '',
    streetDetailsPrimary: address.address1 || '',
    streetDetailsOptional: address.address2 || '',
    city: address.city || '',
    suburb: address.city || '',
    state: address.region || '',
    postcode: address.postalCode || '',
    country: address.country || '',
    latitude: address.lat ?? 0,
    longitude: address.lng ?? 0,
    version: originalAddress?.version ?? 0,
  };
}

/**
 * Format address string to multi-line format with country
 * Standard format:
 * - Line 1: Unit / Street Address (no commas)
 * - Line 2: SUBURB/CITY STATE/PROVINCE POSTCODE (suburb in ALL CAPS, state abbreviated for AU only)
 * - Line 3: COUNTRY (always uppercase)
 *
 * @param addressString - Comma-separated address string from backend (e.g., "Unit 4 12 Smith St, Melbourne VIC 3000, Australia")
 * @returns Object with line1, line2, and line3 formatted, or null if invalid

 * @example
 * formatAustralianAddress("123 Main St, Jiangxi 330000, China")
 * // Returns: { line1: "123 Main St", line2: "JIANGXI 330000", line3: "CHINA" }
 */
export function formatAustralianAddress(
  addressString: string | null | undefined,
): { line1: string; line2: string; line3: string } | null {
  if (!addressString || typeof addressString !== 'string') {
    return null;
  }

  const allCountries = Country.getAllCountries();

  // Try to find and extract country from the end of the address
  let detectedCountry: { name: string; isoCode: string } | null = null;
  let addressWithoutCountry = addressString.trim();

  // Check for country names or codes at the end of the address
  for (const country of allCountries) {
    // Match country name or ISO code at the end (case insensitive)
    const countryPattern = new RegExp(
      `,?\\s*(${country.name}|${country.isoCode})\\s*$`,
      'i',
    );
    if (countryPattern.test(addressString)) {
      detectedCountry = { name: country.name, isoCode: country.isoCode };
      addressWithoutCountry = addressString.replace(countryPattern, '').trim();
      break;
    }
  }

  // Default to Australia if no country detected
  if (!detectedCountry) {
    detectedCountry = { name: 'Australia', isoCode: 'AU' };
  }

  if (!addressWithoutCountry) {
    return null;
  }

  // Split by comma
  const parts = addressWithoutCountry
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  // The last part should be city/suburb, state/province, postcode
  let cityStatePostcodePart: string;
  let streetParts: string[];

  if (parts.length === 1) {
    // Single part - treat as city/state/postcode
    cityStatePostcodePart = parts[0];
    streetParts = [];
  } else {
    // Last part is city/state/postcode, rest is street address
    cityStatePostcodePart = parts[parts.length - 1];
    streetParts = parts.slice(0, -1);
  }

  // Format line 1: street address (without commas)
  const line1 = streetParts.join(' ').trim();

  // Format line 2: CITY/SUBURB STATE/PROVINCE POSTCODE
  let line2: string;

  if (detectedCountry.isoCode === 'AU') {
    // For Australian addresses, try to parse and use state abbreviation
    const australianStates = State.getStatesOfCountry('AU');

    // Try to find state in the city/state/postcode part
    let matchedState: { name: string; isoCode: string } | null = null;

    for (const state of australianStates) {
      // Match full state name or ISO code (abbreviation)
      const statePattern = new RegExp(
        `\\b(${state.name}|${state.isoCode})\\b`,
        'i',
      );
      if (statePattern.test(cityStatePostcodePart)) {
        matchedState = { name: state.name, isoCode: state.isoCode };
        break;
      }
    }

    if (matchedState) {
      // Parse format: "suburb state postcode" or "suburb stateCode postcode"
      // Replace the state (name or code) with the ISO code (abbreviation)
      const statePattern = new RegExp(
        `\\b(${matchedState.name}|${matchedState.isoCode})\\b`,
        'i',
      );
      const normalized = cityStatePostcodePart.replace(
        statePattern,
        matchedState.isoCode,
      );
      line2 = normalized.toUpperCase().replace(/\s+/g, ' ').trim();
    } else {
      // No state found, just uppercase everything
      line2 = cityStatePostcodePart.toUpperCase().replace(/\s+/g, ' ').trim();
    }
  } else {
    // For non-Australian addresses, just uppercase (no abbreviation)
    line2 = cityStatePostcodePart.toUpperCase().replace(/\s+/g, ' ').trim();
  }

  // Line 3: Country name in uppercase
  const line3 = detectedCountry.name.toUpperCase();

  return {
    line1: line1 || '',
    line2: line2 || '',
    line3: line3,
  };
}

// Hook to sync address state with a form field and handle address changes
export function useAddressSync(
  form: UseFormReturn<any>,
  fieldName: string,
  address: AddressType,
  setAddress: React.Dispatch<React.SetStateAction<AddressType>>,
  setSearchInput: React.Dispatch<React.SetStateAction<string>>,
) {
  // Sync address state to form field
  // Uses logic from customer-form to avoid unnecessary dirty states
  React.useEffect(() => {
    if (!address.formattedAddress) return;

    const current = form.getValues(fieldName);
    if (current === address.formattedAddress) return;

    form.setValue(fieldName, address.formattedAddress, {
      shouldDirty: false, // Don't mark dirty if just syncing (e.g. initial load)
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [address.formattedAddress, form, fieldName]);

  // Handler for AddressAutoComplete
  const handleAddressChange = React.useCallback(
    (newAddress: AddressType) => {
      setAddress((prev) =>
        isSameAddress(prev, newAddress) ? prev : newAddress,
      );

      if (newAddress.formattedAddress) {
        setSearchInput('');
        // Trigger validation explicitly when user selects an address
        form.trigger(fieldName);
      }
    },
    [form, fieldName, setAddress, setSearchInput],
  );

  return handleAddressChange;
}
