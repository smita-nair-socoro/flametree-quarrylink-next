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
import { Driver } from '@/lib/types/driver';

interface DriverTableActionsProps {
  driver: Driver;
}

export function DriverTableActions({ driver }: DriverTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  // const { actions, confirmDialogs, viewDialog } = useDriverActions(driver);

  const handleView = () => {
    setDropdownOpen(false);
    // actions.view();
  };

  const handleResendAppInvitation = () => {
    setDropdownOpen(false);
    // actions.resendAppInvitation();
  };

  const handleDeactivate = () => {
    setDropdownOpen(false);
    // actions.deactivate();
  };

  const handleDeleteDriver = () => {
    setDropdownOpen(false);
    // actions.deleteDriver();
  };

  const handleReactivateDriver = () => {
    setDropdownOpen(false);
    // actions.reactivateDriver();
  };

  return (
    <div>
      {/* {confirmDialogs}
      {viewDialog} */}
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleResendAppInvitation}>
            <SendToBack className="h-4 w-4 mr-2" />
            Resend App Invitation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {driver.status === 'DEACTIVATED' && (
            <>
              <DropdownMenuItem onClick={handleReactivateDriver}>
                <Power className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-green-600">Reactivate Driver</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {driver.status === 'ACTIVE' && (
            <>
              <DropdownMenuItem onClick={handleDeactivate}>
                <PowerOff className="h-4 w-4 mr-2 text-orange-900" />
                <span className="text-orange-900">Deactivate</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={handleDeleteDriver}>
            <Delete className="h-4 w-4 mr-2 text-red-600" />
            <span className="text-red-600">Delete Driver</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
