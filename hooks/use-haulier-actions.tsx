'use client';
import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import { FormDialog } from '@/components/form-dialog';
import { HaulierDTO } from '@/lib/types/haulier';
import HaulierForm from '@/app/(protected)/logistics/haulier/(components)/forms/haulier-form';
import { HaulierActionButtons } from '@/app/(protected)/logistics/haulier/(components)/forms/haulier-action-buttons';
import {
  DeleteHaulierDescription,
  DeleteHaulierContent,
  CannotDeleteHaulierDescription,
  CannotDeleteHaulierContent,
} from '@/hooks/haulier/delete-haulier-content';
import { useDeleteHaulier } from '@/lib/api/haulier';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage, extractErrorData } from '@/lib/utils/error-message-helper';

type DeleteDialogState =
  | { mode: 'idle' }
  | { mode: 'confirm' }
  | { mode: 'blocked'; activeTruckIds: number[]; activeDriverIds: number[] };

export function useHaulierActions(
  initialData?: HaulierDTO | null,
  { onDeleteSuccess }: { onDeleteSuccess?: () => void } = {},
) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [haulierData, setHaulierData] = React.useState<HaulierDTO | null | undefined>(initialData);
  const [deleteState, setDeleteState] = React.useState<DeleteDialogState>({ mode: 'idle' });

  const deleteHaulier = useDeleteHaulier();

  const handleConfirmDelete = async () => {
    if (!haulierData?.id) return;
    try {
      await deleteHaulier.mutateAsync(haulierData.id);
      setDeleteState({ mode: 'idle' });
      notifySuccess('Haulier deleted successfully.');
      onDeleteSuccess?.();
    } catch (error) {
      const data = extractErrorData(error) as {
        success?: boolean;
        activeTruckIds?: number[];
        activeDriverIds?: number[];
      } | null;
      if (data?.success === false) {
        setDeleteState({
          mode: 'blocked',
          activeTruckIds: data.activeTruckIds ?? [],
          activeDriverIds: data.activeDriverIds ?? [],
        });
      } else {
        notifyError(extractErrorMessage(error) || 'Failed to delete haulier.');
        setDeleteState({ mode: 'idle' });
      }
    }
  };

  const actions = {
    view: (data?: HaulierDTO | null) => {
      if (data) setHaulierData(data);
      setViewOpen(true);
    },
    delete: () => setDeleteState({ mode: 'confirm' }),
  };

  const confirmDialogs = (
    <>
      <ActionDialog
        open={deleteState.mode === 'confirm'}
        onOpenChangeAction={(open) => {
          if (!open) setDeleteState({ mode: 'idle' });
        }}
        title="Delete Haulier"
        description={<DeleteHaulierDescription haulier={haulierData} />}
        content={<DeleteHaulierContent />}
        confirmText="Delete Haulier"
        confirmVariant="destructive"
        confirmCustomColor="#E7000B"
        cancelText="Cancel"
        onConfirmAction={() => void handleConfirmDelete()}
      />

      <ActionDialog
        open={deleteState.mode === 'blocked'}
        onOpenChangeAction={(open) => {
          if (!open) setDeleteState({ mode: 'idle' });
        }}
        preventOutsideClose
        title="Cannot Delete Haulier"
        description={<CannotDeleteHaulierDescription haulier={haulierData} />}
        content={
          deleteState.mode === 'blocked' ? (
            <CannotDeleteHaulierContent
              haulier={haulierData}
              activeDriverCount={deleteState.activeDriverIds.length}
              activeTruckCount={deleteState.activeTruckIds.length}
            />
          ) : null
        }
        confirmActionNeeded={false}
        cancelText="Close"
        confirmText=""
        onConfirmAction={() => setDeleteState({ mode: 'idle' })}
      />
    </>
  );

  const viewDialog = viewOpen ? (
    <FormDialog
      id={haulierData?.id}
      dialogTitle={haulierData?.haulierName}
      open={viewOpen}
      onOpenChangeAction={(open) => setViewOpen(open)}
      hideTrigger
      dialogWidth="800px"
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

  return { actions, confirmDialogs, viewDialog };
}
