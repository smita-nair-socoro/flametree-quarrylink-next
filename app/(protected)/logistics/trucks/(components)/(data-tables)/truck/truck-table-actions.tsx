'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, PowerOff, Power, Delete } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { TruckDTO } from '@/lib/types/truck';

interface TruckTableActionsProps {
  truck: TruckDTO;
}

export function TruckTableActions({ truck }: TruckTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleView = () => {
    setDropdownOpen(false);
  };

  const handleDeactivate = () => {
    setDropdownOpen(false);
  };

  const handleReactivate = () => {
    setDropdownOpen(false);
  };

  const handleDelete = () => {
    setDropdownOpen(false);
  };

  return (
    <div>
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
          {truck.truckStatus === 'DEACTIVATED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleReactivate}>
                <Power className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-green-600">Reactivate Truck</span>
              </DropdownMenuItem>
            </>
          )}
          {(truck.truckStatus === 'ACTIVE' || truck.truckStatus === 'AVAILABLE') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeactivate}>
                <PowerOff className="h-4 w-4 mr-2 text-orange-900" />
                <span className="text-orange-900">Deactivate</span>
              </DropdownMenuItem>
            </>
          )}
          {truck.truckStatus !== 'ON_DUTY' && (
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
    </div>
  );
}
