'use client';

import * as React from 'react';
import { Client } from '@/lib/types/client';

export function useClientPortalActions(
  clientId: number | undefined,
  clientData?: Client | null
) {
  const [viewOpen, setViewOpen] = React.useState(false);

  const actions = {
    view: () => {
      setViewOpen(true);
      // TODO: Implement view dialog
    },
  };

  return {
    actions,
    viewDialog: null, // TODO: Implement view dialog when needed
  };
}
