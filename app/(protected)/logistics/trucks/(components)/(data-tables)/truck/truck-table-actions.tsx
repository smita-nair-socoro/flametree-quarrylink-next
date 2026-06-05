'use client';
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MoreHorizontal, Eye, PowerOff, Power, Delete, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { TruckDTO } from '@/lib/types/truck';
import { useTruckActions } from '@/hooks/use-truck-actions';
import { normalizeTruckStatus, TRUCK_STATUS } from '@/lib/types/truck-enums';
import { TruckWithDocketsQueryOptions } from '@/lib/api/truck';
import { notifyError } from '@/lib/toast';

interface TruckTableActionsProps {
  truck: TruckDTO;
}

export function TruckTableActions({ truck }: TruckTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useTruckActions(truck);

  const { data: truckWithDockets } = useQuery({
    ...TruckWithDocketsQueryOptions(truck?.id ?? 0),
    enabled: !!truck?.id,
  });

  const handleView = () => {
    setDropdownOpen(false);
    actions.view();
  };

  const handleLinkedDockets = () => {
    setDropdownOpen(false);
    const dockets = truckWithDockets?.dockets ?? [];
    if (dockets.length === 0) {
      notifyError('No dockets assigned to this truck.');
      return;
    }
    const docketIds = dockets.map((d) => d.id).join(',');
    window.open(`/customer-operations/dockets/?docketId=${docketIds}`, '_blank');
  };

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

  const status = normalizeTruckStatus(truck.truckStatus);

  return (
    <>
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLinkedDockets}>
            <FileText className="h-4 w-4 mr-2" />
            Linked Dockets
          </DropdownMenuItem>
          {status === TRUCK_STATUS.DEACTIVATED && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleReactivate}>
                <Power className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-green-600">Reactivate Truck</span>
              </DropdownMenuItem>
            </>
          )}
          {status === TRUCK_STATUS.ACTIVE && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeactivate}>
                <PowerOff className="h-4 w-4 mr-2 text-orange-900" />
                <span className="text-orange-900">Deactivate</span>
              </DropdownMenuItem>
            </>
          )}
          {status !== TRUCK_STATUS.ON_DUTY && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete}>
                <Delete className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-red-600">Delete Truck</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {confirmDialogs}
    </>
  );
}
