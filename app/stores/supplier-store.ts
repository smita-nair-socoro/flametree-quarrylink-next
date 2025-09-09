import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { QuarriesWithProduct } from '@/lib/types/quarry';

interface SupplierStore {
  suppliers: QuarriesWithProduct[];
  selectedSupplier: QuarriesWithProduct | null;
  isLoading: boolean;

  // Actions
  setSuppliers: (suppliers: QuarriesWithProduct[]) => void;
  setSelectedProduct: (product: QuarriesWithProduct | null) => void;
  setLoading: (loading: boolean) => void;

  getSupplierById: (id: number) => QuarriesWithProduct | undefined;
  getSuppliersByStatus: (status: boolean) => QuarriesWithProduct[];

  getSupplierStats: () => {
    total: number;
    available: number;
    unavailable: number;
    archived: number;
  };
}

export const useSupplierStore = create<SupplierStore>()(
  devtools(
    (set, get) => ({
      suppliers: [],
      selectedSupplier: null,
      isLoading: false,

      // Actions
      setSuppliers: (suppliers) => set({ suppliers }),

      setSelectedProduct: (supplier) => set({ selectedSupplier: supplier }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getSupplierById: (id) => {
        const state = get();
        return state.suppliers.find((p) => p.id === id);
      },
    }),
    { name: 'supplier-store' }
  )
);

export const useSelectedSupplier = () =>
  useSupplierStore((state) => state.selectedSupplier);

export const useSuppliers = () => useSupplierStore((state) => state.suppliers);

export const useSupplierLoading = () =>
  useSupplierStore((state) => state.isLoading);

export const useSupplierById = (id: number) => {
  return useSupplierStore((state) => state.suppliers.find((p) => p.id === id));
};
