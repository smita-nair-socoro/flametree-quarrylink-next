export interface AddressType {
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
