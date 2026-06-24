'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Trash2, Truck, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { HaulierDTO } from '@/lib/types/haulier';
import { useHaulierActions } from '@/hooks/use-haulier-actions';
import { useTenantStore } from '@/app/stores/tenant-store';
import { isInternalHaulier } from '@/lib/utils/haulier-helper';

interface HaulierTableActionsProps {
  haulier: HaulierDTO;
}

export function HaulierTableActions({ haulier }: HaulierTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useHaulierActions(haulier);
  const router = useRouter();

  const tenantEmail = useTenantStore((state) => state.tenantEmail);
  const isSubcontractor = !isInternalHaulier(haulier.emailAddress, tenantEmail);

  return (
    <div>
      {viewDialog}
      {confirmDialogs}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              actions.view();
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              router.push(`/logistics/trucks?haulierId=${haulier.id}`);
            }}
          >
            <Truck className="h-4 w-4 mr-2" />
            Linked Trucks
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              router.push(`/logistics/drivers?haulierId=${haulier.id}`);
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            Linked Drivers
          </DropdownMenuItem>
          {isSubcontractor && (
            <>
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
