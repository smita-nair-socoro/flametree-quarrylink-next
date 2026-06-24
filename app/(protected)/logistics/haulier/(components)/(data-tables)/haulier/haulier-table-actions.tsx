'use client';
import * as React from 'react';
import { MoreHorizontal, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { HaulierDTO } from '@/lib/types/haulier';
import { FormDialog } from '@/components/form-dialog';
import HaulierForm from '../../forms/haulier-form';

interface HaulierTableActionsProps {
  haulier: HaulierDTO;
}

export function HaulierTableActions({ haulier }: HaulierTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <div>
      <FormDialog
        id={haulier.id}
        dialogTitle="Edit Haulier"
        open={editOpen}
        onOpenChangeAction={setEditOpen}
        hideTrigger
      >
        <HaulierForm />
      </FormDialog>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              setEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Haulier
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
