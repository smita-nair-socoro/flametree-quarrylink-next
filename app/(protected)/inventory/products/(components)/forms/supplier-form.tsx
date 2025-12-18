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
  className?: string;
  onCancel?: () => void;
}

export default function SupplierForm({
  productId,
  quarrySupplierId,
  onCancel,
  className,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(quarrySupplierId && productId));

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [supplierProductName, setSupplierProductName] = React.useState('');
  const [supplierProductCode, setSupplierProductCode] = React.useState('');

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
    defaultValues: {
      quarry_supplier_id: undefined,
      supplier_product_name: '',
      supplier_product_code: '',
      cost_price_tn: 0,
      sell_price_tn: 0,
      cost_price_m3: 0,
      sell_price_m3: 0,
      cost_price_kg: 0,
      sell_price_kg: 0,
      cost_price_bulka: 0,
      sell_price_bulka: 0,
      margin_tn: 0,
      margin_m3: 0,
      margin_kg: 0,
      margin_bulka: 0,
      available_for_sale_tn: true,
      available_for_sale_m3: false,
      available_for_sale_kg: false,
      available_for_sale_bulka: false,
      truck_tn_rate: 0,
      truck_m3_rate: 0,
      truck_hourly_rate: 0,
      truck_load_rate: 0,
      available_truck_tn_rate: true,
      available_truck_m3_rate: false,
      available_truck_hourly_rate: false,
      available_truck_load_rate: false,
    },
  });

  // Update form when data is loaded in edit mode
  React.useEffect(() => {
    if (isEditing && convertedQuarrySupplierProduct) {
      const data = convertedQuarrySupplierProduct;

      supplierForm.reset({
        quarry_supplier_id: data.quarrySupplierId,
        supplier_product_name: data.supplierProductName || '',
        supplier_product_code: data.supplierProductCode || '',
        cost_price_tn: (data.perTnCostPrice || 0) / 100,
        sell_price_tn: (data.perTnSellPrice || 0) / 100,
        cost_price_m3: (data.perM3CostPrice || 0) / 100,
        sell_price_m3: (data.perM3SellPrice || 0) / 100,
        cost_price_kg: (data.per20kgCostPrice || 0) / 100,
        sell_price_kg: (data.per20kgSellPrice || 0) / 100,
        cost_price_bulka: (data.perBulkaCostPrice || 0) / 100,
        sell_price_bulka: (data.perBulkaSellPrice || 0) / 100,
        margin_tn: 0, // Will be calculated
        margin_m3: 0,
        margin_kg: 0,
        margin_bulka: 0,
        available_for_sale_tn: data.availableForSaleTn ?? true,
        available_for_sale_m3: data.availableForSaleM3 ?? false,
        available_for_sale_kg: data.availableForSale20kg ?? false,
        available_for_sale_bulka: data.availableForSaleBulka ?? false,
        truck_tn_rate: (data.tnTruckRate || 0) / 100,
        truck_m3_rate: (data.m3TruckRate || 0) / 100,
        truck_hourly_rate: (data.hourlyTruckRate || 0) / 100,
        truck_load_rate: (data.loadTruckRate || 0) / 100,
        available_truck_tn_rate: data.availableForTruckRateTn ?? true,
        available_truck_m3_rate: data.availableForTruckRateM3 ?? false,
        available_truck_hourly_rate: data.availableForTruckRateHour ?? false,
        available_truck_load_rate: data.availableForTruckRateLoad ?? false,
      });
    }
  }, [isEditing, convertedQuarrySupplierProduct, supplierForm]);

  const watchedProductName = supplierForm.watch('supplier_product_name');
  const watchedProductCode = supplierForm.watch('supplier_product_code');

  // Watch availability switches for pricing
  const watchedAvailabilityTN = supplierForm.watch('available_for_sale_tn');
  const watchedAvailabilityM3 = supplierForm.watch('available_for_sale_m3');
  const watchedAvailabilityKG = supplierForm.watch('available_for_sale_kg');
  const watchedAvailabilityBulk = supplierForm.watch(
    'available_for_sale_bulka'
  );

  // Watch price changes for margin calculation
  const watchedCostTN = supplierForm.watch('cost_price_tn');
  const watchedSellTN = supplierForm.watch('sell_price_tn');
  const watchedCostM3 = supplierForm.watch('cost_price_m3');
  const watchedSellM3 = supplierForm.watch('sell_price_m3');
  const watchedCostKG = supplierForm.watch('cost_price_kg');
  const watchedSellKG = supplierForm.watch('sell_price_kg');
  const watchedCostBulk = supplierForm.watch('cost_price_bulka');
  const watchedSellBulk = supplierForm.watch('sell_price_bulka');

  // Calculate margin percentage: (Sell Price - Cost Price) / Sell Price × 100
  const calculateMargin = (costPrice: number, sellPrice: number): number => {
    if (!sellPrice || sellPrice <= 0) return 0;
    return ((sellPrice - costPrice) / sellPrice) * 100;
  };

  // Update margin values when prices or availability change
  React.useEffect(() => {
    const units = [
      {
        key: 'tn',
        cost: watchedCostTN,
        sell: watchedSellTN,
        available: watchedAvailabilityTN,
      },
      {
        key: 'm3',
        cost: watchedCostM3,
        sell: watchedSellM3,
        available: watchedAvailabilityM3,
      },
      {
        key: 'kg',
        cost: watchedCostKG,
        sell: watchedSellKG,
        available: watchedAvailabilityKG,
      },
      {
        key: 'bulka',
        cost: watchedCostBulk,
        sell: watchedSellBulk,
        available: watchedAvailabilityBulk,
      },
    ];

    units.forEach(({ key, cost, sell }) => {
      // Always calculate margin based on cost and sell prices, regardless of availability
      const marginValue = calculateMargin(cost || 0, sell || 0);

      const fieldName = key === 'bulka' ? 'margin_bulka' : `margin_${key}`;
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

      if (!processedValues.available_for_sale_tn) {
        processedValues.cost_price_tn = 0;
        processedValues.sell_price_tn = 0;
        processedValues.margin_tn = 0;
      }
      if (!processedValues.available_for_sale_m3) {
        processedValues.cost_price_m3 = 0;
        processedValues.sell_price_m3 = 0;
        processedValues.margin_m3 = 0;
      }
      if (!processedValues.available_for_sale_kg) {
        processedValues.cost_price_kg = 0;
        processedValues.sell_price_kg = 0;
        processedValues.margin_kg = 0;
      }
      if (!processedValues.available_for_sale_bulka) {
        processedValues.cost_price_bulka = 0;
        processedValues.sell_price_bulka = 0;
        processedValues.margin_bulka = 0;
      }

      // Reset truck rate values to 0 if availability switches are off
      if (!processedValues.available_truck_tn_rate) {
        processedValues.truck_tn_rate = 0;
      }
      if (!processedValues.available_truck_m3_rate) {
        processedValues.truck_m3_rate = 0;
      }
      if (!processedValues.available_truck_hourly_rate) {
        processedValues.truck_hourly_rate = 0;
      }
      if (!processedValues.available_truck_load_rate) {
        processedValues.truck_load_rate = 0;
      }

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
        availableForSaleTn: processedValues.available_for_sale_tn,
        availableForSaleM3: processedValues.available_for_sale_m3,
        availableForSale20kg: processedValues.available_for_sale_kg,
        availableForSaleBulka: processedValues.available_for_sale_bulka,
        availableForTruckRateTn: processedValues.available_truck_tn_rate,
        availableForTruckRateM3: processedValues.available_truck_m3_rate,
        availableForTruckRateHour: processedValues.available_truck_hourly_rate,
        availableForTruckRateLoad: processedValues.available_truck_load_rate,
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
              ', '
            )}`,
          }
        );
      } else {
        notifySuccess(
          `Supplier ${isEditing ? 'updated' : 'added'} successfully!`
        );
      }

      // Close form on success
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} quarry supplier product:`,
        error
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

      // Fallback error using extracted message
      notifyError(
        messageFromErr ||
          `Failed to ${
            isEditing ? 'update' : 'create'
          } supplier. Please try again.`
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
            isDesktop ? '' : 'pt-10'
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
            isSubmitting && 'pointer-events-none'
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
              ({ cost, sell }) => (sell ?? 0) > 0 && (cost ?? 0) > (sell ?? 0)
            );

            if (negativeMarginUnits.length === 0) return null;

            return (
              <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <div className="flex items-start gap-2">
                  <span className="text-xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      Warning: Negative Profit Detected
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                      The following units have cost prices higher than sell
                      prices:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {negativeMarginUnits.map(({ label, cost, sell }) => {
                        const costValue = cost ?? 0;
                        const sellValue = sell ?? 0;
                        const margin =
                          ((sellValue - costValue) / sellValue) * 100;
                        return (
                          <li
                            key={label}
                            className="text-sm text-amber-700 dark:text-amber-300"
                          >
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
                : 'col-span-1 flex flex-col space-y-2 gap-3'
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
