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
  PowerOff,
  Power,
  Trash2,
} from 'lucide-react';
import { useTruckActions } from '@/hooks/use-truck-actions';
import { TruckDTO } from '@/lib/types/truck';
import { TRUCK_STATUS, normalizeTruckStatus } from '@/lib/types/truck-enums';
import { TruckWithDocketsQueryOptions } from '@/lib/api/truck';
import { notifyError } from '@/lib/toast';

interface TruckActionButtonsProps {
  truck: TruckDTO | null | undefined;
}

export function TruckActionButtons({ truck }: TruckActionButtonsProps) {
  const { actions, confirmDialogs } = useTruckActions(truck);
  const router = useRouter();

  const { data: truckWithDockets } = useQuery({
    ...TruckWithDocketsQueryOptions(truck?.id ?? 0),
    enabled: !!truck?.id,
  });

  const handleAssignedDockets = () => {
    const dockets = truckWithDockets?.dockets ?? [];
    if (dockets.length === 0) {
      notifyError('No dockets assigned to this truck.');
      return;
    }
    const docketIds = dockets.map((d) => d.id).join(',');
    router.push(`/customer-operations/dockets/?docketId=${docketIds}`);
  };

  if (!truck || !truck.id) {
    return null;
  }

  const status = normalizeTruckStatus(truck.truckStatus);

  return (
    <div className="flex items-start">
      {confirmDialogs}
      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAssignedDockets}
          className="rounded-none bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800 border-r border-gray-200"
        >
          <FileText className="h-4 w-4 mr-2" />
          Assigned Dockets
        </Button>

        {status !== TRUCK_STATUS.ON_DUTY && (
          <DropdownMenu>
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
                  <DropdownMenuItem onClick={actions.reactivate}>
                    <Power className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-green-600">Reactivate Truck</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {status === TRUCK_STATUS.ACTIVE && (
                <>
                  <DropdownMenuItem onClick={actions.deactivate}>
                    <PowerOff className="h-4 w-4 mr-2 text-orange-900" />
                    <span className="text-orange-900">Deactivate Truck</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem onClick={actions.delete}>
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
