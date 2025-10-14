'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { Quarry } from '@/lib/types/quarry';
import QuarrySupplierForm from '@/app/(protected)/inventory/quarries-suppliers/(components)/forms/quarry-supplier-form';

export function useQuarrySupplierActions(
  quarrySupplierId: number | undefined,
  quarrySupplierData?: Quarry | null
) {
  const [viewOpen, setViewOpen] = React.useState(false);

  const actions = {
    view: () => {
      setViewOpen(true);
    },
  };

  const viewDialog = viewOpen ? (
    <FormDialog
      id={quarrySupplierId}
      dialogTitle="View / Edit Quarry / Supplier"
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
        useSelectedQuarrySupplier: true,
      }}
    >
      <QuarrySupplierForm />
    </FormDialog>
  ) : null;

  return {
    actions,
    viewDialog,
  };
}
