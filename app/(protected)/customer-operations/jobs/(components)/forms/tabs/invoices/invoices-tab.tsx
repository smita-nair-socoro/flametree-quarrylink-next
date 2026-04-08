'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { InvoicesListQueryOptions } from '@/lib/api/invoices';
import { invoicesColumns } from './(data-tables)/columns';
import { DataTableClient } from '@/components/ui/data-table-client';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

export default function InvoicesTab({ jobId }: { jobId: number }) {
	const isDesktop = useMediaQuery('(min-width: 768px)');

	const { data: invoices } = useQuery(InvoicesListQueryOptions(jobId));

	console.log(invoices);
	return (
		<div className="flex flex-col gap-4 mt-6">
			<div
				className={cn(
					isDesktop
						? 'flex justify-between items-center'
						: 'flex flex-col gap-4',
				)}
			>
				<span className="text-lg font-semibold">Invoices</span>
				{/* <FormDialog dialogTitle="Add New Docket" buttonTitle="Add New Docket">
					<DocketForm isQuickDocket={false} jobId={jobId} />
				</FormDialog> */}
			</div>

			<div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
				<DataTableClient
					columns={invoicesColumns}
					data={[]}
					// data={items ?? []}
					simpleTable={true}
					defaultSorting={[{ id: 'docketNumber', desc: false }]}
				/>
			</div>
		</div>
	);
}