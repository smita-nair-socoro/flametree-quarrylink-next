'use client';
import * as React from 'react';
import {
  MoreHorizontal,
  Eye,
  Pause,
  Plus,
  CirclePlay,
  CircleX,
  Package,
  FileCheck2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useJobActions } from '@/hooks/use-job-actions';
import { JobDetails } from '@/lib/types/job';


interface JobTableActionsProps {
  job: JobDetails;
}

export function JobTableActions({ job }: JobTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useJobActions(job);

  const handleView = () => {
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.view();
  };

  const handleResume = () => {
    setDropdownOpen(false);
    actions.resume();
  };

  const handleCancel = () => {
    setDropdownOpen(false);
    actions.cancel();
  };

  const handleAddDocket = () => {
    setDropdownOpen(false);
    actions.addDocket();
  };

  const handlePause = () => {
    setDropdownOpen(false);
    actions.pause();
  };

  const handleViewDockets = () => {
    setDropdownOpen(false);
    actions.viewDockets();
  };

  const handleSettle = () => {
    setDropdownOpen(false);
    actions.settle();
  };

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
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

          {(job.jobStatus == 'CANCELLED' || job.jobStatus == 'SETTLED') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleViewDockets}>
                <Package className="h-4 w-4 mr-2" />
                View Dockets
              </DropdownMenuItem>
            </>
          )}
          {job.jobStatus === 'PAUSED' && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleResume}>
                <CirclePlay className="h-4 w-4 mr-2" />
                Resume
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCancel}>
                <CircleX className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-red-600">Cancel</span>
              </DropdownMenuItem>
            </>
          )}
          {job.jobStatus === 'ACTIVE' && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleAddDocket}>
                <Plus className="h-4 w-4 mr-2" />
                Add Docket
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handlePause}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCancel}>
                <CircleX className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-red-600">Cancel</span>
              </DropdownMenuItem>
            </>
          )}
          {job.jobStatus === 'IN_PROGRESS' && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleAddDocket}>
                <Plus className="h-4 w-4 mr-2" />
                Add Docket
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleViewDockets}>
                <Package className="h-4 w-4 mr-2" />
                View Dockets
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handlePause}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCancel}>
                <CircleX className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-red-600">Cancel</span>
              </DropdownMenuItem>
            </>
          )}
          {job.jobStatus === 'COMPLETED' && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleViewDockets}>
                <Package className="h-4 w-4 mr-2" />
                View Dockets
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSettle}>
                <FileCheck2 className="h-4 w-4 mr-2" />
                Settle
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
