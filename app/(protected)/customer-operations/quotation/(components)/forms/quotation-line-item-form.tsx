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
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { useMediaQuery } from '@/hooks/use-media-query';
import { NewQuotationLineItemFormSchema } from './schemas/line-item-quotation-schema';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useSelectedLineItem } from '@/app/stores/line-item-quotation';
import { CurrencyInput } from '@/components/ui/input-mask';
import { useSelectedQuotation } from '@/app/stores/quotation-store';
import { useCreateQuoteItem, useUpdateQuoteItem } from '@/lib/api/quotation';
import { ProductsListQueryOptions } from '@/lib/api/product';
import { QuarryListQueryOptions } from '@/lib/api/quarries';
import { useQuery } from '@tanstack/react-query';

import { notifySuccess, notifyError } from '@/lib/toast';
import { dollarsToCents, centsToDollarsNum } from '@/lib/utils/currency';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface FormProps {
  id?: number;
  className?: string;
  onCancel?: () => void;
  canEdit?: boolean;
}

type QuoteItemRequest = {
  quoteId: number;
  productId: number;
  quarrySupplierId: number;
  productName: string;
  quarryName: string;
  supplierProductName: string;
  productCostUom: string;
  productCostQty: number;
  productCostPrice: number;
  totalProductCostPrice: number;
  productSellUom: string;
  productSellQty: number;
  productSellPrice: number;
  totalProductSellPrice: number;
  truckType: string;
  truckCostUom: string;
  truckCostQty: number;
  truckCostPrice: number;
  totalTruckCostPrice: number;
  truckSellUom: string;
  truckSellQty: number;
  truckSellPrice: number;
  totalTruckSellPrice: number;
  grossProfit: number;
  totalQuantityRequired: number;
  allocatedQuantity: number;
  remainingQuantity: number;
  requiredLoads: number;
  version: number;
  is_deleted: boolean;
  id?: number;
};

