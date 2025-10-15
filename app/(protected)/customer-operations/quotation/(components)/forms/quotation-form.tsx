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
import { NewQuotationFormSchema } from './schemas/quotation-form-schema';
import { quotationLineItemColumns } from '../../(components)/(data-tables)/line-item/columns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/date-picker';
import { GetTodaysDate } from '@/lib/utils/date';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { AddressType } from '@/lib/types/address';
import { Spinner } from '@/components/ui/spinner';
import { useSelectedQuotation } from '@/app/stores/quotation-store';
import { FormDialog } from '@/components/form-dialog';
import QuotationLineItemForm from './quotation-line-item-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { DataTableClient } from '@/components/ui/data-table-client';
import rawJsonWithLineItems from '@/lib/tests/quotationWithLineItemsResonseData.json';
import { Quotation } from '@/lib/types/quotation';
import { PhoneInput } from '@/components/ui/phone-input';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
}

export default function QuotationForm({ id, onCancel, className }: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const selectedQuotation = useSelectedQuotation();

  // When editing, fetch detailed quotation data with line items
  // Change this with API call later
  const getDetailedQuotation = React.useMemo(() => {
    if (isEditing && selectedQuotation?.id) {
      const convertedDetailedJson =
        convertKeysToSnakeCase(rawJsonWithLineItems);
      const { items: detailedItems } = convertedDetailedJson as unknown as {
        items: Quotation[];
      };
      return detailedItems.find((item) => item.id === selectedQuotation.id);
    }
    return null;
  }, [isEditing, selectedQuotation?.id]);

  // Use detailed quotation for editing, or selected quotation for new
  const currentQuotation = isEditing ? getDetailedQuotation : selectedQuotation;

  const convertedQuotationLineItem = convertKeysToSnakeCase(
    currentQuotation?.line_items
  );

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

  const quotationForm = useForm<z.infer<typeof NewQuotationFormSchema>>({
    resolver: zodResolver(NewQuotationFormSchema),
    defaultValues: {
      quote_type:
        isEditing && currentQuotation?.quote_type
          ? currentQuotation.quote_type
          : 'DELIVERY',
      customer_id:
        isEditing && currentQuotation?.customer_id
          ? currentQuotation.customer_id
          : 0,
      account_manager:
        isEditing && currentQuotation?.account_manager
          ? currentQuotation.account_manager
          : 0,
      project_name:
        isEditing && currentQuotation?.project_name
          ? currentQuotation.project_name
          : '',
      delivery_start_date:
        isEditing && currentQuotation?.delivery_start_date
          ? new Date(currentQuotation.delivery_start_date)
          : undefined,
      delivery_window_start:
        isEditing && currentQuotation?.delivery_window_start
          ? new Date(currentQuotation.delivery_window_start).toLocaleTimeString(
              'en-US',
              {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
              }
            )
          : '',
      delivery_window_end:
        isEditing && currentQuotation?.delivery_window_end
          ? new Date(currentQuotation.delivery_window_end).toLocaleTimeString(
              'en-US',
              {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
              }
            )
          : '',
      expiry_date:
        isEditing && currentQuotation?.expiry_date
          ? new Date(currentQuotation.expiry_date)
          : undefined,
      delivery_address: '',
      phone: '',
      email: '',
      created_at:
        isEditing && currentQuotation?.created_at
          ? new Date(currentQuotation.created_at)
          : new Date(),
      updated_at:
        isEditing && currentQuotation?.updated_at
          ? new Date(currentQuotation.updated_at)
          : new Date(),
      created_by:
        isEditing && currentQuotation?.created_by
          ? currentQuotation.created_by
          : 'Jay Woo Choi',
      last_modified_by:
        isEditing && currentQuotation?.last_modified_by
          ? currentQuotation.last_modified_by
          : 'Armin Menhaji',
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Watch the quote_type field to make labels dynamic
  const quoteType = quotationForm.watch('quote_type');

  const addressLabel = React.useMemo(() => {
    if (!quoteType) return 'Address';
    return quoteType === 'DELIVERY' ? 'Delivery Address' : 'Collection Address';
  }, [quoteType]);

  const dateLabel = React.useMemo(() => {
    if (!quoteType) return 'Delivery Date';
    return quoteType === 'DELIVERY' ? 'Delivery Date' : 'Collection Date';
  }, [quoteType]);

  const timeWindowLabel = React.useMemo(() => {
    if (!quoteType) return 'Delivery Time Window';
    return quoteType === 'DELIVERY'
      ? 'Delivery Time Window'
      : 'Collection Time Window';
  }, [quoteType]);

  React.useEffect(() => {
    if (address.formattedAddress) {
      quotationForm.setValue('delivery_address', address.formattedAddress);
    }
  }, [address.formattedAddress, quotationForm]);

  const handleAddressChange = React.useCallback((newAddress: AddressType) => {
    setAddress(newAddress);
    if (newAddress.formattedAddress) {
      setSearchInput('');
    }
  }, []);

  const customerOptions: FormSelectOption[] = [
    {
      label: 'Armin Customer',
      value: 1,
    },
    {
      label: 'Bec Customer',
      value: 2,
    },
    {
      label: 'Jay Customer',
      value: 3,
    },
  ];

  const accountManagerOptions: FormSelectOption[] = [
    { label: 'Reza', value: 1 },
    { label: 'Armin', value: 2 },
    { label: 'Jaywoo', value: 3 },
  ]; // TODO: get account manager

  React.useEffect(() => {
    const customerId = quotationForm.watch('customer_id');
    if (customerId && customerId > 0) {
      // Only set values if they're empty to avoid controlled/uncontrolled warning
      const currentPhone = quotationForm.getValues('phone');
      const currentEmail = quotationForm.getValues('email');

      if (!currentPhone) {
        quotationForm.setValue('phone', '+61444555777');
      }
      if (!currentEmail) {
        quotationForm.setValue('email', 'customer@email.com');
      }
    }
  }, [quotationForm.watch('customer_id')]);

  async function onSubmit(values: z.infer<typeof NewQuotationFormSchema>) {
    console.log('onSubmit function called!');
    console.log('Form is valid:', quotationForm.formState.isValid);
    console.log('Form errors:', quotationForm.formState.errors);
    console.log('Quotation Form Values:', values);
    console.log('Selected Address Details:', address);

    setIsSubmitting(true);

    // Simulate API call delay (remove this in production)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
  }

  const today = React.useMemo(() => {
    const d = GetTodaysDate();
    return d;
  }, []);

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
              Adding Quote...
            </p>
          </div>
        </div>
      )}

      <Form {...quotationForm}>
        <form
          id="add-new-quote-form"
          className={cn(
            'p-1 w-full flex flex-col',
            className,
            isSubmitting && 'pointer-events-none'
          )}
          onSubmit={quotationForm.handleSubmit(onSubmit)}
        >
          <div
            className={cn(
              'p-1 gap-1 w-full',
              isDesktop && isEditing
                ? 'grid grid-cols-2 gap-x-8'
                : 'grid grid-cols-1',
              className,
              isSubmitting && 'pointer-events-none'
            )}
          >
            {/* Quote Type - Only show when creating new quote */}
            <FormField
              control={quotationForm.control}
              name="quote_type"
              render={({ field }) => (
                <FormItem className="col-span-1 col-start-1 gap-3">
                  <FormLabel>Quote Type*</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-flow-col auto-cols-max gap-4"
                    >
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="DELIVERY" />
                        </FormControl>
                        <FormLabel className="font-normal">Delivery</FormLabel>
                      </FormItem>

                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="COLLECTION" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Collection
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSelect
              control={quotationForm.control}
              name="customer_id"
              label="Customer*"
              searchLabel="Customer"
              options={customerOptions}
              placeholder="Select Customer"
              formItemClassName={
                isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
              }
            />

            <FormSelect
              control={quotationForm.control}
              name="account_manager"
              label="Account Manager*"
              searchLabel="Account Managers"
              options={accountManagerOptions}
              placeholder="Select Account Manager"
              formItemClassName={
                isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
              }
            />

            <FormField
              control={quotationForm.control}
              name="project_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-1'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Project Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Project Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={quotationForm.control}
              name="delivery_address"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>{addressLabel}*</FormLabel>
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

            {isEditing && (
              <FormField
                control={quotationForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem
                    className={
                      isEditing && isDesktop
                        ? 'col-span-1 col-start-1'
                        : 'col-span-2'
                    }
                  >
                    <FormLabel>Phone*</FormLabel>
                    <FormControl>
                      <PhoneInput
                        className="w-full"
                        placeholder="Enter Phone"
                        defaultCountry="AU"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={quotationForm.control}
              name="delivery_start_date"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>{dateLabel}*</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChangeAction={field.onChange}
                      placeholder="Pick a date"
                      disabled={{ before: today }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={quotationForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem
                    className={
                      isEditing && isDesktop
                        ? 'col-span-1 col-start-1 gap-0'
                        : 'col-span-2'
                    }
                  >
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Enter Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div
              className={cn(
                'grid grid-cols-2 gap-2',
                isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
              )}
            >
              <h3 className="font-bold col-span-2">{timeWindowLabel}</h3>
              <FormField
                control={quotationForm.control}
                name="delivery_window_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time Window</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="time"
                        id="time-picker-start"
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={quotationForm.control}
                name="delivery_window_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time Window</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="time"
                        id="time-picker-end"
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={quotationForm.control}
              name="expiry_date"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop
                      ? 'col-span-1 col-start-2'
                      : 'col-span-2'
                  }
                >
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChangeAction={field.onChange}
                      placeholder="Pick a date"
                      disabled={{ before: today }}
                    />
                  </FormControl>
                  <FormDescription>
                    If the quote is not approved by the expiry date, it will
                    automatically expire and no longer be valid.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <div
                className={cn(
                  isDesktop
                    ? 'flex justify-between items-center col-span-2 mb-5'
                    : 'flex flex-col gap-4 col-span-1'
                )}
              >
                <div>
                  <span className="text-[#374151] text-2xl font-semibold ">
                    Line Items
                  </span>
                </div>
                <div
                  className={cn(
                    'flex items-center gap-2',
                    !isDesktop && 'mt-2'
                  )}
                >
                  <FormDialog
                    dialogTitle="Add Product"
                    buttonTitle="Add New Product"
                    dialogWidth="700px"
                    contentClass="-mt-5"
                  >
                    <QuotationLineItemForm />
                  </FormDialog>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="col-span-full space-y-10">
                {/* TODO: Come back to this once Product is done! */}
                <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
                  <DataTableClient
                    columns={quotationLineItemColumns}
                    data={convertedQuotationLineItem ?? []}
                    simpleTable={true}
                  />
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Audit Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 gap-6 md:max-w-3xl">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Created By:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quotationForm.watch('created_by') || 'Jay Woo Choi'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Last Modified By:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quotationForm.watch('last_modified_by') ||
                          'Jaywoo Choi'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Created Date:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quotationForm.watch('created_at')
                          ? new Date(
                              quotationForm.watch('created_at')
                            ).toLocaleDateString('en-AU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                            })
                          : '10/02/25'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Modified Date:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quotationForm.watch('updated_at')
                          ? new Date(
                              quotationForm.watch('updated_at')
                            ).toLocaleDateString('en-AU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                            })
                          : '21/04/25'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isDesktop && (
              <div className="flex justify-end space-x-2 col-span-2 my-6">
                <Button variant="outline" type="button" onClick={onCancel}>
                  {isEditing ? 'Close' : 'Cancel'}
                </Button>
                <Button
                  form="add-new-quote-form"
                  className="cursor-pointer"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isEditing ? 'Save Changes' : 'Add Quote'}
                </Button>
              </div>
            )}

            {!isDesktop && (
              <div className="flex flex-col col-span-2 gap-3 my-6">
                <Button
                  form="add-new-quote-form"
                  type="submit"
                  className="cursor-pointer"
                >
                  {isEditing ? 'Save Changes' : 'Add Quote'}
                </Button>
                <Button variant="outline" type="button" onClick={onCancel}>
                  {isEditing ? 'Close' : 'Cancel'}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
