import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Docket } from '@/lib/types/docket';

interface DocketStore {
  dockets: Docket[];
  selectedDocket: Docket | null;
  isLoading: boolean;

  // Actions
  setDockets: (dockets: Docket[]) => void;
  setSelectedDocket: (Docket: Docket | null) => void;
  setLoading: (loading: boolean) => void;

  getDocketById: (id: number) => Docket | undefined;
  getDocketsByStatus: (status: string) => Docket[];

  getDocketStats: () => {
    total: number;
    active: number;
    archived: number;
  };
}

export const useDocketStore = create<DocketStore>()(
  devtools(
    (set, get) => ({
      dockets: [],
      selectedDocket: null,
      isLoading: false,

      // Actions
      setDockets: (dockets) => set({ dockets }),

      setSelectedDocket: (Docket) => set({ selectedDocket: Docket }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getDocketById: (id) => {
        const state = get();
        return state.dockets.find((d) => d.id === id);
      },

      getDocketsByStatus: (status) => {
        const state = get();
        return state.dockets.filter((d) => d.status === status);
      },
    }),
    { name: 'Docket-store' },
  ),
);

export const useSelectedDocket = () =>
  useDocketStore((state) => state.selectedDocket);

export const useDockets = () => useDocketStore((state) => state.dockets);

export const useDocketLoading = () =>
  useDocketStore((state) => state.isLoading);

export const useDocketById = (id: number) => {
  return useDocketStore((state) => state.dockets.find((d) => d.id === id));
};

export const useDocketsByStatus = (status: string) => {
  return useDocketStore((state) =>
    state.dockets.filter((d) => d.status === status),
  );
};
