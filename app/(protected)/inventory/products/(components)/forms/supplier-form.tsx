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

export default function ProductForm({ id, onCancel, className }: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const selectedSupplier = useSelectedSupplier();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [supplierProductName, setSupplierProductName] = React.useState('');
  const [supplierProductCode, setSupplierProductCode] = React.useState('');

  const supplierOptions = [
    { label: 'Supplier 1', value: 'SUPPLIER_1' },
    { label: 'Supplier 2', value: 'SUPPLIER_2' },
    { label: 'Supplier 3', value: 'SUPPLIER_3' },
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
      cost_price_TN: isEditing ? selectedSupplier?.price.TN_cost_price || 0 : 0,
      sell_price_TN: isEditing ? selectedSupplier?.price.TN_sell_price || 0 : 0,
      cost_price_M3: isEditing ? selectedSupplier?.price.M3_cost_price || 0 : 0,
      sell_price_M3: isEditing ? selectedSupplier?.price.M3_sell_price || 0 : 0,
      cost_price_KG: isEditing
        ? selectedSupplier?.price.KG_20_cost_price || 0
        : 0,
      sell_price_KG: isEditing
        ? selectedSupplier?.price.KG_20_sell_price || 0
        : 0,
      cost_price_Bulk: isEditing
        ? selectedSupplier?.price.BULKA_cost_price || 0
        : 0,
      sell_price_Bulk: isEditing
        ? selectedSupplier?.price.BULKA_sell_price || 0
        : 0,
      margin_TN: isEditing ? selectedSupplier?.price.margin_TN || 0 : 0,
      margin_M3: isEditing ? selectedSupplier?.price.margin_M3 || 0 : 0,
      margin_KG: isEditing ? selectedSupplier?.price.margin_KG || 0 : 0,
      margin_BULK: isEditing ? selectedSupplier?.price.margin_BULK || 0 : 0,
      available_for_sale_TN: isEditing
        ? selectedSupplier?.price.available_for_sale_TN || false
        : false,
      available_for_sale_M3: isEditing
        ? selectedSupplier?.price.available_for_sale_M3 || false
        : false,
      available_for_sale_KG: isEditing
        ? selectedSupplier?.price.available_for_sale_KG || false
        : false,
      available_for_sale_Bulk: isEditing
        ? selectedSupplier?.price.available_for_sale_Bulk || false
        : false,
      truck_TN_rate: isEditing ? selectedSupplier?.price.truck_TN_rate || 0 : 0,
      truck_M3_rate: isEditing ? selectedSupplier?.price.truck_M3_rate || 0 : 0,
      truck_hourly_rate: isEditing
        ? selectedSupplier?.price.truck_hourly_rate || 0
        : 0,
      truck_load_rate: isEditing
        ? selectedSupplier?.price.truck_load_rate || 0
        : 0,
      available_truck_TN_rate: isEditing
        ? selectedSupplier?.price.available_truck_TN_rate || false
        : false,
      available_truck_M3_rate: isEditing
        ? selectedSupplier?.price.available_truck_M3_rate || false
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
