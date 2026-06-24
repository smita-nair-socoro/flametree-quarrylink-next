'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { HaulierDTO } from '@/lib/types/haulier';
import HaulierForm from '@/app/(protected)/logistics/haulier/(components)/forms/haulier-form';
import { HaulierActionButtons } from '@/app/(protected)/logistics/haulier/(components)/forms/haulier-action-buttons';

export function useHaulierActions(
  initialData?: HaulierDTO | null,
  { onDeleteSuccess }: { onDeleteSuccess?: () => void } = {},
) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [haulierData, setHaulierData] = React.useState<HaulierDTO | null | undefined>(initialData);

  const actions = {
    view: (data?: HaulierDTO | null) => {
      if (data) setHaulierData(data);
      setViewOpen(true);
    },
    delete: () => {
      console.log('Delete haulier:', haulierData);
      onDeleteSuccess?.();
    },
  };

  const viewDialog = viewOpen ? (
    <FormDialog
      id={haulierData?.id}
      dialogTitle={haulierData?.haulierName}
      open={viewOpen}
      onOpenChangeAction={(open) => setViewOpen(open)}
      hideTrigger
      headerButtonsAlign="center"
      headerButtons={
        <HaulierActionButtons
          haulier={haulierData}
          onDelete={() => setViewOpen(false)}
        />
      }
    >
      <HaulierForm />
    </FormDialog>
  ) : null;

  return { actions, viewDialog };
}
