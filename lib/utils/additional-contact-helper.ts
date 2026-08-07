import type {
  AdditionalContactApiDTO,
  AdditionalContactDTO,
  AdditionalContactMethodDTO,
} from '@/lib/types/customer';
import { ADDITIONAL_CONTACT_METHOD_TYPE } from '@/lib/types/customer-enums';

export function mapAdditionalContactFromApi(
  contact: AdditionalContactApiDTO,
  customerId?: number,
): AdditionalContactDTO {
  return {
    id: contact.id,
    customerId,
    firstName: contact.firstName,
    lastName: contact.lastName,
    positionRole: contact.positionRole,
    contactMethods: Array.isArray(contact.contactMethods)
      ? contact.contactMethods.map((method) => ({
          type: method.type,
          value: method.value,
        }))
      : [],
  };
}

export function mapAdditionalContactToApiPayload(
  values: Pick<
    AdditionalContactDTO,
    'firstName' | 'lastName' | 'positionRole' | 'contactMethods'
  >,
): Omit<AdditionalContactApiDTO, 'id'> {
  const contactMethods: AdditionalContactMethodDTO[] = (
    values.contactMethods ?? []
  )
    .filter((method) => method.type && method.value?.trim())
    .map((method) => ({
      type: method.type,
      value: method.value.trim(),
    }));

  return {
    firstName: values.firstName?.trim() ?? '',
    lastName: values.lastName?.trim() ?? '',
    positionRole: values.positionRole?.trim() ?? '',
    contactMethods,
  };
}

export function getContactMethodValue(
  contact?: AdditionalContactDTO | null,
  type?: ADDITIONAL_CONTACT_METHOD_TYPE,
): string {
  const methods = contact?.contactMethods ?? [];
  if (type) {
    return methods.find((method) => method.type === type)?.value?.trim() ?? '';
  }
  return methods[0]?.value?.trim() ?? '';
}
