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
import { useSelectedProduct } from '@/app/stores/product-store';
import { NewProductFormSchema } from './schemas/product-form-schema';
import { supplierColumns } from '../../(components)/(data-tables)/supplier/columns';
import { Textarea } from '@/components/ui/textarea';
import { DataTableClient } from '@/components/ui/data-table-client';
import { ChartColumn } from 'lucide-react';
import { FormDialog } from '@/components/form-dialog';
import SupplierForm from './supplier-form';
import { convertKeysToSnakeCase } from '@/lib/utils/case-conversion';
import { ActionDialog } from '@/components/action-dialog';
import { tnPricingColumn } from '../(data-tables)/supplier-comparison/tn-pricing-column';
import { m3PricingColumn } from '../(data-tables)/supplier-comparison/m3-pricing-column';
import { kgPricingColumn } from '../(data-tables)/supplier-comparison/kg-pricing-column';
import { bulkaPricingColumn } from '../(data-tables)/supplier-comparison/bulka-pricing.column';
import { truckRateComparisonColumn } from '../(data-tables)/supplier-comparison/truck-rate-comparison';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
}

export default function ProductForm({ id, onCancel, className }: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const selectedProduct = useSelectedProduct();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [totalSupplier, setTotalSupplier] = React.useState(0);
  const [isCompareDialogOpen, setIsCompareDialogOpen] = React.useState(false);

  const convertedProduct = convertKeysToSnakeCase(selectedProduct);

  const materialTypeOptions = [
    { label: 'Aggregate', value: 'AGGREGATE' },
    { label: 'Crushed Rock', value: 'CRUSHED ROCK' },
    { label: 'Dust', value: 'DUST' },
    { label: 'Soil', value: 'SOIL' },
    { label: 'Sand', value: 'SAND' },
  ];

  // TODO: Zod Validation
  const productForm = useForm<z.infer<typeof NewProductFormSchema>>({
    resolver: zodResolver(NewProductFormSchema),
    defaultValues: {
      product_name: isEditing ? selectedProduct?.product_name || '' : '',
      product_code: isEditing ? selectedProduct?.product_code || '' : '',
      material_type: isEditing ? selectedProduct?.material_type || '' : '',
      product_description: isEditing
        ? selectedProduct?.product_description || ''
        : '',
      density_tonnage_per_m3: isEditing
        ? selectedProduct?.density_tonnage_per_m3 || 0
        : 0,
      created_at: undefined,
      updated_at: undefined,
      created_by: isEditing ? selectedProduct?.created_by || '' : '',
      last_modified_by: isEditing
        ? selectedProduct?.last_modified_by || ''
        : '',
    },
  });

  React.useEffect(() => {
    setTotalSupplier(selectedProduct?.quarries.length || 0);
  }, [selectedProduct]);

  async function onSubmit(values: z.infer<typeof NewProductFormSchema>) {
    console.log('Product Form Values:', values);

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

      <span className="text-lg font-semibold">Product Details</span>

      <Form {...productForm}>
        <form
          id="add-new-product-form"
          className={cn(
            'gap-5 p-1 w-full flex flex-col',
            className,
            isSubmitting && 'pointer-events-none'
          )}
          onSubmit={productForm.handleSubmit(onSubmit)}
        >
          <div
            className={cn(
              'gap-1 p-1 w-full mt-4',
              isDesktop ? 'grid grid-cols-2 gap-x-8' : 'grid grid-cols-1',
              className,
              isSubmitting && 'pointer-events-none'
            )}
          >
            <FormField
              control={productForm.control}
              name="product_name"
              render={({ field }) => (
                <FormItem className="col-span-1">
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

            {/* Product Code */}
            <FormField
              control={productForm.control}
              name="product_code"
              render={({ field }) => (
                <FormItem className="col-span-1">
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

            {/* Material Type */}
            <FormSelect
              control={productForm.control}
              name="material_type"
              label="Material Type*"
              options={materialTypeOptions}
              placeholder="Select Material Type"
              showSearch={true}
              className="col-span-1"
            />

            {/* Density (TN/m³) */}
            <FormField
              control={productForm.control}
              name="density_tonnage_per_m3"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Density (TN/m³)*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Density Tonnage per m3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Description */}
            <FormField
              control={productForm.control}
              name="product_description"
              render={({ field }) => (
                <FormItem className={isDesktop ? 'col-span-2' : 'col-span-1'}>
                  <FormLabel>Product Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="w-full"
                      placeholder="Enter Product Description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Supplier Table */}
          <div className="flex flex-col gap-4">
            <div
              className={cn(
                isDesktop
                  ? 'flex justify-between items-center'
                  : 'flex flex-col gap-4'
              )}
            >
              <div className="flex flex-col gap-0">
                <span className="text-lg font-semibold">
                  Supplier Information
                </span>
                {isEditing && (
                  <span className="text-sm text-gray-500">
                    {totalSupplier} suppliers configured with pricing and truck
                    rates
                  </span>
                )}
                {!isEditing && (
                  <span className="text-sm text-gray-500">
                    Add suppliers after creaeting the product
                  </span>
                )}
              </div>

              <div
                className={cn('flex items-center gap-2', !isDesktop && 'mb-2')}
              >
                {isEditing && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => setIsCompareDialogOpen(true)}
                  >
                    <ChartColumn className="mr-3" />
                    Compare All
                  </Button>
                )}
                <FormDialog
                  dialogTitle="Add New Supplier"
                  buttonTitle="Add Supplier"
                  dialogWidth="700px"
                  contentClass="-mt-5"
                >
                  <SupplierForm />
                </FormDialog>
              </div>
            </div>

            {/* Compare All Dialog */}
            <ActionDialog
              open={isCompareDialogOpen}
              onOpenChangeAction={setIsCompareDialogOpen}
              customWidth="!max-w-[60vw]"
              title={`Compare All - ${totalSupplier} suppliers`}
              content={
                <div className="flex flex-col space-y-4">
                  <span className="text-lg font-semibold text-[#101828]">
                    Pricing Comparison
                  </span>
                  <span className="font-normal text-[#364153]">TN Pricing</span>
                  <DataTableClient
                    columns={tnPricingColumn}
                    data={convertedProduct?.quarries || []}
                    simpleTable={true}
                    useColumnSizing={true}
                  />
                  <span className="font-normal text-[#364153]">m³ Pricing</span>
                  <DataTableClient
                    columns={m3PricingColumn}
                    data={convertedProduct?.quarries || []}
                    simpleTable={true}
                    useColumnSizing={true}
                  />
                  <span className="font-normal text-[#364153]">
                    20kg Pricing
                  </span>
                  <DataTableClient
                    columns={kgPricingColumn}
                    data={convertedProduct?.quarries || []}
                    simpleTable={true}
                    useColumnSizing={true}
                  />
                  <span className="font-normal text-[#364153]">
                    Bulka Pricing
                  </span>
                  <DataTableClient
                    columns={bulkaPricingColumn}
                    data={convertedProduct?.quarries || []}
                    simpleTable={true}
                    useColumnSizing={true}
                  />
                  <span className="text-lg font-semibold text-[#101828]">
                    Truck Rates Comparison
                  </span>
                  <DataTableClient
                    columns={truckRateComparisonColumn}
                    data={convertedProduct?.quarries || []}
                    simpleTable={true}
                    useColumnSizing={true}
                  />
                </div>
              }
              confirmActionNeeded={false}
            />

            {/* Supplier Table */}
            <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
              <DataTableClient
                columns={supplierColumns}
                data={isEditing ? convertedProduct?.quarries ?? [] : []}
                simpleTable={true}
              />
            </div>
          </div>

          {/* Audit Information */}
          {isEditing && (
            <div className="col-span-full space-y-6 mt-10 mb-4">
              <h2 className="text-2xl font-bold">Audit Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 md:pl-2 gap-6 md:max-w-3xl">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Created By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct?.created_by || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Last Modified By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct?.last_modified_by || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Created Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct?.created_at
                      ? new Date(selectedProduct.created_at).toLocaleDateString(
                          'en-AU',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          }
                        )
                      : 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Modified Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct?.updated_at
                      ? new Date(selectedProduct.updated_at).toLocaleDateString(
                          'en-AU',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          }
                        )
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div
            className={cn(
              'mb-6',
              isDesktop
                ? 'col-span-2 flex justify-end space-x-2'
                : 'col-span-1 flex flex-col space-y-2 gap-3'
            )}
          >
            {isDesktop && (
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {!isEditing && (
              <Button
                form="add-new-product-form"
                className={!isDesktop ? 'w-full' : 'cursor-pointer'}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Product...' : 'Create Product'}
              </Button>
            )}

            {isEditing && (
              <Button
                form="add-new-product-form"
                type="submit"
                className={!isDesktop ? 'w-full' : 'cursor-pointer'}
              >
                Save Changes
              </Button>
            )}
            {!isDesktop && (
              <Button
                variant="outline"
                type="button"
                onClick={onCancel}
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
