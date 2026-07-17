'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { QuarrySupplierProduct } from '@/lib/types/quarry';

export const EMPTY_SUPPLIER_FORM_VALUES = {
  quarrySupplierId: undefined,
  supplierProductName: '',
  supplierProductCode: '',
  densityTonnagePerM3: 0,
  costPriceTn: 0,
  sellPriceTn: 0,
  costPriceM3: 0,
  sellPriceM3: 0,
  costPriceKg: 0,
  sellPriceKg: 0,
  costPriceBulka: 0,
  sellPriceBulka: 0,
  marginTn: 0,
  marginM3: 0,
  marginKg: 0,
  marginBulka: 0,
  availableForSaleTn: true,
  availableForSaleM3: false,
  availableForSaleKg: false,
  availableForSaleBulka: false,
  truckTnRate: 0,
  truckM3Rate: 0,
  truckHourlyRate: 0,
  truckLoadRate: 0,
  truckKmRate: 0,
  truckKgRate: 0,
  truckBulkaRate: 0,
  availableTruckTnRate: true,
  availableTruckM3Rate: false,
  availableTruckHourlyRate: false,
  availableTruckLoadRate: false,
  availableTruckKmRate: false,
  availableTruckKgRate: false,
  availableTruckBulkaRate: false,
};

function formValuesFromQuarrySupplierProduct(data: QuarrySupplierProduct) {
  return {
    quarrySupplierId: data.quarrySupplierId,
    supplierProductName: data.supplierProductName || '',
    supplierProductCode: data.supplierProductCode || '',
    densityTonnagePerM3: data.densityTonnagePerM3 || 0,
    departmentId: data.department?.id || undefined,
    costPriceTn: (data.perTnCostPrice || 0) / 100,
    sellPriceTn: (data.perTnSellPrice || 0) / 100,
    costPriceM3: (data.perM3CostPrice || 0) / 100,
    sellPriceM3: (data.perM3SellPrice || 0) / 100,
    costPriceKg: (data.per20kgCostPrice || 0) / 100,
    sellPriceKg: (data.per20kgSellPrice || 0) / 100,
    costPriceBulka: (data.perBulkaCostPrice || 0) / 100,
    sellPriceBulka: (data.perBulkaSellPrice || 0) / 100,
    marginTn: 0,
    marginM3: 0,
    marginKg: 0,
    marginBulka: 0,
    availableForSaleTn: data.availableForSaleTn ?? true,
    availableForSaleM3: data.availableForSaleM3 ?? false,
    availableForSaleKg: data.availableForSale20kg ?? false,
    availableForSaleBulka: data.availableForSaleBulka ?? false,
    truckTnRate: (data.tnTruckRate || 0) / 100,
    truckM3Rate: (data.m3TruckRate || 0) / 100,
    truckHourlyRate: (data.hourlyTruckRate || 0) / 100,
    truckLoadRate: (data.loadTruckRate || 0) / 100,
    truckKmRate: (data.kmTruckRate || 0) / 100,
    truckKgRate: (data.kg20TruckRate || 0) / 100,
    truckBulkaRate: (data.bulkaTruckRate || 0) / 100,
    availableTruckTnRate: data.availableForTruckRateTn ?? true,
    availableTruckM3Rate: data.availableForTruckRateM3 ?? false,
    availableTruckHourlyRate: data.availableForTruckRateHour ?? false,
    availableTruckLoadRate: data.availableForTruckRateLoad ?? false,
    availableTruckKmRate: data.availableForTruckRateKm ?? false,
    availableTruckKgRate: data.availableForTruckRate20kg ?? false,
    availableTruckBulkaRate: data.availableForTruckRateBulka ?? false,
  };
}

const MARGIN_FIELD_BY_UNIT = {
  tn: 'marginTn',
  m3: 'marginM3',
  kg: 'marginKg',
  bulka: 'marginBulka',
} as const;

/**
 * Manages form state, initialization, and margin calculations for SupplierForm.
 */
export function useQuarrySupplierProductState(
  selectedSupplierProduct: QuarrySupplierProduct | null | undefined,
  isEditing: boolean,
  supplierForm: UseFormReturn<any>,
  defaultProductDensity?: number,
) {
  const [supplierProductName, setSupplierProductName] = React.useState('');
  const [supplierProductCode, setSupplierProductCode] = React.useState('');

  const watchedProductName = supplierForm.watch('supplierProductName');
  const watchedProductCode = supplierForm.watch('supplierProductCode');

  const watchedCostTN = supplierForm.watch('costPriceTn');
  const watchedSellTN = supplierForm.watch('sellPriceTn');
  const watchedCostM3 = supplierForm.watch('costPriceM3');
  const watchedSellM3 = supplierForm.watch('sellPriceM3');
  const watchedCostKG = supplierForm.watch('costPriceKg');
  const watchedSellKG = supplierForm.watch('sellPriceKg');
  const watchedCostBulk = supplierForm.watch('costPriceBulka');
  const watchedSellBulk = supplierForm.watch('sellPriceBulka');

  React.useEffect(() => {
    if (isEditing && selectedSupplierProduct) {
      supplierForm.reset(
        formValuesFromQuarrySupplierProduct(selectedSupplierProduct),
      );
    } else if (!isEditing) {
      supplierForm.reset(EMPTY_SUPPLIER_FORM_VALUES);
      supplierForm.setValue(
        'densityTonnagePerM3',
        defaultProductDensity ?? 0,
        {
          shouldDirty: false,
        },
      );
    }
  }, [isEditing, selectedSupplierProduct, supplierForm]);

  React.useEffect(() => {
    setSupplierProductName(watchedProductName || 'New Product');
    setSupplierProductCode(watchedProductCode || 'CODE');
  }, [watchedProductName, watchedProductCode]);

  const calculateMargin = (costPrice: number, sellPrice: number): number => {
    if (!sellPrice || sellPrice <= 0) return 0;
    return ((sellPrice - costPrice) / sellPrice) * 100;
  };

  React.useEffect(() => {
    const units = [
      { key: 'tn', cost: watchedCostTN, sell: watchedSellTN },
      { key: 'm3', cost: watchedCostM3, sell: watchedSellM3 },
      { key: 'kg', cost: watchedCostKG, sell: watchedSellKG },
      { key: 'bulka', cost: watchedCostBulk, sell: watchedSellBulk },
    ] as const;

    units.forEach(({ key, cost, sell }) => {
      const marginValue = calculateMargin(cost || 0, sell || 0);
      supplierForm.setValue(MARGIN_FIELD_BY_UNIT[key], marginValue, {
        shouldDirty: false,
      });
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
    supplierForm,
  ]);

  return {
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
  };
}
