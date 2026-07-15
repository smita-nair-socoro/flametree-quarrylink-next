'use client';

import * as React from 'react';

/**
 * Controlled dropdown helper that queues an action until React observes
 * the menu as closed, then runs it on the next animation frame.
 */
export function useControlledDropdownAction() {
  const [open, setOpen] = React.useState(false);
  const pendingActionRef = React.useRef<(() => void) | null>(null);

  const runAfterClose = React.useCallback((action: () => void) => {
    pendingActionRef.current = action;
    setOpen(false);
  }, []);

  React.useEffect(() => {
    if (!open && pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      requestAnimationFrame(action);
    }
  }, [open]);

  return { open, setOpen, runAfterClose };
}
