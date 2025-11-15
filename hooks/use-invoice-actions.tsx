'use client';

export function useInvoiceActions(invoiceId: number | undefined) {
  const actions = {
    view: () => {
      console.log('View invoice:', invoiceId);
    },

    download: () => {
      console.log('Download invoice:', invoiceId);
    },
  };

  return {
    actions,
  };
}
