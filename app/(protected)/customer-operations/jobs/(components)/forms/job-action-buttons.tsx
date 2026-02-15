'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Play } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useJobActions } from '@/hooks/use-job-actions';
import { Job } from '@/lib/types/job';
import { useAuth } from '@/hooks/use-auth';

interface JobActionButtonsProps {
  job: Job | null | undefined;
  layout?: 'compact' | 'expanded';
}

export function JobActionButtons({
  job,
  layout = 'expanded',
}: JobActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Role-based feature detection
  const { attributes } = useAuth();
  const userRole =
    attributes?.['custom:role'] || attributes?.role || 'Essentials';
  const isEssentials = userRole === 'Essentials';

  const { actions, confirmDialogs, viewDialog } = useJobActions(job);

  // Early returns for null quotation or new quotation
  if (!job) {
    return null;
  }

  // Don't render anything if customerId is invalid
  if (!job.id || job.id === 0) {
    return null;
  }

  // Mobile or compact version - everything in dropdown
  if (!isDesktop || layout === 'compact') {
    return (
      <div>
        {confirmDialogs}
        {viewDialog}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* TODO: Add job actions here */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Desktop expanded version - toggle group layout
  return (
    <div>
      {confirmDialogs}
      {viewDialog}

      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        {!isEssentials && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.viewDockets}
            className="rounded-none border-r bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-200"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Dockets
          </Button>
        )}
        {/* TODO: Add job actions here */}
      </div>
    </div>
  );
}
