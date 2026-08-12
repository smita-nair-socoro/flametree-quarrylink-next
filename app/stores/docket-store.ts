import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DocketDTO } from '@/lib/types/docket';

interface DocketStore {
  dockets: DocketDTO[];
  selectedDocket: DocketDTO | null;
  isLoading: boolean;

  // Actions
  setDockets: (dockets: DocketDTO[]) => void;
  setSelectedDocket: (Docket: DocketDTO | null) => void;
  setLoading: (loading: boolean) => void;

  getDocketById: (id: number) => DocketDTO | undefined;
  getDocketsByStatus: (status: string) => DocketDTO[];
}

export const useDocketStore = create<DocketStore>()(
  devtools(
    (set, get) => ({
      dockets: [],
      selectedDocket: null,
      isLoading: false,

      // Actions
      setDockets: (dockets) => set({ dockets }),

      setSelectedDocket: (docket) => set({ selectedDocket: docket }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getDocketById: (id) => {
        const state = get();
        return state.dockets.find((d) => d.id === id);
      },

      getDocketsByStatus: (status) => {
        const state = get();
        return state.dockets.filter((d) => d.docketStatus === status);
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
    state.dockets.filter((d) => d.docketStatus === status),
  );
};
