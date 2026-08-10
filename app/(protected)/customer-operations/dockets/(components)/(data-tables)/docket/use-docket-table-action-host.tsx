'use client';

import * as React from 'react';
import { useDocketActions } from '@/hooks/use-docket-actions';

export type DocketTableActionType =
  | 'view'
  | 'cancel'
  | 'markArrived'
  | 'markDelivered'
  | 'markReady'
  | 'markCollected'
  | 'stop'
  | 'void'
  | 'remove'
  | 'duplicate'
  | 'startTransit'
  | 'resumeTransit'
  | 'unassign'
  | 'startPreparing'
  | 'cashSale'
  | 'invoice'
  | 'cashReceipts'
  | 'viewInvoice'
  | 'assign'
  | 'backToPending'
  | 'retrySync'
  | 'print';

/**
 * Owns a single `useDocketActions` instance for a docket table/list.
 * Rows call `runAction(docketId, action)` instead of instantiating the hook.
 */
export function useDocketTableActionHost() {
  const [actionDocketId, setActionDocketId] = React.useState<number | null>(
    null,
  );
  const pendingActionRef = React.useRef<DocketTableActionType | null>(null);

  const { actions, confirmDialogs, viewDialog } =
    useDocketActions(actionDocketId);
  const actionsRef = React.useRef(actions);
  actionsRef.current = actions;

  React.useEffect(() => {
    const pending = pendingActionRef.current;
    if (pending == null || actionDocketId == null) return;
    pendingActionRef.current = null;
    void actionsRef.current[pending]?.();
  }, [actionDocketId]);

  const runAction = React.useCallback(
    (docketId: number, action: DocketTableActionType) => {
      pendingActionRef.current = action;
      setActionDocketId((prev) => {
        if (prev === docketId) {
          // Same row again — effect won't re-fire; run immediately.
          queueMicrotask(() => {
            const pending = pendingActionRef.current;
            if (pending == null) return;
            pendingActionRef.current = null;
            void actionsRef.current[pending]?.();
          });
          return prev;
        }
        return docketId;
      });
    },
    [],
  );

  return {
    runAction,
    actions,
    confirmDialogs,
    viewDialog,
    actionDocketId,
  };
}

type DocketRowActionsContextValue = {
  runAction: (docketId: number, action: DocketTableActionType) => void;
};

const DocketRowActionsContext =
  React.createContext<DocketRowActionsContextValue | null>(null);

export function DocketRowActionsProvider({
  runAction,
  children,
}: Readonly<{
  runAction: (docketId: number, action: DocketTableActionType) => void;
  children: React.ReactNode;
}>) {
  const value = React.useMemo(() => ({ runAction }), [runAction]);
  return (
    <DocketRowActionsContext.Provider value={value}>
      {children}
    </DocketRowActionsContext.Provider>
  );
}

export function useDocketRowActions() {
  const ctx = React.useContext(DocketRowActionsContext);
  if (!ctx) {
    throw new Error(
      'useDocketRowActions must be used within DocketRowActionsProvider',
    );
  }
  return ctx;
}
