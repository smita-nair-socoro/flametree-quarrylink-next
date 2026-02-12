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
import { NewSupplierFormSchema } from './schemas/supplier-form-schema';
import { Tab } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PricingConfigurationTable } from './(form-tables)/pricing-configuration-table';
import { TruckRatesTable } from './(form-tables)/truck-rates-table';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  QuarrySupplierProductDetailQueryOptions,
  useCreateQuarrySupplierProduct,
  useUpdateQuarrySupplierProduct,
} from '@/lib/api/quarry-supplier-product';
import { QuarriesListQueryOptions } from '@/lib/api/quarry';
import { notifySuccess, notifyError } from '@/lib/toast';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';

interface FormProps {
  productId?: number;
  quarrySupplierId?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  className?: string;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

import {
  useQuarrySupplierProductState,
  EMPTY_SUPPLIER_FORM_VALUES,
} from '@/hooks/product/use-quarry-supplier-product-form-state';

export default function SupplierForm({
  productId,
  quarrySupplierId,
  onCancel,
  onSuccess,
  onSaved,
  className,
  onDirtyChange,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(quarrySupplierId && productId));

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch quarry-supplier-product details if editing
  const {
    data: quarrySupplierProductData,
    isLoading: isLoadingData,
    error: dataError,
    isError: isDataError,
  } = useQuery({
    ...QuarrySupplierProductDetailQueryOptions(quarrySupplierId!, productId!),
    enabled: isEditing && !!quarrySupplierId && !!productId,
  });

  // Fetch quarries/suppliers list
  const {
    data: quarriesData,
    isLoading: isLoadingQuarries,
    error: quarriesError,
    isError: isQuarriesError,
  } = useQuery(QuarriesListQueryOptions());

  const createQuarrySupplierProduct = useCreateQuarrySupplierProduct();
  const updateQuarrySupplierProduct = useUpdateQuarrySupplierProduct();

  React.useEffect(() => {
    if (isDataError && dataError) {
      console.error('Quarry Supplier Product API Error:', dataError);
    }
    if (isQuarriesError && quarriesError) {
      console.error('Quarries API Error:', quarriesError);
    }
  }, [isDataError, dataError, isQuarriesError, quarriesError]);

  // Convert API response from camelCase to snake_case
  const convertedQuarrySupplierProduct = React.useMemo(() => {
    if (!quarrySupplierProductData) return null;
    return quarrySupplierProductData;
  }, [quarrySupplierProductData]);

  // Map quarries to supplier options
  const supplierOptions = React.useMemo(() => {
    if (!quarriesData) return [];

    return quarriesData.map((quarry) => {
      return {
        label: quarry.name,
        value: quarry.id,
      };
    });
  }, [quarriesData]);

  // TODO: Zod Validation
  const supplierForm = useForm<z.infer<typeof NewSupplierFormSchema>>({
    resolver: zodResolver(NewSupplierFormSchema),
    defaultValues: EMPTY_SUPPLIER_FORM_VALUES,
  });

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(supplierForm.formState.isDirty);
  }, [supplierForm.formState.isDirty, onDirtyChange]);

  const {
    supplierProductName,
    supplierProductCode,
    watchedCostTN,
    watchedSellTN,
    watchedCostM3,
    watchedSellM3,
    watchedCostKG,
    watchedSellKG,
    watchedCostBulk,
    watchedSellBulk,
  } = useQuarrySupplierProductState(
    convertedQuarrySupplierProduct,
    isEditing,
    supplierForm,
  );

  const tabs = [
    {
      name: 'Supplier Details',
      content: (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between gap-4">
            <FormSelect
              control={supplierForm.control}
              name="quarry_supplier_id"
              label="Supplier Name*"
              searchLabel="Suppliers"
              options={supplierOptions}
              placeholder="Select a Supplier"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Trigger validation
    const isValid = await supplierForm.trigger();

    if (!isValid) {
      // Check if all errors are warnings
      const errors = supplierForm.formState.errors;
      const hasNonWarningErrors = Object.values(errors).some((error) => {
        // Check if this error is NOT a warning
        // Warnings have params.warning === true in the Zod schema
        const message = error?.message;
        return !(
          typeof message === 'string' && message.startsWith('⚠️ Warning:')
        );
      });

      if (!hasNonWarningErrors) {
        // Only warnings exist, allow submission
        const values = supplierForm.getValues();
        await onSubmit(values);
        return;
      }
    }

    // Normal submission flow (no errors or non-warning errors exist)
    supplierForm.handleSubmit(onSubmit)(e);
  };

  async function onSubmit(values: z.infer<typeof NewSupplierFormSchema>) {
    console.log('onSubmit function called!');
    console.log('Supplier Form Values:', values);

    if (!productId) {
      console.error('Product ID is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Reset pricing values to 0 if availability switches are off
      const processedValues = { ...values };

      // Convert prices from dollars to cents for database storage
      const priceFieldsToConvert = [
        'cost_price_tn',
        'sell_price_tn',
        'cost_price_m3',
        'sell_price_m3',
        'cost_price_kg',
        'sell_price_kg',
        'cost_price_bulka',
        'sell_price_bulka',
        'truck_tn_rate',
        'truck_m3_rate',
        'truck_kg_rate',
        'truck_bulka_rate',
        'truck_hourly_rate',
        'truck_load_rate',
        'truck_km_rate',
      ] as const;

      priceFieldsToConvert.forEach((field) => {
        if (
          processedValues[field] &&
          typeof processedValues[field] === 'number'
        ) {
          processedValues[field] = Math.round(
            (processedValues[field] as number) * 100,
          );
        }
      });

      // Build available units array based on availability switches
      const availableUnits: string[] = [];
      if (processedValues.available_for_sale_tn) availableUnits.push('TN');
      if (processedValues.available_for_sale_m3) availableUnits.push('M3');
      if (processedValues.available_for_sale_kg) availableUnits.push('20KG');
      if (processedValues.available_for_sale_bulka)
        availableUnits.push('BULKA');

      const payload = {
        quarrySupplierId: processedValues.quarry_supplier_id, // Quarry ID from dropdown
        productId: productId,
        supplierProductName: processedValues.supplier_product_name,
        supplierProductCode: processedValues.supplier_product_code,
        availableUnits: availableUnits, // Send as array, not JSON string
        perTnCostPrice: processedValues.cost_price_tn,
        perTnSellPrice: processedValues.sell_price_tn,
        perM3CostPrice: processedValues.cost_price_m3,
        perM3SellPrice: processedValues.sell_price_m3,
        per20kgCostPrice: processedValues.cost_price_kg,
        per20kgSellPrice: processedValues.sell_price_kg,
        perBulkaCostPrice: processedValues.cost_price_bulka,
        perBulkaSellPrice: processedValues.sell_price_bulka,
        tnTruckRate: processedValues.truck_tn_rate,
        m3TruckRate: processedValues.truck_m3_rate,
        hourlyTruckRate: processedValues.truck_hourly_rate,
        loadTruckRate: processedValues.truck_load_rate,
        kmTruckRate: processedValues.truck_km_rate,
        kg20TruckRate: processedValues.truck_kg_rate,
        bulkaTruckRate: processedValues.truck_bulka_rate,
        availableForSaleTn: processedValues.available_for_sale_tn,
        availableForSaleM3: processedValues.available_for_sale_m3,
        availableForSale20kg: processedValues.available_for_sale_kg,
        availableForSaleBulka: processedValues.available_for_sale_bulka,
        availableForTruckRateTn: processedValues.available_truck_tn_rate,
        availableForTruckRateM3: processedValues.available_truck_m3_rate,
        availableForTruckRate20kg: processedValues.available_truck_kg_rate,
        availableForTruckRateBulka: processedValues.available_truck_bulka_rate,
        availableForTruckRateHour: processedValues.available_truck_hourly_rate,
        availableForTruckRateLoad: processedValues.available_truck_load_rate,
        availableForTruckRateKm: processedValues.available_truck_km_rate,
        isActive: true,
        version: convertedQuarrySupplierProduct?.version || 0,
      };

      if (isEditing && quarrySupplierId) {
        // Update existing quarry-supplier-product
        await updateQuarrySupplierProduct.mutateAsync({
          quarrySupplierId,
          productId,
          data: payload,
        });
        console.log('Quarry Supplier Product updated successfully!');
      } else {
        // Create new quarry-supplier-product
        await createQuarrySupplierProduct.mutateAsync(payload);
        console.log('Quarry Supplier Product created successfully!');
      }

      // Check if there are any negative margins and show info notification
      const units = ['tn', 'm3', 'kg', 'bulka'] as const;
      const negativeMarginUnits: string[] = [];

      for (const unit of units) {
        const costPrice =
          (processedValues[`cost_price_${unit}`] as number) || 0;
        const sellPrice =
          (processedValues[`sell_price_${unit}`] as number) || 0;
        const isAvailable = processedValues[
          `available_for_sale_${unit}`
        ] as boolean;

        // Convert back from cents to dollars for comparison
        const costInDollars = costPrice / 100;
        const sellInDollars = sellPrice / 100;

        if (isAvailable && sellInDollars > 0 && costInDollars > sellInDollars) {
          const unitLabel =
            unit === 'tn'
              ? 'TN'
              : unit === 'm3'
                ? 'm³'
                : unit === 'kg'
                  ? '20kg'
                  : 'Bulka';
          negativeMarginUnits.push(unitLabel);
        }
      }

      // Show success notification with warning if negative margins exist
      if (negativeMarginUnits.length > 0) {
        notifySuccess(
          `Supplier ${isEditing ? 'updated' : 'added'} successfully!`,
          {
            description: `Note: Negative margin on ${negativeMarginUnits.join(
              ', ',
            )}`,
          },
        );
      } else {
        notifySuccess(
          `Supplier ${isEditing ? 'updated' : 'added'} successfully!`,
        );
      }

      // Clear dirty state in parent dialog, then close
      onSaved?.();
      onSuccess?.();
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} quarry supplier product:`,
        error,
      );
      // Extract normalized error response and message
      const err = extractErrorResponse(error);
      const extractedMessage = extractErrorMessage(error);
      const codeStr = err?.code ? String(err.code) : undefined;
      const messageFromErr = err?.message || extractedMessage;

      // Duplicate supplier product code (HTTP 409)
      const duplicateKeyPhrase = `Key (supplier_product_code)=(${values.supplier_product_code}) already exists`;
      const isDuplicateProductCode =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        messageFromErr.includes(duplicateKeyPhrase);

      if (isDuplicateProductCode) {
        const msg = `Duplicate supplier product code "${values.supplier_product_code}" already exists for this product.`;
        notifyError(msg);
        supplierForm.setError('supplier_product_code', {
          type: 'manual',
          message: msg,
        });
        return;
      }

      // e.g. "Key (quarry_supplier_id, product_id)=(2, 3) already exists"
      // Don't match the IDs (they can vary / include different spacing); match the stable phrase instead.
      const duplicateSupplierForProductPhrase =
        'Key (quarry_supplier_id, product_id)=';
      const duplicateSupplierForProductSuffix = 'already exists';
      const isDuplicateSupplierForProduct =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        ((messageFromErr.includes(duplicateSupplierForProductPhrase) &&
          messageFromErr.includes(duplicateSupplierForProductSuffix)) ||
          messageFromErr.includes('quarry_supplier_products_pkey'));

      if (isDuplicateSupplierForProduct) {
        const msg = 'Duplicate supplier already exists for this product.';
        notifyError(msg);
        supplierForm.setError('quarry_supplier_id', {
          type: 'manual',
          message: msg,
        });
        return;
      }

      // Fallback error using extracted message
      notifyError(
        messageFromErr ||
          `Failed to ${
            isEditing ? 'update' : 'create'
          } supplier. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  // Show loading state when fetching data
  if (isLoadingQuarries || (isEditing && isLoadingData)) {
    return (
      <div className="w-full flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="medium" />
          <p className="text-lg text-muted-foreground font-bold">
            {isLoadingQuarries
              ? 'Loading suppliers...'
              : 'Loading supplier details...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isQuarriesError || (isEditing && isDataError)) {
    return (
      <div className="w-full flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg text-destructive font-bold mb-2">
            {isQuarriesError
              ? 'Error loading suppliers'
              : 'Error loading supplier details'}
          </p>
          <p className="text-sm text-muted-foreground">
            {quarriesError?.message ||
              dataError?.message ||
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
              {isEditing ? 'Updating Supplier...' : 'Adding Supplier...'}
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
            isSubmitting && 'pointer-events-none',
          )}
          onSubmit={handleSubmit}
        >
          <Tab tabs={tabs} defaultTab={tabs[0].name} className="w-full" />

          <Separator className="my-4" />

          {/* Negative Margin Warning */}
          {(() => {
            const units = [
              {
                key: 'tn',
                label: 'TN',
                cost: watchedCostTN,
                sell: watchedSellTN,
              },
              {
                key: 'm3',
                label: 'm³',
                cost: watchedCostM3,
                sell: watchedSellM3,
              },
              {
                key: 'kg',
                label: '20kg',
                cost: watchedCostKG,
                sell: watchedSellKG,
              },
              {
                key: 'bulka',
                label: 'Bulka',
                cost: watchedCostBulk,
                sell: watchedSellBulk,
              },
            ];

            const negativeMarginUnits = units.filter(
              ({ cost, sell }) => (sell ?? 0) > 0 && (cost ?? 0) > (sell ?? 0),
            );

            if (negativeMarginUnits.length === 0) return null;

            return (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start gap-2">
                  <span className="text-xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800 mb-2">
                      Warning: Negative Margin Detected
                    </p>
                    <p className="text-sm text-amber-700  mb-2">
                      For the following{' '}
                      {negativeMarginUnits.length > 1 ? 'units' : 'unit'}, the
                      cost price is higher than the sell price:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {negativeMarginUnits.map(({ label, cost, sell }) => {
                        const costValue = cost ?? 0;
                        const sellValue = sell ?? 0;
                        const margin =
                          ((sellValue - costValue) / sellValue) * 100;
                        return (
                          <li key={label} className="text-sm text-amber-700 ">
                            <strong>{label}:</strong> Cost $
                            {costValue.toFixed(2)} {'>'} Sell $
                            {sellValue.toFixed(2)} (Margin: {margin.toFixed(2)}
                            %)
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}

          <div
            className={cn(
              'mb-6',
              isDesktop
                ? 'col-span-2 flex justify-end space-x-2'
                : 'col-span-1 flex flex-col space-y-2 gap-3',
            )}
          >
            {isDesktop && (
              <Button variant="outline" type="button" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
            {!isEditing && (
              <Button
                form="add-new-supplier-form"
                className={!isDesktop ? 'w-full' : 'cursor-pointer'}
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {isSubmitting ? 'Adding Product...' : 'Add Supplier'}
              </Button>
            )}

            {isEditing && (
              <Button
                form="add-new-supplier-form"
                type="submit"
                className={!isDesktop ? 'w-full' : 'cursor-pointer'}
                onClick={(e) => {
                  e.stopPropagation();
                }}
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
