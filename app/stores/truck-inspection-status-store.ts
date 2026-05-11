import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface TruckInspectionStatusStore {
  passedDocketIds: Set<number>;
  setTruckInspectionPassed: (docketId: number) => void;
  isTruckInspectionPassed: (docketId: number) => boolean;
}

export const useTruckInspectionStatusStore =
  create<TruckInspectionStatusStore>()(
    devtools(
      (set, get) => ({
        passedDocketIds: new Set(),
        setTruckInspectionPassed: (docketId) => {
          set((state) => ({
            passedDocketIds: new Set(state.passedDocketIds).add(docketId),
          }));
        },
        isTruckInspectionPassed: (docketId) => {
          return get().passedDocketIds.has(docketId);
        },
      }),
      { name: 'TruckInspectionStatusStore' },
    ),
  );
