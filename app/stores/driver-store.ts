import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Driver } from '@/lib/types/driver';

interface DriverStore {
  drivers: Driver[];
  selectedDriver: Driver | null;
  isLoading: boolean;

  // Actions
  setDrivers: (drivers: Driver[]) => void;
  setSelectedDriver: (Driver: Driver | null) => void;
  setLoading: (loading: boolean) => void;

  getDriverById: (id: number) => Driver | undefined;
  getDriversByStatus: (status: string) => Driver[];

  getDriverStats: () => {
    total: number;
    active: number;
    archived: number;
  };
}

export const useDriverStore = create<DriverStore>()(
  devtools(
    (set, get) => ({
      drivers: [],
      selectedDriver: null,
      isLoading: false,

      // Actions
      setDrivers: (drivers) => set({ drivers }),

      setSelectedDriver: (Driver) => set({ selectedDriver: Driver }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getDriverById: (id) => {
        const state = get();
        return state.drivers.find((d) => d.id === id);
      },

      getDriversByStatus: (status) => {
        const state = get();
        return state.drivers.filter((d) => d.status === status);
      },
    }),
    { name: 'Driver-store' },
  ),
);

export const useSelectedDriver = () =>
  useDriverStore((state) => state.selectedDriver);

export const useDrivers = () => useDriverStore((state) => state.drivers);

export const useDriverLoading = () =>
  useDriverStore((state) => state.isLoading);

export const useDriverById = (id: number) => {
  return useDriverStore((state) => state.drivers.find((d) => d.id === id));
};

export const useDriversByStatus = (status: string) => {
  return useDriverStore((state) =>
    state.drivers.filter((d) => d.status === status),
  );
};

export const useDriverByIdOptimized = (id: number) => {
  const drivers = useDrivers();

  return useMemo(() => {
    return drivers.find((d) => d.id === id);
  }, [drivers, id]);
};
