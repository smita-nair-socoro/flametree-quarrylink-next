import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface PreStartChecklistStatusStore {
  passedDate: string | null;
  setPreStartPassed: () => void;
  isPreStartPassedToday: () => boolean;
}

export const usePreStartChecklistStatusStore =
  create<PreStartChecklistStatusStore>()(
    devtools(
      (set, get) => ({
        passedDate: null,
        setPreStartPassed: () => {
          const todayUTC = new Date().toISOString().split('T')[0];
          set({ passedDate: todayUTC });
        },
        isPreStartPassedToday: () => {
          const { passedDate } = get();
          if (!passedDate) return false;
          const todayUTC = new Date().toISOString().split('T')[0];
          return passedDate === todayUTC;
        },
      }),
      { name: 'PreStartChecklistStatusStore' },
    ),
  );
