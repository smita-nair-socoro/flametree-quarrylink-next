'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { QuotationLineItem } from '@/lib/types/quotation';
import QuotationLineItemForm from '@/app/(protected)/customer-operations/quotation/(components)/forms/quotation-line-item-form';
import { ActionDialog } from '@/components/action-dialog';
import { QuotationLineItemActionButtons } from '@/app/(protected)/customer-operations/quotation/(components)/forms/quotation-line-item-action-buttons';

interface DialogConfig {
  title?: string;
  description?: React.ReactNode;
  content?: React.ReactNode;
  confirmText?: string;
  confirmVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost';
  confirmCustomColor?: string;
  confirmCustomClass?: string;
  confirmIcon?: React.ReactNode;
  confirmActionNeeded?: boolean;
}

interface SelectedAction {
  key: string;
}

const getDialogConfigs = (
  lineItemData?: QuotationLineItem | null,
  selectedAction?: SelectedAction
): Record<string, DialogConfig> => {
  if (selectedAction?.key === 'sendToCustomer') {
    return {
      sendToCustomer: {
        title: 'Send Quote',
        description: (
          <div className="flex justify-start items-center gap-2"></div>
        ),
        content: <div className="flex flex-col gap-5"></div>,
        confirmText: 'Send Quote',
        confirmVariant: 'default',
        confirmCustomColor: '#F54900',
      },
    };
  }
  return {};
};

export function useQuotationLineItemActions(
  lineItemId: number | undefined,
  lineItemData?: QuotationLineItem | null
) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);
  const [newExpiryDate, setNewExpiryDate] = React.useState<Date>(() => {
    const weekFromToday = new Date();
    weekFromToday.setDate(weekFromToday.getDate() + 7);
    return weekFromToday;
  });

  const dialogConfigs = getDialogConfigs(
    lineItemData,
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
    remove: createDialogAction('remove', () => {
      console.log('Remove quotation line item:', lineItemId);
      // TODO: implement remove logic
    }),
  };

  // Render active dialog
  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;

    return (
      <ActionDialog
        key={key}
        open={activeDialog === key}
        onOpenChangeAction={(open) => {
          if (!open) {
            setActiveDialog(null);
            setSelectedAction(null);
          }
        }}
        title={config.title ?? ''}
        description={config.description}
        content={config.content}
        confirmText={config.confirmText ?? ''}
        confirmVariant={config.confirmVariant}
        confirmCustomColor={config.confirmCustomColor}
        confirmCustomClass={config.confirmCustomClass}
        confirmIcon={config.confirmIcon}
        confirmActionNeeded={config.confirmActionNeeded}
        onConfirmAction={() => {
          switch (key) {
            case 'remove':
              console.log('Remove quotation line item:', lineItemId);
              // TODO: implement remove logic
              break;
          }
        }}
      />
    );
  });

  const viewDialog = viewOpen ? (
    <FormDialog
      id={lineItemId}
      dialogTitle="View / Edit Quotation"
      open={viewOpen}
      dialogWidth="700px"
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
      headerButtons={
        <QuotationLineItemActionButtons quotationLineItem={lineItemData} />
      }
      hideTrigger
      headerInfo={{
        useSelectedLineItem: true,
      }}
    >
      <QuotationLineItemForm />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
