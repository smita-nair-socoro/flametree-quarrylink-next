'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { HaulierDTO } from '@/lib/types/haulier';
import HaulierForm from '@/app/(protected)/logistics/haulier/(components)/forms/haulier-form';
import { HaulierActionButtons } from '@/app/(protected)/logistics/haulier/(components)/forms/haulier-action-buttons';

export function useHaulierActions(
  haulierData?: HaulierDTO | null,
  { onDeleteSuccess }: { onDeleteSuccess?: () => void } = {},
) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [scrollToSection, setScrollToSection] = React.useState<
    string | undefined
  >();

  const actions = {
    view: () => {
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
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        if (!open) setScrollToSection(undefined);
      }}
      hideTrigger
      headerButtonsAlign="center"
      headerButtons={
        <HaulierActionButtons
          haulier={haulierData}
          onScrollTo={setScrollToSection}
          onDelete={() => setViewOpen(false)}
        />
      }
    >
      <HaulierForm scrollToSection={scrollToSection} />
    </FormDialog>
  ) : null;

  return { actions, viewDialog };
}
