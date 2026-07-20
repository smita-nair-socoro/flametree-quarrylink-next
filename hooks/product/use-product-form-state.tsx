'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductDetails } from '@/lib/types/product';

export const EMPTY_PRODUCT_FORM_VALUES = {
  productName: '',
  productCode: '',
  materialId: undefined as number | undefined,
  productDescription: '',
  densityTonnagePerM3: 0,
  createdAt: undefined as Date | undefined,
  updatedAt: undefined as Date | undefined,
  createdBy: '',
  lastModifiedBy: '',
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
    productName: product.productName || '',
    productCode: product.productCode || '',
    materialId: product.materialId,
    productDescription: product.productDescription || '',
    densityTonnagePerM3: product.densityTonnagePerM3 || 0,
    createdAt: product.createdAt ? new Date(product.createdAt) : undefined,
    updatedAt: auditData?.updatedAt ? new Date(auditData.updatedAt) : undefined,
    createdBy: product.createdBy || '',
    lastModifiedBy: auditData?.lastModifiedBy || '',
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

  const latestAuditData = React.useMemo(() => {
    return getLatestAuditData(selectedProduct);
  }, [selectedProduct]);

  React.useEffect(() => {
    setTotalSupplier(selectedProduct?.quarrySupplierProducts?.length || 0);
  }, [selectedProduct?.quarrySupplierProducts]);

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
