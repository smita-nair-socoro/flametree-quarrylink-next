import { create } from 'zustand';

interface InvoiceDetailsDialogStore {
  open: boolean;
  invoiceId: number | undefined;
  openDialog: (invoiceId: number) => void;
  closeDialog: () => void;
}

export const useInvoiceDetailsDialogStore = create<InvoiceDetailsDialogStore>(
  (set) => ({
    open: false,
    invoiceId: undefined,
    openDialog: (invoiceId) => set({ open: true, invoiceId }),
    closeDialog: () => set({ open: false, invoiceId: undefined }),
  }),
);
