import { parsePhoneNumber } from 'react-phone-number-input';
import type {
  AdditionalContactApiDTO,
  AdditionalContactDTO,
} from '@/lib/types/customer';
import { normalizePhoneNumber } from './phone-helper';

export function combineAdditionalContactPhone(
  phoneCountryCode?: string | null,
  phoneNumber?: string | null,
): string {
  if (!phoneNumber?.trim()) return '';

  const digits = phoneNumber.replace(/\s/g, '');
  const code = phoneCountryCode?.trim() || '+61';
  const normalizedCode = code.startsWith('+') ? code : `+${code}`;

  return normalizePhoneNumber(`${normalizedCode}${digits}`);
}

export function splitAdditionalContactPhone(e164Phone: string): {
  phoneCountryCode: string;
  phoneNumber: string;
} {
  const normalized = normalizePhoneNumber(e164Phone);
  if (!normalized) {
    return { phoneCountryCode: '+61', phoneNumber: '' };
  }

  const parsed = parsePhoneNumber(normalized);
  if (!parsed) {
    return {
      phoneCountryCode: '+61',
      phoneNumber: normalized.replace(/^\+\d+/, ''),
    };
  }

  return {
    phoneCountryCode: `+${parsed.countryCallingCode}`,
    phoneNumber: parsed.nationalNumber,
  };
}

export function mapAdditionalContactFromApi(
  contact: AdditionalContactApiDTO,
  customerId?: number,
): AdditionalContactDTO {
  return {
    id: contact.id,
    customerId,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: combineAdditionalContactPhone(
      contact.phoneCountryCode,
      contact.phoneNumber,
    ),
    position: contact.positionRole,
  };
}

export function mapAdditionalContactToApiPayload(
  values: Pick<
    AdditionalContactDTO,
    'firstName' | 'lastName' | 'email' | 'phone' | 'position'
  >,
): Omit<AdditionalContactApiDTO, 'id'> {
  const { phoneCountryCode, phoneNumber } = splitAdditionalContactPhone(
    values.phone ?? '',
  );

  return {
    firstName: values.firstName?.trim() ?? '',
    lastName: values.lastName?.trim() ?? '',
    email: values.email?.trim() ?? '',
    phoneCountryCode,
    phoneNumber,
    positionRole: values.position?.trim() ?? '',
  };
}
