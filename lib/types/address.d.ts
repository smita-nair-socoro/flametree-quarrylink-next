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
