'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { HaulierDTO } from '@/lib/types/haulier';
import { useHaulierActions } from '@/hooks/use-haulier-actions';
import { useClientStore } from '@/app/stores/client-store';

interface HaulierTableActionsProps {
  haulier: HaulierDTO;
}

export function HaulierTableActions({ haulier }: HaulierTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, viewDialog } = useHaulierActions(haulier);

  const businessName = useClientStore((state) => state.businessName);
  const isSubcontractor =
    !businessName || haulier.haulierName !== businessName;

  return (
    <div>
      {viewDialog}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              actions.view();
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          {isSubcontractor && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setDropdownOpen(false);
                  actions.delete();
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Delete Haulier
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
