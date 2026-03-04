'use client';

import * as React from 'react';
import { type LucideIcon } from 'lucide-react';
import {
  Eye,
  UserPlus,
  CircleX,
  Undo2,
  CircleCheckBig,
  Check,
  ReceiptText,
  Square,
  CirclePlay,
  Receipt,
  Trash2,
} from 'lucide-react';
import { Docket } from '@/lib/types/docket';
import { DOCKET_TYPE } from '@/lib/types/docket-enums';
import { ActionDialog } from '@/components/action-dialog';
import { MarkArrivedContent } from '@/hooks/docket/mark-arrived-content';
import { VoidDocketContent } from '@/hooks/docket/void-docket-content';

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

interface ActionDefinition {
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
}

interface DialogConfig {
  title: string;
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
}

const ACTION_DEFINITIONS: Record<DocketActionKey, ActionDefinition> = {
  viewDetails: {
    label: 'View Details',
    icon: Eye,
  },
  assign: {
    label: 'Assign',
    icon: UserPlus,
  },
  startTransit: {
    label: 'Start Transit',
    icon: CirclePlay,
  },
  unassign: {
    label: 'Unassign',
    icon: Undo2,
  },
  cancel: {
    label: 'Cancel',
    icon: CircleX,
  },
  void: {
    label: 'Void',
    icon: Trash2,
    destructive: true,
  },
  markArrived: {
    label: 'Mark Arrived',
    icon: CircleCheckBig,
  },
  stop: {
    label: 'Stop',
    icon: Square,
    destructive: true,
  },
  resumeTransit: {
    label: 'Resume Transit',
    icon: ReceiptText,
  },
  markDelivered: {
    label: 'Mark Delivered',
    icon: CircleCheckBig,
  },
  invoice: {
    label: 'Invoice',
    icon: Receipt,
  },
  viewInvoice: {
    label: 'View Invoice',
    icon: Receipt,
  },
  startPreparing: {
    label: 'Start Preparing',
    icon: CirclePlay,
  },
  markReady: {
    label: 'Mark Ready',
    icon: Check,
  },
  backToPending: {
    label: 'Back to Pending',
    icon: Undo2,
  },
  markCollected: {
    label: 'Mark Collected',
    icon: CircleCheckBig,
  },
  backToPreparing: {
    label: 'Back to Preparing',
    icon: Undo2,
  },
  cashSale: {
    label: 'Cash Sale',
    icon: ReceiptText,
  },
  cashReceipts: {
    label: 'Cash Receipts',
    icon: ReceiptText,
  },
};

const DELIVERY_ACTIONS: Record<string, DocketActionKey[]> = {
  UNASSIGNED: ['viewDetails', 'assign', 'cancel', 'void'],
  ASSIGNED: ['viewDetails', 'startTransit', 'unassign', 'cancel', 'void'],
  IN_TRANSIT: ['viewDetails', 'markArrived', 'stop'],
  STOPPED: ['viewDetails', 'resumeTransit', 'unassign', 'cancel', 'void'],
  ARRIVED: ['viewDetails', 'markDelivered', 'cancel', 'void'],
  DELIVERED: ['viewDetails', 'invoice', 'cancel', 'void'],
  INVOICED: ['viewDetails', 'viewInvoice'],
  VOIDED: ['viewDetails'],
  CANCELLED: ['viewDetails'],
  DEFAULT: ['viewDetails'],
};

const COLLECTION_ACTIONS: Record<string, DocketActionKey[]> = {
  PENDING: ['viewDetails', 'startPreparing', 'cancel', 'void'],
  PREPARING: ['viewDetails', 'markReady', 'backToPending', 'cancel', 'void'],
  READY: ['viewDetails', 'markCollected', 'backToPreparing', 'cancel', 'void'],
  COLLECTED: ['viewDetails', 'cashSale', 'invoice'],
  CASH_SALE: ['viewDetails', 'cashReceipts'],
  INVOICED: ['viewDetails', 'viewInvoice'],
  VOIDED: ['viewDetails'],
  CANCELLED: ['viewDetails'],
  DEFAULT: ['viewDetails'],
};

const ACTION_MATRIX: Record<DOCKET_TYPE, Record<string, DocketActionKey[]>> = {
  [DOCKET_TYPE.DELIVERY]: DELIVERY_ACTIONS,
  [DOCKET_TYPE.COLLECTION]: COLLECTION_ACTIONS,
};

const FALLBACK_ACTIONS: DocketActionKey[] = ['viewDetails'];

const COLLECTION_STATUS_KEYS = [
  'PENDING',
  'PREPARING',
  'READY',
  'COLLECTED',
  'CASH_SALE',
] as const;
const COLLECTION_STATUSES = new Set<string>(COLLECTION_STATUS_KEYS);

