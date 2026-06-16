'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

import { DataTableClient } from '@/components/ui/data-table-client';
import { docketsColumns } from './(data-tables)/columns';
import { FormDialog } from '@/components/form-dialog';
import DocketForm from '@/app/(protected)/customer-operations/dockets/(components)/forms/docket-form';
import { JobDetails } from '@/lib/types/job';
import { DocketDTO } from '@/lib/types/docket';
import { useQuery } from '@tanstack/react-query';
import { DocketsByJobIdQueryOptions } from '@/lib/api/docket';
import { JOB_STATUS } from '@/lib/types/job-enums';

interface DocketsTabProps {
  selectedJob: JobDetails | null;
}

export default function DocketsTab({ selectedJob }: DocketsTabProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const jobId = selectedJob?.id ?? 0;

  const jobStatus = React.useMemo(() => selectedJob?.jobStatus, [selectedJob]);

  const { data: dockets } = useQuery({
    ...DocketsByJobIdQueryOptions(jobId),
    enabled: !!jobId,
  });

  const items: DocketDTO[] = React.useMemo(() => {
    const list: DocketDTO[] = Array.isArray(dockets)
      ? dockets
      : (dockets?.content ?? []);
    return list.map((docket) => ({
      ...docket,
    })) as DocketDTO[];
  }, [dockets]);


  return (
    <div className="flex flex-col gap-4 mt-6">
      <div
        className={cn(
          isDesktop
            ? 'flex justify-between items-center'
            : 'flex flex-col gap-4',
        )}
      >
        <span className="text-lg font-semibold">Dockets</span>
        {jobStatus !== JOB_STATUS.CANCELLED && (
          <FormDialog dialogTitle="Add New Docket" buttonTitle="Add New Docket">
            <DocketForm isQuickDocket={false} jobId={jobId} />
          </FormDialog>
        )}
      </div>

      <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
        <DataTableClient
          columns={docketsColumns}
          data={items}
          simpleTable={true}
          defaultSorting={[{ id: 'docketNumber', desc: false }]}
        />
      </div>
    </div>
  );
}
