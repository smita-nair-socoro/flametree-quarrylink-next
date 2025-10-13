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

interface FormProps {
  id?: number;
  onSuccess?: () => void;
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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
      required_loads: isEditing ? selectedLineItem?.required_loads : 0,
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

  const productOptions: FormSelectOption[] = [
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
  ];

  const quarryOptions: FormSelectOption[] = [
    { label: 'Socoro', value: 1 },
    { label: 'QuarryLink Internal Quarry', value: 2 },
    { label: 'Quarry ABC', value: 3 },
  ];

  const truckTypeOptions: FormSelectOption[] = [
    { label: 'Truck', value: 'Truck' },
    { label: 'Semi-Trailer', value: 'Semi-Trailer' },
    { label: 'Truck + Trailer', value: 'Truck + Trailer' },
  ];

  const productUnitOptions: FormSelectOption[] = [
    { label: 'TN', value: 'TN' },
    { label: 'M3', value: 'M3' },
    { label: 'KG_20', value: 'KG_20' },
    { label: 'BULKA', value: 'BULKA' },
  ];

  const truckUnitOptions: FormSelectOption[] = [
    { label: 'TN', value: 'TN' },
    { label: 'M3', value: 'M3' },
    { label: 'HOURLY', value: 'HOURLY' },
    { label: 'LOAD', value: 'LOAD' },
  ];

  React.useEffect(() => {
    // when product changes, set quarry and supplier product name empty
    quotationLineItemForm.setValue('quarry_id', 0);
    quotationLineItemForm.setValue('supplier_product_name', '');
  }, [quotationLineItemForm.watch('product_id')]);

  React.useEffect(() => {
    const productId = quotationLineItemForm.getValues('product_id');
    const quarryId = quotationLineItemForm.getValues('quarry_id');

    // Dynamically set supplier product name based on selected Product and Quarry
    // Will change this once API is implemented
    if (productId && quarryId) {
      const productLabel =
        productOptions.find((option) => option.value === productId)?.label ||
        '';
      const quarryLabel =
        quarryOptions.find((option) => option.value === quarryId)?.label || '';

      quotationLineItemForm.setValue(
        'supplier_product_name',
        productLabel + ' ' + quarryLabel
      );
    }
  }, [quotationLineItemForm.watch('quarry_id')]);

  React.useEffect(() => {
    quotationLineItemForm.setValue('truck_cost_uom', '');
    quotationLineItemForm.setValue('truck_sell_uom', '');
  }, [quotationLineItemForm.watch('truck_type')]);

