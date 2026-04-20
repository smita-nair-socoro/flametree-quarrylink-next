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
import { NewProductFormSchema } from './schemas/product-form-schema';
import { supplierColumns } from '../../(components)/(data-tables)/supplier/columns';
import { Textarea } from '@/components/ui/textarea';
import { DataTableClient } from '@/components/ui/data-table-client';
import { MobileLineItem } from '@/components/mobile/mobile-line-item';
import { SupplierTableActions } from '../(data-tables)/supplier/supplier-table-actions';
import { ChartColumn, Check } from 'lucide-react';
import { FormDialog } from '@/components/form-dialog';
import SupplierForm from './supplier-form';
import { ActionDialog } from '@/components/action-dialog';
import { CompareSupplierTable } from '../(data-tables)/supplier-comparison/compare-supplier-table';
import { useQuery } from '@tanstack/react-query';
import { notifyError, notifySuccess } from '@/lib/toast';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import { addNewRecordId } from '@/lib/utils';
import {
  ProductDetailWithQuarrySupplierProductQueryOptions,
  useCreateProduct,
  useUpdateProduct,
} from '@/lib/api/product';
import { MaterialsListQueryOptions } from '@/lib/api/material';
import { ProductDetails } from '@/lib/types/product';
import { Separator } from '@/components/ui/separator';
import { AuditInformation } from '@/components/audit-information';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  className?: string;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

import {
  useProductFormState,
  EMPTY_PRODUCT_FORM_VALUES,
} from '@/hooks/product/use-product-form-state';

