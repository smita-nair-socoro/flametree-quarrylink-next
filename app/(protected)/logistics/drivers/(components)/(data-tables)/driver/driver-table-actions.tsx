'use client';
import * as React from 'react';
import {
  MoreHorizontal,
  Eye,
  SendToBack,
  PowerOff,
  Power,
  Delete,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DriverDTO } from '@/lib/types/driver';
import { useDriverActions } from '@/hooks/use-driver-actions';
import { useResendUserInvitation } from '@/lib/api/user';
import { notifySuccess, notifyError } from '@/lib/toast';

interface DriverTableActionsProps {
  driver: DriverDTO;
  // TEMP: userSub is resolved via email match (users API) until backend adds
  // userSub directly to DriverDTO. Remove this prop and the lookup in columns.tsx
  // once DriverDTO includes userSub.
  userSub?: string;
}

export function DriverTableActions({
  driver,
  userSub,
}: DriverTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useDriverActions(driver);
  const resendInvitationMutation = useResendUserInvitation();

  const handleView = () => {
    setDropdownOpen(false);
    actions.view();
  };

  const handleResendAppInvitation = async () => {
    setDropdownOpen(false);
    if (!userSub) {
      notifyError('Could not find user account for this driver.');
      return;
    }
    try {
      await resendInvitationMutation.mutateAsync(userSub);
      notifySuccess('Invitation resent successfully.');
    } catch {
      notifyError('Failed to resend invitation.');
    }
  };

  const handleDeactivate = () => {
    setDropdownOpen(false);
    actions.deactivate();
  };

  const handleDeleteDriver = () => {
    setDropdownOpen(false);
    actions.delete();
  };

  const handleReactivateDriver = () => {
    setDropdownOpen(false);
    actions.reactivate();
  };

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          {driver.driverStatus === 'DEACTIVATED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleReactivateDriver}>
                <Power className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-green-600">Reactivate Driver</span>
              </DropdownMenuItem>
            </>
          )}
          {driver.driverStatus === 'ACTIVE' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeactivate}>
                <PowerOff className="h-4 w-4 mr-2 text-orange-900" />
                <span className="text-orange-900">Deactivate</span>
              </DropdownMenuItem>
            </>
          )}
          {driver.driverStatus === 'PENDING_INVITATION' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleResendAppInvitation}>
                <SendToBack className="h-4 w-4 mr-2" />
                <span>Resend App Invitation</span>
              </DropdownMenuItem>
            </>
          )}
          {driver.driverStatus !== 'ON_DUTY' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteDriver}>
                <Delete className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-red-600">Delete Driver</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
