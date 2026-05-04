import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TruckDTO } from '@/lib/types/truck';

interface TruckStore {
  selectedTruck: TruckDTO | null;
  setSelectedTruck: (truck: TruckDTO | null) => void;
}

export const useTruckStore = create<TruckStore>()(
  devtools(
    (set) => ({
      selectedTruck: null,
      setSelectedTruck: (truck) => set({ selectedTruck: truck }),
    }),
    { name: 'Truck-store' },
  ),
);

export const useSelectedTruck = () =>
  useTruckStore((state) => state.selectedTruck);