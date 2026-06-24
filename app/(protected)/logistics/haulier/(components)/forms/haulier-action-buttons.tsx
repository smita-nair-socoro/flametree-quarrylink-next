'use client';

import * as React from 'react';
import { Truck, Users, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HaulierDTO } from '@/lib/types/haulier';
import { useTenantStore } from '@/app/stores/tenant-store';
import { useHaulierActions } from '@/hooks/use-haulier-actions';
import { isInternalHaulier } from '@/lib/utils/haulier-helper';

interface HaulierActionButtonsProps {
  haulier: HaulierDTO | null | undefined;
  onDelete?: () => void;
}

export function HaulierActionButtons({
  haulier,
  onDelete,
}: HaulierActionButtonsProps) {
  const { actions } = useHaulierActions(haulier, { onDeleteSuccess: onDelete });
  const tenantEmail = useTenantStore((state) => state.tenantEmail);
  const isSubcontractor = !isInternalHaulier(haulier?.emailAddress, tenantEmail);

  if (!haulier?.id) return null;

  return (
    <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        type="button"
        className="!rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800"
      >
        <Truck className="h-4 w-4 mr-1.5" />
        Linked Trucks
      </Button>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        className="!rounded-none border-r border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
      >
        <Users className="h-4 w-4 mr-1.5" />
        Linked Drivers
      </Button>
      {isSubcontractor && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="!rounded-none bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={actions.delete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
              Delete Haulier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
