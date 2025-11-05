'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { Client } from '@/lib/types/client';
import ClientForm from '@/app/(protected)/customer-operations/client-portal/(components)/forms/client-form';

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
  clientData?: Client | null
): Record<string, DialogConfig> => {
  // Return empty object if no action selected
  return {};
};

export function useClientActions(
  clientId: number | undefined,
  clientData?: Client | null
) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);

  const dialogConfigs = getDialogConfigs(clientData);

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
  };

  // Render active dialog
  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;

    return null;
  });

  const viewDialog = viewOpen ? (
    <FormDialog
      id={clientId}
      dialogTitle="View / Edit Client"
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
      hideTrigger
      headerInfo={{
        useSelectedClient: true,
      }}
    >
      <ClientForm />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
