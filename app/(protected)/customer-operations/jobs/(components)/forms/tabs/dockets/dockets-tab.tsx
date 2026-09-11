'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

import { DataTableClient } from '@/components/ui/data-table-client';
import { docketsColumns } from './(data-tables)/columns';
import { FormDialog } from '@/components/form-dialog';
import DocketForm from '@/app/(protected)/customer-operations/dockets/(components)/forms/docket-form';
import {
  DocketRowActionsProvider,
  useDocketTableActionHost,
} from '@/app/(protected)/customer-operations/dockets/(components)/(data-tables)/docket/docket-table-action-host';
import { JobDetails } from '@/lib/types/job';
import { useQuery } from '@tanstack/react-query';
import {
  DocketsTableQueryOptions,
  getDocketTableRowsFromTableResponse,
  getDocketsTablePage,
  toDocketApiSortParams,
} from '@/lib/api/docket';
import { JOB_STATUS } from '@/lib/types/job-enums';
import type { SortingState } from '@tanstack/react-table';
import { isPrepaidUnpaid } from '@/lib/utils/prepaid';

interface DocketsTabProps {
  selectedJob: JobDetails | null;
}

export default function DocketsTab({ selectedJob }: DocketsTabProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const jobId = selectedJob?.id ?? 0;
  const { runAction, confirmDialogs, viewDialog } = useDocketTableActionHost();

  const jobStatus = React.useMemo(() => selectedJob?.jobStatus, [selectedJob]);

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'deliveryDate', desc: true },
  ]);

  const apiSortParams = React.useMemo(
    () => toDocketApiSortParams(sorting),
    [sorting],
  );

  const { data: docketPage, isFetching, isError } = useQuery({
    ...DocketsTableQueryOptions({
      jobId,
      page: pageIndex,
      pageSize,
      ...apiSortParams,
    }),
    enabled: !!jobId,
  });

  const items = getDocketTableRowsFromTableResponse(docketPage);
  const docketsPage = getDocketsTablePage(docketPage);
  const totalElements = docketsPage?.totalElements ?? 0;
  const totalPages =
    docketsPage?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));

  const handleSortingChange = React.useCallback((newSorting: SortingState) => {
    setSorting(
      newSorting.length > 0
        ? newSorting
        : [{ id: 'deliveryDate', desc: true }],
    );
    setPageIndex(0);
  }, []);

  const handlePaginationChange = React.useCallback(
    (newPage: number, newSize: number) => {
      setPageIndex(newPage);
      setPageSize(newSize);
    },
    [],
  );

  return (
    <DocketRowActionsProvider runAction={runAction}>
      <div className="flex flex-col gap-4 mt-6">
        {confirmDialogs}
        {viewDialog}
        <div
          className={cn(
            isDesktop
              ? 'flex justify-between items-center'
              : 'flex flex-col gap-4',
          )}
        >
          <span className="text-lg font-semibold">Dockets</span>
          {jobStatus !== JOB_STATUS.CANCELLED &&
            (isPrepaidUnpaid(selectedJob) ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button type="button" disabled>
                      Add New Docket
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Record a cash sale before raising dockets on a prepaid job
                </TooltipContent>
              </Tooltip>
            ) : (
            <FormDialog
              dialogTitle={
                selectedJob?.jobType === 'INTERNAL_TRANSFER'
                  ? 'Internal Transfer Docket'
                  : 'Add New Docket'
              }
              dialogDescription={
                selectedJob?.jobType === 'INTERNAL_TRANSFER'
                  ? 'Track material moving between your sites. No customer sale or invoice is created.'
                  : undefined
              }
              buttonTitle={
                selectedJob?.jobType === 'INTERNAL_TRANSFER'
                  ? 'Add Internal Transfer'
                  : 'Add New Docket'
              }
            >
              <DocketForm isQuickDocket={false} jobId={jobId} />
            </FormDialog>
            ))}
        </div>

        <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
          {isError ? (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              Error loading dockets
            </div>
          ) : (
            <DataTableClient
              tableId={`job_dockets_${jobId}`}
              columns={docketsColumns}
              data={items}
              simpleTable={true}
              defaultSorting={[{ id: 'deliveryDate', desc: true }]}
              totalElements={totalElements}
              totalPages={totalPages}
              externalPageIndex={pageIndex}
              externalPageSize={pageSize}
              externalSorting={sorting}
              onPaginationChange={handlePaginationChange}
              onSortingChange={handleSortingChange}
              isLoading={isFetching}
            />
          )}
        </div>
      </div>
    </DocketRowActionsProvider>
  );
}
