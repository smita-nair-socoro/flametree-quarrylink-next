'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  FileText,
  RefreshCw,
  PowerOff,
  Power,
  Trash2,
} from 'lucide-react';
import { useDriverActions } from '@/hooks/use-driver-actions';
import { DriverDTO } from '@/lib/types/driver';
import { DRIVER_STATUS } from '@/lib/types/driver-enums';

interface DriverActionButtonsProps {
  driver: DriverDTO | null | undefined;
  onAssignedDockets?: () => void;
  onResendInvitation?: () => void;
}

export function DriverActionButtons({
  driver,
  onAssignedDockets,
  onResendInvitation,
}: DriverActionButtonsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs } = useDriverActions(driver);

  if (!driver || !driver.id) {
    return null;
  }

  const status = driver.driverStatus;

  const handleDeactivate = () => {
    setDropdownOpen(false);
    actions.deactivate();
  };

  const handleDelete = () => {
    setDropdownOpen(false);
    actions.delete();
  };

  const handleReactivate = () => {
    setDropdownOpen(false);
    actions.reactivate();
  };

  // ON_DUTY — only show "Assigned Dockets", no ellipsis
  if (status === DRIVER_STATUS.ON_DUTY) {
    return (
      <div className="flex items-start">
        {confirmDialogs}
        <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAssignedDockets}
            className="rounded-none bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800"
          >
            <FileText className="h-4 w-4 mr-2" />
            Assigned Dockets
          </Button>
        </div>
      </div>
    );
  }

  // INACTIVE — only ellipsis with "Reactivate Driver" + "Delete Driver"
  if (status === DRIVER_STATUS.INACTIVE) {
    return (
      <div className="flex items-start">
        {confirmDialogs}
        <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleReactivate}>
                <Power className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-green-600">Reactivate Driver</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-red-600">Delete Driver</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // PENDING_INVITATION — "Resend Invitation" outside + ellipsis with "Deactivate Driver", "Delete Driver"
  if (status === DRIVER_STATUS.PENDING_INVITATION) {
    return (
      <div className="flex items-start">
        {confirmDialogs}
        <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={onResendInvitation}
            className="rounded-none border-r border-gray-200 bg-purple-50 hover:bg-purple-100 text-purple-900 hover:text-purple-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Resend Invitation
          </Button>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDeactivate}>
                <PowerOff className="h-4 w-4 mr-2 text-orange-900" />
                <span className="text-orange-900">Deactivate Driver</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-red-600">Delete Driver</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // ACTIVE (default) — "Assigned Dockets" outside + ellipsis with "Deactivate Driver", "Delete Driver"
  return (
    <div className="flex items-start">
      {confirmDialogs}
      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAssignedDockets}
          className="rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800"
        >
          <FileText className="h-4 w-4 mr-2" />
          Assigned Dockets
        </Button>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleDeactivate}>
              <PowerOff className="h-4 w-4 mr-2 text-orange-900" />
              <span className="text-orange-900">Deactivate Driver</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
              <span className="text-red-600">Delete Driver</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}