'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import ProductForm from '@/app/(protected)/inventory/products/(components)/forms/product-form';
import { QuoteItem } from '@/lib/types/quotation';
import { EnhancedConfirmDialog } from '@/components/enhanced-confirm-dialog';

interface DialogAdditionalInfo {
  label: string;
  value: string;
}

const dialogConfigs = {
  remove: {
    title: 'Remove Product from Quote',
    description: 'Are you sure you want to remove this product from the quote?',
    details: [
      'Product will be removed from the quotation',
      'Quote totals will be recalculated',
      'This action cannot be undone',
    ],
    confirmText: 'Remove Product',
    confirmVariant: 'destructive' as const,
  },
};

export function useQuoteItemActions(quoteItem?: QuoteItem | null) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);

  const createDialogAction = (
    dialogType: keyof typeof dialogConfigs,
    action: () => void,
  ) => {
    return () => {
      setActiveDialog(dialogType);
    };
  };

  const actions = {
    viewProduct: () => {
      setViewOpen(true);
    },

    remove: createDialogAction('remove', () => {
      console.log('Remove quote item:', quoteItem?.id);
      // TODO: implement remove logic
    }),
  };

  // Generate additional info based on dialog type and quote item data
  const getAdditionalInfo = (dialogType: string): DialogAdditionalInfo[] => {
    const info: DialogAdditionalInfo[] = [];

    if (!quoteItem) return info;

    //TODO:: Once we fixed products come back here and update the below for quote items

    // // Product Name
    // if (quoteItem.product?.name) {
    //   info.push({
    //     label: 'Product',
    //     value: quoteItem.product.name,
    //   });
    // }
    //
    // // Quantity
    // if (quoteItem.quantity) {
    //   info.push({
    //     label: 'Quantity',
    //     value: quoteItem.quantity.toString(),
    //   });
    // }
    //
    // // Unit Price
    // if (quoteItem.unit_sell_price) {
    //   info.push({
    //     label: 'Unit Price',
    //     value: `$${quoteItem.unit_sell_price.toLocaleString()}`,
    //   });
    // }
    //
    // // Total Price
    // if (quoteItem.total_sell_price) {
    //   info.push({
    //     label: 'Total Price',
    //     value: `$${quoteItem.total_sell_price.toLocaleString()}`,
    //   });
    // }

    return info;
  };

  // Render active dialog
  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;

    return (
      <EnhancedConfirmDialog
        key={key}
        open={true}
        onOpenChangeAction={() => setActiveDialog(null)}
        title={config.title}
        description={config.description}
        details={config.details}
        additionalInfo={getAdditionalInfo(key)}
        confirmText={config.confirmText}
        confirmVariant={config.confirmVariant}
        onConfirmAction={() => {
          switch (key) {
            case 'remove':
              console.log('Remove quote item:', quoteItem?.id, quoteItem);
              // TODO: implement remove quote item mutation logic
              break;
          }
          setActiveDialog(null);
        }}
      />
    );
  });

  const viewDialog = (
    <FormDialog
      id={quoteItem?.product_id}
      dialogTitle="View Product Details"
      open={viewOpen}
      onOpenChangeAction={setViewOpen}
      hideTrigger
    >
      <ProductForm />
    </FormDialog>
  );

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
