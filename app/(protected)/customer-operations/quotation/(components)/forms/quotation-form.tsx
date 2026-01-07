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
import { getQuotationLineItemColumns } from '../../(components)/(data-tables)/line-item/columns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/date-picker';
import { GetTodaysDate } from '@/lib/utils/date';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { Spinner } from '@/components/ui/spinner';
import { useSelectedQuotation } from '@/app/stores/quotation-store';
import { FormDialog } from '@/components/form-dialog';
import QuotationLineItemForm from './quotation-line-item-form';
import { DataTableClient } from '@/components/ui/data-table-client';
import { PhoneInput } from '@/components/ui/phone-input';
import { useCreateQuotation, useUpdateQuotation } from '@/lib/api/quotation';
import {
  transformFormDataToQuoteDto,
  generateNextQuoteNumber,
  getLatestQuoteNumber,
} from '@/lib/utils/quote-helpers';
import { quotationToFormValues } from '@/lib/utils/quotation-form-helpers';
import { notifySuccess, notifyError } from '@/lib/toast';
import { Info, HelpCircle } from 'lucide-react';
import { useQuotationFormState } from '@/hooks/quotation/use-quotation-form-state';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CustomersListQueryOptions } from '@/lib/api/customer';
import { UsersListQueryOptions } from '@/lib/api/user';
import { normalizePhoneNumber } from '@/lib/utils/phone-helper';
import { QuotationsListQueryOptions } from '@/lib/api/quotation';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import { QUOTE_TYPE } from '@/lib/types/quotation-enums';
import { addNewRecordId } from '@/lib/utils';

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
  const queryClient = useQueryClient();

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
  const isCollectionQuote =
    currentQuotation?.quoteType === QUOTE_TYPE.COLLECTION;

  // Update form values when API data loads
  React.useEffect(() => {
    if (isEditing && currentQuotation) {
      quotationForm.reset(quotationToFormValues(currentQuotation, true));
    }
  }, [isEditing, currentQuotation, quotationForm]);

  // Fetch customers from API
  const { data: customers = [] } = useQuery(CustomersListQueryOptions());

  const customerOptions: FormSelectOption[] = React.useMemo(() => {
    if (!customers) return [];
    return customers
      .filter((customer) => customer.id !== undefined)
      .map((customer) => ({
        label: customer.businessName || customer.contactName,
        value: customer.id!,
      }));
  }, [customers]);

  const { data: users = [] } = useQuery(UsersListQueryOptions());
  const userOptions: FormSelectOption[] = React.useMemo(() => {
    if (!users) return [];
    return users.map((user) => ({
      label: user.name,
      value: user.sub,
    }));
  }, [users]);

  const getUserNameBySub = React.useCallback(
    (subOrName?: string | null) => {
      if (!subOrName) return '';
      return users.find((u) => u.sub === subOrName)?.name || subOrName;
    },
    [users]
  );

  // Auto-fill phone/email (and preselect account manager on create) when customer is selected
  React.useEffect(() => {
    const subscription = quotationForm.watch((value, { name }) => {
      if (name === 'customerId' && value.customerId) {
        const selectedCustomer = customers.find(
          (c) => c.id === value.customerId
        );

        if (selectedCustomer) {
          // Update phone and email fields whenever customer changes
          quotationForm.setValue(
            'phone',
            normalizePhoneNumber(selectedCustomer.phone || '') || ''
          );
          quotationForm.setValue('email', selectedCustomer.email || '');

          quotationForm.setValue(
            'accountManagerSub',
            selectedCustomer.accountManagerSub || ''
          );
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [customers, quotationForm, isEditing]);

  async function onSubmit(values: z.infer<typeof NewQuotationFormSchema>) {
    console.log(values);

    // Check for missing email when creating a quotation
    if (!isEditing && !values.email?.trim()) {
      notifyError(
        'Contact has no email. Add an email in the Customer profile for it to appear on the quote.'
      );
      return;
    }

    const customerName =
      customers.find((c) => c.id === values.customerId)?.businessName ||
      customers.find((c) => c.id === values.customerId)?.contactName ||
      '';

    const accountManagerName =
      users.find((user) => user.sub === values.accountManagerSub)?.name || '';

    if (!isEditing) {
      // Retry logic for handling duplicate quote number (409 conflict)
      const MAX_RETRIES = 3;
      let attempt = 0;
      let lastError: unknown = null;

      while (attempt < MAX_RETRIES) {
        try {
          // Re-fetch latest quotations on each attempt to get the most up-to-date number
          const freshQuotations = await queryClient.fetchQuery(
            QuotationsListQueryOptions()
          );

          // Handle both array response and paginated response
          const quotationsList = Array.isArray(freshQuotations)
            ? freshQuotations
            : freshQuotations.content || [];

          const latestQuoteNumber = getLatestQuoteNumber(quotationsList);
          const nextQuoteNumber = generateNextQuoteNumber(latestQuoteNumber);

          console.log(
            `[QuotationForm] Creating quote with number ${nextQuoteNumber} (attempt ${
              attempt + 1
            }/${MAX_RETRIES})`
          );

          const transformed = transformFormDataToQuoteDto(values, {
            customerName,
            accountManagerName,
            accountManagerSub: values.accountManagerSub,
            quoteNumber: nextQuoteNumber,
            lineItemsCount: 0,
            deliveryAddress: deliveryAddress,
          });

          const newQuotation = await createQuotation.mutateAsync(transformed);

          // Add the new record ID to sessionStorage for highlighting
          if (newQuotation && typeof newQuotation.id === 'number') {
            addNewRecordId('quotation_main_data_table', newQuotation.id);
          }

          notifySuccess('Quote created successfully');
          onCancel?.();
          return; // Success - exit the function
        } catch (error) {
          lastError = error;

          // Check if error is a 409 Conflict (duplicate quote number)
          const is409Error =
            error &&
            typeof error === 'object' &&
            'response' in error &&
            error.response &&
            typeof error.response === 'object' &&
            'status' in error.response &&
            error.response.status === 409;

          if (is409Error && attempt < MAX_RETRIES - 1) {
            console.log(
              `[QuotationForm] Quote number conflict detected, retrying... (attempt ${
                attempt + 1
              }/${MAX_RETRIES})`
            );
            attempt++;
            // Wait a bit before retrying (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, 100 * Math.pow(2, attempt))
            );
            continue;
          } else {
            // Not a 409 error, or max retries reached
            break;
          }
        }
      }

      // If we get here, all retries failed
      console.error('Error creating quotation after retries:', lastError);

      // Extract normalized error response and message
      const err = extractErrorResponse(lastError);
      const extractedMessage = extractErrorMessage(lastError);
      const messageFromErr = err?.message || extractedMessage;

      notifyError(
        messageFromErr || 'Failed to create quote. Please try again.'
      );
    } else {
      // Update existing quotation - keep the original quote number
      const transformed = transformFormDataToQuoteDto(values, {
        customerName,
        accountManagerName,
        accountManagerSub: values.accountManagerSub,
        quoteNumber: currentQuotation?.quoteNumber || '',
        lineItemsCount: 0,
        deliveryAddress: deliveryAddress,
        originalDeliveryAddress: currentQuotation?.deliveryAddress || null,
      });

      try {
        await updateQuotation.mutateAsync({
          id: id!,
          ...transformed,
        });
        notifySuccess('Quote updated successfully');
        onCancel?.();
      } catch (error) {
        console.error('Error updating quotation:', error);

        // Extract normalized error response and message
        const err = extractErrorResponse(error);
        const extractedMessage = extractErrorMessage(error);
        const messageFromErr = err?.message || extractedMessage;

        // Fallback error using extracted message
        notifyError(
          messageFromErr || 'Failed to update quote. Please try again.'
        );
      }
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
                  <div className="flex items-center gap-2">
                    <FormLabel>Quote Type*</FormLabel>
                    {isEditing && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="max-w-[250px]"
                          backgroundClassName="bg-gray-900 text-white"
                          arrowClassName="bg-gray-900 fill-gray-900"
                        >
                          <p className="text-xs">
                            Quote type cannot be changed after creation as it
                            would remove truck configuration data. Please create
                            a new quote if you need a different type.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-flow-col auto-cols-max gap-4"
                      disabled={isEditing}
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
              name="accountManagerSub"
              label="Account Manager*"
              searchLabel="Account Managers"
              options={userOptions}
              placeholder="Select Account Manager"
              formItemClassName={
                isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
              }
              disabled={isEditing || !canEdit}
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
                          columns={getQuotationLineItemColumns(
                            currentQuotation?.quoteType
                          )}
                          data={quoteItemsData}
                          simpleTable={true}
                          defaultSorting={[{ id: 'productName', desc: false }]}
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
                      {!isCollectionQuote && (
                        <div className="flex justify-between py-3 -mt-3">
                          <span className="text-sm font-normal">
                            Truck Cost (Total):
                          </span>
                          <span className="text-sm font-normal">
                            ${pricingBreakdown.totalTruckCostPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-3">
                        <span className="text-sm font-normal">
                          Product Sell (Total):
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalProductSellPrice.toFixed(2)}
                        </span>
                      </div>
                      {!isCollectionQuote && (
                        <div className="flex justify-between py-3 -mt-3">
                          <span className="text-sm font-normal">
                            Truck Sell (Total):
                          </span>
                          <span className="text-sm font-normal">
                            ${pricingBreakdown.totalTruckSellPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
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
                          {getUserNameBySub(quotationForm.watch('createdBy')) ||
                            'Jaywoo Choi'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          Last Modified By:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getUserNameBySub(
                            quotationForm.watch('lastModifiedBy')
                          ) || 'Jaywoo Choi'}
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
