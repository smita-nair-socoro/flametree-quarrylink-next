'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductDetails } from '@/lib/types/product';

export const EMPTY_PRODUCT_FORM_VALUES = {
  product_name: '',
  product_code: '',
  material_id: undefined as number | undefined,
  product_description: '',
  density_tonnage_per_m3: 0,
  created_at: undefined as Date | undefined,
  updated_at: undefined as Date | undefined,
  created_by: '',
  last_modified_by: '',
};

interface AuditData {
  lastModifiedBy?: string;
  updatedAt?: string;
}

function getLatestAuditData(product: ProductDetails | null): AuditData | null {
  if (!product) return null;

  const toEpochMs = (iso?: string | null) => {
    if (!iso) return 0;
    const ms = Date.parse(iso);
    return Number.isNaN(ms) ? 0 : ms;
  };

  const candidates = [
    {
      lastModifiedBy: product.lastModifiedBy,
      updatedAt: product.updatedAt,
    },
    ...(product.quarrySupplierProducts ?? []).map((qsp) => {
      // Some API responses include audit fields on this object
      const audit = qsp as unknown as {
        lastModifiedBy?: string | null;
        updatedAt?: string | null;
      };

      return {
        lastModifiedBy: audit.lastModifiedBy ?? undefined,
        updatedAt: audit.updatedAt ?? undefined,
      };
    }),
  ];

  return candidates.reduce((latest, current) => {
    return toEpochMs(current.updatedAt) > toEpochMs(latest.updatedAt)
      ? current
      : latest;
  }) as AuditData;
}

function formValuesFromProduct(
  product: ProductDetails,
  auditData?: AuditData | null
) {
  return {
    product_name: product.productName || '',
    product_code: product.productCode || '',
    material_id: product.materialId,
    product_description: product.productDescription || '',
    density_tonnage_per_m3: product.densityTonnagePerM3 || 0,
    created_at: product.createdAt ? new Date(product.createdAt) : undefined,
    updated_at: auditData?.updatedAt ? new Date(auditData.updatedAt) : undefined,
    created_by: product.createdBy || '',
    last_modified_by: auditData?.lastModifiedBy || '',
  };
}

/**
 * Manages initial form state and sync for ProductForm.
 * Handles calculating latest audit data and resetting the form when data changes.
 */
export function useProductFormState(
  selectedProduct: ProductDetails | null,
  isEditing: boolean,
  productJustCreated: boolean,
  productForm: UseFormReturn<any>
) {
  const [totalSupplier, setTotalSupplier] = React.useState(0);

  // Compare quarry-supplier-product audit data and product audit data
  const latestAuditData = React.useMemo(() => {
    return getLatestAuditData(selectedProduct);
  }, [selectedProduct]);

  // Update total supplier count when product data is loaded
  React.useEffect(() => {
    setTotalSupplier(selectedProduct?.quarrySupplierProducts?.length || 0);
  }, [selectedProduct?.quarrySupplierProducts]);

  // Update form values when product data is loaded (for editing mode)
  React.useEffect(() => {
    if (!isEditing && !productJustCreated) {
      productForm.reset(EMPTY_PRODUCT_FORM_VALUES);
      return;
    }

    if ((isEditing || productJustCreated) && selectedProduct) {
      productForm.reset(
        formValuesFromProduct(selectedProduct, latestAuditData)
      );
    }
  }, [
    isEditing,
    productJustCreated,
    selectedProduct,
    latestAuditData,
    productForm,
  ]);

  return {
    latestAuditData,
    totalSupplier,
  };
}
