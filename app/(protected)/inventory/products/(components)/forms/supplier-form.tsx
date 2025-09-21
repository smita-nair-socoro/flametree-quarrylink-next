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
import { FormSelect } from '@/components/ui/form-select';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Spinner } from '@/components/ui/spinner';
import { useSelectedSupplier } from '@/app/stores/supplier-store';
import { NewSupplierFormSchema } from './schemas/supplier-form-schema';
import { Tab } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PricingConfigurationTable } from './(form-tables)/pricing-configuration-table';
import { TruckRatesTable } from './(form-tables)/truck-rates-table';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
}

export default function SupplierForm({ id, onCancel, className }: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const selectedSupplier = useSelectedSupplier();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [supplierProductName, setSupplierProductName] = React.useState('');
  const [supplierProductCode, setSupplierProductCode] = React.useState('');

  const supplierOptions = [
    { label: 'Blackstone Quarry', value: 'Blackstone Quarry' },
    { label: 'Riverside Materials', value: 'Riverside Materials' },
    { label: 'Quarry 1', value: 'Quarry 1' },
    { label: 'Quarry 2', value: 'Quarry 2' },
    { label: 'Quarry 3', value: 'Quarry 3' },
    { label: 'Quarry 4', value: 'Quarry 4' },
    { label: 'Quarry 5', value: 'Quarry 5' },
    { label: 'Quarry 10', value: 'Quarry 10' },
  ];

  // TODO: Zod Validation
  const supplierForm = useForm<z.infer<typeof NewSupplierFormSchema>>({
    resolver: zodResolver(NewSupplierFormSchema),
    defaultValues: {
      supplier_name: isEditing ? selectedSupplier?.quarry_name || '' : '',
      supplier_product_name: isEditing
        ? selectedSupplier?.supplier_product_name || ''
        : '',
      supplier_product_code: isEditing
        ? selectedSupplier?.supplier_product_code || ''
        : '',
      cost_price_TN: isEditing
        ? (selectedSupplier?.price.tn_cost_price || 0) / 100
        : 0,
      sell_price_TN: isEditing
        ? (selectedSupplier?.price.tn_sell_price || 0) / 100
        : 0,
      cost_price_M3: isEditing
        ? (selectedSupplier?.price.m3_cost_price || 0) / 100
        : 0,
      sell_price_M3: isEditing
        ? (selectedSupplier?.price.m3_sell_price || 0) / 100
        : 0,
      cost_price_KG: isEditing
        ? (selectedSupplier?.price.kg_20_cost_price || 0) / 100
        : 0,
      sell_price_KG: isEditing
        ? (selectedSupplier?.price.kg_20_sell_price || 0) / 100
        : 0,
      cost_price_Bulk: isEditing
        ? (selectedSupplier?.price.bulka_cost_price || 0) / 100
        : 0,
      sell_price_Bulk: isEditing
        ? (selectedSupplier?.price.bulka_sell_price || 0) / 100
        : 0,
      margin_TN: isEditing ? selectedSupplier?.price.margin_tn || 0 : 0,
      margin_M3: isEditing ? selectedSupplier?.price.margin_m3 || 0 : 0,
      margin_KG: isEditing ? selectedSupplier?.price.margin_kg || 0 : 0,
      margin_BULK: isEditing ? selectedSupplier?.price.margin_bulk || 0 : 0,
      available_for_sale_TN: isEditing
        ? selectedSupplier?.price.available_for_sale_tn || true
        : true,
      available_for_sale_M3: isEditing
        ? selectedSupplier?.price.available_for_sale_m3 || false
        : false,
      available_for_sale_KG: isEditing
        ? selectedSupplier?.price.available_for_sale_kg || false
        : false,
      available_for_sale_Bulk: isEditing
        ? selectedSupplier?.price.available_for_sale_bulk || false
        : false,
      truck_TN_rate: isEditing
        ? (selectedSupplier?.price.truck_tn_rate || 0) / 100
        : 0,
      truck_M3_rate: isEditing
        ? (selectedSupplier?.price.truck_m3_rate || 0) / 100
        : 0,
      truck_hourly_rate: isEditing
        ? (selectedSupplier?.price.truck_hourly_rate || 0) / 100
        : 0,
      truck_load_rate: isEditing
        ? (selectedSupplier?.price.truck_load_rate || 0) / 100
        : 0,
      available_truck_TN_rate: isEditing
        ? selectedSupplier?.price.available_truck_tn_rate || false
        : false,
      available_truck_M3_rate: isEditing
        ? selectedSupplier?.price.available_truck_m3_rate || false
        : false,
      available_truck_hourly_rate: isEditing
        ? selectedSupplier?.price.available_truck_hourly_rate || false
        : false,
      available_truck_load_rate: isEditing
        ? selectedSupplier?.price.available_truck_load_rate || false
        : false,
    },
  });

  const watchedProductName = supplierForm.watch('supplier_product_name');
  const watchedProductCode = supplierForm.watch('supplier_product_code');

  // Watch availability switches for pricing
  const watchedAvailabilityTN = supplierForm.watch('available_for_sale_TN');
  const watchedAvailabilityM3 = supplierForm.watch('available_for_sale_M3');
  const watchedAvailabilityKG = supplierForm.watch('available_for_sale_KG');
  const watchedAvailabilityBulk = supplierForm.watch('available_for_sale_Bulk');

  // Watch price changes for margin calculation
  const watchedCostTN = supplierForm.watch('cost_price_TN');
  const watchedSellTN = supplierForm.watch('sell_price_TN');
  const watchedCostM3 = supplierForm.watch('cost_price_M3');
  const watchedSellM3 = supplierForm.watch('sell_price_M3');
  const watchedCostKG = supplierForm.watch('cost_price_KG');
  const watchedSellKG = supplierForm.watch('sell_price_KG');
  const watchedCostBulk = supplierForm.watch('cost_price_Bulk');
  const watchedSellBulk = supplierForm.watch('sell_price_Bulk');

  // Calculate margin percentage
  const calculateMargin = (costPrice: number, sellPrice: number): number => {
    if (!costPrice || !sellPrice || costPrice <= 0) return 0;
    return ((sellPrice - costPrice) / costPrice) * 100;
  };

  // Update margin values when prices or availability change
  React.useEffect(() => {
    const units = [
      {
        key: 'TN',
        cost: watchedCostTN,
        sell: watchedSellTN,
        available: watchedAvailabilityTN,
      },
      {
        key: 'M3',
        cost: watchedCostM3,
        sell: watchedSellM3,
        available: watchedAvailabilityM3,
      },
      {
        key: 'KG',
        cost: watchedCostKG,
        sell: watchedSellKG,
        available: watchedAvailabilityKG,
      },
      {
        key: 'Bulk',
        cost: watchedCostBulk,
        sell: watchedSellBulk,
        available: watchedAvailabilityBulk,
      },
    ];

    units.forEach(({ key, cost, sell }) => {
      // Always calculate margin based on cost and sell prices, regardless of availability
      const marginValue = calculateMargin(cost || 0, sell || 0);

      const fieldName = key === 'Bulk' ? 'margin_BULK' : `margin_${key}`;
      supplierForm.setValue(
        fieldName as keyof z.infer<typeof NewSupplierFormSchema>,
        marginValue
      );
    });
  }, [
    watchedCostTN,
    watchedSellTN,
    watchedCostM3,
    watchedSellM3,
    watchedCostKG,
    watchedSellKG,
    watchedCostBulk,
    watchedSellBulk,
    watchedAvailabilityTN,
    watchedAvailabilityM3,
    watchedAvailabilityKG,
    watchedAvailabilityBulk,
    supplierForm,
  ]);

  React.useEffect(() => {
    if (watchedProductName) {
      setSupplierProductName(watchedProductName);
    } else {
      setSupplierProductName('New Product');
    }

    if (watchedProductCode) {
      setSupplierProductCode(watchedProductCode);
    } else {
      setSupplierProductCode('CODE');
    }
  }, [watchedProductName, watchedProductCode]);

  const tabs = [
    {
      name: 'Supplier Details',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between gap-4">
            <FormSelect
              control={supplierForm.control}
              name="supplier_name"
              label="Supplier*"
              options={supplierOptions}
              placeholder="Select Supplier"
              formItemClassName="w-full"
            />
            <FormField
              control={supplierForm.control}
              name="supplier_product_name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Product Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Product Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={supplierForm.control}
              name="supplier_product_code"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Product Code*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Product Code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ),
    },
    {
      name: 'Price Configuration',
      content: (
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-lg font-medium">Pricing Configuration</span>
            <p className="text-sm text-muted-foreground mt-1">
              Product: {supplierProductName} ({supplierProductCode})
            </p>
          </div>
          <PricingConfigurationTable
            control={supplierForm.control}
            watch={supplierForm.watch}
          />
        </div>
      ),
    },
    {
      name: 'Truck Rates',
      content: (
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-lg font-medium">
              Truck Rates - New Supplier
            </span>
            <p className="text-sm text-muted-foreground mt-1">
              Optional - can be overridden in quotes
            </p>
          </div>
          <TruckRatesTable control={supplierForm.control} />
        </div>
      ),
    },
  ];

  async function onSubmit(values: z.infer<typeof NewSupplierFormSchema>) {
    console.log('onSubmit function called!');
    console.log('Supplier Form Values:', values);

    // Reset pricing values to 0 if availability switches are off
    const processedValues = { ...values };

    if (!processedValues.available_for_sale_TN) {
      processedValues.cost_price_TN = 0;
      processedValues.sell_price_TN = 0;
      processedValues.margin_TN = 0;
    }
    if (!processedValues.available_for_sale_M3) {
      processedValues.cost_price_M3 = 0;
      processedValues.sell_price_M3 = 0;
      processedValues.margin_M3 = 0;
    }
    if (!processedValues.available_for_sale_KG) {
      processedValues.cost_price_KG = 0;
      processedValues.sell_price_KG = 0;
      processedValues.margin_KG = 0;
    }
    if (!processedValues.available_for_sale_Bulk) {
      processedValues.cost_price_Bulk = 0;
      processedValues.sell_price_Bulk = 0;
      processedValues.margin_BULK = 0;
    }

    // Reset truck rate values to 0 if availability switches are off
    if (!processedValues.available_truck_TN_rate) {
      processedValues.truck_TN_rate = 0;
    }
    if (!processedValues.available_truck_M3_rate) {
      processedValues.truck_M3_rate = 0;
    }
    if (!processedValues.available_truck_hourly_rate) {
      processedValues.truck_hourly_rate = 0;
    }
    if (!processedValues.available_truck_load_rate) {
      processedValues.truck_load_rate = 0;
    }

    // Convert prices from dollars to cents for database storage
    const priceFieldsToConvert = [
      'cost_price_TN',
      'sell_price_TN',
      'cost_price_M3',
      'sell_price_M3',
      'cost_price_KG',
      'sell_price_KG',
      'cost_price_Bulk',
      'sell_price_Bulk',
      'truck_TN_rate',
      'truck_M3_rate',
      'truck_hourly_rate',
      'truck_load_rate',
    ] as const;

    priceFieldsToConvert.forEach((field) => {
      if (
        processedValues[field] &&
        typeof processedValues[field] === 'number'
      ) {
        processedValues[field] = Math.round(
          (processedValues[field] as number) * 100
        );
      }
    });

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
              Adding Supplier...
            </p>
          </div>
        </div>
      )}

      <Form {...supplierForm}>
        <form
          id="add-new-supplier-form"
          className={cn(
            'p-1 w-full',
            className,
            isSubmitting && 'pointer-events-none'
          )}
          onSubmit={supplierForm.handleSubmit(onSubmit)}
        >
          <Tab tabs={tabs} defaultTab={tabs[0].name} className="w-full" />

          <Separator className="my-4" />

          {/* Form Actions */}
          <div className={cn('flex justify-end space-x-2 col-span-2 mb-6')}>
            {isDesktop && (
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {!isEditing && (
              <Button
                form="add-new-supplier-form"
                className={!isDesktop ? 'w-full -mb-4' : 'cursor-pointer'}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Supplier...' : 'Add Supplier'}
              </Button>
            )}
            {isEditing && (
              <Button
                form="add-new-supplier-form"
                type="submit"
                className={!isDesktop ? 'w-full -mb-4' : 'cursor-pointer'}
              >
                Save Changes
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
