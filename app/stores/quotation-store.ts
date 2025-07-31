import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { QuotationDetails } from '@/lib/types/quotation';

interface QuotationStore {
  quotations: QuotationDetails[];
  selectedQuotation: QuotationDetails | null;
  isLoading: boolean;

  // Actions
  setQuotations: (quotations: QuotationDetails[]) => void;
  setSelectedQuotation: (quotation: QuotationDetails | null) => void;
  setLoading: (loading: boolean) => void;

  getQuotationById: (id: number) => QuotationDetails | undefined;
  getQuotationsByStatus: (status: string) => QuotationDetails[];
  getPendingQuotations: () => QuotationDetails[];
  getApprovedQuotations: () => QuotationDetails[];
  getDraftQuotations: () => QuotationDetails[];
  getQuotationStats: () => {
    total: number;
    pending: number;
    approved: number;
    draft: number;
    totalValue: number;
  };
}

export const useQuotationStore = create<QuotationStore>()(
  devtools(
    (set, get) => ({
      quotations: [],
      selectedQuotation: null,
      isLoading: false,

      // Actions
      setQuotations: (quotations) => set({ quotations }),

      setSelectedQuotation: (quotation) =>
        set({ selectedQuotation: quotation }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getQuotationById: (id) => {
        const state = get();
        return state.quotations.find((q) => q.id === id);
      },

      getQuotationsByStatus: (status) => {
        const state = get();
        return state.quotations.filter((q) => q.quote_status === status);
      },

      getPendingQuotations: () => {
        const state = get();
        return state.quotations.filter((q) => q.quote_status === 'PENDING');
      },

      getApprovedQuotations: () => {
        const state = get();
        return state.quotations.filter((q) => q.quote_status === 'APPROVED');
      },

      getDraftQuotations: () => {
        const state = get();
        return state.quotations.filter((q) => q.quote_status === 'DRAFT');
      },

      getQuotationStats: () => {
        const state = get();
        const quotations = state.quotations;

        return {
          total: quotations.length,
          pending: quotations.filter((q) => q.quote_status === 'PENDING')
            .length,
          approved: quotations.filter((q) => q.quote_status === 'APPROVED')
            .length,
          draft: quotations.filter((q) => q.quote_status === 'DRAFT').length,
          totalValue: quotations.reduce(
            (sum, q) => sum + (q.total_sell_price || 0),
            0,
          ),
        };
      },
    }),
    { name: 'quotation-store' },
  ),
);

export const useSelectedQuotation = () =>
  useQuotationStore((state) => state.selectedQuotation);

export const useQuotations = () =>
  useQuotationStore((state) => state.quotations);

export const useQuotationLoading = () =>
  useQuotationStore((state) => state.isLoading);

export const useQuotationById = (id: number) => {
  return useQuotationStore((state) =>
    state.quotations.find((q) => q.id === id),
  );
};

export const useQuotationsByStatus = (status: string) => {
  return useQuotationStore((state) =>
    state.quotations.filter((q) => q.quote_status === status),
  );
};

// Get quotation stats
export const useQuotationStats = () => {
  return useQuotationStore((state) => {
    const quotations = state.quotations;
    return {
      total: quotations.length,
      pending: quotations.filter((q) => q.quote_status === 'PENDING').length,
      approved: quotations.filter((q) => q.quote_status === 'APPROVED').length,
      draft: quotations.filter((q) => q.quote_status === 'DRAFT').length,
      totalValue: quotations.reduce(
        (sum, q) => sum + (q.total_sell_price || 0),
        0,
      ),
    };
  });
};

import { useMemo } from 'react';

export const useQuotationByIdOptimized = (id: number) => {
  const quotations = useQuotations();

  return useMemo(() => {
    return quotations.find((q) => q.id === id);
  }, [quotations, id]);
};

export const useQuotationsByStatusOptimized = (status: string) => {
  const quotations = useQuotations();

  return useMemo(() => {
    return quotations.filter((q) => q.quote_status === status);
  }, [quotations, status]);
};
