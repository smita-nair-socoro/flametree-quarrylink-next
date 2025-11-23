// Backend Address structure (from API)
export interface Address {
  id: number;
  suburb: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  streetDetailsPrimary: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  googlePlaceId: string;
  version: number;
}

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
}
