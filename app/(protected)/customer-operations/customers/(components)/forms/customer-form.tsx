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

import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { FormSelect } from '@/components/ui/form-select';
import { useMediaQuery } from '@/hooks/use-media-query';
import { NewCustomerFormSchema } from './schemas/customer-form-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';

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

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
}

export default function CustomerForm({
  id,
  onCancel,
  className,
  onSuccess,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
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
      business_email: isEditing
        ? selectedCustomer?.email || 'buildpty@email.com'
        : '',
      business_phone: isEditing
        ? normalizePhoneNumber(selectedCustomer?.phone || '') || '+61429384373'
        : '',
      abn: isEditing ? selectedCustomer?.abn || '' : '',
      contact_person_name: isEditing && selectedCustomer?.customerType === 'INDIVIDUAL'
        ? selectedCustomer?.contactName || ''
        : '',
      contact_person_first_name: isEditing && selectedCustomer?.customerType === 'BUSINESS'
        ? selectedCustomer?.contactName?.split(' ')[0] || ''
        : '',
      contact_person_last_name: isEditing && selectedCustomer?.customerType === 'BUSINESS'
        ? selectedCustomer?.contactName?.split(' ').slice(1).join(' ') || ''
        : '',
      contact_person_email: isEditing ? selectedCustomer?.email || '' : '',
      contact_person_phone: isEditing
        ? normalizePhoneNumber(selectedCustomer?.phone || '') || '+61429384373'
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
      billing_address: isEditing ? '1 Scott Street Pyrmont, NSW, 2009' : '',
      created_at: undefined,
      updated_at: undefined,
      created_by: 'current_user',
      last_modified_by: 'current_user',
    },
  });

  const handleFormFieldChange = (
    field: 'customer_type' | 'payment_type',
    value: string
  ) => {
    if (field === 'customer_type') {
      setSelectedCustomerType(value);
      customerForm.setValue('customer_type', value);
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
      customerForm.setValue('payment_type', value);
      if (value === 'PREPAID') {
        customerForm.setValue('credit_limit', 0);
        customerForm.setValue('payment_terms_day', 0);
      }
    }
  };

  // Effect to reset form when selected customer changes
  React.useEffect(() => {
    if (selectedCustomer && isEditing) {
      const paymentType =
        selectedCustomer.paymentType === 'PREPAID' ? 'PREPAID' : 'CREDIT';
      setSelectedCustomerType(selectedCustomer.customerType);
      setSelectedPaymentType(paymentType);
      setSearchInput('1 Scott Street Pyrmont, NSW, 2009');

      customerForm.reset({
        customer_type: selectedCustomer.customerType,
        payment_type: paymentType,
        business_name: selectedCustomer.businessName,
        business_email: selectedCustomer.email,
        business_phone: normalizePhoneNumber(selectedCustomer.phone) || '',
        abn: selectedCustomer.abn === 'N/A' ? '' : selectedCustomer.abn,
        contact_person_name: selectedCustomer.customerType === 'INDIVIDUAL'
          ? selectedCustomer.contactName
          : '',
        contact_person_first_name: selectedCustomer.customerType === 'BUSINESS'
          ? selectedCustomer.contactName?.split(' ')[0] || ''
          : '',
        contact_person_last_name: selectedCustomer.customerType === 'BUSINESS'
          ? selectedCustomer.contactName?.split(' ').slice(1).join(' ') || ''
          : '',
        contact_person_email: selectedCustomer.email,
        contact_person_phone:
          normalizePhoneNumber(selectedCustomer.phone) || '',
        credit_limit:
          selectedCustomer.creditLimit === 0
            ? 0
            : selectedCustomer.creditLimit / 100, // Convert from cents to dollars
        payment_terms_day: selectedCustomer.invoiceDueDate,
        payment_terms:
          selectedCustomer.paymentTermType === 'N/A'
            ? ''
            : selectedCustomer.paymentTermType,
        account_manager: selectedCustomer.accountManagerSub,
        billing_address: '1 Scott Street Pyrmont, NSW, 2009',
        created_at: selectedCustomer.createdAt
          ? new Date(selectedCustomer.createdAt)
          : undefined,
        updated_at: selectedCustomer.updatedAt
          ? new Date(selectedCustomer.updatedAt)
          : undefined,
        created_by: selectedCustomer.createdBy,
        last_modified_by: selectedCustomer.lastModifiedBy,
      });
    }
  }, [selectedCustomer, isEditing, customerForm]);

  React.useEffect(() => {
    if (address.formattedAddress) {
      customerForm.setValue('billing_address', address.formattedAddress);
      // Trigger validation when address is set
      customerForm.trigger('billing_address');
    }
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

      // Handle business field population for Individual customers
      let businessName = values.business_name;
      let businessEmail = values.business_email;
      let businessPhone = values.business_phone;
      let abn = values.abn;

      let creditLimit = values.credit_limit;
      let paymentTermsDay = values.payment_terms_day;
      let paymentTermsPeriod = values.payment_terms;

      // Combine contact person fields for the contactName
      let contactName = '';

      if (values.customer_type === 'INDIVIDUAL') {
        // For Individual customers, use contact_person_name
        contactName = values.contact_person_name || '';
        // Populate business fields with contact data
        businessName = values.contact_person_name || values.business_name;
        businessEmail = values.contact_person_email || values.business_email;
        businessPhone = values.contact_person_phone || values.business_phone;
        abn = 'N/A';
      } else if (values.customer_type === 'BUSINESS') {
        // For Business customers, combine first name and last name
        contactName = `${values.contact_person_first_name || ''} ${values.contact_person_last_name || ''}`.trim();
      }

      // Handle credit limit for Prepaid customers
      if (values.payment_type === 'PREPAID') {
        creditLimit = 0;
        paymentTermsDay = 0;
        paymentTermsPeriod = 'N/A';
      }

      const currentTimestamp = new Date().toISOString();
      const customerData = {
        id: 0, // Will be generated by backend
        customerType: values.customer_type || 'BUSINESS',
        businessName: businessName,
        businessEmail: businessEmail,
        businessPhone: businessPhone,
        abn: abn,
        contactName: contactName,
        phone: values.contact_person_phone,
        email: values.contact_person_email,
        billingAddress: values.billing_address,
        creditLimit:
          creditLimit === 0 ? 0 : Math.round(Number(creditLimit || 0) * 100),
        paymentTermsDay: paymentTermsDay,
        paymentTermsPeriod: paymentTermsPeriod,
        accountManagerSub: values.account_manager,
        customerStatus: 'ACTIVE',
        jobsCount: 0,
        version: 0,
        isDeleted: false,
        createdBy: 'current_user',
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
        lastModifiedBy: 'current_user',
      };

      console.log('Customer Data:', customerData);
      // Show success toast
      notifySuccess(isEditing ? 'Customer Updated' : 'Customer Added');
      onSuccess?.();
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

      // Duplicate contact email (HTTP 409)
      const duplicateContactEmailPhrase = `Key (contact_person_email)=(${values.contact_person_email}) already exists`;
      const isDuplicateContactEmail =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        messageFromErr.includes(duplicateContactEmailPhrase);

      if (isDuplicateContactEmail) {
        const msg = `Duplicate contact email "${values.contact_person_email}" already exists.`;
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

          {/* Contact Person Email - For BUSINESS type */}
          {selectedCustomerType === 'BUSINESS' && (
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

          {/* Contact Person Last Name - For BUSINESS type only */}
          {selectedCustomerType === 'BUSINESS' && (
            <FormField
              control={customerForm.control}
              name="contact_person_last_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
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

          {/* Contact Person Phone - For BUSINESS type */}
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
                      ? 'col-span-1 col-start-1'
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
                  ? selectedPaymentType === 'CREDIT'
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
              isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
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
                    ? 'col-span-1 col-start-2'
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
