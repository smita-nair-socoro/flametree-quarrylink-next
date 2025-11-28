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
import { DataTableClient } from '@/components/ui/data-table-client';
import { Quotation } from '@/lib/types/quotation';
import { PhoneInput } from '@/components/ui/phone-input';
import { useQuery } from '@tanstack/react-query';
import {
  QuotationWithLineItemsQueryOptions,
  useCreateQuotation,
  useUpdateQuotation,
} from '@/lib/api/quotation';
import {
  transformFormDataToQuoteDto,
  generateNextQuoteNumber,
  calculateQuotationPricing,
} from '@/lib/utils/quote-helpers';
import { notifySuccess, notifyError } from '@/lib/toast';

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
      console.log('✅ Line items from API:', quotationDetailData.quoteItems);
      console.log('✅ Line items count:', quotationDetailData.quoteItems?.length || 0);
    }
  }, [detailError, quotationDetailData]);

  // Convert QuotationDTO from API to Quotation format for the form
  const getDetailedQuotation = React.useMemo(() => {
    if (isEditing && quotationDetailData) {
      // Transform QuotationDTO to match Quotation interface (both use camelCase now)
      const transformedQuotation = {
        ...quotationDetailData,
        status: quotationDetailData.quoteStatus,
      } as Quotation;

      console.log('🔄 Transformed quotation:', transformedQuotation);
      console.log('🔄 Transformed line items:', transformedQuotation.quoteItems);
      console.log('🔄 Transformed line items count:', transformedQuotation.quoteItems.length);

      return transformedQuotation;
    }
    return null;
  }, [isEditing, quotationDetailData]);

  // Use detailed quotation for editing, or selected quotation for new
  const currentQuotation = isEditing ? getDetailedQuotation : selectedQuotation;

  // Log current quotation state
  React.useEffect(() => {
    console.log('🎯 Current quotation:', currentQuotation);
    console.log('🎯 Current quotation line items:', currentQuotation?.quoteItems);
    console.log('🎯 Current quotation line items count:', currentQuotation?.quoteItems?.length || 0);
  }, [currentQuotation]);

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
      quoteType:
        isEditing && currentQuotation?.quoteType
          ? currentQuotation.quoteType
          : 'DELIVERY',
      customerId:
        isEditing && currentQuotation?.customerId
          ? currentQuotation.customerId
          : 0,
      accountManager:
        isEditing && currentQuotation?.accountManager
          ? currentQuotation.accountManager
          : 0,
      projectName:
        isEditing && currentQuotation?.projectName
          ? currentQuotation.projectName
          : '',
      deliveryStartDate:
        isEditing && currentQuotation?.deliveryStartDate
          ? new Date(currentQuotation.deliveryStartDate)
          : undefined,
      deliveryWindowStart:
        isEditing && currentQuotation?.deliveryWindowStart
          ? new Date(currentQuotation.deliveryWindowStart).toLocaleTimeString(
              'en-US',
              {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
              }
            )
          : '',
      deliveryWindowEnd:
        isEditing && currentQuotation?.deliveryWindowEnd
          ? new Date(currentQuotation.deliveryWindowEnd).toLocaleTimeString(
              'en-US',
              {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
              }
            )
          : '',
      expiryDate:
        isEditing && currentQuotation?.expiryDate
          ? new Date(currentQuotation.expiryDate)
          : undefined,
      deliveryAddress: '',
      phone: '',
      email: '',
      createdAt:
        isEditing && currentQuotation?.createdAt
          ? new Date(currentQuotation.createdAt)
          : new Date(),
      updatedAt:
        isEditing && currentQuotation?.updatedAt
          ? new Date(currentQuotation.updatedAt)
          : new Date(),
      createdBy:
        isEditing && currentQuotation?.createdBy
          ? currentQuotation.createdBy
          : 'Jay Woo Choi',
      lastModifiedBy:
        isEditing && currentQuotation?.lastModifiedBy
          ? currentQuotation.lastModifiedBy
          : 'Armin Menhaji',
    },
  });

  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();

  // Update form values when API data loads
  React.useEffect(() => {
    if (isEditing && currentQuotation) {
      quotationForm.reset({
        quoteType: currentQuotation.quoteType || 'DELIVERY',
        customerId: currentQuotation.customerId || 0,
        accountManager: currentQuotation.accountManager || 0,
        projectName: currentQuotation.projectName || '',
        deliveryStartDate: currentQuotation.deliveryStartDate
          ? new Date(currentQuotation.deliveryStartDate)
          : undefined,
        deliveryWindowStart: currentQuotation.deliveryWindowStart
          ? new Date(currentQuotation.deliveryWindowStart).toLocaleTimeString(
              'en-US',
              {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
              }
            )
          : '',
        deliveryWindowEnd: currentQuotation.deliveryWindowEnd
          ? new Date(currentQuotation.deliveryWindowEnd).toLocaleTimeString(
              'en-US',
              {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
              }
            )
          : '',
        expiryDate: currentQuotation.expiryDate
          ? new Date(currentQuotation.expiryDate)
          : undefined,
        deliveryAddress: currentQuotation.deliveryAddress || '',
        phone: currentQuotation.customerEmail || '', // TODO: Add phone field to API
        email: currentQuotation.customerEmail || '',
        createdAt: currentQuotation.createdAt
          ? new Date(currentQuotation.createdAt)
          : new Date(),
        updatedAt: currentQuotation.updatedAt
          ? new Date(currentQuotation.updatedAt)
          : new Date(),
        createdBy: currentQuotation.createdBy || 'Unknown',
        lastModifiedBy: currentQuotation.lastModifiedBy || 'Unknown',
      });
    }
  }, [isEditing, currentQuotation, quotationForm]);

  // Watch the quoteType field to make labels dynamic
  const quoteType = quotationForm.watch('quoteType');

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
      quotationForm.setValue('deliveryAddress', address.formattedAddress);
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

  const customerId = quotationForm.watch('customerId');

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

    let customerName = getCustomerNameById(values.customerId);
    let accountManagerName = getAccountManagerNameById(values.accountManager);

    if (isEditing && currentQuotation) {
      customerName = customerName || currentQuotation.customerName;
      accountManagerName = accountManagerName || currentQuotation.accountManagerName;
    }

    if (!customerName || !accountManagerName) {
      notifyError('Missing customer or account manager information');
      return;
    }

    const quoteNumber = isEditing && currentQuotation?.quoteNumber
      ? currentQuotation.quoteNumber
      : generateNextQuoteNumber(quotations);


    // address number is set to 1 by default, mock data since we currently don't have the address API
    const quoteData = transformFormDataToQuoteDto(values, {
      customerName,
      accountManagerName,
      quoteNumber,
      deliveryAddressId: isEditing && currentQuotation?.deliveryAddressId
        ? currentQuotation.deliveryAddressId
        : 1,
    });

    try {
      if (isEditing && currentQuotation?.id) {
        await updateQuotation.mutateAsync({ id: currentQuotation.id, data: quoteData });
        notifySuccess('Quotation Updated');
      } else {
        await createQuotation.mutateAsync(quoteData);
        notifySuccess('Quotation Added');
      }
      onCancel?.();
    } catch (error) {
      console.error('Failed to save quotation:', error);
      notifyError(isEditing ? 'Failed to Update Quotation' : 'Failed to Add Quotation');
    }
  }

  const today = React.useMemo(() => {
    const d = GetTodaysDate();
    return d;
  }, []);

  const pricingBreakdown = React.useMemo(() => {
    if (!isEditing || !currentQuotation) {
      return calculateQuotationPricing(null);
    }
    return calculateQuotationPricing(currentQuotation.quoteItems);
  }, [isEditing, currentQuotation]);

  // Calculate GST and Total Invoice(Inc GST)
  const gst = (Number(pricingBreakdown.totalInvoice) * 0.1).toFixed(2);
  const totalInvoiceIncGST = (
    Number(pricingBreakdown.totalInvoice) + Number(gst)
  ).toFixed(2);

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
                    {(() => {
                      const quoteItemsData = currentQuotation?.quoteItems ?? [];
                      console.log('📊 DataTable rendering with line items:', quoteItemsData);
                      console.log('📊 Line items count for table:', quoteItemsData.length);
                      if (quoteItemsData.length > 0) {
                        console.log('📊 First line item structure:', quoteItemsData[0]);
                        console.log('📊 First line item keys:', Object.keys(quoteItemsData[0]));
                        console.log('📊 productName:', quoteItemsData[0].productName);
                        console.log('📊 quarryName:', quoteItemsData[0].quarryName);
                      }
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
                          ${pricingBreakdown.totalProductCostPrice}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 -mt-3">
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
                      <div className="flex justify-between py-3 -mt-3">
                        <span className="text-sm font-normal">
                          Truck Sell (Total):
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalTruckSellPrice}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-sm font-normal">
                          Subtotal (ex-GST):
                        </span>
                        <span className="text-sm font-normal">
                          ${pricingBreakdown.totalInvoice}
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
                        {quotationForm.watch('createdBy') || 'Jay Woo Choi'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Last Modified By:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quotationForm.watch('lastModifiedBy') ||
                          'Jaywoo Choi'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
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
                      <p className="text-sm font-medium text-foreground">
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
