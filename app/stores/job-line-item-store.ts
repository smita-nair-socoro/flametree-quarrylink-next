import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { JobLineItem } from '@/lib/types/job';

interface JobLineItemStore {
  lineItems: JobLineItem[];
  selectedLineItem: JobLineItem | null;
  isLoading: boolean;

  // Actions
  setLineItems: (lineItems: JobLineItem[]) => void;
  setSelectedLineItem: (lineItem: JobLineItem | null) => void;
  setLoading: (loading: boolean) => void;

  getLineItemById: (id: number) => JobLineItem | undefined;
  getLineItemsByStatus: (status: string) => JobLineItem[];
}

export const useJobLineItemStore = create<JobLineItemStore>()(
  devtools(
    (set, get) => ({
      lineItems: [],
      selectedLineItem: null,
      isLoading: false,

      // Actions

      setSelectedLineItem: (lineItem) => set({ selectedLineItem: lineItem }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getLineItemById: (id) => {
        const state = get();
        return state.lineItems.find((li) => li.id === id);
      },
    }),
    { name: 'job-line-item-store' },
  ),
);

export const useSelectedJobLineItem = () =>
  useJobLineItemStore((state) => state.selectedLineItem);

export const useJobLineItems = () =>
  useJobLineItemStore((state) => state.lineItems);
