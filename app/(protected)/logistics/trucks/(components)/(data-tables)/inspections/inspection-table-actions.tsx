'use client';

import * as React from 'react';
import { MoreHorizontal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TruckInspection } from '@/lib/types/truck-inspection';
import {
  ChecklistReportModal,
  CHECKLIST_TYPE,
} from '@/components/checklist-report-modal';

interface InspectionTableActionsProps {
  record: TruckInspection;
}

export function InspectionTableActions({ record }: InspectionTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  if (!record.viewDetailsAvailable) return null;

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              setModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChecklistReportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        type={CHECKLIST_TYPE.TRUCK}
        submissionId={record.submissionId}
      />
    </>
  );
}
