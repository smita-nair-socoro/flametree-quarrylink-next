import { describe, expect, test } from 'vitest';
import {
  isValidCoordinates,
  getDefaultMapCenter,
  createFallbackFormattedAddress,
  normalizeAddressFromMapSelection,
  DEFAULT_MAP_CENTERS,
  type ReverseGeocodeResult,
} from '../geocoding';

describe('isValidCoordinates', () => {
  test('rejects null island (0,0)', () => {
    expect(isValidCoordinates(0, 0)).toBe(false);
  });

  test('rejects out-of-range latitude/longitude', () => {
    expect(isValidCoordinates(-91, 0)).toBe(false);
    expect(isValidCoordinates(91, 0)).toBe(false);
    expect(isValidCoordinates(0, -181)).toBe(false);
    expect(isValidCoordinates(0, 181)).toBe(false);
  });

  test('accepts valid coordinates', () => {
    expect(isValidCoordinates(-37.8, 144.9)).toBe(true);
  });
});

describe('getDefaultMapCenter', () => {
  test('returns the center for a known country code', () => {
    expect(getDefaultMapCenter('AU')).toEqual(DEFAULT_MAP_CENTERS.AU);
    expect(getDefaultMapCenter('nz')).toEqual(DEFAULT_MAP_CENTERS.NZ);
  });

  test('falls back to DEFAULT for unknown or missing country codes', () => {
    expect(getDefaultMapCenter('XX')).toEqual(DEFAULT_MAP_CENTERS.DEFAULT);
    expect(getDefaultMapCenter()).toEqual(DEFAULT_MAP_CENTERS.DEFAULT);
  });
});

describe('createFallbackFormattedAddress', () => {
  test('formats coordinates to 6 decimal places', () => {
    expect(createFallbackFormattedAddress(-37.8, 144.9)).toBe(
      '-37.800000, 144.900000',
    );
  });
});

describe('normalizeAddressFromMapSelection', () => {
  const successResult: ReverseGeocodeResult = {
    success: true,
    address: {
      address1: '1 Main St',
      city: 'Melbourne',
      region: 'VIC',
      postalCode: '3000',
      country: 'Australia',
      formattedAddress: '1 Main St, Melbourne VIC 3000, Australia',
      googlePlaceId: 'place-1',
    },
  };

  test('builds a complete AddressType from a successful geocode result', () => {
    const result = normalizeAddressFromMapSelection(
      successResult,
      -37.8,
      144.9,
    );
    expect(result).toEqual({
      address1: '1 Main St',
      address2: '',
      city: 'Melbourne',
      region: 'VIC',
      postalCode: '3000',
      country: 'Australia',
      formattedAddress: '1 Main St, Melbourne VIC 3000, Australia',
      googlePlaceId: 'place-1',
      lat: -37.8,
      lng: 144.9,
      locationSource: 'MAP_PIN',
    });
  });

  test('clears fields and falls back to lat/lng string when geocode has no info', () => {
    const emptyResult: ReverseGeocodeResult = {
      success: true,
      address: {},
    };
    const result = normalizeAddressFromMapSelection(emptyResult, 1, 2);
    expect(result.address1).toBe('');
    expect(result.country).toBe('');
    expect(result.formattedAddress).toBe('1.000000, 2.000000');
  });

  test('preserves the previous country when requested and geocode has none', () => {
    const noCountryResult: ReverseGeocodeResult = {
      success: true,
      address: { ...successResult.address, country: undefined },
    };
    const result = normalizeAddressFromMapSelection(
      noCountryResult,
      -37.8,
      144.9,
      { preserveCountryIfMissing: true, previousCountry: 'New Zealand' },
    );
    expect(result.country).toBe('New Zealand');
  });

  test('does not preserve previous country when the option is not set', () => {
    const noCountryResult: ReverseGeocodeResult = {
      success: true,
      address: { ...successResult.address, country: undefined },
    };
    const result = normalizeAddressFromMapSelection(
      noCountryResult,
      -37.8,
      144.9,
      { previousCountry: 'New Zealand' },
    );
    expect(result.country).toBe('');
  });
});
