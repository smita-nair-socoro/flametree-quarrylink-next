'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Unplug } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useXeroIntegrationActions } from '@/hooks/use-xero-integration-actions';

export default function IntegrationTab() {
  const { isConnected, actions, connectDialog, disconnectDialog } =
    useXeroIntegrationActions();

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
              onClick={actions.disconnect}
            >
              <Unplug className="w-3.5 h-3.5" />
              Disconnect
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-[#13B5EA] hover:bg-[#0FA3D4] rounded-lg w-full max-w-40 sm:w-auto"
              onClick={actions.connect}
            >
              Connect to Xero
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </CardContent>
      </Card>

      {connectDialog}
      {disconnectDialog}
    </div>
  );
}