const normalizeStatus = (status?: string) => status?.toUpperCase() ?? '';

export interface DocketMenuAction extends ActionDefinition {
  key: DocketActionKey;
  onSelect: () => void;
}

export function useDocketActions(docket?: Docket | null) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [voidReason, setVoidReason] = React.useState('');
  const [voidNotes, setVoidNotes] = React.useState('');

  const createDialogAction = React.useCallback(
    (dialogKey: string) => () => setActiveDialog(dialogKey),
    [],
  );

  const isVoidFormValid = React.useMemo(() => {
    if (!voidReason) return false;
    if (voidReason === 'other') return Boolean(voidNotes.trim());
    return true;
  }, [voidNotes, voidReason]);

  const dialogConfigs = React.useMemo<Record<string, DialogConfig>>(
    () => ({
      markArrived: {
        title: 'Mark as Arrived',
        content: <MarkArrivedContent docket={docket} />,
        confirmText: 'Confirm Arrival',
        confirmCustomColor: '#3B82F6',
        cancelText: 'Cancel',
      },
      void: {
        title: 'Void Docket',
        content: (
          <VoidDocketContent
            docket={docket}
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
    }),
    [docket, isVoidFormValid, voidNotes, voidReason],
  );

  const actionHandlers = React.useMemo<Record<DocketActionKey, () => void>>(
    () => ({
      viewDetails: () => console.log('View docket details:', docket),
      assign: () => console.log('Assign docket:', docket),
      startTransit: () => console.log('Start transit:', docket),
      unassign: () => console.log('Unassign docket:', docket),
      cancel: () => console.log('Cancel docket:', docket),
      void: () => {
        console.log('Open void docket dialog:', docket);
        setVoidReason('');
        setVoidNotes('');
        setActiveDialog('void');
      },
      markArrived: () => {
        console.log('Mark docket as arrived:', docket);
        createDialogAction('markArrived')();
      },
      stop: () => console.log('Stop transit for docket:', docket),
      resumeTransit: () => console.log('Resume transit:', docket),
      markDelivered: () => console.log('Mark delivered:', docket),
      invoice: () => console.log('Invoice docket:', docket),
      viewInvoice: () => console.log('View invoice:', docket),
      startPreparing: () => console.log('Start preparing docket:', docket),
      markReady: () => console.log('Mark ready:', docket),
      backToPending: () => console.log('Back to pending:', docket),
      markCollected: () => console.log('Mark collected:', docket),
      backToPreparing: () => console.log('Back to preparing:', docket),
      cashSale: () => console.log('Cash sale for docket:', docket),
      cashReceipts: () => console.log('Cash receipts for docket:', docket),
    }),
    [createDialogAction, docket],
  );

  const actionKeys = React.useMemo<DocketActionKey[]>(() => {
    if (!docket) return FALLBACK_ACTIONS;

    const statusKey = normalizeStatus(docket.status);
    const inferredType =
      docket.docketType ??
      (COLLECTION_STATUSES.has(statusKey)
        ? DOCKET_TYPE.COLLECTION
        : DOCKET_TYPE.DELIVERY);
    const typeMap = ACTION_MATRIX[inferredType] ?? {};
    const normalizedStatus = statusKey;
    const keys =
      typeMap[statusKey] ?? typeMap[normalizedStatus] ?? typeMap.DEFAULT;

    return keys && keys.length ? keys : FALLBACK_ACTIONS;
  }, [docket]);

  const menuItems = React.useMemo<DocketMenuAction[]>(() => {
    return actionKeys
      .map((key) => {
        const definition = ACTION_DEFINITIONS[key];
        if (!definition) return null;

        return {
          key,
          ...definition,
          onSelect: actionHandlers[key],
        };
      })
      .filter((item): item is DocketMenuAction => Boolean(item));
  }, [actionHandlers, actionKeys]);

  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => (
    <ActionDialog
      key={key}
      open={activeDialog === key}
      onOpenChangeAction={(open) => {
        if (!open) setActiveDialog(null);
      }}
      title={config.title}
      content={config.content}
      confirmText={config.confirmText}
      confirmCustomColor={config.confirmCustomColor}
      confirmVariant={config.confirmVariant}
      confirmDisabled={config.confirmDisabled}
      cancelText={config.cancelText}
      onConfirmAction={() => {
        if (key === 'markArrived') {
          console.log('Mark arrived confirmed:', docket);
          return;
        }

        if (key === 'void') {
          console.log('Void docket confirmed:', docket, {
            voidReason,
            voidNotes,
          });
        }
      }}
    />
  ));

  return {
    actions: actionHandlers,
    menuItems,
    confirmDialogs,
    viewDialog: null,
  };
}
