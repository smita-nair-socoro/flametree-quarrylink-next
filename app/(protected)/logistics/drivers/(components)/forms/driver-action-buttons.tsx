'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
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
import { UsersListQueryOptions, useResendUserInvitation } from '@/lib/api/user';
import { notifySuccess, notifyError } from '@/lib/toast';

interface DriverActionButtonsProps {
  driver: DriverDTO | null | undefined;
}

export function DriverActionButtons({ driver }: DriverActionButtonsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, fullDriverData } = useDriverActions(driver);

  // TEMP: Resolve userSub by matching driver.emailAddress → User.email.
  // Users list is already cached from the drivers page query (React Query dedup).
  // Once backend adds userSub to DriverDTO, remove this query + userSub lookup
  // and read userSub directly from the driver object.
  const { data: users } = useQuery(UsersListQueryOptions());
  const userSub = React.useMemo(() => {
    if (!users || !driver?.emailAddress) return undefined;
    return users.find(
      (u) =>
        u.groups?.includes('driver') &&
        u.email?.toLowerCase() === driver.emailAddress.toLowerCase(),
    )?.sub;
  }, [users, driver?.emailAddress]);
  const resendInvitationMutation = useResendUserInvitation();
  // END TEMP

  const handleResendInvitation = async () => {
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

  const router = useRouter();
  const handleAssignedDockets = () => {
    const targetDriver = fullDriverData || driver;
    if (!targetDriver?.dockets || targetDriver.dockets.length === 0) {
      notifyError('No dockets assigned to this driver.');
      return;
    }
    const docketIds = targetDriver.dockets.map((d) => d.id).join(',');
    router.push(`/customer-operations/dockets/?docketId=${docketIds}`);
  };

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

  return (
    <div className="flex items-start">
      {confirmDialogs}
      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAssignedDockets}
          className={`rounded-none bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800`}
        >
          <FileText className="h-4 w-4 mr-2" />
          Assigned Dockets
        </Button>

        {status !== DRIVER_STATUS.ON_DUTY && (
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
                  <DropdownMenuItem onClick={handleResendInvitation}>
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
