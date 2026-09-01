'use client';

import * as React from 'react';
import { Download, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { JobAttachmentDTO } from '@/lib/types/job';
import { useJobAttachmentActions } from '@/hooks/use-job-attachment-actions';

interface JobAttachmentTableActionsProps {
  jobId: number;
  attachment: JobAttachmentDTO;
}

export function JobAttachmentTableActions({
  jobId,
  attachment,
}: JobAttachmentTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs } = useJobAttachmentActions(
    jobId,
    attachment,
  );

  const handleDownload = () => {
    setDropdownOpen(false);
    actions.download();
  };

  const handleRemove = () => {
    setDropdownOpen(false);
    actions.remove();
  };

  return (
    <div>
      {confirmDialogs}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleRemove}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
