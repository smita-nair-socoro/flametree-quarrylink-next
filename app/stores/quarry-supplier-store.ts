import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Quarry } from '@/lib/types/quarry';
import { QuarryType, QuarryStatus } from '@/lib/types/quarry-enums';

interface QuarrySupplierStore {
  quarries: Quarry[];
  selectedQuarrySupplier: Quarry | null;
  isLoading: boolean;

  // Actions
  setQuarries: (quarries: Quarry[]) => void;
  setSelectedQuarrySupplier: (quarry: Quarry | null) => void;
  setLoading: (loading: boolean) => void;

  getQuarryById: (id: number) => Quarry | undefined;
  getQuarriesByType: (type: QuarryType) => Quarry[];

  getQuarryStats: () => {
    total: number;
    quarries: number;
    suppliers: number;
    active: number;
    archived: number;
  };
}

export const useQuarrySupplierStore = create<QuarrySupplierStore>()(
  devtools(
    (set, get) => ({
      quarries: [],
      selectedQuarrySupplier: null,
      isLoading: false,

      // Actions
      setQuarries: (quarries) => set({ quarries }),

      setSelectedQuarrySupplier: (quarry) =>
        set({ selectedQuarrySupplier: quarry }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getQuarryById: (id) => {
        const state = get();
        return state.quarries.find((q) => q.id === id);
      },

      getQuarriesByType: (type) => {
        const state = get();
        return state.quarries.filter((q) => q.quarrySupplierType === type);
      },

      getQuarryStats: () => {
        const state = get();
        const quarries = state.quarries;

        return {
          total: quarries.length,
          quarries: quarries.filter(
            (q) => q.quarrySupplierType === QuarryType.QUARRY
          ).length,
          suppliers: quarries.filter(
            (q) => q.quarrySupplierType === QuarryType.SUPPLIER
          ).length,
          active: quarries.filter((q) => q.status === QuarryStatus.ACTIVE)
            .length,
          archived: quarries.filter((q) => q.status === QuarryStatus.ARCHIVED)
            .length,
        };
      },
    }),
    { name: 'quarry-supplier-store' }
  )
);

export const useSelectedQuarrySupplier = () =>
  useQuarrySupplierStore((state) => state.selectedQuarrySupplier);

export const useQuarries = () =>
  useQuarrySupplierStore((state) => state.quarries);

export const useQuarryLoading = () =>
  useQuarrySupplierStore((state) => state.isLoading);

export const useQuarryById = (id: number) => {
  return useQuarrySupplierStore((state) =>
    state.quarries.find((q) => q.id === id)
  );
};

export const useQuarriesByType = (type: QuarryType) => {
  return useQuarrySupplierStore((state) =>
    state.quarries.filter((q) => q.quarrySupplierType === type)
  );
};

// Get quarry stats
export const useQuarryStats = () => {
  return useQuarrySupplierStore((state) => {
    const quarries = state.quarries;
    return {
      total: quarries.length,
      quarries: quarries.filter(
        (q) => q.quarrySupplierType === QuarryType.QUARRY
      ).length,
      suppliers: quarries.filter(
        (q) => q.quarrySupplierType === QuarryType.SUPPLIER
      ).length,
      active: quarries.filter((q) => q.status === QuarryStatus.ACTIVE).length,
      archived: quarries.filter((q) => q.status === QuarryStatus.ARCHIVED)
        .length,
    };
  });
};
