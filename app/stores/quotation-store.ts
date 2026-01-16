import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Quotation } from '@/lib/types/quotation';

interface QuotationStore {
  quotations: Quotation[];
  selectedQuotation: Quotation | null;
  isLoading: boolean;

  // Actions
  setQuotations: (quotations: Quotation[]) => void;
  setSelectedQuotation: (quotation: Quotation | null) => void;
  setLoading: (loading: boolean) => void;
  bulkArchiveQuotations: (quotationIds: number[]) => void;

  getQuotationById: (id: number) => Quotation | undefined;
  getQuotationsByStatus: (status: string) => Quotation[];
  getPendingQuotations: () => Quotation[];
  getApprovedQuotations: () => Quotation[];
  getDraftQuotations: () => Quotation[];
  getQuotationStats: () => {
    total: number;
    pending: number;
    approved: number;
    draft: number;
    totalValue: number;
  };
  getCustomerNameById: (customerId: number) => string | null;
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

      bulkArchiveQuotations: (quotationIds) => {
        const state = get();
        const updatedQuotations = state.quotations.map((q) => {
          if (quotationIds.includes(q.id)) {
            return { ...q, quoteStatus: 'ARCHIVED' } as Quotation;
          }
          return q;
        });
        set({ quotations: updatedQuotations });
        console.log('Bulk archived quotations:', quotationIds);
        // TODO: implement API call to archive quotations
      },

      // Selectors
      getQuotationById: (id) => {
        const state = get();
        return state.quotations.find((q) => q.id === id);
      },

      getQuotationsByStatus: (status) => {
        const state = get();
        return state.quotations.filter((q) => q.quoteStatus === status);
      },

      getPendingQuotations: () => {
        const state = get();
        return state.quotations.filter((q) => q.quoteStatus === 'PENDING');
      },

      getApprovedQuotations: () => {
        const state = get();
        return state.quotations.filter((q) => q.quoteStatus === 'APPROVED');
      },

      getDraftQuotations: () => {
        const state = get();
        return state.quotations.filter((q) => q.quoteStatus === 'DRAFT');
      },

      getQuotationStats: () => {
        const state = get();
        const quotations = state.quotations;

        return {
          total: quotations.length,
          pending: quotations.filter((q) => q.quoteStatus === 'PENDING').length,
          approved: quotations.filter((q) => q.quoteStatus === 'APPROVED').length,
          draft: quotations.filter((q) => q.quoteStatus === 'DRAFT').length,
          totalValue: quotations.reduce(
            (sum, q) => sum + (q.totalSellPrice || 0),
            0
          ),
        };
      },

      getCustomerNameById: (customerId) => {
        const state = get();
        const quotation = state.quotations.find(
          (q) => q.customerId === customerId
        );
        return quotation?.customerName || null;
      },
    }),
    { name: 'quotation-store' }
  )
);

export const useSelectedQuotation = () =>
  useQuotationStore((state) => state.selectedQuotation);

export const useQuotations = () =>
  useQuotationStore((state) => state.quotations);
