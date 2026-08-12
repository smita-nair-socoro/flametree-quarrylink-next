'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

import { DataTableClient } from '@/components/ui/data-table-client';
import { getJobLineItemsColumns } from './(data-tables)/columns';
import { JobItemsQueryOptions } from '@/lib/api/job';
import {
  calculateJobPricing,
  calculateJobPricingFromTotals,
  JobPricingTotals,
} from '@/lib/utils/job-helpers';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { TrendingDown, TrendingUp } from 'lucide-react';
import JobLineItemForm from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-line-item-form';
import { FormDialog } from '@/components/form-dialog';
import { useSelectedJob } from '@/app/stores/job-store';
import { JOB_STATUS } from '@/lib/types/job-enums';

interface LineItemsTabProps {
  jobId: number;
  /** Backend-computed job totals; job items are paginated so summing the visible page would undercount. */
  jobTotals?: JobPricingTotals;
}

const DEFAULT_SORTING: SortingState = [{ id: 'productName', desc: false }];

/**
 * Table column id → job-items API sortBy key. Only these columns are
 * server-sortable; the rest keep plain headers.
 */
const LINE_ITEM_COLUMN_TO_API_SORT: Record<string, string> = {
  productName: 'productName',
  remainingQuantity: 'remainingQuantity',
};

