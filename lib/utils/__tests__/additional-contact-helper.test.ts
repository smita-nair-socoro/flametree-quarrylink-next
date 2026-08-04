import { describe, expect, test } from 'vitest';
import {
  combineAdditionalContactPhone,
  splitAdditionalContactPhone,
  mapAdditionalContactFromApi,
  mapAdditionalContactToApiPayload,
} from '../additional-contact-helper';
import type { AdditionalContactApiDTO } from '@/lib/types/customer';

describe('combineAdditionalContactPhone', () => {
  test('combines country code and phone number into E.164', () => {
    expect(combineAdditionalContactPhone('+61', '412345678')).toBe(
      '+61412345678',
    );
  });

  test('defaults to +61 when no country code is given', () => {
    expect(combineAdditionalContactPhone(undefined, '412345678')).toBe(
      '+61412345678',
    );
  });

  test('adds a leading + when the country code lacks one', () => {
    expect(combineAdditionalContactPhone('64', '212345678')).toBe(
      '+64212345678',
    );
  });

  test('strips spaces from the phone number', () => {
    expect(combineAdditionalContactPhone('+61', '412 345 678')).toBe(
      '+61412345678',
    );
  });

  test('returns empty string when phone number is missing', () => {
    expect(combineAdditionalContactPhone('+61', undefined)).toBe('');
    expect(combineAdditionalContactPhone('+61', '   ')).toBe('');
  });
});

describe('splitAdditionalContactPhone', () => {
  test('splits an E.164 AU number into country code and national number', () => {
    expect(splitAdditionalContactPhone('+61412345678')).toEqual({
      phoneCountryCode: '+61',
      phoneNumber: '412345678',
    });
  });

  test('returns AU defaults for empty input', () => {
    expect(splitAdditionalContactPhone('')).toEqual({
      phoneCountryCode: '+61',
      phoneNumber: '',
    });
  });
});

describe('mapAdditionalContactFromApi', () => {
  test('maps an API contact to the frontend DTO shape', () => {
    const apiContact: AdditionalContactApiDTO = {
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phoneCountryCode: '+61',
      phoneNumber: '412345678',
      positionRole: 'Manager',
    };
    expect(mapAdditionalContactFromApi(apiContact, 99)).toEqual({
      id: 1,
      customerId: 99,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '+61412345678',
      position: 'Manager',
    });
  });
});

describe('mapAdditionalContactToApiPayload', () => {
  test('maps and trims frontend form values into the API payload shape', () => {
    expect(
      mapAdditionalContactToApiPayload({
        firstName: ' Jane ',
        lastName: ' Doe ',
        email: ' jane@example.com ',
        phone: '+61412345678',
        position: ' Manager ',
      }),
    ).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phoneCountryCode: '+61',
      phoneNumber: '412345678',
      positionRole: 'Manager',
    });
  });

  test('defaults missing fields to empty strings', () => {
    expect(
      mapAdditionalContactToApiPayload({
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        phone: undefined,
        position: undefined,
      }),
    ).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      phoneCountryCode: '+61',
      phoneNumber: '',
      positionRole: '',
    });
  });
});
