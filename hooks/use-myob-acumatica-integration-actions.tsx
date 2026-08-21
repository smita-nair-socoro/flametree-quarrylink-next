'use client';
import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import { ArrowRight, FileText, ShieldCheck, Unplug, CircleUser } from 'lucide-react';
import { useConnectMyobAcumatica, useDisconnectMyobAcumatica, useMyobAcumaticaStatus } from '@/lib/api/accounting';
import { useAuth } from '@/hooks/use-auth';

export function useMyobAcumaticaIntegrationActions() {
  const { attributes } = useAuth();
  const { data: myobAcumaticaStatus, refetch: refetchStatus } = useMyobAcumaticaStatus();
  const isConnected = myobAcumaticaStatus?.connected ?? false;
  const [showConnectModal, setShowConnectModal] = React.useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = React.useState(false);

  const connectMyobAcumatica = useConnectMyobAcumatica();
  const disconnectMyobAcumatica = useDisconnectMyobAcumatica();

  const actions = {
    connect: () => setShowConnectModal(true),
    disconnect: () => setShowDisconnectModal(true),
  };

  const handleConnect = () => {
    connectMyobAcumatica.mutate(attributes?.email ?? '', {
      onSuccess: (data) => {
        setShowConnectModal(false);
        if (data?.authorizeUrl) {
          window.open(data.authorizeUrl, '_blank');
        }
        refetchStatus();
      },
    });
  };

  const handleDisconnect = () => {
    disconnectMyobAcumatica.mutate(undefined, {
      onSuccess: () => {
        setShowDisconnectModal(false);
        refetchStatus();
      },
    });
  };

  const connectDialog = (
    <ActionDialog
      open={showConnectModal}
      onOpenChangeAction={setShowConnectModal}
      titleIcon={<ShieldCheck className="w-5 h-5 text-muted-foreground" />}
      title="MYOB Acumatica will ask for"
      description={
        <p className="text-sm text-[#71717B] -mt-3">
          Shown on MYOB Acumatica's consent screen before you allow access.
        </p>
      }
      content={
        <div className="grid grid-cols-2 gap-2">
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
                Your MYOB Acumatica profile
              </p>
            </div>
            <p className="text-[12px] text-[#71717B]">
              Name, email, and basic profile to finish sign-in.
            </p>
          </div>
        </div>
      }
      confirmText="Continue to MYOB Acumatica"
      confirmCustomColor="#6B2D8B"
      confirmCustomClass="flex-row-reverse"
      confirmDisabled={connectMyobAcumatica.isPending}
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
      title="Disconnect MYOB Acumatica?"
      description={
        <p className="text-sm text-muted-foreground -mt-3">
          Customer sync and invoices will stop until you connect again. You can
          also revoke access in MYOB Acumatica under Connected apps.
        </p>
      }
      confirmText="Disconnect"
      confirmVariant="destructive"
      confirmIcon={<Unplug className="w-4 h-4" />}
      confirmDisabled={disconnectMyobAcumatica.isPending}
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
