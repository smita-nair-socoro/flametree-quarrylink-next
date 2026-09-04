'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableClient } from '@/components/ui/data-table-client';
import { FormDialog } from '@/components/form-dialog';
import InternalTransferJobForm from './forms/internal-transfer-job-form';
import { JobDTO } from '@/lib/types/job';
import {
  InternalTransferJobsListQueryOptions,
  getJobItemsFromListResponse,
  toJobApiSortParams,
} from '@/lib/api/job';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { JobTableActions } from './(data-tables)/job/job-table-actions';
import { useJobActions } from '@/hooks/use-job-actions';
import { useSearchParams } from 'next/navigation';
import { JobItemsQueryOptions } from '@/lib/api/job';

const columns: ColumnDef<JobDTO>[] = [
  {
    id: 'jobNumber',
    accessorFn: (row) => row.jobNumber,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Job Number" />
    ),
    cell: ({ row }) => <div className="py-2">{row.original.jobNumber}</div>,
    meta: 'Job Number',
  },
  {
    id: 'fromSiteName',
    accessorFn: (row) => row.fromSiteName,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="From Site" />
    ),
    cell: ({ row }) => (
      <div className="py-2">{row.original.fromSiteName || 'N/A'}</div>
    ),
    meta: 'From Site',
  },
  {
    id: 'toSiteName',
    accessorFn: (row) => row.toSiteName,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="To Site" />
    ),
    cell: ({ row }) => (
      <div className="py-2">{row.original.toSiteName || 'N/A'}</div>
    ),
    meta: 'To Site',
  },
  {
    id: 'docketCount',
    accessorFn: (row) => row.docketCount,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Dockets" />
    ),
    cell: ({ row }) => <div className="py-2">{row.original.docketCount ?? 0}</div>,
    meta: 'Dockets',
  },
  {
    id: 'status',
    accessorFn: (row) => row.jobStatus,
    header: ({ column }) => (
      <TableClientSortableHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <div className="py-2">
        <TableBadges names={[row.original.jobStatus]} visibleCount={1} />
      </div>
    ),
    meta: 'Status',
  },
  {
    id: 'accountManagerName',
    accessorFn: (row) => row.createdBy,
    enableSorting: false,
    header: () => <div>Account Manager</div>,
    cell: ({ row }) => (
      <div className="py-2">{row.original.createdBy || '—'}</div>
    ),
    meta: 'Account Manager',
  },
  {
    id: 'actions',
    header: () => <div />,
    cell: ({ row }) => <JobTableActions job={row.original} />,
  },
];

export function InternalTransferJobsTab() {
  const searchParams = useSearchParams();
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'jobNumber', desc: true },
  ]);
  const apiSortParams = React.useMemo(
    () => toJobApiSortParams(sorting),
    [sorting],
  );

  const linkedJobId = React.useMemo(() => {
    const idsParam = searchParams.get('ids');
    if (!idsParam) return undefined;
    const ids = idsParam
      .split(',')
      .map(Number)
      .filter((n) => Number.isFinite(n));
    return ids.length === 1 ? ids[0] : undefined;
  }, [searchParams]);

  const { data, isFetching } = useQuery(
    InternalTransferJobsListQueryOptions({
      page: pageIndex,
      pageSize,
      search: search.trim() || undefined,
      ...apiSortParams,
    }),
  );
  const { data: linkedJob } = useQuery({
    ...JobItemsQueryOptions(linkedJobId ?? 0),
    enabled: linkedJobId != null,
  });

  const items = getJobItemsFromListResponse(data);
  const totalElements = data?.jobs?.totalElements ?? 0;
  const totalPages = data?.jobs?.totalPages ?? 1;
  const { actions, viewDialog, confirmDialogs } = useJobActions();
  const autoOpenedIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!linkedJobId || !linkedJob) return;
    if (autoOpenedIdRef.current === linkedJobId) return;
    autoOpenedIdRef.current = linkedJobId;
    actions.view(linkedJob);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedJobId, linkedJob]);

  return (
    <div className="flex flex-col gap-4">
      {confirmDialogs}
      {viewDialog}
      <div className="flex justify-end">
        <FormDialog
          dialogTitle="Add Internal Transfer Job"
          dialogDescription="Choose From Site and To Site. Sites must differ."
          buttonTitle="Add Internal Transfer"
        >
          <InternalTransferJobForm />
        </FormDialog>
      </div>
      <DataTableClient
        tableId="internal_transfer_jobs"
        data={items}
        columns={columns}
        searchPlaceHolder="Search internal transfer jobs..."
        defaultSorting={[{ id: 'jobNumber', desc: true }]}
        onRowClick={(row) => actions.view(row)}
        totalElements={totalElements}
        totalPages={totalPages}
        externalPageIndex={pageIndex}
        externalPageSize={pageSize}
        externalSorting={sorting}
        onPaginationChange={(page, size) => {
          setPageIndex(page);
          setPageSize(size);
        }}
        onSearchChange={(value) => {
          setSearch(value);
          setPageIndex(0);
        }}
        onSortingChange={(next) => {
          setSorting(
            next.length > 0 ? next : [{ id: 'jobNumber', desc: true }],
          );
          setPageIndex(0);
        }}
        isLoading={isFetching}
      />
    </div>
  );
}