export default function QuoteLineItemForm({
  id,
  onCancel,
  className,
  canEdit,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const [pricingBreakdown, setPricingBreakdown] = React.useState({
    totalProductCostPrice: 0,
    totalTruckCostPrice: 0,
    totalProductSellPrice: 0,
    totalTruckSellPrice: 0,
    totalInvoice: 0,
    grossProfit: 0,
    grossProfitPercentage: 0,
  });

  const selectedLineItem = useSelectedLineItem();
  const selectedQuotation = useSelectedQuotation();
  const createQuoteItem = useCreateQuoteItem();
  const updateQuoteItem = useUpdateQuoteItem();

  const quotationLineItemForm = useForm<
    z.infer<typeof NewQuotationLineItemFormSchema>
  >({
    resolver: zodResolver(NewQuotationLineItemFormSchema),
    mode: 'onChange',
    defaultValues: {
      productId: isEditing ? selectedLineItem?.productId : 0,
      quarrySupplierId: isEditing ? selectedLineItem?.quarrySupplierId ?? 1 : 0,
      supplierProductName: isEditing
        ? selectedLineItem?.supplierProductName
        : '',
      productCostUom: isEditing ? selectedLineItem?.productCostUom : '',
      productCostQty: isEditing ? selectedLineItem?.productCostQty : 0,
      productCostPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.productCostPrice || 0)
        : 0,
      productSellUom: isEditing ? selectedLineItem?.productSellUom : '',
      productSellQty: isEditing ? selectedLineItem?.productSellQty : 0,
      productSellPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.productSellPrice || 0)
        : 0,
      truckType: isEditing ? selectedLineItem?.truckType : '',
      truckCostUom: isEditing ? selectedLineItem?.truckCostUom : '',
      truckCostQty: isEditing ? selectedLineItem?.truckCostQty : 0,
      truckCostPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.truckCostPrice || 0)
        : 0,
      truckSellUom: isEditing ? selectedLineItem?.truckSellUom : '',
      truckSellQty: isEditing ? selectedLineItem?.truckSellQty : 0,
      truckSellPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.truckSellPrice || 0)
        : 0,
      requiredLoads: isEditing ? selectedLineItem?.requiredLoads : 1,
      totalProductCostPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.totalProductCostPrice || 0)
        : 0,
      totalTruckCostPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.totalTruckCostPrice || 0)
        : 0,
      totalProductSellPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.totalProductSellPrice || 0)
        : 0,
      totalTruckSellPrice: isEditing
        ? centsToDollarsNum(selectedLineItem?.totalTruckSellPrice || 0)
        : 0,
      grossProfit: isEditing ? selectedLineItem?.grossProfit : 0,
    },
  });

  // Fetch products from API
  const { data: products } = useQuery(ProductsListQueryOptions());

  const productOptions: FormSelectOption[] = React.useMemo(() => {
    if (!products) return [];
    return products.map((product) => ({
      label: product.productName,
      value: product.id,
    }));
  }, [products]);

  // Fetch quarries from API
  const { data: quarries } = useQuery(QuarryListQueryOptions());

  const quarryOptions: FormSelectOption[] = React.useMemo(() => {
    if (!quarries) return [];
    return quarries.map((quarry) => ({
      label: quarry.name,
      value: quarry.id,
    }));
  }, [quarries]);

  const truckTypeOptions: FormSelectOption[] = React.useMemo(
    () => [
      { label: 'Truck', value: 'Truck' },
      { label: 'Semi-Trailer', value: 'Semi-Trailer' },
      { label: 'Truck + Trailer', value: 'Truck + Trailer' },
      { label: 'Rigid truck', value: 'Rigid truck' },
      { label: 'B-Double', value: 'B-Double' },
      { label: 'Road train', value: 'Road train' },
      { label: 'Dog Truck', value: 'Dog Truck' },
      { label: 'Flatbed', value: 'Flatbed' },
      { label: 'Tipper', value: 'Tipper' },
      { label: 'Semi-Tipper', value: 'Semi-Tipper' },
      { label: 'Side-Tipper', value: 'Side-Tipper' },
      { label: 'Truck and Dog', value: 'Truck and Dog' },
      { label: 'Agitator truck', value: 'Agitator truck' },
    ],
    []
  );

  const productUnitOptions: FormSelectOption[] = React.useMemo(
    () => [
      { label: 'TN', value: 'TN' },
      { label: 'M3', value: 'M3' },
      { label: 'KG_20', value: 'KG_20' },
      { label: 'BULKA', value: 'BULKA' },
    ],
    []
  );

  const truckUnitOptions: FormSelectOption[] = React.useMemo(
    () => [
      { label: 'TN', value: 'TN' },
      { label: 'M3', value: 'M3' },
      { label: 'HOURLY', value: 'HOURLY' },
      { label: 'LOAD', value: 'LOAD' },
    ],
    []
  );

  const productId = quotationLineItemForm.watch('productId');

  React.useEffect(() => {
    const currentProductId = quotationLineItemForm.getValues('productId');
    const initialProductId = isEditing ? selectedLineItem?.productId : 0;

    if (currentProductId !== initialProductId) {
      quotationLineItemForm.setValue('quarrySupplierId', 0);
      quotationLineItemForm.setValue('supplierProductName', '');
    }
  }, [
    productId,
    isEditing,
    selectedLineItem?.productId,
    quotationLineItemForm,
  ]);

  // Dynamically set supplier product name based on selected Product and Quarry
  // Will change this once API is implemented
  const quarryId = quotationLineItemForm.watch('quarrySupplierId');

  React.useEffect(() => {
    const currentProductId = quotationLineItemForm.getValues('productId');
    const currentQuarryId = quotationLineItemForm.getValues('quarrySupplierId');

    if (currentProductId && currentQuarryId) {
      const productLabel =
        productOptions.find((option) => option.value === currentProductId)
          ?.label || '';
      const quarryLabel =
        quarryOptions.find((option) => option.value === currentQuarryId)
          ?.label || '';

      quotationLineItemForm.setValue(
        'supplierProductName',
        productLabel + ' ' + quarryLabel
      );
    }
  }, [quarryId, productOptions, quarryOptions, quotationLineItemForm]);

  // When truck type changes, set truck cost and sell UOM fields to empty
  // Will change this once API is implemented
  const truckType = quotationLineItemForm.watch('truckType');

  React.useEffect(() => {
    const currentTruckType = quotationLineItemForm.getValues('truckType');
    const initialTruckType = isEditing ? selectedLineItem?.truckType : '';

    if (currentTruckType !== initialTruckType) {
      quotationLineItemForm.setValue('truckCostUom', '');
      quotationLineItemForm.setValue('truckSellUom', '');
    }
  }, [
    truckType,
    isEditing,
    selectedLineItem?.truckType,
    quotationLineItemForm,
  ]);

  // Calculate pricing breakdown whenever relevant form values change
  const productCostQty = quotationLineItemForm.watch('productCostQty');
  const productCostPrice = quotationLineItemForm.watch('productCostPrice');
  const truckCostQty = quotationLineItemForm.watch('truckCostQty');
  const truckCostPrice = quotationLineItemForm.watch('truckCostPrice');
  const productSellQty = quotationLineItemForm.watch('productSellQty');
  const productSellPrice = quotationLineItemForm.watch('productSellPrice');
  const truckSellQty = quotationLineItemForm.watch('truckSellQty');
  const truckSellPrice = quotationLineItemForm.watch('truckSellPrice');

  React.useEffect(() => {
    const formValues = quotationLineItemForm.getValues();

    const totalProductCostPrice =
      (formValues.productCostQty || 0) * (formValues.productCostPrice || 0);

    const totalTruckCostPrice =
      (formValues.truckCostQty || 0) * (formValues.truckCostPrice || 0);

    const totalProductSellPrice =
      (formValues.productSellQty || 0) * (formValues.productSellPrice || 0);

    const totalTruckSellPrice =
      (formValues.truckSellQty || 0) * (formValues.truckSellPrice || 0);

    // Calculate total invoice (product sell + truck sell)
    const totalInvoice = totalProductSellPrice + totalTruckSellPrice;
    const totalCost = totalProductCostPrice + totalTruckCostPrice;
    // Calculate gross profit (total invoice - total costs)
    const grossProfit = totalInvoice - totalCost;

    const grossProfitPercentage =
      totalInvoice > 0 ? (grossProfit / totalInvoice) * 100 : 0;

    setPricingBreakdown({
      totalProductCostPrice,
      totalTruckCostPrice,
      totalProductSellPrice,
      totalTruckSellPrice,
      totalInvoice,
      grossProfit,
      grossProfitPercentage,
    });

    // Update form values for the calculated totals
    quotationLineItemForm.setValue(
      'totalProductCostPrice',
      totalProductCostPrice
    );
    quotationLineItemForm.setValue('totalTruckCostPrice', totalTruckCostPrice);
    quotationLineItemForm.setValue(
      'totalProductSellPrice',
      totalProductSellPrice
    );
    quotationLineItemForm.setValue('totalTruckSellPrice', totalTruckSellPrice);
    quotationLineItemForm.setValue('grossProfit', grossProfit);
  }, [
    productCostQty,
    productCostPrice,
    truckCostQty,
    truckCostPrice,
    productSellQty,
    productSellPrice,
    truckSellQty,
    truckSellPrice,
    quotationLineItemForm,
  ]);

  // Calculate GST and Total Invoice(Inc GST)
  const gst = (Number(pricingBreakdown.totalInvoice) * 0.1).toFixed(2);
  const totalInvoiceIncGST = (
    Number(pricingBreakdown.totalInvoice) + Number(gst)
  ).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    quotationLineItemForm.handleSubmit(onSubmit)(e);
  };

  async function onSubmit(
    values: z.infer<typeof NewQuotationLineItemFormSchema>
  ) {
    if (!selectedQuotation?.id) {
      console.error('No quotation selected');
      return;
    }
    // Prepare quote item data
    const quoteItemData: QuoteItemRequest = {
      quoteId: selectedQuotation?.id || 0,
      productId: values.productId,
      quarrySupplierId: values.quarrySupplierId,
      productName:
        productOptions.find((p) => p.value === values.productId)?.label || '',
      quarryName:
        quarryOptions.find((q) => q.value === values.quarrySupplierId)?.label ||
        '',
      supplierProductName: values.supplierProductName,
      productCostUom: values.productCostUom,
      productCostQty: values.productCostQty,
      productCostPrice: dollarsToCents(values.productCostPrice),
      totalProductCostPrice: dollarsToCents(values.totalProductCostPrice),
      productSellUom: values.productSellUom,
      productSellQty: values.productSellQty,
      productSellPrice: dollarsToCents(values.productSellPrice),
      totalProductSellPrice: dollarsToCents(values.totalProductSellPrice),
      truckType: values.truckType,
      truckCostUom: values.truckCostUom,
      truckCostQty: values.truckCostQty,
      truckCostPrice: dollarsToCents(values.truckCostPrice),
      totalTruckCostPrice: dollarsToCents(values.totalTruckCostPrice),
      truckSellUom: values.truckSellUom,
      truckSellQty: values.truckSellQty,
      truckSellPrice: dollarsToCents(values.truckSellPrice),
      totalTruckSellPrice: dollarsToCents(values.totalTruckSellPrice),
      grossProfit: dollarsToCents(String(values.grossProfit)),
      totalQuantityRequired: values.productSellQty,
      allocatedQuantity: 0,
      remainingQuantity: values.productSellQty,
      requiredLoads: values.requiredLoads,
      version: 1,
      is_deleted: false,
    };

    // Only include ID when editing an existing line item
    if (isEditing && selectedLineItem?.id) {
      quoteItemData.id = selectedLineItem.id;
    }

    try {
      if (isEditing && selectedLineItem?.id) {
        console.log('📤 Request Body:', {
          id: selectedLineItem.id,
          data: quoteItemData,
        });

        await updateQuoteItem.mutateAsync({
          id: selectedLineItem.id,
          data: quoteItemData,
        });
        notifySuccess('Line item Updated');
      } else {
        // CREATE: Send new item data
        console.log(
          '➕ CREATE Mode - Sending request 📤 Request Body:',
          quoteItemData
        );

        await createQuoteItem.mutateAsync(quoteItemData);
        notifySuccess('Line item Added');
      }
      quotationLineItemForm.reset();
      onCancel?.();
    } catch (error) {
      console.error('❌ Failed to save Line item:', error);
      notifyError(
        isEditing ? 'Failed to Update Line item' : 'Failed to Add Line item'
      );
    }
  }

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {(createQuoteItem.isPending || updateQuoteItem.isPending) && (
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
            (createQuoteItem.isPending || updateQuoteItem.isPending) &&
              'pointer-events-none'
          )}
          onSubmit={handleSubmit}
        >
          <div
            className={cn(
              'p-1 w-full flex flex-col',
              className,
              (createQuoteItem.isPending || updateQuoteItem.isPending) &&
                'pointer-events-none'
            )}
          >
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
                disabled={isEditing && !canEdit}
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
                disabled={
                  !quotationLineItemForm.watch('productId') ||
                  (isEditing && !canEdit)
                }
              />

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
                        disabled={isEditing && !canEdit}
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
                    disabled={isEditing && !canEdit}
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
                            disabled={isEditing && !canEdit}
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
                            disabled={isEditing && !canEdit}
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
                    disabled={isEditing && !canEdit}
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
                            disabled={isEditing && !canEdit}
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
                            disabled={isEditing && !canEdit}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Truck Configuration */}
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
                disabled={isEditing && !canEdit}
              />

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
                    name="truckCostUom"
                    label="Unit of Measure*"
                    searchLabel="Unit of Measure"
                    showSearch={false}
                    options={truckUnitOptions}
                    placeholder="Select Unit of Measure"
                    disabled={
                      !quotationLineItemForm.watch('truckType') ||
                      (isEditing && !canEdit)
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
                            disabled={isEditing && !canEdit}
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
                            disabled={isEditing && !canEdit}
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
                    isDesktop ? 'grid grid-cols-3 gap-4' : 'flex flex-col gap-3'
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
                      !quotationLineItemForm.watch('truckType') ||
                      (isEditing && !canEdit)
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
                            disabled={isEditing && !canEdit}
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
                            id="truckCostPrice"
                            className="w-full"
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(value === '' ? 0 : value)
                            }
                            decimalPlaces={2}
                            allowNegative={false}
                            disabled={isEditing && !canEdit}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

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
                  disabled={
                    createQuoteItem.isPending ||
                    updateQuoteItem.isPending ||
                    !canEdit
                  }
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
                  disabled={
                    createQuoteItem.isPending ||
                    updateQuoteItem.isPending ||
                    !canEdit
                  }
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
    </div>
  );
}
