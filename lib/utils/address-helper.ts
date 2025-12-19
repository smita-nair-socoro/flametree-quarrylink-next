import type { Address, AddressType } from '@/lib/types/address';

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
    // googlePlaceId: address.googlePlaceId ?? '', temporary changed to number for backend testing
  };
}

// Convert legacy AddressType back to backend Address payload
export function toAddressPayload(
  address?: AddressType | null,
  originalAddress?: Address | null
): Address | undefined {
  if (!address) return undefined;

  const googlePlaceId = 123456789012; // TEMPORARY FIX FOR BACKEND
  // address.googlePlaceId !== undefined && address.googlePlaceId !== null
  //   ? String(address.googlePlaceId)
  //   : '';

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
