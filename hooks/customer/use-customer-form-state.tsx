'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import z from 'zod';
import { CustomerDTO } from '@/lib/types/customer';
import { AddressType } from '@/lib/types/address';
import { normalizePhoneNumber } from '@/lib/utils/phone-helper';
import {
  CUSTOMER_STATUS,
  CUSTOMER_TYPE,
  PAYMENT_TERM_TYPE,
  PAYMENT_TYPE,
} from '@/lib/types/customer-enums';
import {
  CustomerDetailQueryOptions,
  useCreateCustomer,
  useGetCustomerAttachments,
  useGetAdditionalContacts,
} from '@/lib/api/customer';
import { UsersListQueryOptions } from '@/lib/api/user';
import { NewCustomerFormSchema } from '@/app/(protected)/customer-operations/customers/(components)/forms/schemas/customer-form-schema';
import { getCustomerFormBlockState } from '@/app/(protected)/customer-operations/customers/(components)/forms/tabs/details/customer-form-blocker';
import { toAddressPayload } from '@/lib/utils/address-helper';
import { scrollToFirstError } from '@/lib/utils';
import { addNewRecord, addSyncErrorRecordId } from '@/lib/utils/pinned-records';
import { notifySuccess, notifyError } from '@/lib/toast';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import { sortByLabel } from '@/lib/utils/sort-options';

type CustomerFormValues = z.infer<typeof NewCustomerFormSchema>;

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

export const PAYMENT_TERMS_OPTIONS = [
  {
    label: 'of the following month',
    value: PAYMENT_TERM_TYPE.OFTHEFOLLOWINGMONTH,
  },
  {
    label: 'day(s) after the invoice date',
    value: PAYMENT_TERM_TYPE.DAYSAFTERBILLDATE,
  },
  {
    label: 'day(s) after the invoice month',
    value: PAYMENT_TERM_TYPE.DAYSAFTERBILLMONTH,
  },
  { label: 'of the current month', value: PAYMENT_TERM_TYPE.OFCURRENTMONTH },
];

const NOT_LINKED_SUBSTRINGS = [
  'Customer is not linked to any accounting software',
  'Customer creation is supported only for Xero currently',
];

const ARCHIVE_UNARCHIVE_PREFIXES = [
  'Archive customer failed!',
  'Unarchive customer failed!',
];

