import { describe, expect, test } from 'vitest';
import {
  toAddressType,
  isSameAddress,
  toAddressPayload,
  formatAustralianAddress,
} from '../address-helper';
import type { Address } from '@/lib/types/address';
import type { AddressType } from '@/lib/types/address';

const backendAddress: Address = {
  id: 1,
  suburb: 'Melbourne',
  city: 'Melbourne',
  state: 'VIC',
  country: 'Australia',
  postcode: '3000',
  streetDetailsPrimary: '123 Smith St',
  streetDetailsOptional: 'Unit 4',
  formattedAddress: 'Unit 4 123 Smith St, Melbourne VIC 3000, Australia',
  latitude: -37.8,
  longitude: 144.9,
  googlePlaceId: 'place-123',
  version: 2,
};

describe('toAddressType', () => {
  test('maps a backend Address to the legacy AddressType shape', () => {
    expect(toAddressType(backendAddress)).toEqual({
      address1: '123 Smith St',
      address2: 'Unit 4',
      formattedAddress: 'Unit 4 123 Smith St, Melbourne VIC 3000, Australia',
      city: 'Melbourne',
      region: 'VIC',
      postalCode: '3000',
      country: 'Australia',
      lat: -37.8,
      lng: 144.9,
      googlePlaceId: 'place-123',
    });
  });

  test('returns empty defaults for null/undefined address', () => {
    expect(toAddressType(null)).toEqual({
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
    });
    expect(toAddressType(undefined)).toEqual(toAddressType(null));
  });
});

describe('isSameAddress', () => {
  const base: AddressType = {
    address1: '1 Main St',
    address2: '',
    formattedAddress: '1 Main St, Melbourne VIC 3000',
    city: 'Melbourne',
    region: 'VIC',
    postalCode: '3000',
    country: 'Australia',
    lat: -37.8,
    lng: 144.9,
    googlePlaceId: 'place-1',
  };

  test('returns true for identical addresses', () => {
    expect(isSameAddress(base, { ...base })).toBe(true);
  });

  test('returns false when formattedAddress differs', () => {
    expect(
      isSameAddress(base, { ...base, formattedAddress: 'Other address' }),
    ).toBe(false);
  });

  test('returns false when lat/lng differ', () => {
    expect(isSameAddress(base, { ...base, lat: 1 })).toBe(false);
  });

  test('returns prev === next (strict equality) when either side is nullish', () => {
    expect(isSameAddress(null, undefined)).toBe(false);
    expect(isSameAddress(null, null)).toBe(true);
    expect(isSameAddress(undefined, undefined)).toBe(true);
    expect(isSameAddress(null, base)).toBe(false);
    expect(isSameAddress(base, null)).toBe(false);
  });
});

describe('toAddressPayload', () => {
  const address: AddressType = {
    address1: '1 Main St',
    address2: 'Unit 2',
    formattedAddress: '1 Main St, Melbourne VIC 3000',
    city: 'Melbourne',
    region: 'VIC',
    postalCode: '3000',
    country: 'Australia',
    lat: -37.8,
    lng: 144.9,
    googlePlaceId: 'place-1',
  };

  test('returns undefined when address is not provided', () => {
    expect(toAddressPayload(undefined)).toBeUndefined();
    expect(toAddressPayload(null)).toBeUndefined();
  });

  test('builds a backend payload from an AddressType', () => {
    const payload = toAddressPayload(address);
    expect(payload).toMatchObject({
      googlePlaceId: 'place-1',
      formattedAddress: '1 Main St, Melbourne VIC 3000',
      streetDetailsPrimary: '1 Main St',
      streetDetailsOptional: 'Unit 2',
      city: 'Melbourne',
      suburb: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      country: 'Australia',
      latitude: -37.8,
      longitude: 144.9,
    });
  });

  test('preserves id when the address matches the original unchanged', () => {
    const unchanged = toAddressType(backendAddress);
    const payload = toAddressPayload(unchanged, backendAddress);
    expect(payload?.id).toBe(backendAddress.id);
    expect(payload?.version).toBe(backendAddress.version);
  });

  test('omits id when the address has changed from the original', () => {
    const changed = { ...address, city: 'Sydney' };
    const payload = toAddressPayload(changed, backendAddress);
    expect(payload?.id).toBeUndefined();
  });
});

describe('formatAustralianAddress', () => {
  test('returns null for falsy input', () => {
    expect(formatAustralianAddress(null)).toBeNull();
    expect(formatAustralianAddress(undefined)).toBeNull();
    expect(formatAustralianAddress('')).toBeNull();
  });

  test('formats an Australian address with state abbreviation', () => {
    const result = formatAustralianAddress(
      'Unit 4 12 Smith St, Melbourne VIC 3000, Australia',
    );
    expect(result).toEqual({
      line1: 'Unit 4 12 Smith St',
      line2: 'MELBOURNE VIC 3000',
      line3: 'AUSTRALIA',
    });
  });

  test('defaults to Australia when no country is detected', () => {
    const result = formatAustralianAddress('12 Smith St, Melbourne VIC 3000');
    expect(result?.line3).toBe('AUSTRALIA');
  });

  test('formats a non-Australian address without state abbreviation', () => {
    const result = formatAustralianAddress(
      '123 Main St, Jiangxi 330000, China',
    );
    expect(result).toEqual({
      line1: '123 Main St',
      line2: 'JIANGXI 330000',
      line3: 'CHINA',
    });
  });

  test('handles a single-part address with no street segment', () => {
    const result = formatAustralianAddress('Melbourne VIC 3000, Australia');
    expect(result).toEqual({
      line1: '',
      line2: 'MELBOURNE VIC 3000',
      line3: 'AUSTRALIA',
    });
  });
});
