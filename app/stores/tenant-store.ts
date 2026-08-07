import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TenantInternalDetails, Client } from '@/lib/types/client';

interface TenantStore {
  tenantDetails: TenantInternalDetails | null;
  currencyCode?: string;
  taxLabel?: string;
  taxPercentage?: number;
  tenantEmail?: string;
  businessName: string | null;
  /** Raw connected accounting software, e.g. "XERO" or "MYOB_BUSINESS" or "MYOB_ACUMATICA". */
  accountingSoftware?: string;

  /** Display name of the currently logged-in user. */
  user: string;
  /** Client entity selected in admin/tenant-management views. */
  selectedClient: Client | null;

  setTenantDetails: (tenantDetails: TenantInternalDetails) => void;
  setUser: (userName: string) => void;
  setSelectedClient: (client: Client | null) => void;
}

export const useTenantStore = create<TenantStore>()(
  devtools(
    (set) => ({
      tenantDetails: null,
      currencyCode: undefined,
      taxLabel: undefined,
      taxPercentage: undefined,
      tenantEmail: undefined,
      businessName: null,
      accountingSoftware: undefined,
      user: '',
      selectedClient: null,

      setTenantDetails: (tenantDetails) =>
        set({
          tenantDetails,
          currencyCode: tenantDetails.currency?.toUpperCase(),
          taxLabel: tenantDetails.taxType,
          taxPercentage: tenantDetails.taxAmount,
          tenantEmail: tenantDetails.email,
          businessName: tenantDetails.businessName ?? null,
          accountingSoftware: tenantDetails.accountingSoftware,
        }),

      setUser: (userName) => set({ user: userName }),

      setSelectedClient: (client) => set({ selectedClient: client }),
    }),
    { name: 'tenant-store' },
  ),
);

export const useSelectedClient = () =>
  useTenantStore((state) => state.selectedClient);
