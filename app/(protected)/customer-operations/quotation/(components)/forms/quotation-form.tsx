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
import { Spinner } from '@/components/ui/spinner';
import {
  useSelectedQuotation,
  useQuotationStore,
} from '@/app/stores/quotation-store';
import { FormDialog } from '@/components/form-dialog';
import QuotationLineItemForm from './quotation-line-item-form';
import { DataTableClient } from '@/components/ui/data-table-client';
import { PhoneInput } from '@/components/ui/phone-input';
import { useCreateQuotation, useUpdateQuotation } from '@/lib/api/quotation';
import {
  transformFormDataToQuoteDto,
  generateNextQuoteNumber,
} from '@/lib/utils/quote-helpers';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { quotationToFormValues } from '@/lib/utils/quotation-form-helpers';
import { notifySuccess, notifyError } from '@/lib/toast';
import { Info } from 'lucide-react';
import { useQuotationFormState } from '@/hooks/quotation/use-quotation-form-state';
import { QUOTE_STATUS } from '@/lib/types/quotation-enums';
import { useQuery } from '@tanstack/react-query';
import { CustomersListQueryOptions } from '@/lib/api/customer';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { normalizeObjectPhoneNumbers } from '@/lib/utils/phone-helper';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
  canEdit?: boolean;
  isDuplicate?: boolean;
}