export default function ProductForm({
  id,
  onCancel,
  onSuccess,
  onSaved,
  className,
  onDirtyChange,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCompareDialogOpen, setIsCompareDialogOpen] = React.useState(false);

  // Create flow steps (only used when creating a new product)
  const [createStep, setCreateStep] = React.useState<1 | 2>(1);

  // Track newly created product ID
  const [createdProductId, setCreatedProductId] = React.useState<number | null>(
    null,
  );
  const [productJustCreated, setProductJustCreated] = React.useState(false);

  // Get the active product ID (either passed in or newly created)
  const activeProductId = id || createdProductId;

  // When product is created, automatically move to Supplier Info step
  React.useEffect(() => {
    if (!isEditing && productJustCreated) {
      setCreateStep(2);
    }
  }, [isEditing, productJustCreated]);

  // Fetch product with quarries/suppliers - single API call for everything
  const {
    data: productData,
    isLoading: isLoadingProduct,
    error: productError,
    isError: isProductError,
  } = useQuery({
    ...ProductDetailWithQuarrySupplierProductQueryOptions(activeProductId ?? 0),
    enabled: !!activeProductId && (isEditing || productJustCreated),
  });

  // Fetch materials for the dropdown
  const {
    data: materialsData,
    isLoading: isLoadingMaterials,
    error: materialsError,
    isError: isMaterialsError,
  } = useQuery(MaterialsListQueryOptions());

  React.useEffect(() => {
    if (isProductError && productError) {
      console.error('Product API Error:', productError);
    }
    if (isMaterialsError && materialsError) {
      console.error('Materials API Error:', materialsError);
    }
  }, [isProductError, productError, isMaterialsError, materialsError]);

  // Convert product data to snake_case (includes both product details and supplier info)
  const selectedProduct: ProductDetails | null = React.useMemo(() => {
    if (!productData) return null;
    return productData;
  }, [productData]);

  // Map materials to options
  const materialTypeOptions = React.useMemo(() => {
    if (!materialsData) return [];
    return materialsData.map((material) => ({
      label: material.name,
      value: material.id,
    }));
  }, [materialsData]);

  const productForm = useForm<z.infer<typeof NewProductFormSchema>>({
    resolver: zodResolver(NewProductFormSchema),
    defaultValues: EMPTY_PRODUCT_FORM_VALUES,
  });

  const { latestAuditData, totalSupplier } = useProductFormState(
    selectedProduct,
    isEditing,
    productJustCreated,
    productForm,
  );

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(productForm.formState.isDirty);
  }, [productForm.formState.isDirty, onDirtyChange]);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  async function onSubmit(values: z.infer<typeof NewProductFormSchema>) {
    console.log('Product Form Values:', values);

    setIsSubmitting(true);

    try {
      const payload = {
        productName: values.product_name,
        productCode: values.product_code,
        materialId: values.material_id,
        densityTonnagePerM3: values.density_tonnage_per_m3,
        productDescription: values.product_description,
        isActive: true,
        version: selectedProduct?.version || 0,
      };

      // Convert to camelCase as API expects camelCase keys
      if (isEditing && id) {
        // Update existing product
        await updateProduct.mutateAsync({
          id: id,
          data: { ...payload, id },
        });
        console.log('Product updated successfully!');

        // Clear dirty state in parent dialog, then close
        onSaved?.();
        onSuccess?.();
      } else {
        // Create new product
        const createdProduct = await createProduct.mutateAsync(payload);
        console.log('Product created successfully!', createdProduct);

        // Add the new record ID to sessionStorage for highlighting
        if (createdProduct && typeof createdProduct.id === 'number') {
          addNewRecordId('product_main_data_table', createdProduct.id);
        }

        // Store the created product ID and mark as just created
        if (
          createdProduct &&
          typeof createdProduct === 'object' &&
          'id' in createdProduct
        ) {
          setCreatedProductId(createdProduct.id as number);
          setProductJustCreated(true);
          notifySuccess(
            'Product created successfully. You can now add suppliers.',
          );
          setCreateStep(2);
          console.log('Product ID stored:', createdProduct.id);
        }

        // Don't close the form - let user add suppliers
        // Form will stay open with the "Add Supplier" button enabled
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} product:`,
        error,
      );
      // Extract normalized error response and message
      const err = extractErrorResponse(error);
      const extractedMessage = extractErrorMessage(error);
      const codeStr = err?.code ? String(err.code) : undefined;
      const messageFromErr = err?.message || extractedMessage;
      console.log('messageFromErr', messageFromErr);

      // Duplicate product code (HTTP 409) — match the product_code in backend message
      const duplicateKeyPhrase = `[ERROR: duplicate key value violates unique constraint "uq_product_code_ci"`;
      const isDuplicateProductCode =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        messageFromErr.includes(duplicateKeyPhrase);

      if (isDuplicateProductCode) {
        const msg = `Duplicate product code "${values.product_code}" already exists.`;
        notifyError(msg);
        productForm.setError('product_code', { type: 'manual', message: msg });
        return;
      }

      // Fallback error using extracted message
      notifyError(
        messageFromErr || 'Failed to save product. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading state when fetching product details or materials
  if (
    isLoadingMaterials ||
    ((isEditing || productJustCreated) && isLoadingProduct)
  ) {
    return (
      <div className="w-full flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="medium" />
          <p className="text-lg text-muted-foreground font-bold">
            {isLoadingMaterials
              ? 'Loading materials...'
              : 'Loading product details...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (
    isMaterialsError ||
    ((isEditing || productJustCreated) && isProductError)
  ) {
    return (
      <div className="w-full flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg text-destructive font-bold mb-2">
            {isMaterialsError
              ? 'Error loading materials'
              : 'Error loading product details'}
          </p>
          <p className="text-sm text-muted-foreground">
            {materialsError?.message ||
              productError?.message ||
              'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
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

      {/* Stepper - only for create flow */}
      {!isEditing && (
        <div className="mb-5">
          <div className="w-[70%] md:w-1/2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center border text-sm font-semibold',
                  createStep === 1
                    ? 'border-[#7C3AED] text-[#7C3AED]'
                    : 'bg-[#7C3AED] border-[#7C3AED] text-white',
                )}
              >
                {createStep === 1 ? '1' : <Check className="h-4 w-4" />}
              </span>
              <span className="text-sm font-medium text-[#101828]">
                Product Details
              </span>
              <div className="flex-1 h-px bg-border" />

              <span
                className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center border text-sm font-semibold',
                  createStep === 2
                    ? 'border-[#7C3AED] text-[#7C3AED]'
                    : 'border-muted-foreground/30 text-muted-foreground',
                )}
              >
                2
              </span>
              <span className="text-sm font-medium text-[#101828]">
                Supplier Info
              </span>
            </div>
          </div>
          <Separator className="my-5" />
        </div>
      )}

      {(isEditing || createStep === 1) && (
        <span className="text-lg font-semibold">Product Details</span>
      )}

      <Form {...productForm}>
        <form
          id="add-new-product-form"
          className={cn(
            'gap-5 w-full flex flex-col',
            className,
            isSubmitting && 'pointer-events-none',
          )}
          onSubmit={productForm.handleSubmit(onSubmit)}
        >
          {(isEditing || createStep === 1) && (
            <>
              <div
                className={cn(
                  'gap-1 w-full mt-4',
                  isDesktop ? 'grid grid-cols-2 gap-x-8' : 'grid grid-cols-1',
                  className,
                  isSubmitting && 'pointer-events-none',
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
                  name="material_id"
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
                          isNumber
                          allowDecimal
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
                    <FormItem
                      className={isDesktop ? 'col-span-2' : 'col-span-1'}
                    >
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

              {!isEditing && <Separator className="w-full" />}

              <div
                className={cn(
                  'flex items-center gap-2',
                  isEditing
                    ? 'justify-end -mt-5 mb-3 '
                    : 'justify-between mb-5',
                )}
              >
                <Button variant="outline" type="button" onClick={onCancel}>
                  Cancel
                </Button>

                {isEditing ? (
                  <Button
                    form="add-new-product-form"
                    type="submit"
                    className="cursor-pointer"
                  >
                    Save Changes
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    {!productJustCreated && (
                      <Button
                        form="add-new-product-form"
                        className="cursor-pointer"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Adding Product...' : 'Create Product'}
                      </Button>
                    )}

                    {productJustCreated && (
                      <>
                        <Button
                          variant="outline"
                          disabled
                          className="cursor-not-allowed"
                        >
                          ✓ Product Created
                        </Button>
                        <Button type="button" onClick={() => setCreateStep(2)}>
                          Next
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Supplier Table */}
          {(isEditing || createStep === 2) && (
            <div className="flex flex-col gap-4 mb-10">
              <div
                className={cn(
                  isDesktop
                    ? 'flex justify-between items-center'
                    : 'flex flex-col gap-4',
                )}
              >
                <div className="flex flex-col gap-0">
                  <span className="text-lg font-semibold">
                    Quarry / Supplier Information
                  </span>
                  {isEditing ? (
                    <span className="text-sm text-gray-500">
                      {totalSupplier}{' '}
                      {totalSupplier === 1
                        ? 'quarry / supplier'
                        : 'quarries / suppliers'}{' '}
                      configured with pricing and truck rates
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Add quarry / supplier after creating the product
                    </span>
                  )}
                </div>

                <div
                  className={cn(
                    'flex items-center gap-2',
                    !isDesktop && 'mb-2',
                  )}
                >
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => setIsCompareDialogOpen(true)}
                      disabled={
                        totalSupplier === 0 ||
                        !selectedProduct?.quarrySupplierProducts ||
                        selectedProduct.quarrySupplierProducts.length === 0
                      }
                    >
                      <ChartColumn className="mr-3" />
                      Compare All
                    </Button>
                  )}
                  {(isEditing || productJustCreated) && (
                    <FormDialog
                      dialogTitle="Add New Supplier"
                      buttonTitle="Add Quarry / Supplier"
                      dialogWidth="700px"
                      contentClass="-mt-5"
                    >
                      <SupplierForm productId={activeProductId ?? undefined} />
                    </FormDialog>
                  )}
                </div>
              </div>

              {/* Compare All Dialog */}
              <ActionDialog
                open={isCompareDialogOpen}
                onOpenChangeAction={setIsCompareDialogOpen}
                customWidth="!max-w-[95vw] 2xl:!max-w-[1200px]"
                cancelText="Close"
                padding="p-0 gap-0"
                titlePadding="px-5"
                title={`Compare All – ${totalSupplier} Suppliers`}
                content={
                  <CompareSupplierTable
                    data={selectedProduct?.quarrySupplierProducts || []}
                    productName={selectedProduct?.productName}
                  />
                }
                cancelButtonClass="mx-5 my-3"
                confirmActionNeeded={false}
                cancelActionNeeded={isDesktop ? false : true}
              />

              {/* Supplier Table / Cards */}
              <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
                {isDesktop ? (
                  <DataTableClient
                    columns={supplierColumns(selectedProduct?.id)}
                    data={
                      isEditing || productJustCreated
                        ? (selectedProduct?.quarrySupplierProducts ?? [])
                        : []
                    }
                    simpleTable={true}
                    defaultSorting={[{ id: 'name', desc: false }]}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {(isEditing || productJustCreated
                      ? (selectedProduct?.quarrySupplierProducts ?? [])
                      : []
                    ).map((supplier) => {
                      const cost = supplier.perTnCostPrice || 0;
                      const sell = supplier.perTnSellPrice || 0;
                      const margin =
                        sell === 0 ? 0 : ((sell - cost) / sell) * 100;
                      return (
                        <MobileLineItem
                          key={supplier.quarrySupplierId}
                          title={supplier.quarrySupplier?.name || 'Unknown'}
                          subtitle={supplier.supplierProductName || 'N/A'}
                          costPrice={cost}
                          sellPrice={sell}
                          costLabel="Cost (TN)"
                          sellLabel="Sell (TN)"
                          profitLabel="Margin"
                          profitValue={margin}
                          actions={
                            <SupplierTableActions
                              quarry={supplier}
                              productId={
                                selectedProduct?.id ?? supplier.productId
                              }
                            />
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Create flow footer buttons (Step 2) */}
              {!isEditing && <Separator className="w-full mt-5 mb-2" />}

              {!isEditing && createStep === 2 && (
                <div className="flex justify-between items-center -mb-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setCreateStep(1)}
                  >
                    Back to Details
                  </Button>
                  <Button type="button" onClick={onCancel}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          )}

          {isEditing && (
            <AuditInformation
              createdBy={selectedProduct?.createdBy}
              lastModifiedBy={latestAuditData?.lastModifiedBy}
              createdAt={selectedProduct?.createdAt}
              updatedAt={latestAuditData?.updatedAt}
            />
          )}
        </form>
      </Form>
    </div>
  );
}
