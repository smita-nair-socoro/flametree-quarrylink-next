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
import { useCreateQuoteItem } from '@/lib/api/quotation';
import { notifyPromise } from '@/lib/toast';
import { dollarsToCents } from '@/lib/utils/currency';
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

  const quotationLineItemForm = useForm<
    z.infer<typeof NewQuotationLineItemFormSchema>
  >({
    resolver: zodResolver(NewQuotationLineItemFormSchema),
    mode: 'onChange',
    defaultValues: {
      product_id: isEditing ? selectedLineItem?.product_id : 0,
      quarry_id: isEditing ? selectedLineItem?.quarry_id : 0,
      supplier_product_name: isEditing
        ? selectedLineItem?.supplier_product_name
        : '',
      product_cost_uom: isEditing ? selectedLineItem?.product_cost_uom : '',
      product_cost_qty: isEditing ? selectedLineItem?.product_cost_qty : 0,
      product_cost_price: isEditing ? selectedLineItem?.product_cost_price : 0,
      product_sell_uom: isEditing ? selectedLineItem?.product_sell_uom : '',
      product_sell_qty: isEditing ? selectedLineItem?.product_sell_qty : 0,
      product_sell_price: isEditing ? selectedLineItem?.product_sell_price : 0,
      truck_type: isEditing ? selectedLineItem?.truck_type : '',
      truck_cost_uom: isEditing ? selectedLineItem?.truck_cost_uom : '',
      truck_cost_qty: isEditing ? selectedLineItem?.truck_cost_qty : 0,
      truck_cost_price: isEditing ? selectedLineItem?.truck_cost_price : 0,
      truck_sell_uom: isEditing ? selectedLineItem?.truck_sell_uom : '',
      truck_sell_qty: isEditing ? selectedLineItem?.truck_sell_qty : 0,
      truck_sell_price: isEditing ? selectedLineItem?.truck_sell_price : 0,
      required_loads: isEditing ? selectedLineItem?.required_loads : 1,
      total_product_cost_price: isEditing
        ? selectedLineItem?.total_product_cost_price
        : 0,
      total_truck_cost_price: isEditing
        ? selectedLineItem?.total_truck_cost_price
        : 0,
      total_product_sell_price: isEditing
        ? selectedLineItem?.total_product_sell_price
        : 0,
      total_truck_sell_price: isEditing
        ? selectedLineItem?.total_truck_sell_price
        : 0,
      gross_profit: isEditing ? selectedLineItem?.gross_profit : 0,
    },
  });

  const productOptions: FormSelectOption[] = React.useMemo(
    () => [
      {
        label: 'Rock',
        value: 1,
      },
      {
        label: 'Onyx',
        value: 2,
      },
      {
        label: 'Sand',
        value: 3,
      },
      {
        label: 'Soil',
        value: 4,
      },
      {
        label: 'Diamond',
        value: 5,
      },
    ],
    []
  );

  const quarryOptions: FormSelectOption[] = React.useMemo(
    () => [
      { label: 'Socoro', value: 1 },
      { label: 'QuarryLink Internal Quarry', value: 2 },
      { label: 'Quarry ABC', value: 3 },
    ],
    []
  );

  const truckTypeOptions: FormSelectOption[] = React.useMemo(
    () => [
      { label: 'Truck', value: 'Truck' },
      { label: 'Semi-Trailer', value: 'Semi-Trailer' },
      { label: 'Truck + Trailer', value: 'Truck + Trailer' },
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

  // when product changes, set quarry and supplier product name empty
  // Will change this once API is implemented
  const productId = quotationLineItemForm.watch('product_id');

  React.useEffect(() => {
    const currentProductId = quotationLineItemForm.getValues('product_id');
    const initialProductId = isEditing ? selectedLineItem?.product_id : 0;

    if (currentProductId !== initialProductId) {
      quotationLineItemForm.setValue('quarry_id', 0);
      quotationLineItemForm.setValue('supplier_product_name', '');
    }
  }, [
    productId,
    isEditing,
    selectedLineItem?.product_id,
    quotationLineItemForm,
  ]);

  // Dynamically set supplier product name based on selected Product and Quarry
  // Will change this once API is implemented
  const quarryId = quotationLineItemForm.watch('quarry_id');

  React.useEffect(() => {
    const currentProductId = quotationLineItemForm.getValues('product_id');
    const currentQuarryId = quotationLineItemForm.getValues('quarry_id');

    if (currentProductId && currentQuarryId) {
      const productLabel =
        productOptions.find((option) => option.value === currentProductId)
          ?.label || '';
      const quarryLabel =
        quarryOptions.find((option) => option.value === currentQuarryId)
          ?.label || '';

      quotationLineItemForm.setValue(
        'supplier_product_name',
        productLabel + ' ' + quarryLabel
      );
    }
  }, [quarryId, productOptions, quarryOptions, quotationLineItemForm]);

  // When truck type changes, set truck cost and sell UOM fields to empty
  // Will change this once API is implemented
  const truckType = quotationLineItemForm.watch('truck_type');

  React.useEffect(() => {
    const currentTruckType = quotationLineItemForm.getValues('truck_type');
    const initialTruckType = isEditing ? selectedLineItem?.truck_type : '';

    if (currentTruckType !== initialTruckType) {
      quotationLineItemForm.setValue('truck_cost_uom', '');
      quotationLineItemForm.setValue('truck_sell_uom', '');
    }
  }, [
    truckType,
    isEditing,
    selectedLineItem?.truck_type,
    quotationLineItemForm,
  ]);

  // Calculate pricing breakdown whenever relevant form values change
  const productCostQty = quotationLineItemForm.watch('product_cost_qty');
  const productCostPrice = quotationLineItemForm.watch('product_cost_price');
  const truckCostQty = quotationLineItemForm.watch('truck_cost_qty');
  const truckCostPrice = quotationLineItemForm.watch('truck_cost_price');
  const productSellQty = quotationLineItemForm.watch('product_sell_qty');
  const productSellPrice = quotationLineItemForm.watch('product_sell_price');
  const truckSellQty = quotationLineItemForm.watch('truck_sell_qty');
  const truckSellPrice = quotationLineItemForm.watch('truck_sell_price');

  React.useEffect(() => {
    const formValues = quotationLineItemForm.getValues();

    const totalProductCostPrice =
      (formValues.product_cost_qty || 0) * (formValues.product_cost_price || 0);

    const totalTruckCostPrice =
      (formValues.truck_cost_qty || 0) * (formValues.truck_cost_price || 0);

    const totalProductSellPrice =
      (formValues.product_sell_qty || 0) * (formValues.product_sell_price || 0);

    const totalTruckSellPrice =
      (formValues.truck_sell_qty || 0) * (formValues.truck_sell_price || 0);

    // Calculate total invoice (product sell + truck sell)
    const totalInvoice = totalProductSellPrice + totalTruckSellPrice;

    // Calculate gross profit (total invoice - total costs)
    const totalCosts = totalProductCostPrice + totalTruckCostPrice;
    const grossProfit = totalInvoice - totalCosts;

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
      'total_product_cost_price',
      totalProductCostPrice
    );
    quotationLineItemForm.setValue(
      'total_truck_cost_price',
      totalTruckCostPrice
    );
    quotationLineItemForm.setValue(
      'total_product_sell_price',
      totalProductSellPrice
    );
    quotationLineItemForm.setValue(
      'total_truck_sell_price',
      totalTruckSellPrice
    );
    quotationLineItemForm.setValue('gross_profit', grossProfit);
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

    // Prepare quote item data - convert dollars to cents for storage
    const quoteItemData = {
      quote_id: selectedQuotation.id,
      product_name: productOptions.find(p => p.value === values.product_id)?.label || '',
      quarry_name: quarryOptions.find(q => q.value === values.quarry_id)?.label || '',
      supplier_product_name: values.supplier_product_name,
      product_cost_uom: values.product_cost_uom,
      product_cost_qty: values.product_cost_qty,
      product_cost_price: dollarsToCents(values.product_cost_price),
      total_product_cost_price: dollarsToCents(values.total_product_cost_price),
      product_sell_uom: values.product_sell_uom,
      product_sell_qty: values.product_sell_qty,
      product_sell_price: dollarsToCents(values.product_sell_price),
      total_product_sell_price: dollarsToCents(values.total_product_sell_price),
      truck_type: values.truck_type,
      truck_cost_uom: values.truck_cost_uom,
      truck_cost_qty: values.truck_cost_qty,
      truck_cost_price: dollarsToCents(values.truck_cost_price),
      total_truck_cost_price: dollarsToCents(values.total_truck_cost_price),
      truck_sell_uom: values.truck_sell_uom,
      truck_sell_qty: values.truck_sell_qty,
      truck_sell_price: dollarsToCents(values.truck_sell_price),
      total_truck_sell_price: dollarsToCents(values.total_truck_sell_price),
      gross_profit: values.gross_profit,
      total_quantity_required: values.product_sell_qty,
      allocated_quantity: 0,
      remaining_quantity: values.product_sell_qty,
      required_loads: values.required_loads,
      version: 1,
      is_deleted: false,
    };

    await notifyPromise(
      createQuoteItem.mutateAsync(quoteItemData),
      {
        loading: 'Adding product...',
        success: () => {
          quotationLineItemForm.reset();
          onCancel?.();
          return 'Product added successfully!';
        },
        error: (err) =>
          `Failed to add product: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }
    );
  }

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {createQuoteItem.isPending && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10'
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              Adding Product...
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
            createQuoteItem.isPending && 'pointer-events-none'
          )}
          onSubmit={handleSubmit}
        >
          <div
            className={cn(
              'p-1 w-full flex flex-col',
              className,
              createQuoteItem.isPending && 'pointer-events-none'
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
                name="product_id"
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
                name="quarry_id"
                label="Quarry/Supplier*"
                searchLabel="Quarry/Supplier"
                options={quarryOptions}
                placeholder="Select Quarry/Supplier"
                formItemClassName={
                  isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                }
                disabled={
                  !quotationLineItemForm.watch('product_id') ||
                  (isEditing && !canEdit)
                }
              />

              <FormField
                control={quotationLineItemForm.control}
                name="supplier_product_name"
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
                    name="product_cost_uom"
                    label="Unit of Measure*"
                    searchLabel="Unit of Measure"
                    showSearch={false}
                    options={productUnitOptions}
                    placeholder="Select Unit of Measure"
                    disabled={isEditing && !canEdit}
                  />

                  <FormField
                    control={quotationLineItemForm.control}
                    name="product_cost_qty"
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
                    name="product_cost_price"
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
                            id="product_cost_price"
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
                    name="product_sell_uom"
                    label="Unit of Measure*"
                    searchLabel="Unit of Measure"
                    showSearch={false}
                    options={productUnitOptions}
                    placeholder="Select Unit of Measure"
                    disabled={isEditing && !canEdit}
                  />

                  <FormField
                    control={quotationLineItemForm.control}
                    name="product_sell_qty"
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
                    name="product_sell_price"
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
                            id="product_sell_price"
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
                name="truck_type"
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
                    name="truck_cost_uom"
                    label="Unit of Measure*"
                    searchLabel="Unit of Measure"
                    showSearch={false}
                    options={truckUnitOptions}
                    placeholder="Select Unit of Measure"
                    disabled={
                      !quotationLineItemForm.watch('truck_type') ||
                      (isEditing && !canEdit)
                    }
                  />

                  <FormField
                    control={quotationLineItemForm.control}
                    name="truck_cost_qty"
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
                    name="truck_cost_price"
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
                            id="truck_cost_price"
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
                    name="truck_sell_uom"
                    label="Unit of Measure*"
                    searchLabel="Unit of Measure"
                    showSearch={false}
                    options={truckUnitOptions}
                    placeholder="Select Unit of Measure"
                    disabled={
                      !quotationLineItemForm.watch('truck_type') ||
                      (isEditing && !canEdit)
                    }
                  />

                  <FormField
                    control={quotationLineItemForm.control}
                    name="truck_sell_qty"
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
                    name="truck_sell_price"
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
                            id="truck_cost_price"
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
                      {selectedLineItem?.created_by || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Last Modified By:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLineItem?.last_modified_by || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Created Date:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLineItem?.created_at
                        ? new Date(
                            selectedLineItem.created_at
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
                      {selectedLineItem?.updated_at
                        ? new Date(
                            selectedLineItem.updated_at || ''
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
                  disabled={createQuoteItem.isPending || !canEdit}
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
                  disabled={createQuoteItem.isPending || !canEdit}
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
