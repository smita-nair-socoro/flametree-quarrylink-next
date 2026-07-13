'use client';

import * as React from 'react';

import { DocketDTO } from '@/lib/types/docket';
import { ActionDialog } from '@/components/action-dialog';
import { FormDialog } from '@/components/form-dialog';
import DocketForm from '@/app/(protected)/customer-operations/dockets/(components)/forms/docket-form';
import { DocketActionButtons } from '@/app/(protected)/customer-operations/dockets/(components)/forms/docket-action-buttons';
import {
  MarkArrivedDescription,
  MarkArrivedContent,
} from '@/hooks/docket/mark-arrived-content';
import {
  MarkDeliveredDescription,
  MarkDeliveredContent,
} from '@/hooks/docket/mark-delivered-content';
import {
  MarkCollectedDescription,
  MarkCollectedContent,
} from '@/hooks/docket/mark-collected-content';
import {
  MarkReadyDescription,
  MarkReadyContent,
} from '@/hooks/docket/mark-ready-content';
import {
  ResumeTransitDescription,
  ResumeTransitContent,
} from '@/hooks/docket/resume-transit-content';
import {
  StopTransitDescription,
  StopTransitContent,
} from '@/hooks/docket/stop-transit-content';
import {
  StartTransitDescription,
  StartTransitContent,
} from '@/hooks/docket/start-transit-content';
import {
  VoidDocketDescription,
  VoidDocketContent,
} from '@/hooks/docket/void-docket-content';
import {
  CancelDocketDescription,
  CancelDocketContent,
} from '@/hooks/docket/cancel-docket-content';
import {
  StartPreparingDescription,
  StartPreparingContent,
} from '@/hooks/docket/start-preparing-content';
import {
  AssignDocketDescription,
  AssignDocketContent,
} from '@/hooks/docket/assign-docket-content';
import {
  DuplicateDocketDescription,
  DuplicateDocketContent,
} from '@/hooks/docket/duplicate-docket-content';
import {
  UnassignDocketDescription,
  UnassignDocketContent,
} from '@/hooks/docket/unassign-docket-content';
import { InvoiceDocketIndividualModal } from '@/hooks/docket/invoice-docket-individual-modal';
import { useQueryClient } from '@tanstack/react-query';
import { useDocketStore } from '@/app/stores/docket-store';
import {
  useUpdateDocketStatus,
  useAssignDocket,
  useUnassignDocket,
  useDuplicateDocket,
  DocketByIdQueryOptions,
} from '@/lib/api/docket';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { addNewRecordId } from '@/lib/utils';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { useInvoiceActions } from '@/hooks/use-invoice-actions';
import { useRetrySync } from '@/lib/api/invoices';

export type DocketActionKey =
  | 'viewDetails'
  | 'assign'
  | 'startTransit'
  | 'unassign'
  | 'cancel'
  | 'void'
  | 'markArrived'
  | 'stop'
  | 'resumeTransit'
  | 'markDelivered'
  | 'invoice'
  | 'viewInvoice'
  | 'startPreparing'
  | 'markReady'
  | 'backToPending'
  | 'markCollected'
  | 'backToPreparing'
  | 'cashSale'
  | 'cashReceipts'
  | 'duplicate';

interface DialogConfig {
  title: string;
  description?: React.ReactNode;
  content: React.ReactNode;
  confirmText: string;
  confirmCustomColor?: string;
  confirmVariant?:
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost';
  confirmDisabled?: boolean;
  confirmCustomClass?: string;
  cancelText?: string;
  cancelButtonClass?: string;
  preventOutsideClose?: boolean;
  customWidth?: string;
  titleClassName?: string;
  subtitle?: string;
  hideSeparator?: boolean;
  buttonContainerClass?: string;
}

interface SelectedAction {
  key: string;
}

