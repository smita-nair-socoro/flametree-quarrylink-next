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
import React from 'react';
import { FormSelect } from '@/components/ui/form-select';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { CurrencyInput } from '@/components/ui/input-mask';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, TriangleAlertIcon } from 'lucide-react';
import { useLineItemFormState } from '@/hooks/quotation/use-lineitem-form-state';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { toAddressType } from '@/lib/utils/address-helper';
import { EnhancedConfirmDialog } from '@/components/enhanced-confirm-dialog';

interface FormProps {
  id?: number;
  className?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  onSaved?: () => void;
  canEdit?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function QuoteLineItemForm({
  id,
  onCancel,
  onSuccess,
  onSaved,
  className,
  canEdit,
  onDirtyChange,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const {
    isEditing,
    isReadOnly,
    form: quotationLineItemForm,
    selectedLineItem,
    selectedQuotation,
    selectedQuarrySupplierProduct,
    quoteType,
    addressInput,
    setAddressInput,
    addressSearchInput,
    setAddressSearchInput,
    productOptions,
    quarryOptions,
    truckTypeOptions,
    productUnitOptions,
    truckUnitOptions,
    selectedProductId,
    pricingBreakdown,
    gst,
    totalInvoiceIncGST,
    handleSubmit,
    onSubmit,
    isPending,
    customerDeliveryAddressSuggestions,
    handleDeleteDeliveryAddress,
  } = useLineItemFormState({ id, canEdit, onCancel, onSuccess, onSaved });

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    // In "view details" (read-only) mode, we don't want to block closing with
    // a dirty-state warning because users cannot make intentional edits.
    onDirtyChange?.(!isReadOnly && quotationLineItemForm.formState.isDirty);
  }, [isReadOnly, quotationLineItemForm.formState.isDirty, onDirtyChange]);

  // State for delete delivery address confirmation dialog
  const [deleteAddressDialogOpen, setDeleteAddressDialogOpen] =
    React.useState(false);
  const [addressToDeleteId, setAddressToDeleteId] = React.useState<
    string | null
  >(null);

  // Handler to show confirmation dialog before deleting
  const handleDeleteAddressClick = React.useCallback((id: string) => {
    setAddressToDeleteId(id);
    setDeleteAddressDialogOpen(true);
  }, []);

  // Handler to confirm deletion
  const handleConfirmDeleteAddress = React.useCallback(() => {
    if (addressToDeleteId) {
      handleDeleteDeliveryAddress(addressToDeleteId);
    }
    setAddressToDeleteId(null);
  }, [addressToDeleteId, handleDeleteDeliveryAddress]);

  const isCollection = quoteType === 'COLLECTION';

