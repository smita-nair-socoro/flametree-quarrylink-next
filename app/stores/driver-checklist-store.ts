import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DriverChecklistStore {
  isDailyChecklistRequired: boolean;
  setIsDailyChecklistRequired: (value: boolean) => void;
}

export const useDriverChecklistStore = create<DriverChecklistStore>()(
  devtools(
    (set) => ({
      isDailyChecklistRequired: true,
      setIsDailyChecklistRequired: (value) =>
        set({ isDailyChecklistRequired: value }),
    }),
    { name: 'DriverChecklistStore' },
  ),
);
