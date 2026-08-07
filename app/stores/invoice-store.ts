import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Invoice } from '@/lib/types/user';

interface InvoiceStore {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  isLoading: boolean;

  // Actions
  setInvoices: (invoices: Invoice[]) => void;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  setLoading: (loading: boolean) => void;

  getInvoiceById: (id: number) => Invoice | undefined;
  getInvoicesByStatus: (status: string) => Invoice[];
}

export const useInvoiceStore = create<InvoiceStore>()(
  devtools(
    (set, get) => ({
      invoices: [],
      selectedInvoice: null,
      isLoading: false,

      // Actions
      setInvoices: (invoices) => set({ invoices }),

      setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getInvoiceById: (id: number) => {
        const state = get();
        return state.invoices.find((i) => i.id === id);
      },

      getInvoicesByStatus: (status: string) => {
        const state = get();
        return state.invoices.filter((i) => i.invoice_status === status);
      },
    }),
    { name: 'invoice-store' },
  ),
);

export const useSelectedInvoice = () =>
  useInvoiceStore((state) => state.selectedInvoice);

export const useInvoices = () => useInvoiceStore((state) => state.invoices);

export const useCustomerLoading = () =>
  useInvoiceStore((state) => state.isLoading);

export const useInvoiceById = (id: number) => {
  return useInvoiceStore((state) => state.invoices.find((i) => i.id === id));
};

export const useInvoicesByStatus = (status: string) => {
  return useInvoiceStore((state) =>
    state.invoices.filter((i) => i.invoice_status === status),
  );
};

// Get customer stats
export const useInvoiceStats = () => {
  return useInvoiceStore((state) => {
    const invoices = state.invoices;
    return {
      total: invoices.length,
      active: invoices.filter((i) => i.invoice_status === 'ACTIVE').length,
      archived: invoices.filter((i) => i.invoice_status === 'ARCHIVED').length,
    };
  });
};

import { useMemo } from 'react';

export const useInvoiceByIdOptimized = (id: number) => {
  const invoices = useInvoices();

  return useMemo(() => {
    return invoices.find((i) => i.id === id);
  }, [invoices, id]);
};

export const useInvoicesByStatusOptimized = (status: string) => {
  const invoices = useInvoices();

  return useMemo(() => {
    return invoices.filter((i) => i.invoice_status === status);
  }, [invoices, status]);
};
