import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { QuotationLineItem } from '@/lib/types/quotation';

interface QuotationLineItemStore {
  lineItems: QuotationLineItem[];
  selectedLineItem: QuotationLineItem | null;
  isLoading: boolean;

  // Actions
  setLineItems: (lineItems: QuotationLineItem[]) => void;
  setSelectedLineItem: (lineItem: QuotationLineItem | null) => void;
  setLoading: (loading: boolean) => void;

  getLineItemById: (id: number) => QuotationLineItem | undefined;
  getLineItemsByStatus: (status: string) => QuotationLineItem[];
}

export const useQuotationLineItemStore = create<QuotationLineItemStore>()(
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
    { name: 'quotation-line-item-store' },
  ),
);

export const useSelectedLineItem = () =>
  useQuotationLineItemStore((state) => state.selectedLineItem);

export const useLineItems = () =>
  useQuotationLineItemStore((state) => state.lineItems);
