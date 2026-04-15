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
  PowerOff,
  Power,
  Trash2,
} from 'lucide-react';
import { useTruckActions } from '@/hooks/use-truck-actions';
import { TruckDTO } from '@/lib/types/truck';
import { TRUCK_STATUS } from '@/lib/types/truck-enums';

interface TruckActionButtonsProps {
  truck: TruckDTO | null | undefined;
}

export function TruckActionButtons({ truck }: TruckActionButtonsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs } = useTruckActions(truck);

  if (!truck || !truck.id) {
    return null;
  }

  const status = truck.truckStatus;

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

  // ON_DUTY — no actions
  if (status === TRUCK_STATUS.ON_DUTY) {
    return <>{confirmDialogs}</>;
  }

  return (
    <div className="flex items-start">
      {confirmDialogs}
      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">

        {/* DEACTIVATED — Reactivate primary button */}
        {status === TRUCK_STATUS.DEACTIVATED && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReactivate}
            className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-green-900 hover:text-green-800"
          >
            <Power className="h-4 w-4 mr-2" />
            Reactivate Truck
          </Button>
        )}

        {/* Dropdown for secondary actions */}
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
            {status === TRUCK_STATUS.ACTIVE && (
              <>
                <DropdownMenuItem onClick={handleDeactivate}>
                  <PowerOff className="h-4 w-4 mr-2 text-orange-900" />
                  <span className="text-orange-900">Deactivate Truck</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
              <span className="text-red-600">Delete Truck</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}
