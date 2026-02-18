'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { QuarrySupplierProduct } from '@/lib/types/quarry';

export const EMPTY_SUPPLIER_FORM_VALUES = {
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
  truck_km_rate: 0,
  truck_kg_rate: 0,
  truck_bulka_rate: 0,
  available_truck_tn_rate: true,
  available_truck_m3_rate: false,
  available_truck_hourly_rate: false,
  available_truck_load_rate: false,
  available_truck_km_rate: false,
  available_truck_kg_rate: false,
  available_truck_bulka_rate: false,
};

function formValuesFromQuarrySupplierProduct(data: QuarrySupplierProduct) {
  return {
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
    margin_tn: 0, // Will be calculated by effect
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
    truck_km_rate: (data.kmTruckRate || 0) / 100,
    truck_kg_rate: (data.kg20TruckRate || 0) / 100,
    truck_bulka_rate: (data.bulkaTruckRate || 0) / 100,
    available_truck_tn_rate: data.availableForTruckRateTn ?? true,
    available_truck_m3_rate: data.availableForTruckRateM3 ?? false,
    available_truck_hourly_rate: data.availableForTruckRateHour ?? false,
    available_truck_load_rate: data.availableForTruckRateLoad ?? false,
    available_truck_km_rate: data.availableForTruckRateKm ?? false,
    available_truck_kg_rate: data.availableForTruckRate20kg ?? false,
    available_truck_bulka_rate: data.availableForTruckRateBulka ?? false,
  };
}

/**
 * Manages form state, initialization, and margin calculations for SupplierForm.
 */
export function useQuarrySupplierProductState(
  selectedSupplierProduct: QuarrySupplierProduct | null | undefined,
  isEditing: boolean,
  supplierForm: UseFormReturn<any>,
) {
  const [supplierProductName, setSupplierProductName] = React.useState('');
  const [supplierProductCode, setSupplierProductCode] = React.useState('');

  // Watch fields for logic
  const watchedProductName = supplierForm.watch('supplier_product_name');
  const watchedProductCode = supplierForm.watch('supplier_product_code');

  const watchedCostTN = supplierForm.watch('cost_price_tn');
  const watchedSellTN = supplierForm.watch('sell_price_tn');
  const watchedCostM3 = supplierForm.watch('cost_price_m3');
  const watchedSellM3 = supplierForm.watch('sell_price_m3');
  const watchedCostKG = supplierForm.watch('cost_price_kg');
  const watchedSellKG = supplierForm.watch('sell_price_kg');
  const watchedCostBulk = supplierForm.watch('cost_price_bulka');
  const watchedSellBulk = supplierForm.watch('sell_price_bulka');

  // Update form when data is loaded in edit mode
  React.useEffect(() => {
    if (isEditing && selectedSupplierProduct) {
      supplierForm.reset(
        formValuesFromQuarrySupplierProduct(selectedSupplierProduct),
      );
    } else if (!isEditing) {
      supplierForm.reset(EMPTY_SUPPLIER_FORM_VALUES);
    }
  }, [isEditing, selectedSupplierProduct, supplierForm]);

  // Update local state for header/display
  React.useEffect(() => {
    setSupplierProductName(watchedProductName || 'New Product');
    setSupplierProductCode(watchedProductCode || 'CODE');
  }, [watchedProductName, watchedProductCode]);

  // Calculate margin percentage: (Sell Price - Cost Price) / Sell Price × 100
  const calculateMargin = (costPrice: number, sellPrice: number): number => {
    if (!sellPrice || sellPrice <= 0) return 0;
    return ((sellPrice - costPrice) / sellPrice) * 100;
  };

  // Update margin values when prices change
  React.useEffect(() => {
    const units = [
      { key: 'tn', cost: watchedCostTN, sell: watchedSellTN },
      { key: 'm3', cost: watchedCostM3, sell: watchedSellM3 },
      { key: 'kg', cost: watchedCostKG, sell: watchedSellKG },
      { key: 'bulka', cost: watchedCostBulk, sell: watchedSellBulk },
    ];

    units.forEach(({ key, cost, sell }) => {
      const marginValue = calculateMargin(cost || 0, sell || 0);
      const fieldName = key === 'bulka' ? 'margin_bulka' : `margin_${key}`;

      // Use setValue with shouldDirty: false to avoid triggering dirty state just for calculations
      // unless user manually changed inputs (which they did to trigger this effect)
      // But we don't want the *margin field itself* to mark form dirty if it's a computed field?
      // Actually usually computed fields should update.
      supplierForm.setValue(fieldName, marginValue, { shouldDirty: false });
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
    // Return watched values if needed by component for warnings
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
