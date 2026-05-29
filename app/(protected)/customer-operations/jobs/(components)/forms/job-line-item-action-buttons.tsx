'use client';
import * as React from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import { JobItem } from '@/lib/types/job';
import { useJobLineItemActions } from '@/hooks/use-jobs-line-item-actions';
import { Delete } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface JobLineItemActionButtonsProps {
	jobLineItem: JobItem | null | undefined;
	layout?: 'compact' | 'expanded';
}
export function JobLineItemActionButtons({
	jobLineItem,
	layout = 'expanded',
}: JobLineItemActionButtonsProps) {
	const isDesktop = useMediaQuery('(min-width: 768px)');

	const { actions, confirmDialogs, viewDialog } = useJobLineItemActions(
		jobLineItem as JobItem | null | undefined
	);

	// Early returns for null job or new job
	if (!jobLineItem) {
		return null;
	}

	// Don't render anything if jobId is invalid
	if (!jobLineItem.id || jobLineItem.id === 0) {
		return null;
	}

	// Mobile or compact version - everything in dropdown
	if (!isDesktop || layout === 'compact') {
		return (
			<div>
				{confirmDialogs}
				{viewDialog}
				<div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
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
							<DropdownMenuItem
								onClick={actions.remove}
								className="text-destructive focus:text-destructive"
							>
								<Delete className="h-4 w-4 mr-2 text-red-600" />
								Remove
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		);
	}

	// Desktop expanded version - toggle group layout
	return (
		<div>
			{confirmDialogs}
			{viewDialog}
			<div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
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
						<DropdownMenuItem
							onClick={actions.remove}
							className="text-destructive focus:text-destructive"
						>
							<Delete className="h-4 w-4 mr-2 text-red-600" />
							Remove
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}