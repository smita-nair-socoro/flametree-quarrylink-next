'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { CustomerDetails } from '@/lib/types/customer';
import { EnhancedConfirmDialog } from '@/components/enhanced-confirm-dialog';
import CustomerForm from '@/app/(protected)/customer-operations/customers/(components)/forms/customer-form';
import { CustomerActionButtons } from '@/app/(protected)/customer-operations/customers/(components)/forms/customer-action-buttons';
import { Archive, TriangleAlert } from 'lucide-react';

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
  titleIcon?: React.ReactNode;
  confirmIcon?: React.ReactNode;
}

interface SelectedAction {
  key: string;
}

const getDialogConfigs = (
  customerData?: CustomerDetails | null,
  selectedAction?: SelectedAction
): Record<string, DialogConfig> => {
  const customerName = customerData?.business_name;

  if (selectedAction?.key === 'archive') {
    return {
      archive: {
        title: `Archive ${customerName}?`,
        description: '',
        details: [
          'Hide customer from active lists',
          'Prevent new quotes/jobs creation',
          'Preserve all historical data',
        ],
        confirmText: 'Archive Customer',
        confirmCustomClass: 'bg-[#475569] hover:bg-[#64748b] text-white',
        titleIcon: (
          <div className="flex w-[41.99px] h-[41.99px] items-center justify-center bg-[#FFEDD4] rounded-full">
            <span className="flex items-center justify-center">
              <TriangleAlert className="h-5 w-5 text-[#F54900]" />
            </span>
          </div>
        ),
        confirmIcon: <Archive className="h-4 w-4" />,
      },
    };
  } else if (selectedAction?.key === 'unarchive') {
    return {
      unarchive: {
        title: `Unarchive ${customerName}?`,
        description: '',
        details: [
          'Restore customer to active lists',
          'Allow new quotes/jobs creation',
          'Make customer visible in searches',
        ],
        confirmText: 'Unarchive Customer',
        confirmCustomClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        titleIcon: (
          <div className="flex w-[41.99px] h-[41.99px] items-center justify-center bg-blue-100 rounded-full">
            <span className="flex items-center justify-center">
              <Archive className="h-5 w-5 text-blue-600" />
            </span>
          </div>
        ),
        confirmIcon: <Archive className="h-4 w-4" />,
      },
    };
  }

  // Return empty object if no action selected
  return {};
};

export function useCustomerActions(
  customerId: number | undefined,
  customerData?: CustomerDetails | null
) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);

  const dialogConfigs = getDialogConfigs(
    customerData,
    selectedAction || undefined
  );

  const createDialogAction = (actionKey: string, action: () => void) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
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
      // TODO: implement archive logic
    }),

    unarchive: createDialogAction('unarchive', () => {
      console.log('Unarchive customer:', customerId);
      // TODO: implement unarchive logic
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
            setSelectedAction(null);
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
        confirmIcon={config.confirmIcon}
        titleIcon={config.titleIcon}
        onConfirmAction={() => {
          switch (key) {
            case 'archive':
              console.log('Archive customer:', customerId, customerData);
              // TODO: implement archive logic
              break;
            case 'unarchive':
              console.log('Unarchive customer:', customerId, customerData);
              // TODO: implement unarchive logic
              break;
          }
          setActiveDialog(null);
          setSelectedAction(null);
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