export default function QuotationForm({
  id,
  onCancel,
  className,
  canEdit,
  isDuplicate,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const selectedQuotation = useSelectedQuotation();

  const quotationForm = useForm<z.infer<typeof NewQuotationFormSchema>>({
    resolver: zodResolver(NewQuotationFormSchema),
    defaultValues: quotationToFormValues(
      isEditing ? selectedQuotation : null,
      isEditing
    ),
  });

  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();

  // All form state management: data fetching, labels, pricing, address, customer auto-fill
  const {
    currentQuotation,
    isLoadingDetail,
    detailError,
    addressLabel,
    dateLabel,
    timeWindowLabel,
    pricingBreakdown,
    gst,
    totalInvoiceIncGST,
    deliveryAddress,
    handleAddressChange,
    searchInput,
    setSearchInput,
  } = useQuotationFormState(selectedQuotation, isEditing, quotationForm);

  // Update form values when API data loads
  React.useEffect(() => {
    if (isEditing && currentQuotation) {
      quotationForm.reset(quotationToFormValues(currentQuotation, true));
    }
  }, [isEditing, currentQuotation, quotationForm]);

  // Fetch customers from API
  const { data: customersRaw = [] } = useQuery(CustomersListQueryOptions());

  // Convert API response from camelCase to snake_case and normalize phone numbers
  const customers = React.useMemo(() => {
    const converted = convertKeysToSnakeCase(customersRaw);
    const normalized = converted.map(normalizeObjectPhoneNumbers);
    return normalized;
  }, [customersRaw]);

  // Get unique account managers from quotations store
  const getUniqueAccountManagers = useQuotationStore(
    (state) => state.getUniqueAccountManagers
  );

  // Build customer options from API customers list
  const customerOptions: FormSelectOption[] = React.useMemo(() => {
    const options = customers
      .filter((customer) => customer.business_name || customer.contact_name) // Only include customers with name
      .map((customer) => ({
        label: customer.business_name || customer.contact_name,
        value: customer.id,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [customers]);

  // Auto-fill phone and email when customer is selected
  React.useEffect(() => {
    const subscription = quotationForm.watch((value, { name }) => {
      if (name === 'customerId' && value.customerId) {
        const selectedCustomer = customers.find(
          (c) => c.id === value.customerId
        );

        if (selectedCustomer) {
          console.log('🔄 [QuotationForm] Auto-filling customer data:', {
            customerId: selectedCustomer.id,
            customerName: selectedCustomer.business_name,
            phone: selectedCustomer.phone,
            email: selectedCustomer.email,
          });

          // Update phone and email fields whenever customer changes
          quotationForm.setValue('phone', selectedCustomer.phone || '');
          quotationForm.setValue('email', selectedCustomer.email || '');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [customers, quotationForm]);

  // Build account manager options from quotations list
  const accountManagerOptions: FormSelectOption[] = React.useMemo(() => {
    return getUniqueAccountManagers();
  }, [getUniqueAccountManagers]);

  async function onSubmit(values: z.infer<typeof NewQuotationFormSchema>) {
    const getAccountManagerNameById =
      useQuotationStore.getState().getAccountManagerNameById;
    const quotations = useQuotationStore.getState().quotations;

    // Get customer name from customers list
    const selectedCustomer = customers.find((c) => c.id === values.customerId);
    let customerName = selectedCustomer?.business_name;

    let accountManagerName = getAccountManagerNameById(values.accountManager);

    if (isEditing && currentQuotation) {
      customerName = customerName || currentQuotation.customerName;
      accountManagerName =
        accountManagerName || currentQuotation.accountManagerName;
    }

    if (!customerName || !accountManagerName) {
      notifyError(
        extractErrorMessage('Missing customer or account manager information')
      );
      return;
    }

    console.log('📝 [QuotationForm][onSubmit] Customer Data:', {
      customerId: values.customerId,
      customerName,
      phone: values.phone,
      email: values.email,
    });

    const quoteNumber =
      isEditing && currentQuotation?.quoteNumber
        ? currentQuotation.quoteNumber
        : generateNextQuoteNumber(quotations);

    try {
      console.log(
        '🔍 [Quotation][onSubmit] Current Quotation:',
        currentQuotation
      );

      const quoteData = transformFormDataToQuoteDto(values, {
        customerName,
        accountManagerName,
        quoteNumber,

        lineItemsCount: isEditing
          ? currentQuotation?.quoteItems?.length || 0
          : 0,
        deliveryAddress: deliveryAddress,
      });

      // Handle status when editing
      if (isEditing && currentQuotation) {
        if (currentQuotation.status === 'DECLINED') {
          // If the quote was DECLINED, change it back to DRAFT when saving
          quoteData.quoteStatus = QUOTE_STATUS.DRAFT;
          console.log(
            '🔄 [Quotation][submit] Changing DECLINED status to DRAFT'
          );
        } else {
          // Preserve the original status for other statuses (PENDING, APPROVED, etc.)
          quoteData.quoteStatus = currentQuotation.status;
          console.log(
            '🔄 [Quotation][submit] Preserving original status:',
            currentQuotation.status
          );
        }
      }

      console.log('📦 [Quotation][submit] Transformed Quote Data:', quoteData);

      if (isEditing && currentQuotation?.id) {
        const updatePayload = { ...quoteData, id: currentQuotation.id };
        console.log('📤 [UPDATE] Sending Request Body:', updatePayload);

        await updateQuotation.mutateAsync(updatePayload);

        notifySuccess('Quotation Updated');
      } else {
        await createQuotation.mutateAsync(quoteData);
        notifySuccess('Quotation Added');
      }
      onCancel?.();
    } catch (error: unknown) {
      console.error('Failed to save quotation:', error);

      const message = extractErrorMessage(error);

      notifyError(
        `${
          isEditing ? 'Failed to Update Quotation' : 'Failed to Add Quotation'
        }: ${message}`
      );
    }
  }

  const today = React.useMemo(() => {
    const d = GetTodaysDate();
    return d;
  }, []);

  // Show loading state while fetching quotation details
  if (isEditing && isLoadingDetail) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="medium" />
          <p className="text-lg text-muted-foreground font-bold">
            Loading quotation details...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if fetching failed
  if (isEditing && detailError) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-semibold text-lg">
            Failed to load quotation details
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {detailError instanceof Error
              ? detailError.message
              : 'Unknown error occurred'}
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {(createQuotation.isPending || updateQuotation.isPending) && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10'
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              {isDuplicate ? 'Creating Duplicate Quote...' : 'Adding Quote...'}
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
            (createQuotation.isPending || updateQuotation.isPending) &&
              'pointer-events-none'
          )}
          onSubmit={quotationForm.handleSubmit(onSubmit)}
        >
          {isEditing && currentQuotation?.status === 'PENDING' && (
            <div className="border border-yellow-600 bg-yellow-50 p-4 rounded-md mb-4 flex flex-col">
              <div className="flex items-center gap-2 text-yellow-900 font-medium text-sm">
                <Info className="h-4 w-4" />
                <span>To edit, decline the quote....</span>
              </div>
              <span className="text-muted-foreground ml-6 text-sm">
                Save your changes and it will return to Draft for sending
              </span>
            </div>
          )}

          {isEditing && currentQuotation?.status === 'DECLINED' && (
            <div className="border border-blue-600 bg-blue-50 p-4 rounded-md mb-4 flex flex-col">
              <div className="flex items-center gap-2 text-blue-900 font-medium text-sm">
                <Info className="h-4 w-4" />
                <span>This quote was declined</span>
              </div>
              <span className="text-muted-foreground ml-6 text-sm">
                You can edit and save changes. It will automatically return to
                Draft status
              </span>
            </div>
          )}

          <div
            className={cn(
              'p-1 gap-1 w-full',
              isDesktop && isEditing
                ? 'grid grid-cols-2 gap-x-8'
                : 'grid grid-cols-1',
              className,
              (createQuotation.isPending || updateQuotation.isPending) &&
                'pointer-events-none'
            )}
          >
            {/* Duplicate Info Banner */}
            {isDuplicate && (
              <div className="col-span-full mb-4">
                <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] border border-[#0075FF33] rounded-lg">
                  <div className="flex-shrink-0 mt-0.5 text-[#0075FF]">
                    <Info className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-sm text-[#09090B]">
                    You can edit and adjust all information including customer
                    details and line items. Once you&apos;re happy with the
                    changes, create the duplicate and it will be marked as{' '}
                    <strong>DRAFT</strong>. You can then update it further or
                    send it to the customer.
                  </div>
                </div>
              </div>
            )}

            {/* Quote Type - Only show when creating new quote */}
            <FormField
              control={quotationForm.control}
              name="quoteType"
              render={({ field }) => (
                <FormItem className="col-span-1 col-start-1 gap-3">
                  <FormLabel>Quote Type*</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-flow-col auto-cols-max gap-4"
                      disabled={isEditing && !canEdit}
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
              name="customerId"
              label="Customer*"
              searchLabel="Customer"
              options={customerOptions}
              placeholder="Select Customer"
              formItemClassName={
                isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
              }
              disabled={isEditing && !canEdit}
            />

            <FormSelect
              control={quotationForm.control}
              name="accountManager"
              label="Account Manager*"
              searchLabel="Account Managers"
              options={accountManagerOptions}
              placeholder="Select Account Manager"
              formItemClassName={
                isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
              }
              disabled={isEditing && !canEdit}
            />

            <FormField
              control={quotationForm.control}
              name="projectName"
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
                      disabled={isEditing && !canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={quotationForm.control}
              name="deliveryAddress"
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
                      address={deliveryAddress}
                      setAddress={handleAddressChange}
                      searchInput={searchInput}
                      setSearchInput={setSearchInput}
                      dialogTitle="Enter Address"
                      placeholder="Enter site address..."
                      readOnly={isEditing && !canEdit}
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
                        disabled={isEditing && !canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={quotationForm.control}
              name="deliveryStartDate"
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
                      readOnly={isEditing && !canEdit}
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
                        disabled={isEditing && !canEdit}
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
                name="deliveryWindowStart"
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
                        disabled={isEditing && !canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={quotationForm.control}
                name="deliveryWindowEnd"
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
                        disabled={isEditing && !canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={quotationForm.control}
              name="expiryDate"
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
                      readOnly={isEditing && !canEdit}
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
                {canEdit && (
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
                      <QuotationLineItemForm canEdit={canEdit} />
                    </FormDialog>
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div className="col-span-full space-y-10">
                <div className="flex flex-col gap-0">
                  <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
                    {(() => {
                      const quoteItemsData = currentQuotation?.quoteItems ?? [];
                      return (
                        <DataTableClient
                          columns={quotationLineItemColumns}
                          data={quoteItemsData}
                          simpleTable={true}
                          useColumnSizing={true}
                        />
                      );
                    })()}
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="bg-gray-50 border-t px-2 border-[#E5E5E5] [&>div]:border-b [&>div]:border-dashed [&>div]:border-purple-300 [&>div:nth-child(1)]:border-b-0 [&>div:nth-child(3)]:border-b-0 [&>div:nth-child(5)]:border-b-0">
                      <div className="flex justify-between py-3">
                        <span className="text-sm font-normal">
                          Product Cost (Total):
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalProductCostPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 -mt-3">
                        <span className="text-sm font-normal">
                          Truck Cost (Total):
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalTruckCostPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-sm font-normal">
                          Product Sell (Total):
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalProductSellPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 -mt-3">
                        <span className="text-sm font-normal">
                          Truck Sell (Total):
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalTruckSellPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-sm font-normal">
                          Subtotal (ex-GST):
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalInvoice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 -mt-3">
                        <span className="text-sm font-normal">GST (10%):</span>
                        <span className="text-sm font-normal">${gst}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-sm font-semibold">
                          Total Invoice (Incl. GST):
                        </span>
                        <span className="text-sm font-semibold">
                          ${totalInvoiceIncGST}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between py-3 px-2 bg-slate-200">
                      <span className="text-sm font-semibold">
                        Gross Profit:
                      </span>
                      <span className="text-sm font-semibold">
                        ${pricingBreakdown.grossProfit.toFixed(2)} (
                        {pricingBreakdown.grossProfitPercentage?.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {!isDuplicate && (
                  <div className="space-y-6 mt-10 mb-4">
                    <h2 className="text-2xl font-bold">Audit Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 md:pl-2 gap-6 md:max-w-3xl">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          Created By:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {quotationForm.watch('createdBy') || 'Jay Woo Choi'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          Last Modified By:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {quotationForm.watch('lastModifiedBy') ||
                            'Jaywoo Choi'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          Created Date:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {quotationForm.watch('createdAt')
                            ? new Date(
                                quotationForm.watch('createdAt')
                              ).toLocaleDateString('en-AU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit',
                              })
                            : '10/02/25'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          Modified Date:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {quotationForm.watch('updatedAt')
                            ? new Date(
                                quotationForm.watch('updatedAt')
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
                )}
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
                  disabled={
                    isEditing &&
                    (createQuotation.isPending ||
                      updateQuotation.isPending ||
                      !canEdit)
                  }
                >
                  {isDuplicate
                    ? 'Create Duplicate'
                    : isEditing
                    ? 'Save Changes'
                    : 'Add Quote'}
                </Button>
              </div>
            )}

            {!isDesktop && (
              <div className="flex flex-col col-span-2 gap-3 my-6">
                <Button
                  form="add-new-quote-form"
                  type="submit"
                  className="cursor-pointer"
                  disabled={
                    isEditing &&
                    (createQuotation.isPending ||
                      updateQuotation.isPending ||
                      !canEdit)
                  }
                >
                  {isDuplicate
                    ? 'Create Duplicate'
                    : isEditing
                    ? 'Save Changes'
                    : 'Add Quote'}
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
