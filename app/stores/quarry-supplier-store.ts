import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Quarry } from '@/lib/types/quarry';

interface QuarrySupplierStore {
  quarriesSuppliers: Quarry[];
  selectedQuarrySupplier: Quarry | null;
  isLoading: boolean;

  // Actions
  setQuarriesSuppliers: (quarriesSuppliers: Quarry[]) => void;
  setSelectedQuarrySupplier: (quarrySupplier: Quarry | null) => void;
  setLoading: (loading: boolean) => void;

  getQuarrySupplierById: (id: number) => Quarry | undefined;
  getQuarriesSuppliersByStatus: (status: string) => Quarry[];

  getQuarrySupplierStats: () => {
    total: number;
    active: number;
    archived: number;
  };
}

export const useQuarrySupplierStore = create<QuarrySupplierStore>()(
  devtools(
    (set, get) => ({
      quarriesSuppliers: [],
      selectedQuarrySupplier: null,
      isLoading: false,

      // Actions
      setQuarriesSuppliers: (quarriesSuppliers) => set({ quarriesSuppliers }),

      setSelectedQuarrySupplier: (quarrySupplier) =>
        set({ selectedQuarrySupplier: quarrySupplier }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getQuarrySupplierById: (id) => {
        const state = get();
        return state.quarriesSuppliers.find((q) => q.id === id);
      },

      getQuarriesSuppliersByStatus: (status) => {
        const state = get();
        return state.quarriesSuppliers.filter((q) => q.status === status);
      },

      getQuarrySupplierStats: () => {
        const state = get();
        const quarriesSuppliers = state.quarriesSuppliers;

        return {
          total: quarriesSuppliers.length,
          active: quarriesSuppliers.filter((q) => q.status === 'ACTIVE').length,
          archived: quarriesSuppliers.filter((q) => q.status === 'ARCHIVED')
            .length,
        };
      },
    }),
    { name: 'quarry-supplier-store' }
  )
);

export const useSelectedQuarrySupplier = () =>
  useQuarrySupplierStore((state) => state.selectedQuarrySupplier);

export const useQuarriesSuppliers = () =>
  useQuarrySupplierStore((state) => state.quarriesSuppliers);

export const useQuarrySupplierLoading = () =>
  useQuarrySupplierStore((state) => state.isLoading);

export const useQuarrySupplierById = (id: number) => {
  return useQuarrySupplierStore((state) =>
    state.quarriesSuppliers.find((q) => q.id === id)
  );
};

export const useQuarriesSuppliersByStatus = (status: string) => {
  return useQuarrySupplierStore((state) =>
    state.quarriesSuppliers.filter((q) => q.status === status)
  );
};

// Get quarry/supplier stats
export const useQuarrySupplierStats = () => {
  return useQuarrySupplierStore((state) => {
    const quarriesSuppliers = state.quarriesSuppliers;
    return {
      total: quarriesSuppliers.length,
      active: quarriesSuppliers.filter((q) => q.status === 'ACTIVE').length,
      archived: quarriesSuppliers.filter((q) => q.status === 'ARCHIVED').length,
    };
  });
};

import { useMemo } from 'react';

export const useQuarrySupplierByIdOptimized = (id: number) => {
  const quarriesSuppliers = useQuarriesSuppliers();

  return useMemo(() => {
    return quarriesSuppliers.find((q) => q.id === id);
  }, [quarriesSuppliers, id]);
};

export const useQuarriesSuppliersByStatusOptimized = (status: string) => {
  const quarriesSuppliers = useQuarriesSuppliers();

  return useMemo(() => {
    return quarriesSuppliers.filter((q) => q.status === status);
  }, [quarriesSuppliers, status]);
};
