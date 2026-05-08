'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormDialog } from '@/components/form-dialog';
import JobForm from './(components)/forms/job-form';
import { JobDTO } from '@/lib/types/job';
import { Plus, FileText, Wallet, Package, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { jobColumns } from './(components)/(data-tables)/job/columns';
import { useJobActions } from '@/hooks/use-job-actions';
import { useQuery } from '@tanstack/react-query';
import { JobsListQueryOptions } from '@/lib/api/job';
import { StatsCards, StatsCardData } from '@/components/stats-cards';

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: jobs } = useQuery(JobsListQueryOptions());
  const items: JobDTO[] = React.useMemo(() => {
    const list: JobDTO[] = Array.isArray(jobs) ? jobs : (jobs?.content ?? []);
    return list.map((job) => ({
      ...job,
    })) as JobDTO[];
  }, [jobs]);

  // Statistics cards data
  const statsCards: StatsCardData[] = [
    {
      title: 'Open Jobs',
      value: '15',
      description: 'Jobs requiring resources',
      icon: FileText,
      iconBgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Value of Uninvoiced Dockets',
      value: '$1,043,570',
      description: '12 Delivery | 10 Collection',
      icon: Wallet,
      iconBgColor: 'bg-[#CBFBF1]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Completed Jobs ',
      value: '12',
      description: '24 dockets ready for invoicing',
      icon: Package,
      iconBgColor: 'bg-[#CBFBF1]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Paused Jobs',
      value: '3',
      description: 'Need attention',
      icon: CircleAlert,
      iconBgColor: 'bg-[#FEF9C2]',
      iconColor: 'text-[#0A0A0AB2]',
      descriptionColor: 'text-[#E7000B]',
    },
  ]

  const { actions, viewDialog, confirmDialogs } = useJobActions();

  // URL-driven filtering for linked jobs
  const jobIdsParam = searchParams.get('jobIds');
  const jobIdsSet = React.useMemo(() => {
    if (!jobIdsParam) return null;
    const ids = jobIdsParam
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    return new Set(ids);
  }, [jobIdsParam]);

  const filteredItems = React.useMemo(() => {
    if (!jobIdsSet) return items;
    return items.filter((j) => jobIdsSet.has(j.id));
  }, [items, jobIdsSet]);

  // Auto-open job view when navigated from quote convert-to-job
  React.useEffect(() => {
    const openJobId = searchParams.get('openJobId');
    if (!openJobId || items.length === 0) return;

    const job = items.find((j) => j.id === Number(openJobId));
    if (job) {
      actions.view(job);
      router.replace('/customer-operations/jobs');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, items]);

  const facetDefs: FacetDefinition[] = [
    { column: 'status', title: 'Status', icon: Plus },
    { column: 'customerName', title: 'Customer', icon: Plus },
    { column: 'accountManagerName', title: 'Account Manager', icon: Plus },
  ];

  const handleRowClick = (row: JobDTO) => {
    actions.view(row);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Jobs</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle="Add New Job"
            dialogDescription="Fill in the required fields to add a new job."
            buttonTitle="Add Job"
          >
            <JobForm />
          </FormDialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatsCards
        cards={statsCards}
        mobileGridCols={1}
        desktopGridCols={4}
      />

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        {jobIdsSet && (
          <div className="flex flex-row sm:flex-row sm:items-center gap-5 mb-3">
            <div className="mt-1 text-sm text-muted-foreground">
              <span>Showing filtered jobs</span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/customer-operations/jobs')}
            >
              Reset Filter
            </Button>
          </div>
        )}
        <DataTableClient
          tableId="job_main_data_table"
          data={filteredItems ?? []}
          columns={jobColumns}
          facetDefinition={facetDefs}
          searchPlaceHolder="Search jobs..."
          defaultSorting={[{ id: 'jobNumber', desc: true }]}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