  // Calculate pricing breakdown whenever relevant form values change
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
    quotationLineItemForm.watch('product_cost_qty'),
    quotationLineItemForm.watch('product_cost_price'),
    quotationLineItemForm.watch('truck_cost_qty'),
    quotationLineItemForm.watch('truck_cost_price'),
    quotationLineItemForm.watch('product_sell_qty'),
    quotationLineItemForm.watch('product_sell_price'),
    quotationLineItemForm.watch('truck_sell_qty'),
    quotationLineItemForm.watch('truck_sell_price'),
  ]);

  async function onSubmit(
    values: z.infer<typeof NewQuotationLineItemFormSchema>
  ) {
    console.log('onSubmit function called!');
    console.log('Form is valid:', quotationLineItemForm.formState.isValid);
    console.log('Form errors:', quotationLineItemForm.formState.errors);
    console.log('Quotation Form Values:', values);

    setIsSubmitting(true);

    // Simulate API call delay (remove this in production)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
  }

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
            isSubmitting && 'pointer-events-none'
          )}
          onSubmit={quotationLineItemForm.handleSubmit(onSubmit)}
        >
          <div
            className={cn(
              'gap-6 p-1 w-full flex flex-col',
              className,
              isSubmitting && 'pointer-events-none'
            )}
          >
            {/* Product Information */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-20px font-semibold mt-3">
                  Product Information
                </span>
                <Separator />
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
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-20px font-semibold mt-3">Pricing</span>
                <Separator />
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
                    label="UOM*"
                    searchLabel="UOM"
                    showSearch={false}
                    options={productUnitOptions}
                    placeholder="Select UOM"
                  />

                  <FormField
                    control={quotationLineItemForm.control}
                    name="product_cost_qty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Cost QTY*</FormLabel>
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
                        <FormLabel>Product Cost*</FormLabel>
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
                    label="UOM*"
                    searchLabel="UOM"
                    showSearch={false}
                    options={productUnitOptions}
                    placeholder="Select UOM"
                  />

                  <FormField
                    control={quotationLineItemForm.control}
                    name="product_sell_qty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Sell QTY*</FormLabel>
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
                        <FormLabel>Product Sell*</FormLabel>
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
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-20px font-semibold mt-3">
                  Truck Configuration
                </span>
                <Separator />
              </div>
              <FormSelect
                control={quotationLineItemForm.control}
                name="truck_type"
                label="Truck Type*"
                searchLabel="Truck Type"
                options={truckTypeOptions}
                placeholder="Select Truck Type"
              />

              <FormSelect
                control={quotationLineItemForm.control}
                name="truck_cost_uom"
                label="Truck Cost UOM*"
                searchLabel="Truck Cost UOM"
                showSearch={false}
                options={truckUnitOptions}
                placeholder="Select UOM"
                disabled={!quotationLineItemForm.watch('truck_type')}
              />

              <FormField
                control={quotationLineItemForm.control}
                name="truck_cost_qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Truck Cost QTY*</FormLabel>
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
                    <FormLabel>Truck Cost Rate*</FormLabel>
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormSelect
                control={quotationLineItemForm.control}
                name="truck_sell_uom"
                label="Truck Sell UOM*"
                searchLabel="Truck Sell UOM"
                showSearch={false}
                options={truckUnitOptions}
                placeholder="Select UOM"
                disabled={!quotationLineItemForm.watch('truck_type')}
              />

              <FormField
                control={quotationLineItemForm.control}
                name="truck_sell_qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Truck Sell QTY*</FormLabel>
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
                    <FormLabel>Truck Sell Rate*</FormLabel>
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={quotationLineItemForm.control}
                name="required_loads"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Loads*</FormLabel>
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
            </div>

            <div className="flex flex-col gap-0">
              <div className="flex flex-col gap-2">
                <span className="text-[0A0A0A] font-semibold text-[20px]">
                  Pricing Breakdown
                </span>
                <Separator />
              </div>
              <div className="bg-gray-50 border-t px-2 border-[#E5E5E5]">
                <div className="flex justify-between py-3">
                  <span className="text-sm font-normal">
                    Total Product Cost Price:
                  </span>
                  <span className="text-sm font-normal">
                    ${pricingBreakdown.totalProductCostPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm font-normal">
                    Total Truck Cost Price:
                  </span>
                  <span className="text-sm font-normal">
                    ${pricingBreakdown.totalTruckCostPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm font-normal">
                    Total Product Sell Price:
                  </span>
                  <span className="text-sm font-normal">
                    ${pricingBreakdown.totalProductSellPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm font-normal">
                    Total Truck Sell Price:
                  </span>
                  <span className="text-sm font-normal">
                    ${pricingBreakdown.totalTruckSellPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm font-semibold">Total Invoice:</span>
                  <span className="text-sm font-normal">
                    ${pricingBreakdown.totalInvoice.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between py-3 px-2 bg-slate-200">
                <span className="text-sm font-semibold">Gross Profit:</span>
                <span className="text-sm font-normal">
                  ${pricingBreakdown.grossProfit.toFixed(2)} (
                  {pricingBreakdown.grossProfitPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>

            {isDesktop && (
              <div className="flex justify-end space-x-2 col-span-2 mb-6">
                <Button variant="outline" type="button" onClick={onCancel}>
                  {isEditing ? 'Close' : 'Cancel'}
                </Button>
                <Button
                  form="add-new-quote-line-item-form"
                  className="cursor-pointer"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isEditing ? 'Save Changes' : 'Add Product'}
                </Button>
              </div>
            )}

            {!isDesktop && (
              <div className="flex flex-col col-span-2 gap-3 mb-6">
                <Button
                  form="add-new-quote-line-item-form"
                  type="submit"
                  className="cursor-pointer"
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
