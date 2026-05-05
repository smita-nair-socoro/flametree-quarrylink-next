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
import type { ChecklistItem } from '@/lib/types/checklist';

interface ComplianceTableActionsProps {
  record: ChecklistItem;
  onView: (record: ChecklistItem) => void;
}

export function ComplianceTableActions({ record, onView }: ComplianceTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  if (!record.viewDetailsAvailable) return null;

  return (
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
            onView(record);
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
