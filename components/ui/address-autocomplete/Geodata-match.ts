import { geocodePostalAddress } from '@/lib/utils/geocoding';

interface AddressInput {
  formattedAddress?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export async function resolveAddressCoords(
  address: AddressInput,
): Promise<{ lat: number; lng: number } | null> {
  const query =
    address.formattedAddress ||
    [address.suburb || address.city, address.state, address.postcode, address.country]
      .filter(Boolean)
      .join(', ');

  if (!query) return null;

  const results = await geocodePostalAddress(query);
  if (results.length === 0) return null;

  const { lat, lng } = results[0];
  return lat && lng ? { lat, lng } : null;
}
