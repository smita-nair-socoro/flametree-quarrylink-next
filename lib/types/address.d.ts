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
  googlePlaceId?: string; // Optional Google Place ID from Places API
}

// Delivery Address DTO nested in quotation
export interface DeliveryAddressDTO {
  id: number;
  googlePlaceId: string;
  formattedAddress: string;
  streetDetailsPrimary: string;
  streetDetailsOptional: string;
  city: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  latitude: number;
  longitude: number;
  version: number;
}
