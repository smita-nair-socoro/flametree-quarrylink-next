import { describe, expect, test } from 'vitest';
import {
  mapAdditionalContactFromApi,
  mapAdditionalContactToApiPayload,
  getContactMethodValue,
} from '../additional-contact-helper';
import type { AdditionalContactApiDTO } from '@/lib/types/customer';
import { ADDITIONAL_CONTACT_METHOD_TYPE } from '@/lib/types/customer-enums';

describe('mapAdditionalContactFromApi', () => {
  test('maps an API contact to the frontend DTO shape', () => {
    const apiContact: AdditionalContactApiDTO = {
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      positionRole: 'Manager',
      contactMethods: [
        {
          type: ADDITIONAL_CONTACT_METHOD_TYPE.BUSINESS_PHONE,
          value: '412345678',
        },
        {
          type: ADDITIONAL_CONTACT_METHOD_TYPE.EMAIL,
          value: 'jane@example.com',
        },
      ],
    };
    expect(mapAdditionalContactFromApi(apiContact, 99)).toEqual({
      id: 1,
      customerId: 99,
      firstName: 'Jane',
      lastName: 'Doe',
      positionRole: 'Manager',
      contactMethods: [
        {
          type: ADDITIONAL_CONTACT_METHOD_TYPE.BUSINESS_PHONE,
          value: '412345678',
        },
        {
          type: ADDITIONAL_CONTACT_METHOD_TYPE.EMAIL,
          value: 'jane@example.com',
        },
      ],
    });
  });
});

describe('mapAdditionalContactToApiPayload', () => {
  test('maps and trims frontend form values into the API payload shape', () => {
    expect(
      mapAdditionalContactToApiPayload({
        firstName: ' Jane ',
        lastName: ' Doe ',
        positionRole: ' Manager ',
        contactMethods: [
          {
            type: ADDITIONAL_CONTACT_METHOD_TYPE.BUSINESS_PHONE,
            value: ' 412345678 ',
          },
          {
            type: ADDITIONAL_CONTACT_METHOD_TYPE.EMAIL,
            value: '',
          },
        ],
      }),
    ).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      positionRole: 'Manager',
      contactMethods: [
        {
          type: ADDITIONAL_CONTACT_METHOD_TYPE.BUSINESS_PHONE,
          value: '412345678',
        },
      ],
    });
  });

  test('defaults missing fields to empty values', () => {
    expect(
      mapAdditionalContactToApiPayload({
        firstName: undefined,
        lastName: undefined,
        positionRole: undefined,
        contactMethods: undefined,
      }),
    ).toEqual({
      firstName: '',
      lastName: '',
      positionRole: '',
      contactMethods: [],
    });
  });
});

describe('getContactMethodValue', () => {
  test('returns the first matching method value by type', () => {
    expect(
      getContactMethodValue(
        {
          contactMethods: [
            {
              type: ADDITIONAL_CONTACT_METHOD_TYPE.BUSINESS_PHONE,
              value: '412345678',
            },
            {
              type: ADDITIONAL_CONTACT_METHOD_TYPE.EMAIL,
              value: 'jane@example.com',
            },
          ],
        },
        ADDITIONAL_CONTACT_METHOD_TYPE.EMAIL,
      ),
    ).toBe('jane@example.com');
  });
});
