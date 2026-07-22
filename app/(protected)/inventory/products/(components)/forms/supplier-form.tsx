'use client';

import { formatDollars } from '@/lib/utils/currency';
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
import { sortByLabel } from '@/lib/utils/sort-options';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFormDialogFooter } from '@/components/form-dialog';
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
import { useXeroIntegrationActions } from '@/hooks/use-xero-integration-actions';
import { useGetDepartments } from '@/lib/api/department';
import { useAccountingSoftwareProvider } from '@/lib/utils/tenant-config-helper';


interface FormProps {
  productId?: number;
  quarrySupplierId?: number;
  existingQuarryIds?: number[];
  defaultProductDensity?: number;
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
  existingQuarryIds = [],
  defaultProductDensity,
  onCancel,
  onSuccess,
  onSaved,
  className,
  onDirtyChange,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(quarrySupplierId && productId));

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const accountingSoftware = useAccountingSoftwareProvider();
  const { isConnected: isXeroConnected } = useXeroIntegrationActions();
  const showXeroMapping = accountingSoftware === 'XERO' && isXeroConnected;
  const departmentsQuery = useGetDepartments({
    enabled: showXeroMapping,
  });

  const departments = React.useMemo(() => {
    return departmentsQuery.data ?? [];
  }, [departmentsQuery.data]);

  const readOnly = accountingSoftware === 'MYOB';

  const departmentOptions = React.useMemo<FormSelectOption[]>(
    () =>
      sortByLabel(
        departments
          .filter((department) => department.id !== undefined)
          .map((department) => ({
            value: department.id as number,
            label: `${department.departmentName}`,
          })),
        (option) => option.label,
      ),
    [departments],
  );


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

  // Map quarries to supplier options, excluding already-linked quarries (unless editing that quarry)
  const supplierOptions = React.useMemo(() => {
    if (!quarriesData) return [];

    return sortByLabel(
      quarriesData
        .filter(
          (quarry) =>
            !existingQuarryIds.includes(quarry.id) ||
            quarry.id === quarrySupplierId,
        )
        .map((quarry) => ({
          label: quarry.name,
          value: quarry.id,
        })),
      (option) => option.label,
    );
  }, [quarriesData, existingQuarryIds, quarrySupplierId]);

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
    quarrySupplierProductData ?? null,
    isEditing,
    supplierForm,
    defaultProductDensity,
  );

  const tabs = [
    {
      name: 'Supplier Details',
      content: (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-3">
                <div className="w-4 h-px bg-gray-300 shrink-0" />
                <span className="whitespace-nowrap text-base font-semibold">
                  Quarry / Supplier Information
                </span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormSelect
              control={supplierForm.control}
              name="quarrySupplierId"
              label="Quarry / Supplier Name*"
              searchLabel="quarries and suppliers"
              options={supplierOptions}
              placeholder="Select a Supplier"
              formItemClassName="w-full"
              autoSelectForOnlyOneOption={!isEditing}
              disabled={readOnly}
            />
            <FormField
              control={supplierForm.control}
              name="supplierProductName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Product Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Product Name"
                      {...field}
                      readOnly={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={supplierForm.control}
              name="supplierProductCode"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Product Code*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Product Code"
                      {...field}
                      readOnly={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={supplierForm.control}
              name="densityTonnagePerM3"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Product Density (TN/m³)*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      isNumber
                      allowDecimal
                      minDecimals={2}
                      maxDecimals={2}
                      suffix="TN/m³"
                      {...field}
                      readOnly={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showXeroMapping && (
              <>
                <Separator className="col-span-full my-2 mb-5" />

                <div className="flex flex-col mb-3">
                  <h2 className="text-sm font-semibold mb-1">Xero Mapping</h2>
                  <p className="text-xs text-muted-foreground">
                    Optional fields pushed to Xero on invoice creation.
                  </p>
                </div>
                <FormSelect
                  control={supplierForm.control}
                  name="departmentId"
                  label="Department"
                  options={departmentOptions}
                  placeholder="Select department (optional)"
                  searchLabel="departments"
                  formItemClassName="col-span-full"
                  className="w-full"
                  disabled={departmentsQuery.isLoading}
                />
              </>
            )}
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
            readOnly={readOnly}
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
          <TruckRatesTable control={supplierForm.control} readOnly={readOnly} />
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
        'costPriceTn',
        'sellPriceTn',
        'costPriceM3',
        'sellPriceM3',
        'costPriceKg',
        'sellPriceKg',
        'costPriceBulka',
        'sellPriceBulka',
        'truckTnRate',
        'truckM3Rate',
        'truckKgRate',
        'truckBulkaRate',
        'truckHourlyRate',
        'truckLoadRate',
        'truckKmRate',
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
      if (processedValues.availableForSaleTn) availableUnits.push('TN');
      if (processedValues.availableForSaleM3) availableUnits.push('M3');
      if (processedValues.availableForSaleKg) availableUnits.push('20KG');
      if (processedValues.availableForSaleBulka)
        availableUnits.push('BULKA');

      const payload = {
        quarrySupplierId: processedValues.quarrySupplierId,
        productId: productId,
        supplierProductName: processedValues.supplierProductName,
        supplierProductCode: processedValues.supplierProductCode,
        densityTonnagePerM3: processedValues.densityTonnagePerM3,
        ...(showXeroMapping && processedValues.departmentId != null
          ? { departmentId: processedValues.departmentId }
          : {}),
        availableUnits: availableUnits,
        perTnCostPrice: processedValues.costPriceTn,
        perTnSellPrice: processedValues.sellPriceTn,
        perM3CostPrice: processedValues.costPriceM3,
        perM3SellPrice: processedValues.sellPriceM3,
        per20kgCostPrice: processedValues.costPriceKg,
        per20kgSellPrice: processedValues.sellPriceKg,
        perBulkaCostPrice: processedValues.costPriceBulka,
        perBulkaSellPrice: processedValues.sellPriceBulka,
        tnTruckRate: processedValues.truckTnRate,
        m3TruckRate: processedValues.truckM3Rate,
        hourlyTruckRate: processedValues.truckHourlyRate,
        loadTruckRate: processedValues.truckLoadRate,
        kmTruckRate: processedValues.truckKmRate,
        kg20TruckRate: processedValues.truckKgRate,
        bulkaTruckRate: processedValues.truckBulkaRate,
        availableForSaleTn: processedValues.availableForSaleTn,
        availableForSaleM3: processedValues.availableForSaleM3,
        availableForSale20kg: processedValues.availableForSaleKg,
        availableForSaleBulka: processedValues.availableForSaleBulka,
        availableForTruckRateTn: processedValues.availableTruckTnRate,
        availableForTruckRateM3: processedValues.availableTruckM3Rate,
        availableForTruckRate20kg: processedValues.availableTruckKgRate,
        availableForTruckRateBulka: processedValues.availableTruckBulkaRate,
        availableForTruckRateHour: processedValues.availableTruckHourlyRate,
        availableForTruckRateLoad: processedValues.availableTruckLoadRate,
        availableForTruckRateKm: processedValues.availableTruckKmRate,
        isActive: true,
        version: quarrySupplierProductData?.version || 0,
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
      const negativeMarginUnits: string[] = [];
      const pricingFieldByUnit = {
        tn: {
          cost: 'costPriceTn',
          sell: 'sellPriceTn',
          available: 'availableForSaleTn',
        },
        m3: {
          cost: 'costPriceM3',
          sell: 'sellPriceM3',
          available: 'availableForSaleM3',
        },
        kg: {
          cost: 'costPriceKg',
          sell: 'sellPriceKg',
          available: 'availableForSaleKg',
        },
        bulka: {
          cost: 'costPriceBulka',
          sell: 'sellPriceBulka',
          available: 'availableForSaleBulka',
        },
      } as const;

      for (const unit of ['tn', 'm3', 'kg', 'bulka'] as const) {
        const fields = pricingFieldByUnit[unit];
        const costPrice =
          (processedValues[fields.cost] as number) || 0;
        const sellPrice =
          (processedValues[fields.sell] as number) || 0;
        const isAvailable = processedValues[fields.available] as boolean;

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
      const duplicateKeyPhrase = `Key (supplier_product_code)=(${values.supplierProductCode}) already exists`;
      const isDuplicateProductCode =
        codeStr === '409' &&
        typeof messageFromErr === 'string' &&
        messageFromErr.includes(duplicateKeyPhrase);

      if (isDuplicateProductCode) {
        const msg = `Duplicate supplier product code "${values.supplierProductCode}" already exists for this product.`;
        notifyError(msg);
        supplierForm.setError('supplierProductCode', {
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
        supplierForm.setError('quarrySupplierId', {
          type: 'manual',
          message: msg,
        });
        return;
      }

      // Fallback error using extracted message
      notifyError(
        messageFromErr ||
        `Failed to ${isEditing ? 'update' : 'create'
        } supplier. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  useFormDialogFooter(
    isDesktop && !readOnly ? (
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        {!isEditing && (
          <Button
            form="add-new-supplier-form"
            className="cursor-pointer"
            type="submit"
            disabled={isSubmitting}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {isSubmitting ? 'Adding Product...' : 'Add Quarry / Supplier'}
          </Button>
        )}
        {isEditing && (
          <Button
            form="add-new-supplier-form"
            type="submit"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Save Changes
          </Button>
        )}
      </div>
    ) : null,
  );

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
          <Tab
            tabs={tabs}
            defaultTab={tabs[0].name}
            className="w-full min-w-0"
            tabsClassName="h-10 w-full overflow-x-auto flex-nowrap rounded-md"
            tabsTriggerClassName="h-8 flex-1 justify-center"
            enableDropdownOnMobile
          />

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
                            {formatDollars(costValue)} {'>'} Sell $
                            {formatDollars(sellValue)} (Margin:{' '}
                            {margin.toFixed(2)}
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

          {!isDesktop && !readOnly && (
            <div className="flex flex-col gap-3 mb-6">
              {!isEditing && (
                <Button
                  form="add-new-supplier-form"
                  className="cursor-pointer"
                  type="submit"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {isSubmitting ? 'Adding Product...' : 'Add Quarry / Supplier'}
                </Button>
              )}
              {isEditing && (
                <Button
                  form="add-new-supplier-form"
                  type="submit"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Save Changes
                </Button>
              )}
              <Button variant="outline" type="button" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
