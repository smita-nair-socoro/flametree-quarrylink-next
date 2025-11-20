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
  getUniqueCustomerNames: () => Array<{ label: string; value: number }>;
  getUniqueAccountManagers: () => Array<{ label: string; value: number }>;
  getCustomerNameById: (customerId: number) => string | null;
  getAccountManagerNameById: (managerId: number) => string | null;
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
        return state.quotations.filter((q) => q.status === status);
      },

      getPendingQuotations: () => {
        const state = get();
        return state.quotations.filter((q) => q.status === 'PENDING');
      },

      getApprovedQuotations: () => {
        const state = get();
        return state.quotations.filter((q) => q.status === 'APPROVED');
      },

      getDraftQuotations: () => {
        const state = get();
        return state.quotations.filter((q) => q.status === 'DRAFT');
      },

      getQuotationStats: () => {
        const state = get();
        const quotations = state.quotations;

        return {
          total: quotations.length,
          pending: quotations.filter((q) => q.status === 'PENDING').length,
          approved: quotations.filter((q) => q.status === 'APPROVED').length,
          draft: quotations.filter((q) => q.status === 'DRAFT').length,
          totalValue: quotations.reduce(
            (sum, q) => sum + (q.total_sell_price || 0),
            0
          ),
        };
      },

      getUniqueCustomerNames: () => {
        const state = get();
        const customerMap = new Map<number, string>();

        state.quotations.forEach((quotation) => {
          if (quotation.customer_id && quotation.customer_name) {
            customerMap.set(quotation.customer_id, quotation.customer_name);
          }
        });

        return Array.from(customerMap.entries())
          .map(([value, label]) => ({ label, value }))
          .sort((a, b) => a.label.localeCompare(b.label));
      },

      getUniqueAccountManagers: () => {
        const state = get();
        const managerMap = new Map<number, string>();

        state.quotations.forEach((quotation) => {
          if (quotation.account_manager && quotation.account_manager_name) {
            managerMap.set(
              quotation.account_manager,
              quotation.account_manager_name
            );
          }
        });

        return Array.from(managerMap.entries())
          .map(([value, label]) => ({ label, value }))
          .sort((a, b) => a.label.localeCompare(b.label));
      },

      getCustomerNameById: (customerId) => {
        const state = get();
        const quotation = state.quotations.find(
          (q) => q.customer_id === customerId
        );
        return quotation?.customer_name || null;
      },

      getAccountManagerNameById: (managerId) => {
        const state = get();
        const quotation = state.quotations.find(
          (q) => q.account_manager === managerId
        );
        return quotation?.account_manager_name || null;
      },
    }),
    { name: 'quotation-store' }
  )
);

export const useSelectedQuotation = () =>
  useQuotationStore((state) => state.selectedQuotation);

export const useQuotations = () =>
  useQuotationStore((state) => state.quotations);
