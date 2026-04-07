'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { InvoicesListQueryOptions } from '@/lib/api/invoices';

export default function InvoicesTab({ jobId }: { jobId: number }) {
	const { data: invoices } = useQuery(InvoicesListQueryOptions(jobId));
	console.log(invoices);
	return (
		<div>
			<h1>Invoices</h1>
		</div>
	);
}