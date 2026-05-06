'use client';

import * as React from 'react';

import { DocketDTO } from '@/lib/types/docket';
import { ActionDialog } from '@/components/action-dialog';
import {
  MarkArrivedDescription,
  MarkArrivedContent,
} from '@/hooks/docket/mark-arrived-content';
import {
  MarkDeliveredDescription,
  MarkDeliveredContent,
} from '@/hooks/docket/mark-delivered-content';
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
import { useDriverAppUpdateDocketStatus } from '@/lib/api/driver-app';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';

export function useDriverAppDocketActions(docketData?: DocketDTO | null) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);

  const [deliveredProductsConfirmed, setDeliveredProductsConfirmed] =
    React.useState(false);
  const [receiverOnSite, setReceiverOnSite] = React.useState(false);
  const [receiverName, setReceiverName] = React.useState('');
  const [receiverSignature, setReceiverSignature] = React.useState('');
  const [unloadedPhoto, setUnloadedPhoto] = React.useState<File | null>(null);
  const [receiptPhoto, setReceiptPhoto] = React.useState<File | null>(null);
  const [stopReason, setStopReason] = React.useState('');
  const [stopNotes, setStopNotes] = React.useState('');

  const updateStatus = useDriverAppUpdateDocketStatus();

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleMarkArrived = async () => {
    if (!docketData?.id) return;
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              latitude = pos.coords.latitude;
              longitude = pos.coords.longitude;
              resolve();
            },
            () => resolve(),
          );
        });
      }

      await updateStatus.mutateAsync({
        id: docketData.id,
        docketStatus: DOCKET_STATUS.ARRIVED,
        latitude,
        longitude,
      });
      notifySuccess('Docket marked as Arrived');
      setActiveDialog(null);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleStartTransit = async () => {
    if (!docketData?.id) return;
    try {
      await updateStatus.mutateAsync({
        id: docketData.id,
        docketStatus: DOCKET_STATUS.IN_TRANSIT,
      });
      notifySuccess('Docket status updated to In Transit');
      setActiveDialog(null);
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleMarkDelivered = async () => {
    if (!docketData?.id) return;
    try {
      const [unloadedPhotos, receivedPhotos] = await Promise.all([
        unloadedPhoto ? fileToBase64(unloadedPhoto).then((b) => [b]) : Promise.resolve(undefined),
        receiptPhoto ? fileToBase64(receiptPhoto).then((b) => [b]) : Promise.resolve(undefined),
      ]);

      await updateStatus.mutateAsync({
        id: docketData.id,
        docketStatus: DOCKET_STATUS.DELIVERED,
        deliveredProductsConfirmed,
        receiverOnSite,
        receiverName: receiverName.trim() || undefined,
        signatureImage: receiverSignature || undefined,
        unloadedPhotos,
        receivedPhotos,
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

  const handleStopTransit = async () => {
    if (!docketData?.id) return;
    try {
      const composedReason = stopNotes.trim()
        ? `${stopReason}-${stopNotes.trim()}`
        : stopReason;
      await updateStatus.mutateAsync({
        id: docketData.id,
        docketStatus: DOCKET_STATUS.STOPPED,
        reason: composedReason,
        notes: stopNotes.trim() || undefined,
      });
      notifySuccess('Docket transit stopped');
      setActiveDialog(null);
      setStopReason('');
      setStopNotes('');
    } catch (error) {
      notifyError(extractErrorMessage(error));
    }
  };

  const handleResumeTransit = async () => {
    if (!docketData?.id) return;
    try {
      await updateStatus.mutateAsync({
        id: docketData.id,
        docketStatus: DOCKET_STATUS.IN_TRANSIT,
      });
      notifySuccess('Docket transit resumed');
      setActiveDialog(null);
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
  }, [deliveredProductsConfirmed, receiverName, receiverOnSite, receiverSignature]);

  const dialogConfigs = React.useMemo(
    () => ({
      markArrived: {
        title: 'Mark as Arrived',
        description: <MarkArrivedDescription docket={docketData} />,
        content: <MarkArrivedContent docket={docketData} />,
        confirmText: 'Confirm Arrival',
        confirmCustomColor: '#3B82F6',
        cancelText: 'Cancel',
        confirmDisabled: false,
      },
      startTransit: {
        title: 'Start Transit',
        description: <StartTransitDescription docket={docketData} />,
        content: <StartTransitContent docket={docketData} />,
        confirmText: 'Start Transit',
        confirmCustomColor: '#3B82F6',
        cancelText: 'Cancel',
        confirmDisabled: false,
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
        confirmVariant: 'destructive' as const,
        confirmDisabled: !isStopFormValid,
        cancelText: 'Cancel',
      },
      resumeTransit: {
        title: 'Resume Transit',
        description: <ResumeTransitDescription docket={docketData} />,
        content: <ResumeTransitContent docket={docketData} />,
        confirmText: 'Resume Transit',
        confirmCustomColor: '#008236',
        cancelText: 'Cancel',
        confirmDisabled: false,
      },
    }),
    [
      docketData,
      deliveredProductsConfirmed,
      isMarkDeliveredFormValid,
      isStopFormValid,
      receiptPhoto,
      receiverName,
      receiverOnSite,
      receiverSignature,
      stopNotes,
      stopReason,
      unloadedPhoto,
    ],
  );

  const actions = {
    markArrived: () => setActiveDialog('markArrived'),
    startTransit: () => setActiveDialog('startTransit'),
    markDelivered: () => setActiveDialog('markDelivered'),
    stop: () => setActiveDialog('stop'),
    resumeTransit: () => setActiveDialog('resumeTransit'),
  };

  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;
    return (
      <ActionDialog
        key={key}
        open={activeDialog === key}
        onOpenChangeAction={(open) => {
          if (!open) setActiveDialog(null);
        }}
        title={config.title}
        description={config.description}
        content={config.content}
        confirmText={config.confirmText}
        confirmCustomColor={config.confirmCustomColor}
        confirmVariant={'confirmVariant' in config ? config.confirmVariant : undefined}
        confirmDisabled={config.confirmDisabled}
        cancelText={config.cancelText}
        preventOutsideClose={'preventOutsideClose' in config ? config.preventOutsideClose : undefined}
        onConfirmAction={async () => {
          switch (key) {
            case 'markArrived': await handleMarkArrived(); break;
            case 'startTransit': await handleStartTransit(); break;
            case 'markDelivered': await handleMarkDelivered(); break;
            case 'stop': await handleStopTransit(); break;
            case 'resumeTransit': await handleResumeTransit(); break;
          }
        }}
      />
    );
  });

  return {
    actions,
    confirmDialogs,
    isDialogOpen: activeDialog !== null,
  };
}
