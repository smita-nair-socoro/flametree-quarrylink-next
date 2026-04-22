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
import { useDocketStore } from '@/app/stores/docket-store';
import { useUpdateDocketStatus, useUpdateDocket, DocketByIdQueryOptions } from '@/lib/api/docket';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { useQuery } from '@tanstack/react-query';

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
  | 'cashReceipts';

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
  cancelText?: string;
  preventOutsideClose?: boolean;
}

interface SelectedAction {
  key: string;
}

export function useDocketActions(docketData?: DocketDTO | null) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
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
  const selectedDocket = useDocketStore((s) => s.selectedDocket);
  const setSelectedDocket = useDocketStore((state) => state.setSelectedDocket);
  const [cancelReason, setCancelReason] = React.useState('');
  const [cancelNotes, setCancelNotes] = React.useState('');
  const [selectedAction, setSelectedAction] =
    React.useState<SelectedAction | null>(null);

  const updateDocketStatusMutation = useUpdateDocketStatus();
  const updateDocketMutation = useUpdateDocket();

  // Assign state
  const [assignHauler, setAssignHauler] = React.useState<number | undefined>(undefined);
  const [assignTruck, setAssignTruck] = React.useState<number | undefined>(undefined);
  const [assignDriver, setAssignDriver] = React.useState<number | undefined>(undefined);

  const resetAssignState = React.useCallback(() => {
    setAssignHauler(undefined);
    setAssignTruck(undefined);
    setAssignDriver(undefined);
  }, []);

  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
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
        ...selectedDocket as DocketDTO,
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
        ...selectedDocket as DocketDTO,
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
      let latitude: string | undefined;
      let longitude: string | undefined;

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              latitude = pos.coords.latitude.toFixed(7);
              longitude = pos.coords.longitude.toFixed(7);
              resolve();
            },
            () => resolve(), // proceed without coords if denied/unavailable
          );
        });
      }

      await updateDocketStatusMutation.mutateAsync({
        docketId: docketData.id,
        docketStatus: DOCKET_STATUS.ARRIVED,
        latitude,
        longitude,
      });
      setSelectedDocket({
        ...selectedDocket as DocketDTO,
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
        ...selectedDocket as DocketDTO,
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
        ...selectedDocket as DocketDTO,
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
      notifySuccess('Docket marked as Ready for Collection');
      setActiveDialog(null);
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
        ...selectedDocket as DocketDTO,
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
        ...selectedDocket as DocketDTO,
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
        ...selectedDocket as DocketDTO,
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
        ...selectedDocket as DocketDTO,
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
    if (!docketData?.id) return;
    try {
      await updateDocketMutation.mutateAsync({
        id: docketData.id,
        data: {
          truckId: assignTruck,
          driverId: assignDriver,
          docketStatus: DOCKET_STATUS.ASSIGNED,
        },
      });
      setSelectedDocket({
        ...(selectedDocket as DocketDTO),
        docketStatus: DOCKET_STATUS.ASSIGNED,
        truckId: assignTruck ?? docketData.truckId,
        driverId: assignDriver ?? docketData.driverId,
      });
      notifySuccess('Docket assigned successfully');
      setActiveDialog(null);
      resetAssignState();
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

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

  const isAssignFormValid = Boolean(assignTruck && assignDriver);

  const dialogConfigs = React.useMemo<Record<string, DialogConfig>>(
    () => ({
      assign: {
        title: 'Assign docket',
        description: <AssignDocketDescription docket={docketData} />,
        content: (
          <AssignDocketContent
            docket={docketData}
            haulerSelection={assignHauler}
            truckSelection={assignTruck}
            driverSelection={assignDriver}
            onHaulerChange={setAssignHauler}
            onTruckChange={setAssignTruck}
            onDriverChange={setAssignDriver}
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
        content: <MarkArrivedContent docket={docketData} />,
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
        description: <StartTransitDescription docket={docketData} />,
        content: <StartTransitContent docket={docketData} />,
        confirmText: 'Start Transit',
        confirmCustomColor: '#3B82F6',
        cancelText: 'Cancel',
      },
      resumeTransit: {
        title: 'Resume Transit',
        description: <ResumeTransitDescription docket={docketData} />,
        content: <ResumeTransitContent docket={docketData} />,
        confirmText: 'Resume Transit',
        confirmCustomColor: '#008236',
        cancelText: 'Cancel',
      },
      markReady: {
        title: 'Mark as Ready',
        description: <MarkReadyDescription docket={docketData} />,
        content: <MarkReadyContent docket={docketData} />,
        confirmText: 'Mark as Ready',
        confirmCustomColor: '#10B981',
        cancelText: 'Cancel',
      },
      markCollected: {
        title: 'Mark as Collected',
        description: <MarkCollectedDescription docket={docketData} />,
        content: <MarkCollectedContent docket={docketData} />,
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
        description: <StartPreparingDescription docket={docketData} />,
        content: <StartPreparingContent docket={docketData} />,
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
    }),
    [
      docketData,
      deliveredProductsConfirmed,
      isMarkDeliveredFormValid,
      isStopFormValid,
      isVoidFormValid,
      isCancelFormValid,
      isAssignFormValid,
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
    ],
  );

  const createDialogAction = (actionKey: string) => {
    return () => {
      setSelectedAction({ key: actionKey });
      setActiveDialog(actionKey);
    };
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
    cancel: createDialogAction('cancel'),
    unassign: () => {
      console.log('Unassign docket confirmed:', docketData);
    },
    startPreparing: createDialogAction('startPreparing'),
    cashSale: () => {
      console.log('Cash sale confirmed:', docketData);
    },
    invoice: () => {
      console.log('Invoice confirmed:', docketData);
    },
    cashReceipts: () => {
      console.log('Cash receipts confirmed:', docketData);
    },
    viewInvoice: () => {
      console.log('View invoice confirmed:', docketData);
    },
    assign: createDialogAction('assign'),

    backToPending: () => {
      console.log('Back to pending confirmed:', docketData);
    },
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
        cancelText={config.cancelText}
        preventOutsideClose={config.preventOutsideClose}
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
            case 'cashSale':
              console.log('Cash sale confirmed:', docketData);
              break;
            case 'invoice':
              console.log('Invoice confirmed:', docketData);
              break;
            case 'cashReceipts':
              console.log('Cash receipts confirmed:', docketData);
              break;
            case 'viewInvoice':
              console.log('View invoice confirmed:', docketData);
              break;
            case 'assign':
              console.log('Assign docket confirmed:', docketData);
              break;
            case 'unassign':
              console.log('Unassign docket confirmed:', docketData);
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

  const canEdit = ['UNASSIGNED', 'ASSIGNED'].includes(
    (docketData ?? selectedDocket)?.docketStatus ?? '',
  );
  const viewDialog = viewOpen ? (
    <FormDialog
      id={selectedDocket?.id}
      dialogTitle="View / Edit Docket"
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        if (!open) {
          setTimeout(() => {
            setViewOpen(false);
          }, 100);
        }
      }}
      hideTrigger
      headerButtons={
        <DocketActionButtons docket={docketData ?? selectedDocket} />
      }
      headerInfo={{
        useSelectedDocket: true,
      }}
    >
      <DocketForm canEdit={canEdit} />
    </FormDialog>
  ) : null;

  return {
    actions,
    confirmDialogs,
    viewDialog,
    isDialogOpen: activeDialog !== null,
  };
}