export default function LineItemsTab({
  jobId,
  jobTotals,
}: Readonly<LineItemsTabProps>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const {
    currencyCode,
    currencySymbol,
    taxLabel,
    taxPercentage,
    exTaxLabel,
    taxRateLabel,
  } = useTenantCurrencyTax();

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [sorting, setSorting] = React.useState<SortingState>(DEFAULT_SORTING);

  const sortParams = React.useMemo(() => {
    const sort = sorting[0];
    if (!sort) return {};
    return {
      sortBy: LINE_ITEM_COLUMN_TO_API_SORT[sort.id] ?? sort.id,
      sortOrder: sort.desc ? 'desc' : 'asc',
    };
  }, [sorting]);

  const { data: jobDetails, isFetching } = useQuery({
    // Job-items API pagination is 1-based (page 1 = first page).
    ...JobItemsQueryOptions(jobId, {
      page: pageIndex + 1,
      pageSize,
      ...sortParams,
    }),
    enabled: jobId > 0,
  });

  const jobLineItems = React.useMemo(
    () => jobDetails?.jobItems?.content ?? [],
    [jobDetails?.jobItems],
  );
  const totalElements = jobDetails?.jobItems?.totalElements ?? 0;
  const totalPages =
    jobDetails?.jobItems?.totalPages ??
    Math.max(1, Math.ceil(totalElements / pageSize));

  const handlePaginationChange = React.useCallback(
    (newPage: number, newSize: number) => {
      setPageIndex(newPage);
      setPageSize(newSize);
    },
    [],
  );

  const handleSortingChange = React.useCallback((newSorting: SortingState) => {
    setSorting(newSorting.length > 0 ? newSorting : DEFAULT_SORTING);
    setPageIndex(0);
  }, []);

  const pricingBreakdown = React.useMemo(() => {
    const totals = jobTotals ?? jobDetails;
    if (totals) {
      return calculateJobPricingFromTotals(totals, currencyCode, taxPercentage);
    }
    return calculateJobPricing(jobLineItems, currencyCode, taxPercentage);
  }, [jobTotals, jobDetails, jobLineItems, currencyCode, taxPercentage]);

  const isAllCollection = React.useMemo(() => {
    if (!jobLineItems || jobLineItems.length === 0) return false;
    return jobLineItems.every((item) => item.jobItemType === 'COLLECTION');
  }, [jobLineItems]);

  const selectedJob = useSelectedJob();
  const jobStatus = React.useMemo(() => selectedJob?.jobStatus, [selectedJob]);

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div
        className={cn(
          isDesktop
            ? 'flex justify-between items-center'
            : 'flex flex-col gap-4',
        )}
      >
        <span className="text-lg font-semibold">Line Items</span>
        {jobStatus !== JOB_STATUS.CANCELLED && (
          <FormDialog
            dialogTitle="Add Product"
            buttonTitle="Add New Product"
            dialogWidth="700px"
            contentClass="-mt-5"
            preventAutoFocus
          >
            <JobLineItemForm canEdit={true} />
          </FormDialog>
        )}
      </div>

      <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
        <DataTableClient
          columns={getJobLineItemsColumns(
            currencyCode,
            taxLabel,
            taxPercentage,
          )}
          tableId={`job_line_items_${jobId}`}
          data={jobLineItems}
          simpleTable={true}
          defaultSorting={DEFAULT_SORTING}
          totalElements={totalElements}
          totalPages={totalPages}
          externalPageIndex={pageIndex}
          externalPageSize={pageSize}
          externalSorting={sorting}
          onPaginationChange={handlePaginationChange}
          onSortingChange={handleSortingChange}
          isLoading={isFetching}
        />
      </div>
      {totalElements > 0 && (
        <div className="flex flex-col gap-3">
          {(() => {
            const separatorBorder = 'border-t border-dashed border-[#8E51FF]';
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cost Summary */}
                  <div className="md:col-span-1 md:col-start-2 rounded-lg border border-[#DDD] bg-gray-50 px-4 py-3 shadow-sm">
                    <h3 className="text-lg font-bold mb-3">Cost Summary</h3>
                    <div className="flex flex-col gap-3 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-normal">
                      <div>
                        <span>Product Cost</span>
                        <span>
                          {currencySymbol}
                          {pricingBreakdown.totalProductCostPrice}
                        </span>
                      </div>
                      {!isAllCollection && (
                        <div>
                          <span>Truck Cost</span>
                          <span>
                            {currencySymbol}
                            {pricingBreakdown.totalTruckCostPrice}
                          </span>
                        </div>
                      )}
                      <div className={`pt-2 ${separatorBorder}`}>
                        <span>Subtotal {exTaxLabel}</span>
                        <span>
                          {currencySymbol}
                          {pricingBreakdown.costSubtotalExGST}
                        </span>
                      </div>
                      <div>
                        <span>{taxRateLabel}</span>
                        <span>
                          {currencySymbol}
                          {pricingBreakdown.costGst}
                        </span>
                      </div>
                      <div className={`pt-2 ${separatorBorder}`}>
                        <span className="font-bold text-lg">Total Cost</span>
                        <span className="font-bold text-lg">
                          {currencySymbol}
                          {pricingBreakdown.totalCost}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Sale Summary */}
                  <div className="md:col-span-1 md:col-start-3 bg-purple-50 rounded-lg border border-[#DDD] px-4 py-3 shadow-sm">
                    <h3 className="text-lg font-bold mb-3">Sale Summary</h3>
                    <div className="flex flex-col gap-3 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-normal">
                      <div>
                        <span>Product Sell</span>
                        <span>
                          {currencySymbol}
                          {pricingBreakdown.totalProductSellPrice}
                        </span>
                      </div>
                      {!isAllCollection && (
                        <div>
                          <span>Truck Sell</span>
                          <span>
                            {currencySymbol}
                            {pricingBreakdown.totalTruckSellPrice}
                          </span>
                        </div>
                      )}
                      <div className={`pt-2 ${separatorBorder}`}>
                        <span>Subtotal {exTaxLabel}</span>
                        <span>
                          {currencySymbol}
                          {pricingBreakdown.invoiceSubtotalExGST}
                        </span>
                      </div>
                      <div>
                        <span>{taxRateLabel}</span>
                        <span>
                          {currencySymbol}
                          {pricingBreakdown.invoiceGst}
                        </span>
                      </div>
                      <div className={`pt-2 ${separatorBorder}`}>
                        <span className="font-bold text-lg">Total Invoice</span>
                        <span className="font-bold text-lg">
                          {currencySymbol}
                          {pricingBreakdown.totalInvoice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Gross Profit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-end items-center gap-2 py-3 px-4 bg-gray-50 border border-[#DDDDDD] rounded-lg md:col-span-2 md:col-start-2">
                    <span className="text-lg font-semibold">Gross Profit:</span>
                    {pricingBreakdown.grossProfitPercentage >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600 shrink-0" />
                    )}
                    <span
                      className={cn(
                        'text-lg font-bold',
                        pricingBreakdown.grossProfitPercentage >= 0
                          ? 'text-green-600'
                          : 'text-red-600',
                      )}
                    >
                      {pricingBreakdown.grossProfitPercentage?.toFixed(2)}%
                    </span>
                    <span className="text-lg font-medium ml-5">
                      {pricingBreakdown.grossProfit}
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
