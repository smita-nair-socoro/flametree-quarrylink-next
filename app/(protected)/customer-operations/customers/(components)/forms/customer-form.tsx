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

import { DollarSignIcon } from 'lucide-react';
import { InputIcon } from '@/components/ui/input-icon';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { AddressType } from '@/lib/types/address';
import { ABNInput } from '@/components/ui/input-mask';
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
      if (value === 'Individual') {
        customerForm.setValue('abn', 'N/A');
        customerForm.setValue(
          'business_name',
          customerForm.getValues('contact_person_name')
        );
        customerForm.setValue(
          'business_email',
          customerForm.getValues('contact_person_email')
        );
        customerForm.setValue(
          'business_phone',
          customerForm.getValues('contact_person_phone')
        );
      }
    } else if (field === 'payment_type') {
      setSelectedPaymentType(value);
      if (value === 'Prepaid') {
        customerForm.setValue('credit_limit', 0);
      }
    }
  };

  React.useEffect(() => {
    if (selectedCustomerType === 'Individual') {
      customerForm.setValue('abn', 'N/A');
      customerForm.setValue(
        'business_name',
        customerForm.getValues('contact_person_name')
      );
      customerForm.setValue(
        'business_email',
        customerForm.getValues('contact_person_email')
      );
      customerForm.setValue(
        'business_phone',
        customerForm.getValues('contact_person_phone')
      );
    }
  }, [selectedCustomerType]);

  React.useEffect(() => {
    if (selectedPaymentType === 'Prepaid') {
      customerForm.setValue('credit_limit', 0);
    }
  }, [selectedPaymentType]);

  // Effect to sync contact person data to business fields for Individual customers when contact data changes
  React.useEffect(() => {
    if (selectedCustomerType === 'Individual') {
      const contactName = customerForm.watch('contact_person_name');
      const contactEmail = customerForm.watch('contact_person_email');
      const contactPhone = customerForm.watch('contact_person_phone');

      if (contactName) {
        customerForm.setValue('business_name', contactName);
      }
      if (contactEmail) {
        customerForm.setValue('business_email', contactEmail);
      }
      if (contactPhone) {
        customerForm.setValue('business_phone', contactPhone);
      }
    }
  }, [
    customerForm.watch('contact_person_name'),
    customerForm.watch('contact_person_email'),
    customerForm.watch('contact_person_phone'),
    selectedCustomerType,
    customerForm,
  ]);

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
    // Debugging form state
    // const hasErrors = Object.keys(customerForm.formState.errors).length > 0;
    // console.log('Form has errors:', hasErrors);
    // console.log('Form is valid:', !hasErrors);
    // console.log('Form errors:', customerForm.formState.errors);
    console.log('Customer Form Values:', values);

    setIsSubmitting(true);

    const currentTimestamp = new Date().toISOString();
    const customerData = {
      id: 0, // Will be generated by backend
      customerType: values.customer_type?.toUpperCase() || 'BUSINESS',
      businessName: values.business_name,
      abn: values.abn,
      contactName: values.contact_person_name,
      phone: values.contact_person_phone,
      email: values.contact_person_email,
      billingAddressId: 0,
      creditLimit: Math.round(Number(values.credit_limit || 0) * 100),
      paymentTerms: values.payment_terms,
      accountManager: values.account_manager,
      customerStatus: 'ACTIVE',
      jobsCount: 0,
      version: 0, // TODO: get version
      isDeleted: false,
      createdBy: 'current_user', // TODO: get current user
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      lastModifiedBy: 'current_user', // TODO: get current user
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
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center space-y-4">
            <Spinner className="h-8 w-8 animate-spin" />
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
          {/* Quote Type - Only show when creating new quote */}
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
                    <ABNInput
                      isBusiness={selectedCustomerType === 'Business'}
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
                    <InputIcon
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full"
                      startIcon={<DollarSignIcon className="w-4 h-4" />}
                      placeholder="Enter Credit Limit"
                      {...field}
                      value={field.value === 0 ? '' : field.value}
                      onChange={(e) => {
                        const value =
                          e.target.value === ''
                            ? 0
                            : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormSelect
            control={customerForm.control}
            name="payment_terms"
            label="Payment Terms*"
            options={paymentTermsOptions}
            placeholder="Select Customer"
            formItemClassName={
              isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
            }
          />

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
                      dialogTitle="Enter Address"
                      placeholder="Enter site address..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isEditing && (
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
          )}

          <div className={cn('flex justify-end space-x-2 col-span-2')}>
            {isDesktop && (
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
            )}
            {!isEditing && (
              <Button
                form="add-new-customer-form"
                className={!isDesktop ? 'w-full' : 'cursor-pointer'}
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
