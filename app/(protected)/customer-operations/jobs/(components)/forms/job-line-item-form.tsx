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
import {
  HelpCircle,
  TriangleAlertIcon,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useJobLineItemFormState } from '@/hooks/job/use-job-lineitem-form-state';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { AddressType } from '@/lib/types/address';
import { isSameAddress, toAddressType } from '@/lib/utils/address-helper';
import { EnhancedConfirmDialog } from '@/components/enhanced-confirm-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { JOB_LINE_ITEM_TYPE } from '@/lib/types/job-enums';

interface FormProps {
  id?: number;
  className?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  onSaved?: () => void;
  canEdit?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function JobLineItemForm({
  id,
  onCancel,
  onSuccess,
  onSaved,
  className,
  canEdit = true,
  onDirtyChange,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const {
    isEditing,
    isReadOnly,
    form: jobLineItemForm,
    selectedJob,
    selectedQuarrySupplierProduct,
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
    handleSubmit,
    isPending,
    customerDeliveryAddressSuggestions,
    handleDeleteDeliveryAddress,
    productDetails,
    isSubmitting,
  } = useJobLineItemFormState({ id, canEdit, onSuccess, onSaved });

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(!isReadOnly && jobLineItemForm.formState.isDirty);
  }, [isReadOnly, jobLineItemForm.formState.isDirty, onDirtyChange]);

  // Handler for address changes with functional updates to prevent unnecessary rerenders
  const handleAddressChange = React.useCallback(
    (newAddress: AddressType) => {
      setAddressInput((prev) =>
        isSameAddress(prev, newAddress) ? prev : newAddress,
      );
    },
    [setAddressInput],
  );

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

  const [isCollection, setIsCollection] = React.useState(false);
  const lineItemType = jobLineItemForm.watch('type');
  React.useEffect(() => {
    if (lineItemType === JOB_LINE_ITEM_TYPE.COLLECTION) {
      setIsCollection(true);
    } else {
      setIsCollection(false);
    }
  }, [lineItemType]);

