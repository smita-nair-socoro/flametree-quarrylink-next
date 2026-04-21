'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActionDialog } from '@/components/action-dialog';
import {
  ArrowRight,
  CheckCircle,
  FileText,
  ShieldCheck,
  Unplug,
  CircleUser,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function IntegrationTab() {
  const [isConnected, setIsConnected] = React.useState(true);
  const [showConnectModal, setShowConnectModal] = React.useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = React.useState(false);

  return (
    <div className="py-3 space-y-3">
      <h2 className="text-2xl font-semibold">Integrations</h2>
      <p className="text-sm text-muted-foreground">
        Connect or manage your integration.
      </p>

      <Card className="max-w-md py-3 rounded-md">
        <CardContent className="flex flex-col gap-3 px-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-13 h-13 rounded-xl bg-[#13B5EA] flex items-center justify-center overflow-hidden p-2">
              <Image
                src="/xero-logo.png"
                alt="Xero"
                width={100}
                height={100}
                className="object-contain brightness-0 invert"
              />
            </div>

            <div className="flex items-center gap-3 min-w-0">
              <span className="font-semibold text-sm">Xero</span>
              {isConnected ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-300 bg-green-50 gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Connected
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[#18181B] border-[#00000000] bg-[#F4F4F5]"
                >
                  Not Connected
                </Badge>
              )}
            </div>
          </div>

          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive max-w-40 w-full sm:w-auto"
              onClick={() => setShowDisconnectModal(true)}
            >
              <Unplug className="w-3.5 h-3.5" />
              Disconnect
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-[#13B5EA] hover:bg-[#0FA3D4] rounded-lg w-full max-w-40 sm:w-auto"
              onClick={() => setShowConnectModal(true)}
            >
              Connect to Xero
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </CardContent>
      </Card>

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
        onConfirmAction={() => setIsConnected(true)}
      />

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
            Customer sync and invoices will stop until you connect again. You
            can also revoke access in Xero under Connected apps.
          </p>
        }
        confirmText="Disconnect"
        confirmVariant="destructive"
        confirmIcon={<Unplug className="w-4 h-4" />}
        onConfirmAction={() => setIsConnected(false)}
      />
    </div>
  );
}
