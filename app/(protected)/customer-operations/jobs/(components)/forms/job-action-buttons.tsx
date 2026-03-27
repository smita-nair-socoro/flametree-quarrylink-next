'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Pause,
  Plus,
  CirclePlay,
  CircleX,
  Package,
  FileCheck2,
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useJobActions } from '@/hooks/use-job-actions';
import { JobDTO } from '@/lib/types/job';
import { JOB_STATUS } from '@/lib/types/job-enums';

interface JobActionButtonsProps {
  job: JobDTO | null | undefined;
  layout?: 'compact' | 'expanded';
}

export function JobActionButtons({
  job,
  layout = 'expanded',
}: JobActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const { actions, confirmDialogs, viewDialog, addDocketDialog } =
    useJobActions(job);

  if (!job) {
    return null;
  }

  // Don't render anything if customerId is invalid
  if (!job.id || job.id === 0) {
    return null;
  }

  const handleResume = () => actions.resume();
  const handlePause = () => actions.pause();
  const handleCancel = () => actions.cancel();
  const handleAddDocket = () => actions.addDocket();
  const handleViewDockets = () => actions.viewDockets();
  const handleSettle = () => actions.settle();

  // Mobile or compact version - everything in dropdown
  if (!isDesktop || layout === 'compact') {
    return (
      <div>
        {confirmDialogs}
        {viewDialog}
        {addDocketDialog}

        {job.jobStatus !== JOB_STATUS.CANCELLED && job.jobStatus !== JOB_STATUS.SETTLED && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {job.jobStatus === JOB_STATUS.PAUSED && (
                <>
                  <DropdownMenuItem onClick={handleResume}>
                    <CirclePlay className="h-4 w-4 mr-2" />
                    Resume
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

              {job.jobStatus === JOB_STATUS.ACTIVE && (
                <>
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

              {job.jobStatus === JOB_STATUS.IN_PROGRESS && (
                <>
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

              {job.jobStatus === JOB_STATUS.COMPLETED && (
                <>
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
        )}
      </div>
    );
  }

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      {addDocketDialog}

      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        {job.jobStatus === JOB_STATUS.PAUSED && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResume}
              className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800"
            >
              <CirclePlay className="h-4 w-4 mr-2" />
              Resume
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCancel}>
                  <CircleX className="h-4 w-4 mr-2 text-red-600" />
                  <span className="text-red-600">Cancel</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {job.jobStatus === JOB_STATUS.ACTIVE && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddDocket}
              className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-green-900 hover:text-green-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Docket
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePause}
              className="rounded-none border-r border-gray-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-900 hover:text-yellow-800"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCancel}>
                  <CircleX className="h-4 w-4 mr-2 text-red-600" />
                  <span className="text-red-600">Cancel</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {job.jobStatus === JOB_STATUS.IN_PROGRESS && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddDocket}
              className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-green-900 hover:text-green-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Docket
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewDockets}
              className="rounded-none border-r border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800"
            >
              <Package className="h-4 w-4 mr-2" />
              View Dockets
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handlePause}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCancel}>
                  <CircleX className="h-4 w-4 mr-2 text-red-600" />
                  <span className="text-red-600">Cancel</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {job.jobStatus === JOB_STATUS.COMPLETED && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewDockets}
              className="rounded-none border-r border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800"
            >
              <Package className="h-4 w-4 mr-2" />
              View Dockets
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSettle}
              className="rounded-none border-r border-gray-200 bg-purple-100 hover:bg-purple-200 text-purple-900 hover:text-purple-800"
            >
              <FileCheck2 className="h-4 w-4 mr-2" />
              Settle
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