  // - Delivery: Use customer's billing address
  // - Collection: Use selected quarry supplier's address
  const pinnedAddress = isCollection
    ? selectedQuarrySupplierProduct?.quarrySupplier?.address
    : selectedJob?.customerWithAddressResponse?.billingAddress;
  const pinnedAddressType = React.useMemo(
    () => toAddressType(pinnedAddress),
    [pinnedAddress],
  );

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {isPending && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10',
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

      {isSubmitting && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10',
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

      <Form {...jobLineItemForm}>
        <form
          id="add-new-job-line-item-form"
          className={cn(
            'w-full flex flex-col',
            className,
            isPending && 'pointer-events-none',
          )}
          onSubmit={handleSubmit}
        >
          <div
            className={cn(
              'w-full flex flex-col',
              className,
              isPending && 'pointer-events-none',
            )}
          >
            <FormField
              control={jobLineItemForm.control}
              name="type"
              render={({ field }) => (
                <FormItem className="col-span-1 col-start-1 gap-3">
                  <div className="flex items-center gap-2">
                    <FormLabel>Line Item Type*</FormLabel>
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
                            Type cannot be changed after creation as it would
                            remove truck configuration data. Please create a new
                            job if you need a different type.
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
            {!isCollection && (
              <FormField
                control={jobLineItemForm.control}
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
                        setAddress={handleAddressChange}
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
                control={jobLineItemForm.control}
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
                control={jobLineItemForm.control}
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
                  control={jobLineItemForm.control}
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
                          setAddress={handleAddressChange}
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
                control={jobLineItemForm.control}
                name="supplierProductName"
                render={({ field }) => (
                  <FormItem
                    className={
                      isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                    }
                  >
                    <FormLabel>Supplier Product Name*</FormLabel>
                    <FormControl>
                      <Input className="w-full" {...field} disabled />
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
                    control={jobLineItemForm.control}
                    name="productSellUom"
                    label="Unit of Measure*"
                    searchLabel="Unit of Measure"
                    showSearch={false}
                    options={productUnitOptions}
                    placeholder="Select Unit of Measure"
                    disabled={isReadOnly}
                  />

                  <FormField
                    control={jobLineItemForm.control}
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
                    control={jobLineItemForm.control}
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
                              jobLineItemForm.watch('productSellUom') === 'TN'
                                ? 'TN'
                                : jobLineItemForm.watch('productSellUom') ===
                                    'M3'
                                  ? 'm3'
                                  : jobLineItemForm.watch('productSellUom') ===
                                      'KG_20'
                                    ? 'Bags'
                                    : jobLineItemForm.watch(
                                          'productSellUom',
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
                  <div className="col-span-3 -mt-3 mb-3">
                    {productDetails?.densityTonnagePerM3 &&
                      productDetails.densityTonnagePerM3 > 0 && (
                        <div className="p-[17.25px] bg-purple-50 border border-purple-300 rounded-md">
                          <div className="text-sm font-semibold text-purple-900">
                            Conversion: 1 TN ={' '}
                            {(1 / productDetails.densityTonnagePerM3).toFixed(
                              2,
                            )}{' '}
                            m³ ={' '}
                            {(1 / productDetails.densityTonnagePerM3).toFixed(
                              2,
                            )}{' '}
                            Bulka = 50 x 20kg
                          </div>
                        </div>
                      )}
                  </div>
                </div>
                {/* Conversion Info Box */}
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
                    control={jobLineItemForm.control}
                    name="productCostUom"
                    label="Unit of Measure*"
                    searchLabel="Unit of Measure"
                    showSearch={false}
                    options={productUnitOptions}
                    placeholder="Select Unit of Measure"
                    disabled={isReadOnly}
                  />

                  <FormField
                    control={jobLineItemForm.control}
                    name="productCostQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>QTY*</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            {...field}
                            disabled
                            isNumber
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={jobLineItemForm.control}
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
                              jobLineItemForm.watch('productCostUom') === 'TN'
                                ? 'TN'
                                : jobLineItemForm.watch('productCostUom') ===
                                    'M3'
                                  ? 'm3'
                                  : jobLineItemForm.watch('productCostUom') ===
                                      'KG_20'
                                    ? 'Bags'
                                    : jobLineItemForm.watch(
                                          'productCostUom',
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
                  control={jobLineItemForm.control}
                  name="truckType"
                  label="Truck Type*"
                  searchLabel="Truck Type"
                  options={truckTypeOptions}
                  placeholder="Select Truck Type"
                  disabled={isReadOnly}
                />

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
                      control={jobLineItemForm.control}
                      name="truckSellUom"
                      label="Unit of Measure*"
                      searchLabel="Unit of Measure"
                      showSearch={false}
                      options={truckUnitOptions}
                      placeholder="Select Unit of Measure"
                      disabled={
                        !jobLineItemForm.watch('truckType') || isReadOnly
                      }
                    />

                    <FormField
                      control={jobLineItemForm.control}
                      name="truckSellQty"
                      render={({ field }) => {
                        const truckSellUom =
                          jobLineItemForm.watch('truckSellUom');
                        const manualInputUoms = ['HOURLY', 'LOAD', 'KM'];
                        const isEnabled =
                          truckSellUom &&
                          manualInputUoms.includes(truckSellUom);
                        return (
                          <FormItem>
                            <FormLabel>QTY*</FormLabel>
                            <FormControl>
                              <Input
                                className="w-full"
                                {...field}
                                disabled={isReadOnly || !isEnabled}
                                isNumber
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={jobLineItemForm.control}
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
                                jobLineItemForm.watch('truckSellUom') === 'TN'
                                  ? 'TN'
                                  : jobLineItemForm.watch('truckSellUom') ===
                                      'M3'
                                    ? 'm3'
                                    : jobLineItemForm.watch('truckSellUom') ===
                                        'HOURLY'
                                      ? 'HOURLY'
                                      : jobLineItemForm.watch(
                                            'truckSellUom',
                                          ) === 'LOAD'
                                        ? 'LOAD'
                                        : jobLineItemForm.watch(
                                              'truckSellUom',
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
                      control={jobLineItemForm.control}
                      name="truckCostUom"
                      label="Unit of Measure*"
                      searchLabel="Unit of Measure"
                      showSearch={false}
                      options={truckUnitOptions}
                      placeholder="Select Unit of Measure"
                      disabled={
                        !jobLineItemForm.watch('truckType') || isReadOnly
                      }
                    />

                    <FormField
                      control={jobLineItemForm.control}
                      name="truckCostQty"
                      render={({ field }) => {
                        const truckCostUom =
                          jobLineItemForm.watch('truckCostUom');
                        const manualInputUoms = ['HOURLY', 'LOAD', 'KM'];
                        const isEnabled =
                          truckCostUom &&
                          manualInputUoms.includes(truckCostUom);
                        return (
                          <FormItem>
                            <FormLabel>QTY*</FormLabel>
                            <FormControl>
                              <Input
                                className="w-full"
                                {...field}
                                disabled={isReadOnly || !isEnabled}
                                isNumber
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={jobLineItemForm.control}
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
                                jobLineItemForm.watch('truckCostUom') === 'TN'
                                  ? 'TN'
                                  : jobLineItemForm.watch('truckCostUom') ===
                                      'M3'
                                    ? 'm3'
                                    : jobLineItemForm.watch('truckCostUom') ===
                                        'HOURLY'
                                      ? 'HOURLY'
                                      : jobLineItemForm.watch(
                                            'truckCostUom',
                                          ) === 'LOAD'
                                        ? 'LOAD'
                                        : jobLineItemForm.watch(
                                              'truckCostUom',
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
              <div className="flex flex-col gap-3 mt-4">
                {(() => {
                  const separatorBorder =
                    'border-t border-dashed border-purple-300';
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cost Summary */}
                        <div className="bg-white rounded-lg border border-[#E5E5E5] px-4 py-3 shadow-sm">
                          <h3 className="text-lg font-bold mb-3">
                            Cost Summary
                          </h3>
                          <div className="flex flex-col gap-3 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-normal">
                            <div>
                              <span>Product Cost</span>
                              <span>
                                $
                                {pricingBreakdown.totalProductCostPrice.toFixed(
                                  2,
                                )}
                              </span>
                            </div>
                            {!isCollection && (
                              <div>
                                <span>Truck Cost</span>
                                <span>
                                  $
                                  {pricingBreakdown.totalTruckCostPrice.toFixed(
                                    2,
                                  )}
                                </span>
                              </div>
                            )}
                            <div className={`pt-2 ${separatorBorder}`}>
                              <span>Subtotal (ex-GST)</span>
                              <span>
                                ${pricingBreakdown.costSubtotalExGST.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span>GST (10%)</span>
                              <span>
                                ${pricingBreakdown.costGst.toFixed(2)}
                              </span>
                            </div>
                            <div className={`pt-2 ${separatorBorder}`}>
                              <span className="font-bold text-lg">
                                Total Cost
                              </span>
                              <span className="font-bold text-lg">
                                ${pricingBreakdown.totalCost.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Sale Summary */}
                        <div className="bg-white rounded-lg border border-[#E5E5E5] px-4 py-3 shadow-sm">
                          <h3 className="text-lg font-bold mb-3">
                            Sale Summary
                          </h3>
                          <div className="flex flex-col gap-3 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-normal">
                            <div>
                              <span>Product Sell</span>
                              <span>
                                $
                                {pricingBreakdown.totalProductSellPrice.toFixed(
                                  2,
                                )}
                              </span>
                            </div>
                            {!isCollection && (
                              <div>
                                <span>Truck Sell</span>
                                <span>
                                  $
                                  {pricingBreakdown.totalTruckSellPrice.toFixed(
                                    2,
                                  )}
                                </span>
                              </div>
                            )}
                            <div className={`pt-2 ${separatorBorder}`}>
                              <span>Subtotal (ex-GST)</span>
                              <span>
                                $
                                {pricingBreakdown.invoiceSubtotalExGST.toFixed(
                                  2,
                                )}
                              </span>
                            </div>
                            <div>
                              <span>GST (10%)</span>
                              <span>
                                ${pricingBreakdown.invoiceGst.toFixed(2)}
                              </span>
                            </div>
                            <div className={`pt-2 ${separatorBorder}`}>
                              <span className="font-bold text-lg">
                                Total Invoice
                              </span>
                              <span className="font-bold text-lg">
                                $
                                {pricingBreakdown.totalInvoiceInclGst.toFixed(
                                  2,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Gross Profit */}

                      <div className="flex justify-end items-center gap-2 py-3 px-4 bg-gray-200 rounded-lg">
                        <span className="text-lg font-semibold">
                          Gross Profit:
                        </span>
                        {pricingBreakdown.grossProfitPercentage >= 0 ? (
                          <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600 shrink-0" />
                        )}
                        <span
                          className={cn(
                            'text-lg font-bold',
                            pricingBreakdown.grossProfitPercentage >= 0
                              ? 'text-green-600'
                              : 'text-red-600',
                          )}
                        >
                          {pricingBreakdown.grossProfitPercentage.toFixed(2)}%
                        </span>
                        <span className="text-lg font-medium ml-3">
                          {pricingBreakdown.grossProfit >= 0 ? '' : '-'}$
                          {Math.abs(pricingBreakdown.grossProfit).toFixed(2)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {isDesktop && (
              <div className="flex justify-end space-x-2 col-span-2 my-6">
                <Button variant="outline" type="button" onClick={onCancel}>
                  {isEditing ? 'Close' : 'Cancel'}
                </Button>
                <Button
                  className="cursor-pointer"
                  type="submit"
                  disabled={isPending}
                >
                  {isEditing ? 'Save Changes' : 'Add Product'}
                </Button>
              </div>
            )}

            {!isDesktop && (
              <div className="flex flex-col col-span-2 gap-3 my-6">
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={isPending}
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
            <p className="mb-3">
              Are you sure you want to remove this delivery address from your
              suggestions?
            </p>
            <p>
              This will not affect existing quotes or historical records, but
              the address will no longer appear as a suggestion for this
              customer.
            </p>
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
