'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { cn, addNewRecordId } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { FormSelect } from '@/components/ui/form-select';
import { useMediaQuery } from '@/hooks/use-media-query';
import { NewCustomerFormSchema } from './schemas/customer-form-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Info } from 'lucide-react';

import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { AddressType } from '@/lib/types/address';
import { ABNInput, CurrencyInput } from '@/components/ui/input-mask';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { useSelectedCustomer } from '@/app/stores/customer-store';
import { notifySuccess, notifyError } from '@/lib/toast';
import { normalizePhoneNumber } from '@/lib/utils/phone-helper';
import { useQuery } from '@tanstack/react-query';
import { UsersListQueryOptions } from '@/lib/api/user';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import { useCreateCustomer, useUpdateCustomer } from '@/lib/api/customer';
import { CustomerDTO } from '@/lib/types/customer';
import { CUSTOMER_STATUS, CUSTOMER_TYPE } from '@/lib/types/customer-enums';
import { toAddressPayload } from '@/lib/utils/address-helper';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
  onCancel?: () => void;
}

export default function CustomerForm({
  id,
  onCancel,
  onSaved,
  onDirtyChange,
  className,
  onSuccess,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isEditing = Boolean(id);
  const selectedCustomer = useSelectedCustomer();

  // Fetch users (account managers)
  const { data: users = [] } = useQuery(UsersListQueryOptions());
  const accountManagerOptions = React.useMemo(
    () =>
      users.map((user) => ({
        label: user.name,
        value: user.sub,
      })),
    [users]
  );

  // Mutation hooks
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  // Initialize states with selected customer data only when editing, defaults otherwise
  const [selectedCustomerType, setSelectedCustomerType] =
    React.useState<string>(
      isEditing && selectedCustomer?.customerType
        ? selectedCustomer.customerType
        : 'BUSINESS'
    );
  const [selectedPaymentType, setSelectedPaymentType] = React.useState<string>(
    isEditing && selectedCustomer?.paymentType
      ? selectedCustomer.paymentType
      : 'CREDIT'
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [address, setAddress] = React.useState<AddressType>({
    address1: '',
    address2: '',
    formattedAddress: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    lat: 0,
    lng: 0,
  });
  const [searchInput, setSearchInput] = React.useState(
    isEditing ? '1 Scott Street Pyrmont, NSW, 2009' : ''
  );

  const customerForm = useForm<z.infer<typeof NewCustomerFormSchema>>({
    resolver: zodResolver(NewCustomerFormSchema),
    mode: 'onChange',
    defaultValues: {
      customer_type:
        isEditing && selectedCustomer?.customerType
          ? selectedCustomer.customerType
          : 'BUSINESS',
      payment_type:
        isEditing && selectedCustomer?.paymentType
          ? selectedCustomer.paymentType
          : 'CREDIT',
      business_name: isEditing ? selectedCustomer?.businessName || '' : '',
      business_email: isEditing ? selectedCustomer?.businessEmail || '' : '',
      business_phone: isEditing
        ? normalizePhoneNumber(selectedCustomer?.businessPhone || '') || ''
        : '',
      abn: isEditing ? selectedCustomer?.abn || '' : '',
      contact_person_name:
        isEditing && selectedCustomer?.customerType === 'INDIVIDUAL'
          ? selectedCustomer?.contactName || ''
          : '',
      contact_person_first_name:
        isEditing && selectedCustomer?.customerType === 'BUSINESS'
          ? selectedCustomer?.firstName || ''
          : '',
      contact_person_last_name:
        isEditing && selectedCustomer?.customerType === 'BUSINESS'
          ? selectedCustomer?.lastName || ''
          : '',
      contact_person_email: isEditing ? selectedCustomer?.email || '' : '',
      contact_person_phone: isEditing
        ? normalizePhoneNumber(selectedCustomer?.phone || '') || ''
        : '',
      credit_limit:
        isEditing && selectedCustomer ? selectedCustomer.creditLimit / 100 : 0, // Convert from cents to dollars
      payment_terms: isEditing
        ? selectedCustomer?.paymentTermType || 'of the following month'
        : 'of the following month',
      payment_terms_day: isEditing ? selectedCustomer?.invoiceDueDate || 0 : 0,
      account_manager: isEditing
        ? selectedCustomer?.accountManagerSub || ''
        : '',
      billing_address: isEditing
        ? selectedCustomer?.billingAddress?.formattedAddress || ''
        : '',
      created_at: undefined,
      updated_at: undefined,
      created_by: 'current_user',
      last_modified_by: 'current_user',
    },
  });

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(customerForm.formState.isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerForm.formState.isDirty]);

  const handleFormFieldChange = (
    field: 'customer_type' | 'payment_type',
    value: string
  ) => {
    if (field === 'customer_type') {
      setSelectedCustomerType(value);
      if (value === 'INDIVIDUAL') {
        // Clear business-specific fields
        customerForm.setValue('business_name', '');
        customerForm.setValue('business_email', '');
        customerForm.setValue('business_phone', '');
        customerForm.setValue('abn', '');
        customerForm.setValue('contact_person_first_name', '');
        customerForm.setValue('contact_person_last_name', '');
        // Clear contact person name for fresh start
        customerForm.setValue('contact_person_name', '');
      } else if (value === 'BUSINESS') {
        // Clear individual-specific fields
        customerForm.setValue('contact_person_name', '');
        customerForm.setValue('contact_person_first_name', '');
        customerForm.setValue('contact_person_last_name', '');
      }
    } else if (field === 'payment_type') {
      setSelectedPaymentType(value);
      if (value === 'PREPAID') {
        customerForm.setValue('credit_limit', 0);
        customerForm.setValue('payment_terms_day', 0);
      }
    }
  };

  const selectedCustomerId = selectedCustomer?.id;
  const didInitRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!isEditing) return;
    if (!selectedCustomerId) return;

    // only run when the selected customer id changes
    if (didInitRef.current === selectedCustomerId) return;
    didInitRef.current = selectedCustomerId;

    const paymentType =
      selectedCustomer?.paymentType === 'PREPAID' ? 'PREPAID' : 'CREDIT';

    setSelectedCustomerType(selectedCustomer?.customerType ?? 'BUSINESS');
    setSelectedPaymentType(paymentType);

    if (selectedCustomer?.billingAddress) {
      setSearchInput(selectedCustomer.billingAddress.formattedAddress || '');
      setAddress({
        address1: selectedCustomer.billingAddress.streetDetailsPrimary || '',
        address2: selectedCustomer.billingAddress.streetDetailsOptional || '',
        formattedAddress:
          selectedCustomer.billingAddress.formattedAddress || '',
        city: selectedCustomer.billingAddress.city || '',
        region: selectedCustomer.billingAddress.state || '',
        postalCode: selectedCustomer.billingAddress.postcode || '',
        country: selectedCustomer.billingAddress.country || '',
        lat: selectedCustomer.billingAddress.latitude || 0,
        lng: selectedCustomer.billingAddress.longitude || 0,
        googlePlaceId: selectedCustomer.billingAddress.googlePlaceId,
      });
    }

    customerForm.reset({
      customer_type: selectedCustomer?.customerType ?? 'BUSINESS',
      payment_type: paymentType,
      business_name: selectedCustomer?.businessName ?? '',
      business_email: selectedCustomer?.businessEmail ?? '',
      business_phone:
        normalizePhoneNumber(selectedCustomer?.businessPhone ?? '') ?? '',
      abn: selectedCustomer?.abn === 'N/A' ? '' : selectedCustomer?.abn ?? '',
      contact_person_name:
        selectedCustomer?.customerType === 'INDIVIDUAL'
          ? selectedCustomer?.contactName ?? ''
          : '',
      contact_person_first_name:
        selectedCustomer?.customerType === 'BUSINESS'
          ? selectedCustomer?.firstName ?? ''
          : '',
      contact_person_last_name:
        selectedCustomer?.customerType === 'BUSINESS'
          ? selectedCustomer?.lastName ?? ''
          : '',
      contact_person_email: selectedCustomer?.email ?? '',
      contact_person_phone:
        normalizePhoneNumber(selectedCustomer?.phone ?? '') ?? '',
      credit_limit: selectedCustomer?.creditLimit
        ? selectedCustomer.creditLimit / 100
        : 0,
      payment_terms_day: selectedCustomer?.invoiceDueDate ?? 0,
      payment_terms:
        selectedCustomer?.paymentTermType &&
        selectedCustomer.paymentTermType !== 'N/A'
          ? selectedCustomer.paymentTermType
          : '',
      account_manager: selectedCustomer?.accountManagerSub ?? '',
      billing_address: selectedCustomer?.billingAddress?.formattedAddress ?? '',
      created_at: selectedCustomer?.createdAt
        ? new Date(selectedCustomer.createdAt)
        : undefined,
      updated_at: selectedCustomer?.updatedAt
        ? new Date(selectedCustomer.updatedAt)
        : undefined,
      created_by: selectedCustomer?.createdBy ?? 'current_user',
      last_modified_by: selectedCustomer?.lastModifiedBy ?? 'current_user',
    });
  }, [isEditing, selectedCustomerId]); // ✅ only stable deps

  React.useEffect(() => {
    if (!address.formattedAddress) return;

    const current = customerForm.getValues('billing_address');
    if (current === address.formattedAddress) return;

    customerForm.setValue('billing_address', address.formattedAddress, {
      shouldDirty: false, // ✅ prevent dirty flip
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [address.formattedAddress, customerForm]);

  const handleAddressChange = React.useCallback(
    (newAddress: AddressType) => {
      setAddress(newAddress);
      if (newAddress.formattedAddress) {
        setSearchInput('');
        // Trigger validation for the billing_address field
        customerForm.trigger('billing_address');
      }
    },
    [customerForm]
  );

  const paymentTermsOptions = [
    { label: 'of the following month', value: 'OFFOLLOWINGMONTH' },
    {
      label: 'day(s) after the invoice date',
      value: 'DAYSAFTERBILLDATE',
    },
    {
      label: 'day(s) after the invoice month',
      value: 'DAYSAFTERBILLMONTH',
    },
    { label: 'of the current month', value: 'OFCURRENTMONTH' },
  ];

  // If older customer records stored the manager name (not sub), map it when users load.
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

  async function onSubmit(values: z.infer<typeof NewCustomerFormSchema>) {
    console.log('onSubmit function called!');
    console.log('Customer Form Values:', values);

    try {
      setIsSubmitting(true);

      // Convert address using helper function
      const billingAddressData = toAddressPayload(
        address,
        isEditing && selectedCustomer ? selectedCustomer.billingAddress : null
      );

      // Backend requires billingAddressId (maps to customers.billing_address_id) on update.
      const billingAddressIdFromExisting =
        (isEditing && selectedCustomer
          ? selectedCustomer.billingAddressId ??
            selectedCustomer.billingAddress?.id
          : undefined) ?? billingAddressData?.id;

      // Build the CustomerDTO payload
      const customerData: Partial<CustomerDTO> = {
        customerType:
          values.customer_type === 'BUSINESS'
            ? CUSTOMER_TYPE.BUSINESS
            : CUSTOMER_TYPE.INDIVIDUAL,
        phone: values.contact_person_phone || '',
        email: values.contact_person_email || '',
        ...(billingAddressIdFromExisting
          ? { billingAddressId: billingAddressIdFromExisting }
          : {}),
        billingAddress: billingAddressData,
        creditLimit: Math.round(Number(values.credit_limit || 0) * 100), // Convert to cents
        accountManagerSub: values.account_manager,
        invoiceDueDate: values.payment_terms_day || 0,
        customerStatus: CUSTOMER_STATUS.ACTIVE,
        jobsCount: 0,
        paymentType: values.payment_type,
        version: isEditing && selectedCustomer ? selectedCustomer.version : 0,
      };

      // Only set paymentTermType for CREDIT payment type
      if (values.payment_type === 'CREDIT') {
        customerData.paymentTermType =
          values.payment_terms || 'DAYSAFTERBILLDATE';
      }

      // Add id for updates
      if (isEditing && id) {
        customerData.id = id;
      }

      // Add timestamps and metadata
      const now = new Date().toISOString();
      if (!isEditing) {
        // New customer: set all initial fields
        customerData.createdAt = now;
        customerData.updatedAt = now;
        customerData.isDeleted = false;
        customerData.createdBy = values.created_by;
        customerData.lastModifiedBy = values.last_modified_by;
      } else {
        // Update customer: set update fields
        customerData.createdAt =
          selectedCustomer?.createdAt ?? new Date().toISOString();
        customerData.updatedAt = now;
        customerData.lastModifiedBy = values.last_modified_by;
        customerData.createdBy =
          selectedCustomer?.createdBy ?? values.created_by;
        customerData.isDeleted = selectedCustomer?.isDeleted ?? false;
      }

      // Handle BUSINESS type specific fields
      if (values.customer_type === 'BUSINESS') {
        customerData.contactName = `${values.contact_person_first_name || ''} ${
          values.contact_person_last_name || ''
        }`.trim();
        customerData.businessName = values.business_name || '';
        customerData.businessEmail = values.business_email || '';
        customerData.businessPhone = values.business_phone || '';
        customerData.firstName = values.contact_person_first_name || '';
        customerData.lastName = values.contact_person_last_name || '';
        customerData.abn = values.abn || '';
        // Default fields, actually not needed but is mandatory in backend
        customerData.legalName = values.business_name || '';
        customerData.tradingName = values.business_name || '';
        customerData.acn = '997744';
        customerData.vatNumber = '123';
      }

      // Handle INDIVIDUAL type specific fields
      if (values.customer_type === 'INDIVIDUAL') {
        customerData.contactName = values.contact_person_name || '';
        customerData.abn = 'N/A';
        // Default fields for INDIVIDUAL type
        customerData.dateOfBirth = new Date().toISOString();
        customerData.govId = '123';
      }

      // Handle PREPAID payment type
      if (values.payment_type === 'PREPAID') {
        customerData.creditLimit = 0;
        customerData.invoiceDueDate = 0;
      }

      console.log('Customer Data Payload:', customerData);

      // Call the appropriate mutation
      if (isEditing) {
        await updateCustomer.mutateAsync(customerData);
        notifySuccess('Customer Updated Successfully!');
      } else {
        const newCustomer = await createCustomer.mutateAsync(customerData);
        notifySuccess('Customer Added Successfully!');

        // Add the new record ID to sessionStorage for highlighting
        if (newCustomer && typeof newCustomer.id === 'number') {
          addNewRecordId('customer_main_data_table', newCustomer.id);
        }
      }

      onSuccess?.();
      onSaved?.();
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} customer:`,
        error
      );

      // Extract normalized error response and message
      const err = extractErrorResponse(error);
      const extractedMessage = extractErrorMessage(error);
      const codeStr = err?.code ? String(err.code) : undefined;
      const messageFromErr = err?.message || extractedMessage;

      // Duplicate business email (HTTP 409)
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

      // Duplicate contact email - Check both the specific key format and constraint name
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

      // Duplicate ABN (HTTP 409)
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

      // Fallback error using extracted message
      notifyError(
        messageFromErr || 'Failed to save customer. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle form validation errors
  function onError(errors: unknown) {
    console.error('Form validation errors:', errors);
    notifyError(
      isEditing ? 'Failed to Update Customer' : 'Failed to Add Customer',
      {
        description: 'Check required fields',
      }
    );
  }

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10'
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              {isEditing ? 'Updating Customer...' : 'Adding Customer...'}
            </p>
          </div>
        </div>
      )}

      <Form {...customerForm}>
        <form
          id="add-new-customer-form"
          className={cn(
            'p-1 gap-1 w-full',
            isEditing && isDesktop
              ? 'grid grid-cols-2 gap-x-8'
              : 'grid grid-cols-1',
            className,
            isSubmitting && 'pointer-events-none'
          )}
          onSubmit={customerForm.handleSubmit(onSubmit, onError)}
        >
          {/* Warning for incomplete data from Xero sync */}
          {isEditing &&
            selectedCustomer &&
            (() => {
              const isBusiness = selectedCustomer.customerType === 'BUSINESS';
              const isIndividual =
                selectedCustomer.customerType === 'INDIVIDUAL';

              // Check for missing fields
              const missingFields = [];

              // Common required fields
              if (
                !selectedCustomer.email ||
                selectedCustomer.email.trim() === ''
              ) {
                missingFields.push('email');
              }
              if (
                !selectedCustomer.phone ||
                selectedCustomer.phone.trim() === ''
              ) {
                missingFields.push('phone');
              }
              if (
                !selectedCustomer.accountManagerSub ||
                selectedCustomer.accountManagerSub.trim() === ''
              ) {
                missingFields.push('account manager');
              }

              // Business-specific required fields
              if (isBusiness) {
                if (
                  !selectedCustomer.businessName ||
                  selectedCustomer.businessName.trim() === ''
                ) {
                  missingFields.push('business name');
                }
                if (
                  !selectedCustomer.abn ||
                  selectedCustomer.abn.trim() === '' ||
                  selectedCustomer.abn === 'N/A'
                ) {
                  missingFields.push('ABN');
                }
                // Check if firstName and lastName exist
                if (
                  !selectedCustomer.firstName ||
                  selectedCustomer.firstName.trim() === ''
                ) {
                  missingFields.push('contact person first name');
                }
                if (
                  !selectedCustomer.lastName ||
                  selectedCustomer.lastName.trim() === ''
                ) {
                  missingFields.push('contact person last name');
                }
              }

              // Individual-specific required fields
              if (isIndividual) {
                if (
                  !selectedCustomer.contactName ||
                  selectedCustomer.contactName.trim() === ''
                ) {
                  missingFields.push('contact person name');
                }
              }

              const showWarning = missingFields.length > 0;

              return showWarning ? (
                <div className="border border-blue-600 bg-blue-50 p-4 rounded-md mb-4 flex flex-col col-span-full">
                  <div className="flex items-center gap-2 text-[#09090B] text-sm">
                    <Info className="h-4 w-4 text-[#0075FF]" />
                    <span>
                      This customer was synced from Xero with partial data.
                      Please complete the missing fields to continue using this
                      customer in QuarryLink.
                    </span>
                  </div>
                </div>
              ) : null;
            })()}

          {/* Customer Type */}
          <FormField
            control={customerForm.control}
            name="customer_type"
            render={({ field }) => (
              <FormItem className="col-span-1 col-start-1">
                <FormLabel>Customer Type*</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFormFieldChange('customer_type', value);
                    }}
                    defaultValue={field.value}
                    className="grid grid-flow-col auto-cols-max gap-4"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="BUSINESS" />
                      </FormControl>
                      <FormLabel className="font-normal">Business</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="INDIVIDUAL" />
                      </FormControl>
                      <FormLabel className="font-normal">Individual</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Type */}
          <FormField
            control={customerForm.control}
            name="payment_type"
            render={({ field }) => (
              <FormItem
                className={
                  isEditing && isDesktop
                    ? 'col-span-1 col-start-2'
                    : 'col-span-1 col-start-1'
                }
              >
                <FormLabel>Payment Type*</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFormFieldChange('payment_type', value);
                    }}
                    defaultValue={field.value}
                    className="grid grid-flow-col auto-cols-max gap-4"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="CREDIT" />
                      </FormControl>
                      <FormLabel className="font-normal">Credit</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="PREPAID" />
                      </FormControl>
                      <FormLabel className="font-normal">Pre-Paid</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Name */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="business_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Business Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Business Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Business Email */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="business_email"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Business Email*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Business Phone */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="business_phone"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Business Phone*</FormLabel>
                  <FormControl>
                    <PhoneInput
                      className="w-full"
                      defaultCountry="AU"
                      placeholder="Enter phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* ABN */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="abn"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>ABN*</FormLabel>
                  <FormControl>
                    <ABNInput className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Contact Person Name - For INDIVIDUAL type only */}
          {selectedCustomerType === 'INDIVIDUAL' && (
            <FormField
              control={customerForm.control}
              name="contact_person_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Contact Person Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {/* Contact Person First Name - For BUSINESS type only */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="contact_person_first_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person First Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter First Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Contact Person Last Name - For BUSINESS type only */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="contact_person_last_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person Last Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Last Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Contact Person Email - For BUSINESS type */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="contact_person_email"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person Email*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="contact_person_phone"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person Phone*</FormLabel>
                  <FormControl>
                    <PhoneInput
                      className="w-full"
                      defaultCountry="AU"
                      placeholder="Enter phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Contact Person Email - For INDIVIDUAL type */}
          {selectedCustomerType === 'INDIVIDUAL' && (
            <FormField
              control={customerForm.control}
              name="contact_person_email"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person Email*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Contact Person Phone - For INDIVIDUAL type */}
          {selectedCustomerType === 'INDIVIDUAL' && (
            <FormField
              control={customerForm.control}
              name="contact_person_phone"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Contact Person Phone*</FormLabel>
                  <FormControl>
                    <PhoneInput
                      className="w-full"
                      defaultCountry="AU"
                      placeholder="Enter phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Credit Limit */}
          {selectedPaymentType === 'CREDIT' && (
            <FormField
              control={customerForm.control}
              name="credit_limit"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? selectedCustomerType === 'BUSINESS'
                        ? 'col-span-1 col-start-1'
                        : 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Credit Limit*</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      id="credit_limit"
                      className="w-full"
                      placeholder="Enter Credit Limit"
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value === '' ? 0 : value)
                      }
                      decimalPlaces={2}
                      allowNegative={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Payment Terms */}
          {selectedPaymentType === 'CREDIT' && (
            <div
              className={cn(
                'space-y-2',
                isEditing && isDesktop
                  ? selectedCustomerType === 'BUSINESS'
                    ? 'col-span-1 col-start-2'
                    : 'col-span-1 col-start-1'
                  : 'col-span-2'
              )}
            >
              <FormLabel>Invoice Due Date*</FormLabel>
              <div className="grid grid-cols-[2fr_8fr] w-full">
                <FormField
                  control={customerForm.control}
                  name="payment_terms_day"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormControl>
                        <Input
                          type="number"
                          className="rounded-r-none border-r-0 focus-visible:z-10 w-full"
                          placeholder="Days"
                          {...field}
                          isNumber
                          onChange={(e) => {
                            field.onChange(e);
                            // Trigger validation for both payment_terms_day and payment_terms fields
                            customerForm.trigger([
                              'payment_terms_day',
                              'payment_terms',
                            ]);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="absolute mt-9 whitespace-nowrap" />
                    </FormItem>
                  )}
                />
                <FormSelect
                  control={customerForm.control}
                  name="payment_terms"
                  options={paymentTermsOptions}
                  placeholder="Select Payment Terms"
                  className="rounded-l-none w-full"
                  showSearch={false}
                  onChange={() => {
                    // Trigger validation for payment_terms_day when payment_terms changes
                    customerForm.trigger([
                      'payment_terms_day',
                      'payment_terms',
                    ]);
                  }}
                />
              </div>
            </div>
          )}

          {/* Account Manager */}
          <FormSelect
            control={customerForm.control}
            name="account_manager"
            label="Account Manager*"
            options={accountManagerOptions}
            placeholder="Select Account Manager"
            formItemClassName={
              isEditing && isDesktop
                ? selectedCustomerType === 'BUSINESS'
                  ? 'col-span-1 col-start-1'
                  : 'col-span-1 col-start-2'
                : 'col-span-2'
            }
          />

          {/* Billing Address */}
          <FormField
            control={customerForm.control}
            name="billing_address"
            render={({ field }) => (
              <FormItem
                className={
                  isEditing && isDesktop
                    ? selectedCustomerType === 'BUSINESS'
                      ? 'col-span-1 col-start-2'
                      : 'col-span-1 col-start-1'
                    : 'col-span-2'
                }
              >
                <FormLabel>Billing Address*</FormLabel>
                <FormControl>
                  <AddressAutoComplete
                    address={address}
                    setAddress={handleAddressChange}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    dialogTitle="Search for Billing Address"
                    placeholder="Search for Billing Address..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Audit Information */}
          {isEditing && (
            <div className="col-span-full space-y-6 mt-10 mb-4">
              <h2 className="text-2xl font-bold">Audit Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 md:pl-2 gap-6 md:max-w-3xl">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Created By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer?.createdBy || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Last Modified By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer?.lastModifiedBy || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Created Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer?.createdAt
                      ? new Date(selectedCustomer.createdAt).toLocaleDateString(
                          'en-AU',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          }
                        )
                      : 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Modified Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer?.updatedAt
                      ? new Date(selectedCustomer.updatedAt).toLocaleDateString(
                          'en-AU',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          }
                        )
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          {isDesktop && (
            <div className="flex justify-end space-x-2 col-span-2 mb-6">
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
              <Button
                form="add-new-customer-form"
                className="cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? isEditing
                    ? 'Saving Changes...'
                    : 'Adding Customer...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Add Customer'}
              </Button>
            </div>
          )}

          {!isDesktop && (
            <div className="flex flex-col col-span-2 gap-3 mb-6">
              <Button
                // TODO: QLINK-257 Edit Customer Functionality
                // form="add-new-customer-form"
                type="submit"
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? isEditing
                    ? 'Saving Changes...'
                    : 'Adding Customer...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Add Customer'}
              </Button>
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
