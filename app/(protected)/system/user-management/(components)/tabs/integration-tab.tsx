'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useXeroIntegrationActions } from '@/hooks/use-xero-integration-actions';
import { useMyobBusinessIntegrationActions } from '@/hooks/use-myob-business-integration-actions';
import { useMyobAcumaticaIntegrationActions } from '@/hooks/use-myob-acumatica-integration-actions';
import { useAccountingSoftwareProvider } from '@/lib/utils/tenant-config-helper';
import { FieldMappings } from './field-mapping';

function XeroIntegrationCard() {
  const {
    isConnected: xeroConnected,
    actions: xeroActions,
    connectDialog: xeroConnectDialog,
  } = useXeroIntegrationActions();

  return (
    <>
      <Card
        className={`rounded-lg py-4 ${xeroConnected ? 'max-w-3xl' : 'max-w-md'}`}
      >
        <CardContent className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-13 h-13 rounded-xl bg-[#13B5EA] flex items-center justify-center overflow-hidden p-2">
                <Image
                  src="/Xero-logo.png"
                  alt="Xero"
                  width={100}
                  height={100}
                  className="object-contain brightness-0 invert"
                />
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <span className="font-semibold text-sm">Xero</span>
                {xeroConnected ? (
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

            {!xeroConnected && (
              <Button
                size="sm"
                className="bg-[#13B5EA] hover:bg-[#0FA3D4] rounded-lg w-full max-w-40 sm:w-auto"
                onClick={xeroActions.connect}
              >
                Connect to Xero
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {xeroConnected && <FieldMappings />}
        </CardContent>
      </Card>
      {xeroConnectDialog}
    </>
  );
}

function MyobBusinessIntegrationCard() {
  const {
    isConnected: myobConnected,
    actions: myobActions,
    connectDialog: myobConnectDialog,
  } = useMyobBusinessIntegrationActions();

  return (
    <>
      <Card className={`rounded-lg py-4 ${myobConnected ? 'max-w-3xl' : 'max-w-md'}`}>
        <CardContent className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-13 h-13 rounded-xl bg-[#6B2D8B] flex items-center justify-center overflow-hidden p-2">
                <Image
                  src="/MyOB-logo.png"
                  alt="MYOB"
                  width={100}
                  height={100}
                  className="object-contain brightness-0 invert"
                />
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <span className="font-semibold text-sm">MYOB Business</span>
                {myobConnected ? (
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

            {!myobConnected && (
              <Button
                size="sm"
                className="bg-[#6B2D8B] hover:bg-[#5B247B] rounded-lg w-full max-w-40 sm:w-auto mt-2.5"
                onClick={myobActions.connect}
              >
                Connect to MYOB
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {myobConnected && <FieldMappings />}
        </CardContent>
      </Card>
      {myobConnectDialog}
    </>
  );
}

function MyobAcumaticaIntegrationCard() {
  const {
    isConnected: myobConnected,
    actions: myobActions,
    connectDialog: myobConnectDialog,
  } = useMyobAcumaticaIntegrationActions();

  return (
    <>
      <Card className={`rounded-lg py-4 ${myobConnected ? 'max-w-3xl' : 'max-w-md'}`}>
        <CardContent className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-13 h-13 rounded-xl bg-[#6B2D8B] flex items-center justify-center overflow-hidden p-2">
                <Image
                  src="/MyOB-logo.png"
                  alt="MYOB"
                  width={100}
                  height={100}
                  className="object-contain brightness-0 invert"
                />
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <span className="font-semibold text-sm">MYOB Acumatica</span>
                {myobConnected ? (
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

            {!myobConnected && (
              <Button
                size="sm"
                className="bg-[#6B2D8B] hover:bg-[#5B247B] rounded-lg w-full max-w-40 sm:w-auto mt-2.5"
                onClick={myobActions.connect}
              >
                Connect to MYOB
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <FieldMappings />
        </CardContent>
      </Card>
      {myobConnectDialog}
    </>
  );
}

export default function IntegrationTab() {
  const accountingSoftware = useAccountingSoftwareProvider();

  return (
    <div className="py-3 space-y-3">
      <h2 className="text-2xl font-semibold">Integrations</h2>
      <p className="text-sm text-muted-foreground">
        Connect or manage your integration.
      </p>

      {accountingSoftware === 'XERO' && <XeroIntegrationCard />}
      {accountingSoftware === 'MYOB_BUSINESS' && <MyobBusinessIntegrationCard />}
      {accountingSoftware === 'MYOB_ACUMATICA' && <MyobAcumaticaIntegrationCard />}
    </div>
  );
}
