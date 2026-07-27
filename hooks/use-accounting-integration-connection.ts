'use client';

import * as React from 'react';
import {
  useMyobAcumaticaStatus,
  useMyobBusinessStatus,
  useXeroStatus,
} from '@/lib/api/accounting';
import {
  useAccountingSoftwareLabel,
  useAccountingSoftwareProvider,
} from '@/lib/utils/tenant-config-helper';

/** Connection state for the tenant's configured accounting software provider. */
export function useAccountingIntegrationConnection() {
  const accountingSoftware = useAccountingSoftwareProvider();
  const accountingSoftwareLabel = useAccountingSoftwareLabel();
  const { data: xeroStatus } = useXeroStatus();
  const { data: myobBusinessStatus } = useMyobBusinessStatus();
  const { data: myobAcumaticaStatus } = useMyobAcumaticaStatus();

  const isConnected = React.useMemo(() => {
    switch (accountingSoftware) {
      case 'XERO':
        return xeroStatus?.connected ?? false;
      case 'MYOB_BUSINESS':
        return myobBusinessStatus?.connected ?? false;
      case 'MYOB_ACUMATICA':
        return myobAcumaticaStatus?.connected ?? false;
      default:
        return false;
    }
  }, [
    accountingSoftware,
    xeroStatus?.connected,
    myobBusinessStatus?.connected,
    myobAcumaticaStatus?.connected,
  ]);

  const showAccountingMapping =
    accountingSoftware != null && isConnected;

  return {
    accountingSoftware,
    accountingSoftwareLabel,
    isConnected,
    showAccountingMapping,
  };
}
