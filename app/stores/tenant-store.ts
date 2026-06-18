import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TenantInternalDetails } from '@/lib/types/client';

interface TenantStore {
  tenantDetails: TenantInternalDetails | null;
  currencyCode?: string;
  taxLabel?: string;
  taxPercentage?: number;
  /** Raw connected accounting software, e.g. "XERO" or "MYOB_BUSINESS". */
  accountingSoftware?: string;

  setTenantDetails: (tenantDetails: TenantInternalDetails) => void;
}

export const useTenantStore = create<TenantStore>()(
  devtools(
    (set) => ({
      tenantDetails: null,
      currencyCode: undefined,
      taxLabel: undefined,
      taxPercentage: undefined,
      accountingSoftware: undefined,

      setTenantDetails: (tenantDetails) =>
        set({
          tenantDetails,
          currencyCode: tenantDetails.currency?.toUpperCase(),
          taxLabel: tenantDetails.taxType,
          taxPercentage: tenantDetails.taxAmount,
          accountingSoftware: tenantDetails.accountingSoftware,
        }),
    }),
    { name: 'tenant-store' },
  ),
);
