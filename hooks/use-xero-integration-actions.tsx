'use client';
import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  Unplug,
  CircleUser,
} from 'lucide-react';
import { useConnectXero, useXeroStatus } from '@/lib/api/xero';

export function useXeroIntegrationActions() {
  const { data: xeroStatus, refetch: refetchStatus } = useXeroStatus();
  const isConnected = xeroStatus?.connected ?? false;
  const [showConnectModal, setShowConnectModal] = React.useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = React.useState(false);

  const connectXero = useConnectXero();

  const actions = {
    connect: () => setShowConnectModal(true),
    disconnect: () => setShowDisconnectModal(true),
  };

  const handleConnect = () => {
    connectXero.mutate(undefined, {
      onSuccess: () => {
        setShowConnectModal(false);
        refetchStatus();
      },
    });
  };

  const handleDisconnect = () => {
    setShowDisconnectModal(false);
  };

  const connectDialog = (
    <ActionDialog
      open={showConnectModal}
      onOpenChangeAction={setShowConnectModal}
      titleIcon={<ShieldCheck className="w-5 h-5 text-muted-foreground" />}
      title="Xero will ask for"
      description={
        <p className="text-sm text-[#71717B] -mt-3">
          Shown on Xero&apos;s consent screen before you allow access.
        </p>
      }
      content={
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-lg p-4 flex flex-col gap-2 bg-[#F4F4F566]">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p className="font-medium text-[#09090B] text-[14px]">
                Organisation data
              </p>
            </div>
            <p className="text-[12px] text-[#71717B]">
              Contacts, invoices, and related files for the org you pick — for
              customer sync and invoices.
            </p>
          </div>
          <div className="border rounded-lg p-4 flex flex-col gap-2 bg-[#F4F4F566]">
            <div className="flex items-center gap-2">
              <CircleUser className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p className="font-medium text-[#09090B] text-[14px]">
                Your Xero profile
              </p>
            </div>
            <p className="text-[12px] text-[#71717B]">
              Name, email, and basic profile to finish sign-in.
            </p>
          </div>
        </div>
      }
      confirmText="Continue to Xero"
      confirmCustomColor="#13B5EA"
      confirmCustomClass="flex-row-reverse"
      confirmIcon={<ArrowRight className="w-4 h-4" />}
      confirmDisabled={connectXero.isPending}
      onConfirmAction={handleConnect}
    />
  );

  const disconnectDialog = (
    <ActionDialog
      open={showDisconnectModal}
      onOpenChangeAction={setShowDisconnectModal}
      titleIcon={
        <div className="w-11 h-11 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
          <Unplug className="w-6 h-6 text-[#D42422]" />
        </div>
      }
      title="Disconnect Xero?"
      description={
        <p className="text-sm text-muted-foreground -mt-3">
          Customer sync and invoices will stop until you connect again. You can
          also revoke access in Xero under Connected apps.
        </p>
      }
      confirmText="Disconnect"
      confirmVariant="destructive"
      confirmIcon={<Unplug className="w-4 h-4" />}
      onConfirmAction={handleDisconnect}
    />
  );

  return {
    isConnected,
    actions,
    connectDialog,
    disconnectDialog,
  };
}
