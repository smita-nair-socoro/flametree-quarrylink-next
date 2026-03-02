'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useJobLineItemActions } from '@/hooks/use-jobs-line-item-actions';
import { JobLineItem } from '@/lib/types/job';

interface JobLineItemTableActionsProps {
	jobLineItem: JobLineItem;
}

export function JobLineItemTableActions({
	jobLineItem,
}: JobLineItemTableActionsProps) {
	const [dropdownOpen, setDropdownOpen] = React.useState(false);
	const { actions, confirmDialogs, viewDialog } =
		useJobLineItemActions(jobLineItem);

	const createHandler =
		(actionFn: () => void, additionalSetup?: () => void) => () => {
			additionalSetup?.();
			setDropdownOpen(false);
			actionFn();
		};

	const handleView = createHandler(actions.view);

	const handleDelete = createHandler(actions.remove);

	return (
		<div>
			{confirmDialogs}
			{viewDialog}
			<DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="rounded-none hover:bg-gray-50 text-gray-800 hover:text-gray-900"
					>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuItem onClick={handleView}>
						<Eye className="h-4 w-4 mr-2" />
						View Products
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleDelete}
						className="text-destructive focus:text-destructive"
					>
						<Delete className="h-4 w-4 mr-2 text-red-600" />
						Remove
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
