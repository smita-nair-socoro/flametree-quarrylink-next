import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface TenantStore {
  tenantName: string;
  setTenantName: (name: string) => void;
}

export const useTenantStore = create<TenantStore>()(
  devtools(
    (set) => ({
      tenantName: '',
      setTenantName: (name) => set({ tenantName: name }),
    }),
    { name: 'tenant-store' }
  )
);

export const useTenantName = () =>
  useTenantStore((state) => state.tenantName);
