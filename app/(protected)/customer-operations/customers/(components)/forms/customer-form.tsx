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
import { DatePicker } from '@/components/date-picker';

import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { AddressType } from '@/lib/types/address';
import { ABNInput, CurrencyInput } from '@/components/ui/input-mask';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
}

export default function CustomerForm({ id, onCancel, className }: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const [selectedCustomerType, setSelectedCustomerType] =
    React.useState<string>('Business');
  const [selectedPaymentType, setSelectedPaymentType] =
    React.useState<string>('Credit');
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
  const [searchInput, setSearchInput] = React.useState('');

  const customerForm = useForm<z.infer<typeof NewCustomerFormSchema>>({
    resolver: zodResolver(NewCustomerFormSchema),
    defaultValues: {
      customer_type: 'Business',
      payment_type: 'Credit',
      business_name: '',
      business_email: '',
      business_phone: '',
      abn: '',
      contact_person_name: '',
      contact_person_email: '',
      contact_person_phone: '',
      credit_limit: 0,
      payment_terms: '',
      account_manager: '',
      billing_address: '',
      created_at: new Date(),
      updated_at: new Date(),
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
      if (value === 'Individual') {
        // Clear business fields for Individual customers
        customerForm.setValue('abn', 'N/A');
        customerForm.setValue('business_name', '');
        customerForm.setValue('business_email', '');
        customerForm.setValue('business_phone', '');
      } else if (value === 'Business') {
        // Reset ABN for Business customers (remove N/A)
        customerForm.setValue('abn', '');
      }
    } else if (field === 'payment_type') {
      setSelectedPaymentType(value);
      customerForm.setValue('payment_type', value);
      if (value === 'Prepaid') {
        // Set credit limit to 0 for Prepaid customers
        customerForm.setValue('credit_limit', 0);
      }
    }
  };

  React.useEffect(() => {
    if (address.formattedAddress) {
      customerForm.setValue('billing_address', address.formattedAddress);
    }
  }, [address.formattedAddress, customerForm]);

  const handleAddressChange = React.useCallback((newAddress: AddressType) => {
    setAddress(newAddress);
    if (newAddress.formattedAddress) {
      setSearchInput('');
    }
  }, []);

  const paymentTermsOptions = [
    { label: 'Net 7', value: 'Net 7' },
    { label: 'Net 14', value: 'Net 14' },
    { label: 'Net 30', value: 'Net 30' },
  ];

  const accountManagerOptions = [
    { label: 'Reza', value: 'Reza' },
    { label: 'Armin', value: 'Armin' },
  ]; // TODO: get account manager

  async function onSubmit(values: z.infer<typeof NewCustomerFormSchema>) {
    console.log('onSubmit function called!');
    console.log('Customer Form Values:', values);

    setIsSubmitting(true);

    // Handle business field population for Individual customers
    let businessName = values.business_name;
    let businessEmail = values.business_email;
    let businessPhone = values.business_phone;
    let creditLimit = values.credit_limit;

    if (values.customer_type === 'Individual') {
      // For Individual customers, populate business fields with contact data
      businessName = values.contact_person_name || values.business_name;
      businessEmail = values.contact_person_email || values.business_email;
      businessPhone = values.contact_person_phone || values.business_phone;
    }

    // Handle credit limit for Prepaid customers
    if (values.payment_type === 'Prepaid') {
      creditLimit = 0;
    }

    const currentTimestamp = new Date().toISOString();
    const customerData = {
      id: 0, // Will be generated by backend
      customerType: values.customer_type?.toUpperCase() || 'BUSINESS',
      businessName: businessName,
      businessEmail: businessEmail,
      businessPhone: businessPhone,
      abn: values.abn,
      contactName: values.contact_person_name,
      phone: values.contact_person_phone,
      email: values.contact_person_email,
      billingAddressId: 0,
      creditLimit: Math.round(Number(creditLimit || 0) * 100),
      paymentTerms: values.payment_terms,
      accountManager: values.account_manager,
      customerStatus: 'ACTIVE',
      jobsCount: 0,
      version: 0,
      isDeleted: false,
      createdBy: 'current_user', // Backend will set this
      createdAt: currentTimestamp, // Backend will set this
      updatedAt: currentTimestamp, // Backend will set this
      lastModifiedBy: 'current_user', // Backend will set this
    };

    console.log('Customer Data:', customerData);

    // Simulate API call delay (remove this in production)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
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
              Adding Customer...
            </p>
          </div>
        </div>
      )}

      <Form {...customerForm}>
        <form
          id="add-new-customer-form"
          className={cn(
            'gap-6 p-1 w-full',
            isEditing && isDesktop
              ? 'grid grid-cols-2 gap-x-8'
              : 'grid grid-cols-1',
            className,
            isSubmitting && 'pointer-events-none'
          )}
          onSubmit={customerForm.handleSubmit(onSubmit)}
        >
          {/* Customer Type */}
          {!isEditing && (
            <FormField
              control={customerForm.control}
              name="customer_type"
              render={({ field }) => (
                <FormItem className="space-y-3 col-span-full">
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
                          <RadioGroupItem value="Business" />
                        </FormControl>
                        <FormLabel className="font-normal">Business</FormLabel>
                      </FormItem>

                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="Individual" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Individual
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Payment Type */}
          <FormField
            control={customerForm.control}
            name="payment_type"
            render={({ field }) => (
              <FormItem className="space-y-3 col-span-full">
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
                        <RadioGroupItem value="Credit" />
                      </FormControl>
                      <FormLabel className="font-normal">Credit</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="Prepaid" />
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
          {selectedCustomerType === 'Business' && (
            <FormField
              control={customerForm.control}
              name="business_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
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
          {selectedCustomerType === 'Business' && (
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
          {selectedCustomerType === 'Business' && (
            <FormField
              control={customerForm.control}
              name="business_phone"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
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
          {selectedCustomerType === 'Business' && (
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

          {/* Contact Person Name */}
          <FormField
            control={customerForm.control}
            name="contact_person_name"
            render={({ field }) => (
              <FormItem
                className={
                  isEditing && isDesktop
                    ? 'col-span-1 col-start-2'
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

          {/* Contact Person Email */}
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

          {/* Contact Person Phone */}
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

          {/* Credit Limit */}
          {selectedPaymentType === 'Credit' && (
            <FormField
              control={customerForm.control}
              name="credit_limit"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
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
          <FormSelect
            control={customerForm.control}
            name="payment_terms"
            label="Payment Terms*"
            options={paymentTermsOptions}
            placeholder="Select Payment Terms"
            formItemClassName={
              isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
            }
          />

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
          {!isEditing && (
            <FormField
              control={customerForm.control}
              name="billing_address"
              render={({ field }) => (
                <FormItem className={isEditing ? 'col-span-2' : 'col-span-2'}>
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
          )}

          {/* Audit Information */}
          {/* TODO: QLINK-257 Edit Customer Functionality */}
          {/* {isEditing && (
            <div
              className={cn(
                'space-y-6',
                isEditing ? 'col-span-2' : 'col-span-2'
              )}
            >
              <h2 className="text-2xl font-bold">Audit Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={customerForm.control}
                  name="created_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Created By</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full text-muted-foreground cursor-not-allowed"
                          readOnly={true}
                          disabled
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="created_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Created At</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChangeAction={field.onChange}
                          readOnly={true}
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customerForm.control}
                  name="last_modified_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Modified By</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full text-muted-foreground cursor-not-allowed"
                          readOnly={true}
                          disabled
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="updated_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Modified At</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChangeAction={field.onChange}
                          readOnly={true}
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )} */}

          {/* Form Actions */}
          <div className={cn('flex justify-end space-x-2 col-span-2 mb-6')}>
            {isDesktop && (
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
            )}
            {!isEditing && (
              <Button
                form="add-new-customer-form"
                className={!isDesktop ? 'w-full -mb-4' : 'cursor-pointer'}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Customer...' : 'Add Customer'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
