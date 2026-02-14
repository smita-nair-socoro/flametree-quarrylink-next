'use client';
import * as React from 'react';
// import { MoreHorizontal, Eye, Archive, ArchiveRestore } from 'lucide-react';
import { MoreHorizontal, Eye, Play, Pause } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useJobActions } from '@/hooks/use-job-actions';
import { Job } from '@/lib/types/job';
import { Separator } from '@/components/ui/separator';

interface JobTableActionsProps {
  job: Job;
}

export function JobTableActions({ job }: JobTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useJobActions(job);

  const handleView = () => {
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.view();
  };

  const handleResume = () => {
    actions.resume();
  };

  const handleCancel = () => {
    actions.cancel();
  };

  const handleAddDocket = () => {
    actions.addDocket();
  };

  const handlePause = () => {
    actions.pause();
  };

  const handleViewDockets = () => {
    actions.viewDockets();
  };

  const handleSettle = () => {
    actions.settle();
  };

  return (
    <div>
      {confirmDialogs}
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
          {job.status === 'PAUSED' && (
            <>
              <DropdownMenuItem onClick={handleResume}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePause}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCancel}>
                <Play className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