function addressFromCustomer(customer: CustomerDTO | null): AddressType {
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
  const paymentType: PAYMENT_TYPE =
    customer.paymentType === 'PREPAID' ? PAYMENT_TYPE.PREPAID : PAYMENT_TYPE.CREDIT;

  return {
    customer_type: customer.customerType ?? CUSTOMER_TYPE.BUSINESS,
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

interface UseCustomerFormStateOptions {
  customerId: number;
  isEditing: boolean;
  customerForm: UseFormReturn<CustomerFormValues>;
  onDirtyChange?: (isDirty: boolean) => void;
  onSaved?: () => void;
  onSuccess?: () => void;
}

/**
 * Manages customer form data fetching, local state, sync banners, and submit flow.
 */
export function useCustomerFormState({
  customerId,
  isEditing,
  customerForm,
  onDirtyChange,
  onSaved,
  onSuccess,
}: UseCustomerFormStateOptions) {
  const createCustomer = useCreateCustomer();
  const isRetrySyncRef = React.useRef(false);

  const { data: selectedCustomer, isLoading: isCustomerLoading } = useQuery({
    ...CustomerDetailQueryOptions(customerId),
    enabled: isEditing && customerId > 0,
  });

  const { data: customerAttachments = [], isLoading: isAttachmentsLoading } =
    useQuery({
      ...useGetCustomerAttachments(customerId),
      enabled: isEditing && customerId > 0,
    });

  const attachmentTableData = React.useMemo(
    () => (Array.isArray(customerAttachments) ? customerAttachments : []),
    [customerAttachments],
  );

  const [additionalContactsPageIndex, setAdditionalContactsPageIndex] =
    React.useState(0);
  const [additionalContactsPageSize, setAdditionalContactsPageSize] =
    React.useState(10);

  React.useEffect(() => {
    setAdditionalContactsPageIndex(0);
  }, [customerId]);

  const {
    data: additionalContactsPage,
    isFetching: isAdditionalContactsFetching,
  } = useQuery({
    ...useGetAdditionalContacts(customerId, {
      page: additionalContactsPageIndex,
      pageSize: additionalContactsPageSize,
    }),
    enabled: isEditing && customerId > 0,
  });

  const additionalContactTableData = React.useMemo(
    () => additionalContactsPage?.content ?? [],
    [additionalContactsPage],
  );

  const handleAdditionalContactsPaginationChange = React.useCallback(
    (page: number, pageSize: number) => {
      setAdditionalContactsPageIndex(page);
      setAdditionalContactsPageSize(pageSize);
    },
    [],
  );

  const { data: allUsers = [] } = useQuery(UsersListQueryOptions());
  const users = React.useMemo(
    () =>
      allUsers.filter((user) => {
        const groups = Array.isArray(user.groups) ? user.groups : [];
        return !groups.some((group) =>
          String(group).toLowerCase().includes('driver'),
        );
      }),
    [allUsers],
  );
  const accountManagerOptions = React.useMemo(
    () =>
      sortByLabel(
        users.map((user) => ({ label: user.name, value: user.sub })),
        (option) => option.label,
      ),
    [users],
  );

  const blockState = React.useMemo(
    () => getCustomerFormBlockState(isEditing ? selectedCustomer : null),
    [isEditing, selectedCustomer],
  );
  const isFormBlocked = blockState !== null;

  const [accSoftwareSyncError, setAccSoftwareSyncError] = React.useState<
    string | null
  >(null);
  const [notLinkedWarning, setNotLinkedWarning] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [addAttachmentOpen, setAddAttachmentOpen] = React.useState(false);

  const [selectedCustomerType, setSelectedCustomerType] =
    React.useState<string>('BUSINESS');
  const [selectedPaymentType, setSelectedPaymentType] =
    React.useState<string>('CREDIT');
  const [address, setAddress] = React.useState<AddressType>(
    EMPTY_CUSTOMER_ADDRESS,
  );
  const [searchInput, setSearchInput] = React.useState('');
  const didInitRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    onDirtyChange?.(customerForm.formState.isDirty);
  }, [customerForm.formState.isDirty, onDirtyChange]);

  React.useEffect(() => {
    if (!isEditing) {
      didInitRef.current = null;
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

  React.useEffect(() => {
    if (
      !isEditing ||
      !selectedCustomer?.accountManagerSub ||
      users.length === 0
    ) {
      return;
    }

    const currentValue = customerForm.getValues('account_manager') || '';
    const subSet = new Set(users.map((u) => u.sub));
    if (currentValue && subSet.has(currentValue)) return;

    const matched =
      users.find((u) => u.sub === selectedCustomer.accountManagerSub) ||
      users.find((u) => u.name === selectedCustomer.accountManagerSub);

    if (matched?.sub) {
      customerForm.setValue('account_manager', matched.sub);
    }
  }, [isEditing, selectedCustomer, users, customerForm]);

  const handleSyncNote = React.useCallback((note?: string): boolean => {
    if (!note) return false;
    if (ARCHIVE_UNARCHIVE_PREFIXES.some((prefix) => note.startsWith(prefix))) {
      return false;
    }
    if (NOT_LINKED_SUBSTRINGS.some((msg) => note.includes(msg))) {
      setNotLinkedWarning(true);
      return true;
    }
    setAccSoftwareSyncError(note);
    return true;
  }, []);

  React.useEffect(() => {
    setAccSoftwareSyncError(null);
    setNotLinkedWarning(false);
    if (!isEditing || !selectedCustomer) return;
    handleSyncNote(selectedCustomer.accSoftwareNotes);
  }, [selectedCustomer?.id, isEditing, selectedCustomer, handleSyncNote]);

  const handleFormFieldChange = React.useCallback(
    (field: 'customer_type' | 'payment_type', value: string) => {
      if (field === 'customer_type') {
        setSelectedCustomerType(value);
      } else if (field === 'payment_type') {
        setSelectedPaymentType(value);
      }
    },
    [],
  );

  const onSubmit = React.useCallback(
    async (rawValues: CustomerFormValues) => {
      const values: CustomerFormValues = {
        ...rawValues,
        ...(rawValues.customer_type === CUSTOMER_TYPE.INDIVIDUAL
          ? {
            business_name: '',
            business_email: '',
            business_phone: '',
            abn: '',
            contact_person_first_name: '',
            contact_person_last_name: '',
          }
          : {
            contact_person_name: '',
          }),
        ...(rawValues.payment_type === PAYMENT_TYPE.PREPAID
          ? { credit_limit: 0, payment_terms_day: 0 }
          : {}),
      };

      try {
        setIsSubmitting(true);

        const billingAddressData = toAddressPayload(
          address,
          isEditing && selectedCustomer ? selectedCustomer.billingAddress : null,
        );

        const billingAddressIdFromExisting =
          (isEditing && selectedCustomer
            ? (selectedCustomer.billingAddressId ??
              selectedCustomer.billingAddress?.id)
            : undefined) ?? billingAddressData?.id;

        const customerData: Partial<CustomerDTO> = {
          customerType:
            values.customer_type === 'BUSINESS'
              ? CUSTOMER_TYPE.BUSINESS
              : CUSTOMER_TYPE.INDIVIDUAL,
          contactPersonPhone: values.contact_person_phone || '',
          contactPersonEmail: values.contact_person_email || '',
          ...(billingAddressIdFromExisting
            ? { billingAddressId: billingAddressIdFromExisting }
            : {}),
          billingAddress: billingAddressData,
          creditLimit: Math.round(Number(values.credit_limit || 0) * 100),
          accountManagerSub: values.account_manager,
          invoiceDueDateDayCount: values.payment_terms_day || 0,
          customerStatus: CUSTOMER_STATUS.ACTIVE,
          paymentType: values.payment_type,
          version: isEditing && selectedCustomer ? selectedCustomer.version : 0,
        };

        if (values.payment_type === 'CREDIT') {
          customerData.paymentTermType =
            values.payment_terms || PAYMENT_TERM_TYPE.DAYSAFTERBILLDATE;
        }

        if (isEditing && customerId) {
          customerData.id = customerId;
          if (selectedCustomer?.accSoftwareContactId) {
            customerData.accSoftwareContactId =
              selectedCustomer.accSoftwareContactId;
          }
        }

        if (values.customer_type === CUSTOMER_TYPE.BUSINESS) {
          customerData.businessName = values.business_name || '';
          customerData.businessEmail = values.business_email || '';
          customerData.businessPhone = values.business_phone || '';
          customerData.individualContactName =
            values.contact_person_first_name +
            ' ' +
            values.contact_person_last_name || '';
          customerData.contactPersonFirstName =
            values.contact_person_first_name || '';
          customerData.contactPersonLastName =
            values.contact_person_last_name || '';
          customerData.abn = values.abn || '';
          customerData.acn = '997744';
          customerData.vatNumber = '123';
        }

        if (values.customer_type === CUSTOMER_TYPE.INDIVIDUAL) {
          customerData.individualContactName = values.contact_person_name || '';
          customerData.abn = 'N/A';
          customerData.govId = '123';
        }

        if (values.payment_type === PAYMENT_TYPE.PREPAID) {
          customerData.creditLimit = 0;
          customerData.invoiceDueDateDayCount = 0;
        }

        const result = await createCustomer.mutateAsync(customerData);

        if (isEditing && !isRetrySyncRef.current) {
          notifySuccess('Customer Updated Successfully!');
          customerForm.reset(customerForm.getValues());
        } else {
          notifySuccess('Customer Added Successfully!');

          if (result && typeof result.id === 'number') {
            addNewRecord('customer_main_data_table', { ...result, id: result.id });
            if (!result.accSoftwareContactId) {
              addSyncErrorRecordId('customer_main_data_table', result.id);
            }
          }

          handleSyncNote(result.accSoftwareNotes);
        }

        onSaved?.();
        if (!isEditing) {
          onSuccess?.();
        }
      } catch (error) {
        console.error(
          `Error ${isEditing ? 'updating' : 'creating'} customer:`,
          error,
        );

        const err = extractErrorResponse(error);
        const extractedMessage = extractErrorMessage(error);
        const codeStr = err?.code ? String(err.code) : undefined;
        const messageFromErr = err?.message || extractedMessage;

        const duplicateEmailPhrase = `Key (business_email)=(${values.business_email}) already exists`;
        const isDuplicateEmail =
          codeStr === '409' &&
          typeof messageFromErr === 'string' &&
          messageFromErr.includes(duplicateEmailPhrase);

        if (isDuplicateEmail) {
          const msg = `Duplicate business email "${values.business_email}" already exists.`;
          notifyError(msg);
          customerForm.setError('business_email', {
            type: 'manual',
            message: msg,
          });
          return;
        }

        const emailKeyPattern = `Key (email)=(${values.contact_person_email}) already exists`;
        const isDuplicateContactEmail =
          codeStr === '409' &&
          typeof messageFromErr === 'string' &&
          (messageFromErr.includes(emailKeyPattern) ||
            messageFromErr.includes('customers_email_key'));

        if (isDuplicateContactEmail) {
          const msg = 'The contact person email already exists.';
          notifyError(msg);
          customerForm.setError('contact_person_email', {
            type: 'manual',
            message: msg,
          });
          return;
        }

        const duplicateABNPhrase = `Key (abn)=(${values.abn}) already exists`;
        const isDuplicateABN =
          codeStr === '409' &&
          typeof messageFromErr === 'string' &&
          messageFromErr.includes(duplicateABNPhrase);

        if (isDuplicateABN) {
          const msg = `Duplicate ABN "${values.abn}" already exists.`;
          notifyError(msg);
          customerForm.setError('abn', { type: 'manual', message: msg });
          return;
        }

        notifyError(
          messageFromErr || 'Failed to save customer. Please try again.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      address,
      createCustomer,
      customerForm,
      customerId,
      handleSyncNote,
      isEditing,
      onSaved,
      onSuccess,
      selectedCustomer,
    ],
  );

  const onError = React.useCallback(
    (errors: unknown) => {
      console.error('Form validation errors:', errors);
      notifyError(
        isEditing ? 'Failed to Update Customer' : 'Failed to Add Customer',
        {
          description: 'Check required fields',
        },
      );
      scrollToFirstError();
    },
    [isEditing],
  );

  const handleRetrySync = React.useCallback(() => {
    isRetrySyncRef.current = true;
    void customerForm
      .handleSubmit(onSubmit, onError)()
      .finally(() => {
        isRetrySyncRef.current = false;
      });
  }, [customerForm, onError, onSubmit]);

  return {
    selectedCustomer,
    isCustomerLoading,
    attachmentTableData,
    isAttachmentsLoading,
    additionalContactTableData,
    additionalContactsPage,
    isAdditionalContactsFetching,
    additionalContactsPageIndex,
    additionalContactsPageSize,
    handleAdditionalContactsPaginationChange,
    accountManagerOptions,
    blockState,
    isFormBlocked,
    accSoftwareSyncError,
    notLinkedWarning,
    isSubmitting,
    addAttachmentOpen,
    setAddAttachmentOpen,
    selectedCustomerType,
    setSelectedCustomerType,
    selectedPaymentType,
    setSelectedPaymentType,
    address,
    setAddress,
    searchInput,
    setSearchInput,
    handleFormFieldChange,
    onSubmit,
    onError,
    handleRetrySync,
  };
}
