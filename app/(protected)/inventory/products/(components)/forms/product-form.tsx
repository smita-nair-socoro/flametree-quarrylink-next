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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

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

  const materialTypeOptions = [
    { label: 'Steel', value: 'Steel' },
    { label: 'Aluminum', value: 'Aluminum' },
    { label: 'Green Waste', value: 'Green Waste' },
    { label: 'Concrete', value: 'Concrete' },
    { label: 'Sand', value: 'Sand' },
    { label: 'Gravel', value: 'Gravel' },
    { label: 'Limestone', value: 'Limestone' },
    { label: 'Brick', value: 'Brick' },
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
      created_by: 'current_user',
      last_modified_by: 'current_user',
    },
  });

  async function onSubmit(values: z.infer<typeof NewProductFormSchema>) {
    console.log('onSubmit function called!');
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
            'gap-6 p-1 w-full mt-6',
            isDesktop ? 'grid grid-cols-2 gap-x-8' : 'grid grid-cols-1',
            className,
            isSubmitting && 'pointer-events-none'
          )}
          onSubmit={productForm.handleSubmit(onSubmit)}
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
                <FormLabel>Product Description*</FormLabel>
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

          {/* Audit Information */}
          {isEditing && (
            <div
              className={cn(
                isDesktop ? 'col-span-2' : 'col-span-1',
                'space-y-6 mt-6'
              )}
            >
              <h2 className="text-lg font-semibold">Audit Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 gap-6 md:max-w-3xl">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Created By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct?.created_by || 'N/A'}
                  </p>
                </div>

                <div className="flex flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Last Modified By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct?.last_modified_by || 'N/A'}
                  </p>
                </div>

                <div className="flex flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">
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

                <div className="flex flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">
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

          <Separator className={cn(isDesktop ? 'col-span-2' : 'col-span-1')} />

          {/* Form Actions */}
          <div
            className={cn(
              'mb-6',
              isDesktop
                ? 'col-span-2 flex justify-end space-x-2'
                : 'col-span-1 flex flex-col space-y-2 gap-3'
            )}
          >
            {!isEditing && (
              <Button
                form="add-new-product-form"
                className={!isDesktop ? 'w-full' : 'cursor-pointer'}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Product...' : 'Add Product'}
              </Button>
            )}

            {isDesktop && (
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
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
