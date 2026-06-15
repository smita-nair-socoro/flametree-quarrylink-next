import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TenantInternalDetails } from '@/lib/types/client';

interface TenantStore {
  tenantDetails: TenantInternalDetails | null;
  currencyCode?: string;
  taxLabel?: string;
  taxPercentage?: number;

  setTenantDetails: (tenantDetails: TenantInternalDetails) => void;
}

export const useTenantStore = create<TenantStore>()(
  devtools(
    (set) => ({
      tenantDetails: null,
      currencyCode: undefined,
      taxLabel: undefined,
      taxPercentage: undefined,

      setTenantDetails: (tenantDetails) =>
        set({
          tenantDetails,
          currencyCode: tenantDetails.currency?.toUpperCase(),
          taxLabel: tenantDetails.taxType,
          taxPercentage: tenantDetails.taxAmount,
        }),
    }),
    { name: 'tenant-store' },
  ),
);