export function useDocketActions(docketData?: DocketDTO | null) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [isFormDirty, setIsFormDirty] = React.useState(false);
  const [deliveredProductsConfirmed, setDeliveredProductsConfirmed] =
    React.useState(false);
  const [unloadedPhoto, setUnloadedPhoto] = React.useState<File | null>(null);
  const [receiptPhoto, setReceiptPhoto] = React.useState<File | null>(null);
  const [receiverOnSite, setReceiverOnSite] = React.useState(false);
  const [receiverName, setReceiverName] = React.useState('');
  const [receiverSignature, setReceiverSignature] = React.useState('');
  const [stopReason, setStopReason] = React.useState('');
  const [stopNotes, setStopNotes] = React.useState('');
  const [voidReason, setVoidReason] = React.useState('');
  const [voidNotes, setVoidNotes] = React.useState('');
  const setSelectedDocket = useDocketStore((state) => state.setSelectedDocket);
  const selectedDocket = useDocketStore((s) => {
    if (docketData) {
      return s.selectedDocket?.id === docketData.id ? s.selectedDocket : null;
    }
    return s.selectedDocket;
  });
  const [cancelReason, setCancelReason] = React.useState('');
  const [cancelNotes, setCancelNotes] = React.useState('');
  const [, setSelectedAction] = React.useState<SelectedAction | null>(null);

  // Duplicate state
  const [duplicateCopies, setDuplicateCopies] = React.useState(0);
  const [duplicateRetainPo, setDuplicateRetainPo] = React.useState(true);
  const [duplicateDeliveryDate, setDuplicateDeliveryDate] = React.useState<
    Date | undefined
  >(undefined);
  const [duplicatePurchaseOrder, setDuplicatePurchaseOrder] = React.useState(
    () => docketData?.purchaseOrder ?? '',
  );

  React.useEffect(() => {
    if (duplicateRetainPo) setDuplicatePurchaseOrder(docketData?.purchaseOrder ?? '');
  }, [duplicateRetainPo, docketData?.purchaseOrder]);

  const resetDuplicateState = React.useCallback(() => {
    setDuplicateCopies(0);
    setDuplicateRetainPo(true);
    setDuplicateDeliveryDate(undefined);
    setDuplicatePurchaseOrder(docketData?.purchaseOrder ?? '');
  }, [docketData?.purchaseOrder]);
  const { actions: invoiceActions } = useInvoiceActions((docketData ?? selectedDocket)?.invoiceId);
  const retrySyncMutation = useRetrySync();
  const queryClient = useQueryClient();
  const updateDocketStatusMutation = useUpdateDocketStatus();
  const assignDocketMutation = useAssignDocket();
  const unassignDocketMutation = useUnassignDocket();
  const duplicateDocketMutation = useDuplicateDocket();
  const effectiveDocket = docketData ?? selectedDocket;

  // Assign state
  const [assignHauler, setAssignHauler] = React.useState<number | undefined>(
    undefined,
  );
  const [assignTruck, setAssignTruck] = React.useState<number | undefined>(
    undefined,
  );
  const [assignDriver, setAssignDriver] = React.useState<number | undefined>(
    undefined,
  );
  const [assignExceedsCapacity, setAssignExceedsCapacity] = React.useState(false);

  const resetAssignState = React.useCallback(() => {
    setAssignHauler(undefined);
    setAssignTruck(undefined);
    setAssignDriver(undefined);
    setAssignExceedsCapacity(false);
  }, []);

  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const [header, data] = dataUrl.split(',');
    const mime = /:(.*?);/.exec(header)?.[1] ?? 'image/png';
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.codePointAt(i) ?? 0;
    }
    return new File([array], filename, { type: mime });
  };

  const handleMarkDelivered = async () => {
    if (!docketData?.id) return;
    try {
      const signatureFile = receiverSignature
        ? dataURLtoFile(receiverSignature, 'signature.png')
        : null;

      await updateDocketStatusMutation.mutateAsync({
        docketId: docketData.id,
        docketStatus: DOCKET_STATUS.DELIVERED,
        deliveredProductsConfirmed,
        receiverOnSite,
        receiverName: receiverName.trim() || undefined,
        signatureImage: signatureFile,
        unloadedPhoto,
        receiptPhoto,
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: DOCKET_STATUS.DELIVERED,
      });
      notifySuccess('Docket marked as Delivered');
      setActiveDialog(null);
      setDeliveredProductsConfirmed(false);
      setUnloadedPhoto(null);
      setReceiptPhoto(null);
      setReceiverOnSite(false);
      setReceiverName('');
      setReceiverSignature('');
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleStartTransit = async () => {
    if (!docketData?.id) return;
    try {
      await updateDocketStatusMutation.mutateAsync({
        docketId: docketData.id,
        docketStatus: DOCKET_STATUS.IN_TRANSIT,
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: DOCKET_STATUS.IN_TRANSIT,
      });
      notifySuccess('Docket status updated to In Transit');
      setActiveDialog(null);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleMarkArrived = async () => {
    if (!docketData?.id) return;
    try {
      await updateDocketStatusMutation.mutateAsync({
        docketId: docketData.id,
        docketStatus: DOCKET_STATUS.ARRIVED,
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: DOCKET_STATUS.ARRIVED,
      });
      notifySuccess('Docket marked as Arrived');
      setActiveDialog(null);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleResumeTransit = async () => {
    if (!docketData?.id) return;
    try {
      await updateDocketStatusMutation.mutateAsync({
        docketId: docketData.id,
        docketStatus: DOCKET_STATUS.IN_TRANSIT,
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: DOCKET_STATUS.IN_TRANSIT,
      });
      notifySuccess('Docket transit resumed');
      setActiveDialog(null);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleMarkCollected = async () => {
    if (!docketData?.id) return;
    try {
      await updateDocketStatusMutation.mutateAsync({
        docketId: docketData.id,
        docketStatus: DOCKET_STATUS.COLLECTED,
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: DOCKET_STATUS.COLLECTED,
      });
      notifySuccess('Docket marked as Collected');
      setActiveDialog(null);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleMarkReady = async () => {
    if (!docketData?.id) return;
    try {
      await updateDocketStatusMutation.mutateAsync({
        docketId: docketData.id,
        docketStatus: DOCKET_STATUS.READY,
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: DOCKET_STATUS.READY,
      });
      notifySuccess('Docket marked as Ready for Collection');
      setActiveDialog(null);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleBackToPending = async () => {
    if (!docketData?.id) return;
    try {
      await updateDocketStatusMutation.mutateAsync({
        docketId: docketData.id,
        docketStatus: DOCKET_STATUS.PENDING,
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: DOCKET_STATUS.PENDING,
      });
      notifySuccess('Docket status updated to Pending');
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleStartPreparing = async () => {
    if (!docketData?.id) return;
    try {
      await updateDocketStatusMutation.mutateAsync({
        docketId: docketData.id,
        docketStatus: DOCKET_STATUS.PREPARING,
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: DOCKET_STATUS.PREPARING,
      });
      notifySuccess('Docket status updated to Preparing');
      setActiveDialog(null);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleStopTransit = async () => {
    if (!docketData?.id) return;
    try {
      const composedReason = stopNotes.trim()
        ? `${stopReason}-${stopNotes.trim()}`
        : stopReason;
      await updateDocketStatusMutation.mutateAsync({
        docketId: docketData.id,
        docketStatus: DOCKET_STATUS.STOPPED,
        reason: composedReason,
        notes: stopNotes.trim() || undefined,
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: DOCKET_STATUS.STOPPED,
      });
      notifySuccess('Docket transit stopped');
      setActiveDialog(null);
      setStopReason('');
      setStopNotes('');
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleRetrySync = async () => {
    if (!docketData?.id) return;
    try {
      await retrySyncMutation.mutateAsync(docketData.jobId);
      const freshDocket = await queryClient.fetchQuery(DocketByIdQueryOptions(docketData.id));
      if (freshDocket) setSelectedDocket(freshDocket);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const isVoidFormValid = React.useMemo(() => {
    if (!voidReason) return false;
    if (voidReason === 'other') return Boolean(voidNotes.trim());
    return true;
  }, [voidNotes, voidReason]);

  const isCancelFormValid = React.useMemo(() => {
    if (!cancelReason) return false;
    if (cancelReason === 'other') return Boolean(cancelNotes.trim());
    return true;
  }, [cancelNotes, cancelReason]);

  const handleVoidDocket = async () => {
    if (!docketData?.id) return;
    try {
      const composedReason = voidNotes.trim()
        ? `${voidReason}-${voidNotes.trim()}`
        : voidReason;
      await updateDocketStatusMutation.mutateAsync({
        docketId: docketData.id,
        docketStatus: DOCKET_STATUS.VOIDED,
        reason: composedReason,
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: DOCKET_STATUS.VOIDED,
      });
      notifySuccess('Docket voided');
      setActiveDialog(null);
      setVoidReason('');
      setVoidNotes('');
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleCancelDocket = async () => {
    if (!docketData?.id) return;
    try {
      const composedReason = cancelNotes.trim()
        ? `${cancelReason}-${cancelNotes.trim()}`
        : cancelReason;
      await updateDocketStatusMutation.mutateAsync({
        docketId: docketData.id,
        docketStatus: DOCKET_STATUS.CANCELLED,
        reason: composedReason,
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: DOCKET_STATUS.CANCELLED,
      });
      notifySuccess('Docket cancelled');
      setActiveDialog(null);
      setCancelReason('');
      setCancelNotes('');
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleAssignDocket = async () => {
    if (!effectiveDocket?.id || !assignTruck || !assignDriver) return;
    try {
      const result = await assignDocketMutation.mutateAsync({
        docketId: effectiveDocket.id,
        truckId: assignTruck,
        driverId: assignDriver,
        deliveryStartWindow: effectiveDocket.deliveryCollectionStartTime,
        deliveryEndWindow: effectiveDocket.deliveryCollectionEndTime,
      });
      setSelectedDocket({
        ...effectiveDocket,
        docketStatus: result.docketStatus,
        truckId: result.truckId,
        driverId: result.driverId,
      });
      notifySuccess('Docket assigned successfully');
      setActiveDialog(null);
      resetAssignState();
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleUnassignDocket = async () => {
    if (!docketData?.id) return;
    try {
      const result = await unassignDocketMutation.mutateAsync({
        docketId: docketData.id,
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: result.docketStatus,
        truckId: result.truckId,
        driverId: result.driverId,
      });
      notifySuccess('Docket unassigned successfully');
      setActiveDialog(null);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleDuplicateDocket = async () => {
    if (!docketData?.id || !duplicateDeliveryDate) return;
    try {
      const result = await duplicateDocketMutation.mutateAsync({
        id: docketData.id,
        data: {
          numberOfCopies: duplicateCopies,
          retainPurchaseOrder: duplicateRetainPo,
          purchaseOrder: duplicateRetainPo ? undefined : duplicatePurchaseOrder,
          deliveryCollectionDate: duplicateDeliveryDate.toISOString(),
        },
      });
      result.dockets.forEach((d) =>
        addNewRecordId('docket_main_data_table', d.id),
      );
      notifySuccess(
        `${result.dockets.length} docket${result.dockets.length === 1 ? '' : 's'} duplicated successfully`,
      );
      setActiveDialog(null);
      resetDuplicateState();
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const duplicateLoadSize =
    docketData?.plannedLoadSize || docketData?.actualLoadSize || docketData?.loadSize || 0;
  const duplicateRemaining = docketData?.jobItem?.remainingQuantity ?? 0;
  const duplicateMaxCopies = duplicateLoadSize > 0 ? Math.floor(duplicateRemaining / duplicateLoadSize) : 99;
  const isDuplicateFormValid =
    duplicateCopies >= 1 &&
    duplicateCopies <= duplicateMaxCopies &&
    !!duplicateDeliveryDate;

  const isStopFormValid = React.useMemo(() => {
    if (!stopReason) return false;
    if (stopReason === 'other') return Boolean(stopNotes.trim());
    return true;
  }, [stopNotes, stopReason]);

  const isMarkDeliveredFormValid = React.useMemo(() => {
    if (!deliveredProductsConfirmed) return false;
    if (!receiverOnSite) return true;

    return Boolean(receiverName.trim() && receiverSignature.trim());
  }, [
    deliveredProductsConfirmed,
    receiverName,
    receiverOnSite,
    receiverSignature,
  ]);

  const isAssignFormValid = Boolean(assignTruck && assignDriver) && !assignExceedsCapacity;

  const loadSizeDiffersFromPlanned = React.useMemo(() => {
    if (!effectiveDocket) return false;
    const planned = effectiveDocket.plannedLoadSize;
    const actual = effectiveDocket.actualLoadSize;
    if (planned == null || actual == null) return false;
    return actual !== planned;
  }, [effectiveDocket]);

  const dialogConfigs = React.useMemo<Record<string, DialogConfig>>(
    () => ({
      assign: {
        title: 'Assign docket',
        description: <AssignDocketDescription docket={effectiveDocket} />,
        content: (
          <AssignDocketContent
            docket={effectiveDocket}
            haulerSelection={assignHauler}
            truckSelection={assignTruck}
            driverSelection={assignDriver}
            onHaulerChange={setAssignHauler}
            onTruckChange={setAssignTruck}
            onDriverChange={setAssignDriver}
            onClose={() => { setActiveDialog(null); setViewOpen(false); }}
            onExceedsCapacity={setAssignExceedsCapacity}
          />
        ),
        confirmText: 'Assign docket',
        confirmCustomColor: '#3B82F6',
        confirmDisabled: !isAssignFormValid,
        cancelText: 'Cancel',
      },
      markArrived: {
        title: 'Mark as Arrived',
        description: <MarkArrivedDescription docket={docketData} />,
        content: <MarkArrivedContent docket={docketData} isAdmin={true} />,
        confirmText: 'Confirm Arrival',
        confirmCustomColor: '#3B82F6',
        cancelText: 'Cancel',
      },
      markDelivered: {
        title: 'Mark as Delivered',
        description: <MarkDeliveredDescription docket={docketData} />,
        content: (
          <MarkDeliveredContent
            deliveredProductsConfirmed={deliveredProductsConfirmed}
            onDeliveredProductsConfirmedChange={setDeliveredProductsConfirmed}
            unloadedPhoto={unloadedPhoto}
            onUnloadedPhotoChange={setUnloadedPhoto}
            receiptPhoto={receiptPhoto}
            onReceiptPhotoChange={setReceiptPhoto}
            receiverOnSite={receiverOnSite}
            onReceiverOnSiteChange={setReceiverOnSite}
            receiverName={receiverName}
            onReceiverNameChange={setReceiverName}
            receiverSignature={receiverSignature}
            onReceiverSignatureChange={setReceiverSignature}
            onClearSignature={() => setReceiverSignature('')}
          />
        ),
        confirmText: 'Mark as Delivered',
        confirmCustomColor: '#8B5CF6',
        confirmDisabled: !isMarkDeliveredFormValid,
        cancelText: 'Cancel',
        preventOutsideClose: true,
      },
      startTransit: {
        title: 'Start Transit',
        description: <StartTransitDescription docket={effectiveDocket} />,
        content: <StartTransitContent docket={effectiveDocket} />,
        confirmText: 'Start Transit',
        confirmCustomColor: '#3B82F6',
        cancelText: 'Cancel',
      },
      resumeTransit: {
        title: 'Resume Transit',
        description: <ResumeTransitDescription docket={effectiveDocket} />,
        content: <ResumeTransitContent docket={effectiveDocket} />,
        confirmText: 'Resume Transit',
        confirmCustomColor: '#008236',
        cancelText: 'Cancel',
      },
      markReady: {
        title: 'Mark as Ready',
        description: <MarkReadyDescription docket={effectiveDocket} />,
        content: <MarkReadyContent docket={effectiveDocket} />,
        confirmText: 'Mark as Ready',
        confirmCustomColor: '#10B981',
        cancelText: 'Cancel',
      },
      markCollected: {
        title: 'Mark as Collected',
        description: <MarkCollectedDescription docket={effectiveDocket} />,
        content: <MarkCollectedContent docket={effectiveDocket} />,
        confirmText: 'Mark as Collected',
        confirmCustomColor: '#008236',
        cancelText: 'Cancel',
      },
      stop: {
        title: 'Stop Transit',
        description: <StopTransitDescription docket={docketData} />,
        content: (
          <StopTransitContent
            stopReason={stopReason}
            onStopReasonChange={setStopReason}
            stopNotes={stopNotes}
            onStopNotesChange={setStopNotes}
          />
        ),
        confirmText: 'Stop Transit',
        confirmCustomColor: '#F97316',
        confirmVariant: 'destructive',
        confirmDisabled: !isStopFormValid,
        cancelText: 'Cancel',
      },
      startPreparing: {
        title: 'Start Preparing',
        description: <StartPreparingDescription docket={effectiveDocket} />,
        content: <StartPreparingContent docket={effectiveDocket} />,
        confirmText: 'Start Preparing',
        confirmCustomColor: '#F97316',
        cancelText: 'Cancel',
      },
      void: {
        title: 'Void Docket',
        description: <VoidDocketDescription docket={docketData} />,
        content: (
          <VoidDocketContent
            voidReason={voidReason}
            onVoidReasonChange={setVoidReason}
            voidNotes={voidNotes}
            onVoidNotesChange={setVoidNotes}
          />
        ),
        confirmText: 'Void Docket',
        confirmCustomColor: '#E7000B',
        confirmVariant: 'destructive',
        confirmDisabled: !isVoidFormValid,
        cancelText: 'Cancel',
      },
      cancel: {
        title: 'Cancel Docket',
        description: <CancelDocketDescription docket={docketData} />,
        content: (
          <CancelDocketContent
            cancelReason={cancelReason}
            onCancelReasonChange={setCancelReason}
            cancelNotes={cancelNotes}
            onCancelNotesChange={setCancelNotes}
          />
        ),
        confirmText: 'Cancel Docket',
        confirmCustomColor: '#E7000B',
        confirmVariant: 'destructive',
        confirmDisabled: !isCancelFormValid,
        cancelText: 'Keep Docket',
      },
      duplicate: {
        title: 'Duplicate Docket',
        subtitle: `Create a copy of docket ${effectiveDocket?.docketNumber ?? ''}`,
        description: (
          <div className="-mt-[18px] flex flex-col gap-6">
            <div className="-mx-[25px] border-t border-[#F3F4F6]" />
            <DuplicateDocketDescription docket={effectiveDocket} copies={duplicateCopies} />
          </div>
        ),
        content: (
          <DuplicateDocketContent
            docket={effectiveDocket}
            copies={duplicateCopies}
            onCopiesChange={setDuplicateCopies}
            retainPoNumber={duplicateRetainPo}
            onRetainPoNumberChange={setDuplicateRetainPo}
            newDeliveryDate={duplicateDeliveryDate}
            onNewDeliveryDateChange={setDuplicateDeliveryDate}
            poValue={duplicatePurchaseOrder}
            onPoValueChange={setDuplicatePurchaseOrder}
          />
        ),
        confirmText: 'Create Copy',
        confirmCustomColor: '#99A1AF',
        confirmCustomClass: 'h-[37px] w-[114px] rounded-[10px] pt-[9px] pr-[15px] pb-[8px] pl-[16px] cursor-pointer hover:opacity-80 transition-opacity',
        confirmDisabled: !isDuplicateFormValid,
        cancelText: 'Cancel',
        cancelButtonClass: 'h-[37px] w-[79px] rounded-[10px] border border-[#E5E7EB] pt-[9px] pr-[16px] pb-[8px] pl-[17px] text-[#364153]',
        customWidth: "w-full !max-w-[672px]",
        titleClassName: 'text-2xl',
        hideSeparator: true,
        buttonContainerClass: '-mt-[19px] -mx-[25px] px-[25px] border-t border-[#F3F4F6] flex justify-end items-center gap-3 pt-6',
      },
      unassign: {
        title: 'Confirm unassign',
        description: <UnassignDocketDescription docket={effectiveDocket} />,
        content: <UnassignDocketContent docket={effectiveDocket} />,
        confirmText: 'Unassign docket',
        confirmVariant: 'destructive',
        cancelText: 'Cancel',
        preventOutsideClose: true,
      },
    }),
    [
      docketData,
      effectiveDocket,
      deliveredProductsConfirmed,
      isMarkDeliveredFormValid,
      isStopFormValid,
      isVoidFormValid,
      isCancelFormValid,
      isAssignFormValid,
      isDuplicateFormValid,
      duplicateCopies,
      duplicateRetainPo,
      duplicateDeliveryDate,
      duplicatePurchaseOrder,
      receiptPhoto,
      receiverName,
      receiverOnSite,
      receiverSignature,
      stopNotes,
      stopReason,
      unloadedPhoto,
      voidNotes,
      voidReason,
      cancelNotes,
      cancelReason,
      assignHauler,
      assignTruck,
      assignDriver,
      assignExceedsCapacity,
    ],
  );

  const createDialogAction = (actionKey: string) => () => {
    setActiveDialog(actionKey);
  };

  const actions = {
    view: (docket?: DocketDTO | null) => {
      const toSelect = docket ?? docketData;
      if (toSelect != null) {
        setSelectedDocket(toSelect);
      }
      setViewOpen(true);
    },
    startTransit: createDialogAction('startTransit'),
    resumeTransit: createDialogAction('resumeTransit'),
    markArrived: createDialogAction('markArrived'),
    markDelivered: createDialogAction('markDelivered'),
    stop: createDialogAction('stop'),
    markReady: createDialogAction('markReady'),
    markCollected: createDialogAction('markCollected'),
    void: createDialogAction('void'),
    remove: createDialogAction('remove'),
    duplicate: createDialogAction('duplicate'),
    cancel: () => {
      setCancelReason('');
      setCancelNotes('');
      setActiveDialog('cancel');
    },
    unassign: () => {
      if (loadSizeDiffersFromPlanned) {
        console.log('Load size differs from planned');
        createDialogAction('unassign')();
        return;
      }
      console.log('Load size does not differ from planned');
      void handleUnassignDocket();
    },
    startPreparing: createDialogAction('startPreparing'),
    cashSale: () => {
      console.log('Cash sale confirmed:', docketData);
    },
    invoice: createDialogAction('invoice'),
    cashReceipts: () => {
      console.log('Cash receipts confirmed:', docketData);
    },
    viewInvoice: () => {
      invoiceActions.viewDetails();
    },

    retrySync: handleRetrySync,

    assign: createDialogAction('assign'),

    backToPending: handleBackToPending,
    backToPreparing: () => {
      console.log('Back to preparing confirmed:', docketData);
    },
  };

  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;

    return (
      <ActionDialog
        key={key}
        open={activeDialog === key}
        onOpenChangeAction={(open) => {
          if (!open) {
            if (key === 'assign') resetAssignState();
            if (key === 'duplicate') resetDuplicateState();
            setActiveDialog(null);
          }
        }}
        title={config.title}
        description={config.description}
        content={config.content}
        confirmText={config.confirmText}
        confirmCustomColor={config.confirmCustomColor}
        confirmVariant={config.confirmVariant}
        confirmDisabled={config.confirmDisabled}
        confirmCustomClass={config.confirmCustomClass}
        cancelText={config.cancelText}
        cancelButtonClass={config.cancelButtonClass}
        preventOutsideClose={config.preventOutsideClose}
        customWidth={config.customWidth}
        titleClassName={config.titleClassName}
        subtitle={config.subtitle}
        hideSeparator={config.hideSeparator}
        buttonContainerClass={config.buttonContainerClass}

        onConfirmAction={async () => {
          switch (key) {
            case 'assign':
              await handleAssignDocket();
              break;
            case 'startTransit':
              await handleStartTransit();
              break;
            case 'resumeTransit':
              await handleResumeTransit();
              break;
            case 'markArrived':
              await handleMarkArrived();
              break;
            case 'markDelivered':
              await handleMarkDelivered();
              break;
            case 'stop':
              await handleStopTransit();
              break;
            case 'markReady':
              await handleMarkReady();
              break;
            case 'markCollected':
              await handleMarkCollected();
              break;
            case 'cancel':
              await handleCancelDocket();
              break;
            case 'void':
              await handleVoidDocket();
              break;
            case 'startPreparing':
              await handleStartPreparing();
              break;
            case 'duplicate':
              await handleDuplicateDocket();
              break;
            case 'cashSale':
              console.log('Cash sale confirmed:', docketData);
              break;
            case 'cashReceipts':
              console.log('Cash receipts confirmed:', docketData);
              break;
            case 'unassign':
              await handleUnassignDocket();
              break;
            case 'backToPending':
              console.log('Back to pending confirmed:', docketData);
              break;
            case 'backToPreparing':
              console.log('Back to preparing confirmed:', docketData);
              break;
          }
        }}
      />
    );
  });

  const canEdit = ['UNASSIGNED', 'PENDING', 'ASSIGNED'].includes(
    effectiveDocket?.docketStatus ?? '',
  );
  const viewDialog = viewOpen ? (
    <FormDialog
      id={effectiveDocket?.id}
      dialogTitle="View / Edit Docket"
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        if (!open) {
          setIsFormDirty(false);
          setTimeout(() => {
            setViewOpen(false);
          }, 100);
        }
      }}
      onUnsavedChangesChange={setIsFormDirty}
      hideTrigger
      headerButtons={
        <DocketActionButtons docket={effectiveDocket} hasUnsavedChanges={isFormDirty} />
      }
      headerInfo={{
        useSelectedDocket: true,
      }}
    >
      <DocketForm
        canEdit={canEdit}
        initialDocket={effectiveDocket}
      />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs: [
      ...confirmDialogs,
      <InvoiceDocketIndividualModal
        key="invoiceDocketIndividual"
        open={activeDialog === 'invoice'}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null);
        }}
        docket={docketData}
      />
    ],
    viewDialog,
    isDialogOpen: activeDialog !== null,
  };
}
