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
import { useClientStore } from '@/app/stores/client-store';
import { useHaulierActions } from '@/hooks/use-haulier-actions';

interface HaulierActionButtonsProps {
  haulier: HaulierDTO | null | undefined;
  onScrollTo: (section: string) => void;
  onDelete?: () => void;
}

export function HaulierActionButtons({
  haulier,
  onScrollTo,
  onDelete,
}: HaulierActionButtonsProps) {
  const { actions } = useHaulierActions(haulier, { onDeleteSuccess: onDelete });
  const businessName = useClientStore((state) => state.businessName);
  const isSubcontractor =
    !businessName || haulier?.haulierName !== businessName;

  if (!haulier?.id) return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={() => onScrollTo('trucks')}
      >
        <Truck className="h-4 w-4 mr-1.5" />
        Linked Trucks
      </Button>
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={() => onScrollTo('drivers')}
      >
        <Users className="h-4 w-4 mr-1.5" />
        Linked Drivers
      </Button>
      {isSubcontractor && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" type="button">
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