  // Determine pinned address based on quote type:
  // - Delivery: Use customer's billing address
  // - Collection: Use selected quarry supplier's address
  const pinnedAddress = isCollection
    ? selectedQuarrySupplierProduct?.quarrySupplier?.address
    : selectedQuotation?.customerWithAddressResponseDto?.billingAddress;
  const pinnedAddressType = React.useMemo(
    () => toAddressType(pinnedAddress),
    [pinnedAddress]
  );

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {isPending && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10'
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              {isEditing ? 'Updating Product...' : 'Adding Product...'}
            </p>
          </div>
        </div>
      )}

      <Form {...quotationLineItemForm}>
        <form
          id="add-new-quote-line-item-form"
          className={cn(
            'p-1 w-full flex flex-col',
            className,
            isPending && 'pointer-events-none'
          )}
          onSubmit={handleSubmit}
        >
          <div
            className={cn(
              'p-1 w-full flex flex-col',
              className,
              isPending && 'pointer-events-none'
            )}
          >
            {!isCollection && (
              <FormField
                control={quotationLineItemForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem
                    className={
                      isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                    }
                  >
                    <FormLabel>Delivery Address*</FormLabel>
                    <FormControl>
                      <AddressAutoComplete
                        address={addressInput}
                        setAddress={setAddressInput}
                        searchInput={addressSearchInput}
                        setSearchInput={setAddressSearchInput}
                        dialogTitle="Delivery Address"
                        placeholder="Enter site address..."
                        readOnly={isReadOnly}
                        useSuggestions
                        pinnedAddress={pinnedAddressType}
                        isCollection={false}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        historyAddresses={customerDeliveryAddressSuggestions}
                        onDeleteHistoryAddress={handleDeleteAddressClick}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* Product Information */}
            <div className="flex flex-col">
              <div className="flex flex-col gap-2">
                <span className="text-[20px] font-semibold">
                  Product Information
                </span>
                <Separator className="mb-4" />
              </div>
              <FormSelect
                control={quotationLineItemForm.control}
                name="productId"
                label="Product Name*"
                searchLabel="Product"
                options={productOptions}
                placeholder="Select Product"
                formItemClassName={
                  isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                }
                disabled={isReadOnly}
              />

              <FormSelect
                control={quotationLineItemForm.control}
                name="quarrySupplierId"
                label="Quarry/Supplier*"
                searchLabel="Quarry/Supplier"
                options={quarryOptions}
                placeholder="Select Quarry/Supplier"
                formItemClassName={
                  isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                }
                disabled={!selectedProductId || isReadOnly}
              />

              {isCollection && (
                <FormField
                  control={quotationLineItemForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem
                      className={
                        isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                      }
                    >
                      <FormLabel>Collection Address*</FormLabel>
                      <FormControl>
                        <AddressAutoComplete
                          address={addressInput}
                          setAddress={setAddressInput}
                          searchInput={addressSearchInput}
                          setSearchInput={setAddressSearchInput}
                          dialogTitle="Collection Address"
                          placeholder="Enter site address..."
                          readOnly={isReadOnly}
                          useSuggestions
                          pinnedAddress={pinnedAddressType}
                          isCollection
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={quotationLineItemForm.control}
                name="supplierProductName"
                render={({ field }) => (
                  <FormItem
                    className={
                      isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                    }
                  >
                    <FormLabel>Supplier Product Name*</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Enter Supplier Product Name"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing */}
            <div className="flex flex-col">
              <div className="flex flex-col gap-2">
                <span className="text-[20px] font-semibold mt-3">
                  Product Pricing
                </span>
                <Separator className="mb-4" />
              </div>

              {/* Cost Pricing */}
              <div className="space-y-2">
                <span className="block text-sm font-medium text-[#737373]">
                  Cost Pricing
                </span>
                <div
                  className={
                    isDesktop ? 'grid grid-cols-3 gap-4' : 'flex flex-col gap-3'
                  }
                >
                  <FormSelect
                    control={quotationLineItemForm.control}
                    name="productCostUom"
                    label="Unit of Measure*"
                    searchLabel="Unit of Measure"
                    showSearch={false}
                    options={productUnitOptions}
                    placeholder="Select Unit of Measure"
                    disabled={isReadOnly}
                  />

                  <FormField
                    control={quotationLineItemForm.control}
                    name="productCostQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>QTY*</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            {...field}
                            disabled={isReadOnly}
                            isNumber
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={quotationLineItemForm.control}
                    name="productCostPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Cost Per Unit*
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>(ex-GST)</p>
                            </TooltipContent>
                          </Tooltip>
                        </FormLabel>
                        <FormControl>
                          <CurrencyInput
                            id="productCostPrice"
                            className="w-full"
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(value === '' ? 0 : value)
                            }
                            decimalPlaces={2}
                            allowNegative={false}
                            disabled={isReadOnly}
                            unit={
                              quotationLineItemForm.watch('productCostUom') ===
                              'TN'
                                ? 'TN'
                                : quotationLineItemForm.watch(
                                    'productCostUom'
                                  ) === 'M3'
                                ? 'm3'
                                : quotationLineItemForm.watch(
                                    'productCostUom'
                                  ) === 'KG_20'
                                ? 'Bags'
                                : quotationLineItemForm.watch(
                                    'productCostUom'
                                  ) === 'BULKA'
                                ? 'Bags'
                                : ''
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sell Pricing */}
              <div className="space-y-2">
                <span className="block text-sm font-medium text-[#737373]">
                  Sell Pricing
                </span>
                <div
                  className={
                    isDesktop ? 'grid grid-cols-3 gap-4' : 'flex flex-col gap-3'
                  }
                >
                  <FormSelect
                    control={quotationLineItemForm.control}
                    name="productSellUom"
                    label="Unit of Measure*"
                    searchLabel="Unit of Measure"
                    showSearch={false}
                    options={productUnitOptions}
                    placeholder="Select Unit of Measure"
                    disabled={isReadOnly}
                  />

                  <FormField
                    control={quotationLineItemForm.control}
                    name="productSellQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>QTY*</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            {...field}
                            disabled={isReadOnly}
                            isNumber
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={quotationLineItemForm.control}
                    name="productSellPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Sell Price Per Unit*
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>(ex-GST)</p>
                            </TooltipContent>
                          </Tooltip>
                        </FormLabel>
                        <FormControl>
                          <CurrencyInput
                            id="productSellPrice"
                            className="w-full"
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(value === '' ? 0 : value)
                            }
                            decimalPlaces={2}
                            allowNegative={false}
                            disabled={isReadOnly}
                            unit={
                              quotationLineItemForm.watch('productSellUom') ===
                              'TN'
                                ? 'TN'
                                : quotationLineItemForm.watch(
                                    'productSellUom'
                                  ) === 'M3'
                                ? 'm3'
                                : quotationLineItemForm.watch(
                                    'productSellUom'
                                  ) === 'KG_20'
                                ? 'Bags'
                                : quotationLineItemForm.watch(
                                    'productSellUom'
                                  ) === 'BULKA'
                                ? 'Bags'
                                : ''
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {pricingBreakdown.totalProductCostPrice >
                pricingBreakdown.totalProductSellPrice && (
                <div className="p-[17.25px] bg-[#FFF4E6] border border-[#FF8C00] rounded-md">
                  <div className="flex items-start gap-2">
                    <TriangleAlertIcon className="h-5 w-5 text-[#FF8C00]" />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold">Review Product Pricing</p>
                      <p className="text-[#364153]">
                        This line item will generate a loss based on current
                        costs. If this is expected, you can continue. Otherwise,
                        adjust the price to restore profitability.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Truck Configuration */}
            {!isCollection && (
              <div className="flex flex-col">
                <div className="flex flex-col gap-2">
                  <span className="text-[20px] font-semibold mt-3">
                    Truck Configuration
                  </span>
                  <Separator className="mb-4" />
                </div>
                <FormSelect
                  control={quotationLineItemForm.control}
                  name="truckType"
                  label="Truck Type*"
                  searchLabel="Truck Type"
                  options={truckTypeOptions}
                  placeholder="Select Truck Type"
                  disabled={isReadOnly}
                />

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-[#737373]">
                    Cost Pricing
                  </span>
                  <div
                    className={
                      isDesktop
                        ? 'grid grid-cols-3 gap-4'
                        : 'flex flex-col gap-3'
                    }
                  >
                    <FormSelect
                      control={quotationLineItemForm.control}
                      name="truckCostUom"
                      label="Unit of Measure*"
                      searchLabel="Unit of Measure"
                      showSearch={false}
                      options={truckUnitOptions}
                      placeholder="Select Unit of Measure"
                      disabled={
                        !quotationLineItemForm.watch('truckType') || isReadOnly
                      }
                    />

                    <FormField
                      control={quotationLineItemForm.control}
                      name="truckCostQty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>QTY*</FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              disabled={isReadOnly}
                              isNumber
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={quotationLineItemForm.control}
                      name="truckCostPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            Cost Per Unit*
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>(ex-GST)</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <CurrencyInput
                              id="truckCostPrice"
                              className="w-full"
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(value === '' ? 0 : value)
                              }
                              decimalPlaces={2}
                              allowNegative={false}
                              disabled={isReadOnly}
                              unit={
                                quotationLineItemForm.watch('truckCostUom') ===
                                'TN'
                                  ? 'TN'
                                  : quotationLineItemForm.watch(
                                      'truckCostUom'
                                    ) === 'M3'
                                  ? 'm3'
                                  : quotationLineItemForm.watch(
                                      'truckCostUom'
                                    ) === 'HOURLY'
                                  ? 'HOURLY'
                                  : quotationLineItemForm.watch(
                                      'truckCostUom'
                                    ) === 'LOAD'
                                  ? 'LOAD'
                                  : quotationLineItemForm.watch(
                                      'truckCostUom'
                                    ) === 'KM'
                                  ? 'KM'
                                  : ''
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="block text-sm font-medium text-[#737373]">
                    Sell Pricing
                  </span>
                  <div
                    className={
                      isDesktop
                        ? 'grid grid-cols-3 gap-4'
                        : 'flex flex-col gap-3'
                    }
                  >
                    <FormSelect
                      control={quotationLineItemForm.control}
                      name="truckSellUom"
                      label="Unit of Measure*"
                      searchLabel="Unit of Measure"
                      showSearch={false}
                      options={truckUnitOptions}
                      placeholder="Select Unit of Measure"
                      disabled={
                        !quotationLineItemForm.watch('truckType') || isReadOnly
                      }
                    />

                    <FormField
                      control={quotationLineItemForm.control}
                      name="truckSellQty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>QTY*</FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              disabled={isReadOnly}
                              isNumber
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={quotationLineItemForm.control}
                      name="truckSellPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            Sell Price Per Unit*
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>(ex-GST)</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <CurrencyInput
                              id="truckSellPrice"
                              className="w-full"
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(value === '' ? 0 : value)
                              }
                              decimalPlaces={2}
                              allowNegative={false}
                              disabled={isReadOnly}
                              unit={
                                quotationLineItemForm.watch('truckSellUom') ===
                                'TN'
                                  ? 'TN'
                                  : quotationLineItemForm.watch(
                                      'truckSellUom'
                                    ) === 'M3'
                                  ? 'm3'
                                  : quotationLineItemForm.watch(
                                      'truckSellUom'
                                    ) === 'HOURLY'
                                  ? 'HOURLY'
                                  : quotationLineItemForm.watch(
                                      'truckSellUom'
                                    ) === 'LOAD'
                                  ? 'LOAD'
                                  : quotationLineItemForm.watch(
                                      'truckSellUom'
                                    ) === 'KM'
                                  ? 'KM'
                                  : ''
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {pricingBreakdown.totalTruckCostPrice >
                  pricingBreakdown.totalTruckSellPrice && (
                  <div className="p-[17.25px] bg-[#FFF4E6] border border-[#FF8C00] rounded-md mb-3">
                    <div className="flex items-start gap-2">
                      <TriangleAlertIcon className="h-5 w-5 text-[#FF8C00]" />
                      <div className="flex-1 text-sm">
                        <p className="font-semibold">Review Truck Pricing</p>
                        <p className="text-[#364153]">
                          The truck configuration will generate a loss based on
                          current costs. If this is expected, you can continue.
                          Otherwise, adjust the price to restore profitability.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-0">
              <div className="flex flex-col gap-2">
                <span className="text-[0A0A0A] font-semibold text-[20px]">
                  Pricing Breakdown
                </span>
                <Separator />
              </div>
              <div className="bg-gray-50 border-t px-2 border-[#E5E5E5] [&>div]:border-b [&>div]:border-dashed [&>div]:border-purple-300 [&>div:nth-child(1)]:border-b-0 [&>div:nth-child(3)]:border-b-0 [&>div:nth-child(5)]:border-b-0">
                <div className="flex justify-between py-3">
                  <span className="text-sm font-normal">
                    Product Cost (Total)
                  </span>
                  <span className="text-sm font-normal">
                    ${pricingBreakdown.totalProductCostPrice.toFixed(2)}
                  </span>
                </div>
                {!isCollection && (
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
                {!isCollection && (
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
              <div className="flex justify-between py-3 px-2 bg-slate-200 mt-3">
                <span className="text-sm font-semibold">Gross Profit:</span>
                <span className="text-sm font-semibold">
                  ${pricingBreakdown.grossProfit.toFixed(2)} (
                  {pricingBreakdown.grossProfitPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Audit Information */}
            {isEditing && (
              <div className="col-span-full space-y-6 mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 gap-6 md:max-w-3xl">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Created By:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLineItem?.createdBy || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Last Modified By:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLineItem?.lastModifiedBy || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Created Date:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLineItem?.createdAt
                        ? new Date(
                            selectedLineItem.createdAt
                          ).toLocaleDateString('en-AU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Modified Date:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLineItem?.updatedAt
                        ? new Date(
                            selectedLineItem.updatedAt || ''
                          ).toLocaleDateString('en-AU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })
                        : 'N/A'}
                    </p>
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
                  className="cursor-pointer"
                  type="button"
                  disabled={isPending || !canEdit}
                  onClick={() => quotationLineItemForm.handleSubmit(onSubmit)()}
                >
                  {isEditing ? 'Save Changes' : 'Add Product'}
                </Button>
              </div>
            )}

            {!isDesktop && (
              <div className="flex flex-col col-span-2 gap-3 my-6">
                <Button
                  type="button"
                  className="cursor-pointer"
                  disabled={isPending || !canEdit}
                  onClick={() => quotationLineItemForm.handleSubmit(onSubmit)()}
                >
                  {isEditing ? 'Save Changes' : 'Add Product'}
                </Button>
                <Button variant="outline" type="button" onClick={onCancel}>
                  {isEditing ? 'Close' : 'Cancel'}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>

      {/* Confirmation dialog for removing delivery address from suggestions */}
      <EnhancedConfirmDialog
        open={deleteAddressDialogOpen}
        onOpenChangeAction={setDeleteAddressDialogOpen}
        title="Remove Delivery Address"
        content={
          <>
            <p className="mb-3">Are you sure you want to remove this delivery address from your suggestions?</p>
            <p>This will not affect existing quotes or historical records, but the address will no longer appear as a suggestion for this customer.</p>
          </>
        }
        cancelText="Cancel"
        confirmText="Remove"
        confirmVariant="destructive"
        onConfirmAction={handleConfirmDeleteAddress}
      />
    </div>
  );
}
