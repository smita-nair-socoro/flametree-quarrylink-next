'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
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
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { useMediaQuery } from '@/hooks/use-media-query';
import { NewCustomerFormSchema } from './schemas/customer-form-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/date-picker';

import { DollarSignIcon } from 'lucide-react';
import { InputIcon } from '@/components/ui/input-icon';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { AddressType } from '@/lib/types/address';

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

  // TODO: Once Address Type is added, do this
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
      abn: '',
      contact_person_name: '',
      email: '',
      phone: '',
      credit_limit: '',
      payment_terms: '',
      created_at: undefined,
      updated_at: undefined,
      created_by: '',
      last_modified_by: '',
    },
  });

  const handleFormFieldChange = (
    field: 'customer_type' | 'payment_type',
    value: string
  ) => {
    if (field === 'customer_type') {
      setSelectedCustomerType(value);
    } else if (field === 'payment_type') {
      setSelectedPaymentType(value);
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
  ];

  function onSubmit(values: z.infer<typeof NewCustomerFormSchema>) {
    console.log('onSubmit function called!');
    console.log('Form is valid:', customerForm.formState.isValid);
    console.log('Form errors:', customerForm.formState.errors);
    console.log('Customer Form Values:', values);
  }

  return (
    <div className="w-full">
      <Form {...customerForm}>
        <form
          id="add-new-customer-form"
          className={cn(
            'gap-6 p-1 w-full',
            isEditing && isDesktop
              ? 'grid grid-cols-2 gap-x-8'
              : 'grid grid-cols-1',
            className
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
                  <FormLabel>Customer Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
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
                <FormLabel>Payment Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
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
                      <FormLabel className="font-normal">Prepaid</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormLabel>Business Name</FormLabel>
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
                <FormLabel>ABN</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="XX XXX XXX XXX"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <FormLabel>Contact Person Name</FormLabel>
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
            name="email"
            render={({ field }) => (
              <FormItem
                className={
                  isEditing && isDesktop
                    ? 'col-span-1 col-start-2'
                    : 'col-span-2'
                }
              >
                <FormLabel>Email</FormLabel>
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
            name="phone"
            render={({ field }) => (
              <FormItem
                className={
                  isEditing && isDesktop
                    ? 'col-span-1 col-start-2'
                    : 'col-span-2'
                }
              >
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="+61 XXX XXX XXX"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <FormLabel>Credit Limit</FormLabel>
                <FormControl>
                  <InputIcon
                    className="w-full"
                    startIcon={<DollarSignIcon className="w-4 h-4" />}
                    placeholder="Enter Credit Limit"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                  <FormLabel>Billing Address</FormLabel>
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
                'flex justify-between items-center',
                isEditing ? 'col-span-2' : 'col-span-2'
              )}
            >
              <h2 className="text-2xl font-bold">Line Items</h2>
              <Button variant="default" type="button" onClick={onCancel}>
                + Add New Product
              </Button>
            </div>
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

          <div
            className={cn(
              'flex justify-end space-x-2',
              isEditing ? 'col-span-2' : 'col-span-2'
            )}
          >
            {isDesktop && (
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
            )}
            {!isEditing && (
              <Button
                form="add-new-quote-form"
                className={!isDesktop ? 'w-full' : 'cursor-pointer'}
                type="submit"
              >
                Add Quote
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
