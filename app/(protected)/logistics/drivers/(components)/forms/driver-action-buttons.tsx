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

  const handleReactivate = () => {
    setDropdownOpen(false);
    actions.reactivate();
  };

  const handleDelete = () => {
    setDropdownOpen(false);
    actions.delete();
  };

  const hasSecondaryActions = status !== DRIVER_STATUS.ON_DUTY;

  return (
    <div className="flex items-start">
      {confirmDialogs}
      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        {/* Assigned Dockets — always shown as primary */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onAssignedDockets}
          className={`rounded-none bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800`}
        >
          <FileText className="h-4 w-4 mr-2" />
          Assigned Dockets
        </Button>

        {/* Dropdown — shown for all statuses except ON_DUTY */}
        {hasSecondaryActions && (
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
              {status === DRIVER_STATUS.PENDING_INVITATION && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setDropdownOpen(false);
                      onResendInvitation?.();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2 text-purple-700" />
                    <span className="text-purple-700">Resend Invitation</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {status === DRIVER_STATUS.INACTIVE && (
                <>
                  <DropdownMenuItem onClick={handleReactivate}>
                    <Power className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-green-600">Reactivate Driver</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {(status === DRIVER_STATUS.ACTIVE ||
                status === DRIVER_STATUS.PENDING_INVITATION) && (
                <>
                  <DropdownMenuItem onClick={handleDeactivate}>
                    <PowerOff className="h-4 w-4 mr-2 text-orange-900" />
                    <span className="text-orange-900">Deactivate Driver</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-red-600">Delete Driver</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
