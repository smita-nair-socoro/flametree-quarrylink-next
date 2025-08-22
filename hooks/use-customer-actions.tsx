'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { CustomerDetails } from '@/lib/types/customer';
import { EnhancedConfirmDialog } from '@/components/enhanced-confirm-dialog';
import CustomerForm from '@/app/(protected)/customer-operations/customers/(components)/forms/customer-form';
import { CustomerActionButtons } from '@/app/(protected)/customer-operations/customers/(components)/forms/customer-action-buttons';

interface DialogConfig {
  title: string;
  description: string;
  details: string[];
  content?: string;
  confirmText: string;
  confirmVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost';
  confirmCustomColor?: string;
  confirmCustomClass?: string;
}

const dialogConfigs: Record<string, DialogConfig> = {
  archive: {
    title: 'Confirm Customer To Be Archived?',
    description: 'Are you sure you want to archive this customer?',
    details: [
      'Hide customer from active lists',
      'Prevent new quotes/ jobs creation',
      'Preserve all historical data',
    ],
    confirmText: 'Archive Customer',
    confirmCustomClass: 'bg-red-600 hover:bg-red-800 text-white border-red-700',
  },
};

export function useCustomerActions(
  customerId: number | undefined,
  customerData?: CustomerDetails | null
) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);

  const createDialogAction = (
    dialogType: keyof typeof dialogConfigs,
    action: () => void
  ) => {
    return () => {
      setActiveDialog(dialogType);
    };
  };

  const actions = {
    view: () => {
      setViewOpen(true);
    },

    viewJobs: () => {
      console.log('View jobs:', customerId);
      // TODO: implement view jobs logic
    },
    viewDockets: () => {
      console.log('View dockets:', customerId);
      // TODO: implement view dockets logic
    },
    viewQuotations: () => {
      console.log('View quotations:', customerId);
      // TODO: implement view quotations logic
    },

    archive: createDialogAction('archive', () => {
      console.log('Archive customer:', customerId);
      // TODO: implement delete logic
    }),
  };

  // Render active dialog
  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;

    return (
      <EnhancedConfirmDialog
        key={key}
        open={activeDialog === key}
        onOpenChangeAction={(open) => {
          if (!open) {
            setActiveDialog(null);
          }
        }}
        title={config.title}
        description={config.description}
        content={config.content}
        details={config.details}
        confirmText={config.confirmText}
        confirmVariant={config.confirmVariant}
        confirmCustomColor={config.confirmCustomColor}
        confirmCustomClass={config.confirmCustomClass}
        onConfirmAction={() => {
          switch (key) {
            case 'archive':
              console.log('Archive customer:', customerId, customerData);
              // TODO: implement archive logic
              break;
          }
          setActiveDialog(null);
        }}
      />
    );
  });

  const viewDialog = viewOpen ? (
    <FormDialog
      id={customerId}
      dialogTitle="View / Edit Customer"
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        // Ensure dropdown menu state is reset when dialog closes
        if (!open) {
          // Small delay to ensure proper cleanup
          setTimeout(() => {
            setViewOpen(false);
          }, 100);
        }
      }}
      headerButtons={<CustomerActionButtons customer={customerData} />}
      hideTrigger
      // headerInfo={{
      //   useSelectedCustomer: true,
      // }}
    >
      <CustomerForm />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
