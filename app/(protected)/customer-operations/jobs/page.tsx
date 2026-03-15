'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import JobForm from './(components)/forms/job-form';
import { JobDTO } from '@/lib/types/job';
import { Plus } from 'lucide-react';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { jobColumns } from './(components)/(data-tables)/job/columns';
import { useJobActions } from '@/hooks/use-job-actions';
import { useQuery } from '@tanstack/react-query';
import { JobsListQueryOptions } from '@/lib/api/job';

export default function CustomersPage() {
  const { data: jobs } = useQuery(JobsListQueryOptions());
  const items: JobDTO[] = React.useMemo(() => {
    const list: JobDTO[] = Array.isArray(jobs) ? jobs : jobs?.content ?? [];
    return list.map((job) => ({
      ...job,
    })) as JobDTO[];
  }, [jobs]);

  const { actions, viewDialog, confirmDialogs } = useJobActions();


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

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTableClient
          tableId="job_main_data_table"
          data={items ?? []}
          columns={jobColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search jobs..."
          defaultSorting={[{ id: 'jobNumber', desc: false }]}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
