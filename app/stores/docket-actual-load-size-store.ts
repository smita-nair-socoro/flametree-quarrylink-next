import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DocketActualLoadSizeStore {
  sizes: Record<number, number>;
  setActualLoadSize: (docketId: number, size: number) => void;
}

export const useDocketActualLoadSizeStore = create<DocketActualLoadSizeStore>()(
  devtools(
    (set) => ({
      sizes: {},
      setActualLoadSize: (docketId, size) =>
        set((state) => ({ sizes: { ...state.sizes, [docketId]: size } })),
    }),
    { name: 'DocketActualLoadSizeStore' },
  ),
);
