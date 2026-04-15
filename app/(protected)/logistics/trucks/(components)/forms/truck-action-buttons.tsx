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
  PowerOff,
  Power,
  Trash2,
} from 'lucide-react';
import { useTruckActions } from '@/hooks/use-truck-actions';
import { TruckDTO } from '@/lib/types/truck';
import { TRUCK_STATUS } from '@/lib/types/truck-enums';

interface TruckActionButtonsProps {
  truck: TruckDTO | null | undefined;
  onAssignedDockets?: () => void;
}

export function TruckActionButtons({ truck, onAssignedDockets }: TruckActionButtonsProps) {
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

  const hasSecondaryActions = status !== TRUCK_STATUS.ON_DUTY;

  return (
    <div className="flex items-start">
      {confirmDialogs}
      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">

        {/* Assigned Dockets — always shown as primary */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onAssignedDockets}
          className={`rounded-none bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800 ${hasSecondaryActions ? 'border-r border-gray-200' : ''}`}
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
              {status === TRUCK_STATUS.DEACTIVATED && (
                <>
                  <DropdownMenuItem onClick={handleReactivate}>
                    <Power className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-green-600">Reactivate Truck</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

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
        )}

      </div>
    </div>
  );
}
