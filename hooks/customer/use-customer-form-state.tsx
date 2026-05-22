'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CustomerDTO } from '@/lib/types/customer';
import { AddressType } from '@/lib/types/address';
import { normalizePhoneNumber } from '@/lib/utils/phone-helper';
import {
  CUSTOMER_TYPE,
  PAYMENT_TYPE,
  PAYMENT_TERM_TYPE,
} from '@/lib/types/customer-enums';

const EMPTY_CUSTOMER_ADDRESS: AddressType = {
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
};

export const EMPTY_CUSTOMER_FORM_VALUES = {
  customer_type: CUSTOMER_TYPE.BUSINESS,
  payment_type: PAYMENT_TYPE.CREDIT,
  business_name: '',
  business_email: '',
  business_phone: '',
  abn: '',
  contact_person_name: '',
  contact_person_first_name: '',
  contact_person_last_name: '',
  contact_person_email: '',
  contact_person_phone: '',
  credit_limit: 0,
  payment_terms: PAYMENT_TERM_TYPE.OFTHEFOLLOWINGMONTH,
  payment_terms_day: 0,
  account_manager: '',
  billing_address: '',
  created_at: undefined as Date | undefined,
  updated_at: undefined as Date | undefined,
  created_by: 'current_user',
  last_modified_by: 'current_user',
};

function addressFromCustomer(
  customer: CustomerDTO | null,
): AddressType {
  if (!customer?.billingAddress) return EMPTY_CUSTOMER_ADDRESS;
  const a = customer.billingAddress;
  return {
    address1: a.streetDetailsPrimary || '',
    address2: a.streetDetailsOptional || '',
    formattedAddress: a.formattedAddress || '',
    city: a.city || '',
    region: a.state || '',
    postalCode: a.postcode || '',
    country: a.country || '',
    lat: a.latitude ?? 0,
    lng: a.longitude ?? 0,
    googlePlaceId: a.googlePlaceId?.toString() ?? '',
  };
}

function formValuesFromCustomer(customer: CustomerDTO) {
  const paymentType = customer.paymentType === 'PREPAID' ? 'PREPAID' : 'CREDIT';

  return {
    customer_type: customer.customerType ?? 'BUSINESS',
    payment_type: paymentType,
    business_name: customer.businessName ?? '',
    business_email: customer.businessEmail ?? '',
    business_phone: normalizePhoneNumber(customer.businessPhone ?? '') ?? '',
    abn: customer.abn === 'N/A' ? '' : (customer.abn ?? ''),
    contact_person_name:
      customer.customerType === 'INDIVIDUAL'
        ? (customer.individualContactName ?? '')
        : '',
    contact_person_first_name:
      customer.customerType === 'BUSINESS'
        ? (customer.contactPersonFirstName ?? '')
        : '',
    contact_person_last_name:
      customer.customerType === 'BUSINESS'
        ? (customer.contactPersonLastName ?? '')
        : '',
    contact_person_email: customer.contactPersonEmail ?? '',
    contact_person_phone:
      normalizePhoneNumber(customer.contactPersonPhone ?? '') ?? '',
    credit_limit: customer.creditLimit ? customer.creditLimit / 100 : 0,
    payment_terms_day: customer.invoiceDueDateDayCount ?? 0,
    payment_terms:
      customer.paymentTermType &&
      customer.paymentTermType !== PAYMENT_TERM_TYPE.DAYSAFTERBILLDATE
        ? customer.paymentTermType
        : PAYMENT_TERM_TYPE.OFTHEFOLLOWINGMONTH,
    account_manager: customer.accountManagerSub ?? '',
    billing_address: customer.billingAddress?.formattedAddress ?? '',
    created_at: customer.createdAt ? new Date(customer.createdAt) : undefined,
    updated_at: customer.updatedAt ? new Date(customer.updatedAt) : undefined,
    created_by: customer.createdBy ?? 'current_user',
    last_modified_by: customer.lastModifiedBy ?? 'current_user',
  };
}

/**
 * Manages initial form state and sync: when customer detail loads (editing) or when
 * switching to create mode, resets form and local state (type, address, searchInput).
 */
type CreditFieldStash = {
  credit_limit: number;
  payment_terms: string;
  payment_terms_day: number;
};

export function useCustomerFormState(
  selectedCustomer: CustomerDTO | null,
  isEditing: boolean,
  customerForm: UseFormReturn<any>,
) {
  const [selectedCustomerType, setSelectedCustomerType] =
    React.useState<string>('BUSINESS');
  const [selectedPaymentType, setSelectedPaymentType] =
    React.useState<string>('CREDIT');
  const [address, setAddress] = React.useState<AddressType>(
    EMPTY_CUSTOMER_ADDRESS,
  );
  const [searchInput, setSearchInput] = React.useState('');
  const didInitRef = React.useRef<number | null>(null);

  const creditStash = React.useRef<CreditFieldStash | null>(null);

  React.useEffect(() => {
    if (!isEditing) {
      didInitRef.current = null;
      creditStash.current = null;
      setSelectedCustomerType('BUSINESS');
      setSelectedPaymentType('CREDIT');
      setSearchInput('');
      setAddress(EMPTY_CUSTOMER_ADDRESS);
      customerForm.reset(EMPTY_CUSTOMER_FORM_VALUES);
      return;
    }

    if (!selectedCustomer?.id) return;
    if (didInitRef.current === selectedCustomer.id) return;
    didInitRef.current = selectedCustomer.id;

    const paymentType =
      selectedCustomer.paymentType === 'PREPAID' ? 'PREPAID' : 'CREDIT';

    setSelectedCustomerType(selectedCustomer.customerType ?? 'BUSINESS');
    setSelectedPaymentType(paymentType);
    setSearchInput(selectedCustomer.billingAddress?.formattedAddress ?? '');
    setAddress(addressFromCustomer(selectedCustomer));
    customerForm.reset(formValuesFromCustomer(selectedCustomer));
  }, [isEditing, selectedCustomer, customerForm]);

  return {
    selectedCustomerType,
    setSelectedCustomerType,
    selectedPaymentType,
    setSelectedPaymentType,
    address,
    setAddress,
    searchInput,
    setSearchInput,
    creditStash,
  };
}
