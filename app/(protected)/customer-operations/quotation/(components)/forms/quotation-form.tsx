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
import {
  useSelectedQuotation,
  useQuotationStore,
} from '@/app/stores/quotation-store';
import { FormDialog } from '@/components/form-dialog';
import QuotationLineItemForm from './quotation-line-item-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { DataTableClient } from '@/components/ui/data-table-client';
import { Quotation, QuotationDTO } from '@/lib/types/quotation';
import { PhoneInput } from '@/components/ui/phone-input';
import { centsToDollars } from '@/lib/utils/currency';
import { useQuery } from '@tanstack/react-query';
import {
  QuotationWithLineItemsQueryOptions,
  useCreateQuotation,
  useUpdateQuotation,
} from '@/lib/api/quotation';
import {
  transformFormDataToQuoteDto,
  generateNextQuoteNumber,
} from '@/lib/utils/quote-helpers';
import { notifyPromise, notifyError } from '@/lib/toast';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
  canEdit?: boolean;
}

export default function QuotationForm({
  id,
  onCancel,
  className,
  canEdit,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const selectedQuotation = useSelectedQuotation();

  // When editing, fetch detailed quotation data with line items from backend API
  const {
    data: quotationDetailData,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useQuery(QuotationWithLineItemsQueryOptions(selectedQuotation?.id || 0));

  // Log API response for debugging
  React.useEffect(() => {
    if (detailError) {
      console.error('❌ Error fetching quotation details:', detailError);
    }
    if (quotationDetailData) {
      console.log('✅ Quotation detail data fetched from API:', quotationDetailData);
    }
  }, [detailError, quotationDetailData]);

  // Convert QuotationDTO from API to Quotation format for the form
  const getDetailedQuotation = React.useMemo(() => {
    if (isEditing && quotationDetailData) {
      // Convert to snake_case if needed
      const convertedQuotation = convertKeysToSnakeCase(
        quotationDetailData
      ) as any;

      // Transform to match Quotation interface (map quote_status → status, quote_items → line_items)
      const transformedQuotation = {
        ...convertedQuotation,
        quoteId: convertedQuotation.id,
        status: convertedQuotation.quote_status,
        line_items: convertedQuotation.quote_items || convertedQuotation.line_items || [],
      } as Quotation;

      console.log('🔄 Transformed quotation data:', transformedQuotation);
      console.log('📋 Line items count:', transformedQuotation.line_items?.length || 0);
      console.log('📦 Line items:', transformedQuotation.line_items);

      return transformedQuotation;
    }
    return null;
  }, [isEditing, quotationDetailData]);

  // Use detailed quotation for editing, or selected quotation for new
  const currentQuotation = isEditing ? getDetailedQuotation : selectedQuotation;

  const convertedQuotationLineItem = convertKeysToSnakeCase(
    currentQuotation?.line_items
  );

  React.useEffect(() => {
    console.log('📊 Current quotation:', currentQuotation);
    console.log('📋 Converted line items for table:', convertedQuotationLineItem);
  }, [currentQuotation, convertedQuotationLineItem]);

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

  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();

  // Update form values when API data loads
  React.useEffect(() => {
    if (isEditing && currentQuotation) {
      quotationForm.reset({
        quote_type: currentQuotation.quote_type || 'DELIVERY',
        customer_id: currentQuotation.customer_id || 0,
        account_manager: currentQuotation.account_manager || 0,
        project_name: currentQuotation.project_name || '',
        delivery_start_date: currentQuotation.delivery_start_date
          ? new Date(currentQuotation.delivery_start_date)
          : undefined,
        delivery_window_start: currentQuotation.delivery_window_start
          ? new Date(currentQuotation.delivery_window_start).toLocaleTimeString(
              'en-US',
              {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
              }
            )
          : '',
        delivery_window_end: currentQuotation.delivery_window_end
          ? new Date(currentQuotation.delivery_window_end).toLocaleTimeString(
              'en-US',
              {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
              }
            )
          : '',
        expiry_date: currentQuotation.expiry_date
          ? new Date(currentQuotation.expiry_date)
          : undefined,
        delivery_address: currentQuotation.delivery_address || '',
        phone: currentQuotation.customer_email || '', // TODO: Add phone field to API
        email: currentQuotation.customer_email || '',
        created_at: currentQuotation.created_at
          ? new Date(currentQuotation.created_at)
          : new Date(),
        updated_at: currentQuotation.updated_at
          ? new Date(currentQuotation.updated_at)
          : new Date(),
        created_by: currentQuotation.created_by || 'Unknown',
        last_modified_by: currentQuotation.last_modified_by || 'Unknown',
      });
    }
  }, [isEditing, currentQuotation, quotationForm]);

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

  // Get unique customer names and account managers from quotations store
  const getUniqueCustomerNames = useQuotationStore(
    (state) => state.getUniqueCustomerNames
  );
  const getUniqueAccountManagers = useQuotationStore(
    (state) => state.getUniqueAccountManagers
  );

  // Build customer options from quotations list
  const customerOptions: FormSelectOption[] = React.useMemo(() => {
    return getUniqueCustomerNames();
  }, [getUniqueCustomerNames]);

  // Build account manager options from quotations list
  const accountManagerOptions: FormSelectOption[] = React.useMemo(() => {
    return getUniqueAccountManagers();
  }, [getUniqueAccountManagers]);

  const customerId = quotationForm.watch('customer_id');

  React.useEffect(() => {
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
  }, [customerId, quotationForm]);

  async function onSubmit(values: z.infer<typeof NewQuotationFormSchema>) {
    const getCustomerNameById = useQuotationStore.getState().getCustomerNameById;
    const getAccountManagerNameById = useQuotationStore.getState().getAccountManagerNameById;
    const quotations = useQuotationStore.getState().quotations;

    let customerName = getCustomerNameById(values.customer_id);
    let accountManagerName = getAccountManagerNameById(values.account_manager);

    if (isEditing && currentQuotation) {
      customerName = customerName || currentQuotation.customer_name;
      accountManagerName = accountManagerName || currentQuotation.account_manager_name;
    }

    if (!customerName || !accountManagerName) {
      notifyError('Missing customer or account manager information');
      return;
    }

    const quoteNumber = isEditing && currentQuotation?.quote_number
      ? currentQuotation.quote_number
      : generateNextQuoteNumber(quotations);


    // address number is set to 1 by default, mock data since we currently don't have the address API
    const quoteData = transformFormDataToQuoteDto(values, {
      customerName,
      accountManagerName,
      quoteNumber,
      deliveryAddressId: isEditing && currentQuotation?.delivery_address_id
        ? currentQuotation.delivery_address_id
        : 1,
    });

    //test console.log
    console.log('📤 Request Data:', {
      mode: isEditing ? 'UPDATE' : 'CREATE',
      id: currentQuotation?.id,
      data: quoteData,
      jsonString: JSON.stringify(quoteData, null, 2)
    });

    if (isEditing && currentQuotation?.id) {
      await notifyPromise(
        updateQuotation.mutateAsync({ id: currentQuotation.id, data: quoteData }),
        {
          loading: 'Updating quotation...',
          success: (data) =>
            `Quotation ${data.quote_number} updated successfully!`,
          error: (err) =>
            `Failed to update quotation: ${err instanceof Error ? err.message : 'Unknown error'}`,
        }
      );
    } else {
      await notifyPromise(createQuotation.mutateAsync(quoteData), {
        loading: 'Creating quotation...',
        success: (data) =>
          `Quotation ${data.quote_number} created successfully!`,
        error: (err) =>
          `Failed to create quotation: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }

    onCancel?.();
  }

  const today = React.useMemo(() => {
    const d = GetTodaysDate();
    return d;
  }, []);

  const pricingBreakdown = React.useMemo(() => {
    if (!isEditing || !currentQuotation) {
      return {
        totalProductCostPrice: 0,
        totalTruckCostPrice: 0,
        totalProductSellPrice: 0,
        totalTruckSellPrice: 0,
        totalInvoice: 0,
        grossProfit: 0,
        grossProfitPercentage: 0,
      };
    }

    // Calculate totals from line items (values are in cents in database)
    const lineItems = currentQuotation.line_items || [];

    console.log('🔍 Line items raw values:', lineItems.map(item => ({
      product: item.product_name,
      total_product_cost_price: item.total_product_cost_price,
      total_truck_cost_price: item.total_truck_cost_price,
      total_product_sell_price: item.total_product_sell_price,
      total_truck_sell_price: item.total_truck_sell_price,
    })));

    // Sum up the values (in cents)
    const totalProductCostCents = lineItems.reduce(
      (sum, item) => sum + (item.total_product_cost_price || 0),
      0
    );
    const totalTruckCostCents = lineItems.reduce(
      (sum, item) => sum + (item.total_truck_cost_price || 0),
      0
    );
    const totalProductSellCents = lineItems.reduce(
      (sum, item) => sum + (item.total_product_sell_price || 0),
      0
    );
    const totalTruckSellCents = lineItems.reduce(
      (sum, item) => sum + (item.total_truck_sell_price || 0),
      0
    );

    const totalCostCents = totalProductCostCents + totalTruckCostCents;
    const totalInvoiceCents = totalProductSellCents + totalTruckSellCents;
    const grossProfitCents = totalInvoiceCents - totalCostCents;
    const grossProfitPercentage = totalInvoiceCents > 0 ? (grossProfitCents / totalInvoiceCents) * 100 : 0;

    console.log('💰 Pricing breakdown (in cents):', {
      totalProductCostCents,
      totalTruckCostCents,
      totalProductSellCents,
      totalTruckSellCents,
      totalInvoiceCents,
      grossProfitCents,
      grossProfitPercentage,
    });

    // Convert cents to dollars for display
    return {
      totalProductCostPrice: centsToDollars(totalProductCostCents),
      totalTruckCostPrice: centsToDollars(totalTruckCostCents),
      totalProductSellPrice: centsToDollars(totalProductSellCents),
      totalTruckSellPrice: centsToDollars(totalTruckSellCents),
      totalInvoice: centsToDollars(totalInvoiceCents),
      grossProfit: centsToDollars(grossProfitCents),
      grossProfitPercentage: grossProfitPercentage,
    };
  }, [isEditing, currentQuotation]);

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
              {isEditing ? 'Updating Quote...' : 'Adding Quote...'}
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
            (createQuotation.isPending || updateQuotation.isPending) && 'pointer-events-none'
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
              (createQuotation.isPending || updateQuotation.isPending) && 'pointer-events-none'
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
              name="customer_id"
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
              name="account_manager"
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
                      disabled={isEditing && !canEdit}
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
                        disabled={isEditing && !canEdit}
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
                      <QuotationLineItemForm canEdit={true} />
                    </FormDialog>
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div className="col-span-full space-y-10">
                <div className="flex flex-col gap-0">
                  <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
                    <DataTableClient
                      columns={quotationLineItemColumns}
                      data={convertedQuotationLineItem ?? []}
                      simpleTable={true}
                    />
                  </div>

                  <div className="flex flex-col gap-0">
                    <div className="bg-gray-50 border-t px-2 border-[#E5E5E5]">
                      <div className="flex justify-between py-3">
                        <span className="text-sm font-normal">
                          Product Cost (Total):
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalProductCostPrice}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-sm font-normal">
                          Truck Cost (Total):
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalTruckCostPrice}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-sm font-normal">
                          Product Sell (Total):
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalProductSellPrice}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-sm font-normal">
                          Truck Sell (Total):
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalTruckSellPrice}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-sm font-semibold">
                          Total Invoice:
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalInvoice}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between py-3 px-2 bg-slate-200">
                      <span className="text-sm font-semibold">
                        Gross Profit:
                      </span>
                      <span className="text-sm font-normal">
                        ${pricingBreakdown.grossProfit} (
                        {pricingBreakdown.grossProfitPercentage?.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
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
                  disabled={createQuotation.isPending || updateQuotation.isPending || !canEdit}
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
                  disabled={createQuotation.isPending || updateQuotation.isPending || !canEdit}
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
