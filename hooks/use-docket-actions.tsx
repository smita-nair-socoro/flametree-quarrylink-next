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

const normalizeStatus = (status?: string) => status?.toUpperCase() ?? '';

export interface DocketMenuAction extends ActionDefinition {
  key: DocketActionKey;
  onSelect: () => void;
}

export function useDocketActions(docket?: Docket | null) {
  const actionHandlers = React.useMemo<Record<DocketActionKey, () => void>>(
    () => ({
      viewDetails: () => console.log('View docket details:', docket),
      assign: () => console.log('Assign docket:', docket),
      startTransit: () => console.log('Start transit:', docket),
      unassign: () => console.log('Unassign docket:', docket),
      cancel: () => console.log('Cancel docket:', docket),
      void: () => console.log('Void docket:', docket),
      markArrived: () => console.log('Mark arrived:', docket),
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
    [docket],
  );

  const actionKeys = React.useMemo<DocketActionKey[]>(() => {
    if (!docket) return FALLBACK_ACTIONS;

    const type = docket.docketType ?? DOCKET_TYPE.DELIVERY;
    const statusKey = docket.status;
    const typeMap = ACTION_MATRIX[type] ?? {};
    const normalizedStatus = normalizeStatus(statusKey);
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

  return {
    actions: actionHandlers,
    menuItems,
    confirmDialogs: [],
    viewDialog: null,
  };
}
