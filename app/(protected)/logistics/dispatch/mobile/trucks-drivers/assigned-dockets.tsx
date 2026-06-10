'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  UserMinus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import {
  formatDispatchProductSellUomLabel,
  formatTimeRange,
  loadVolumeM3FromProductSellUom,
} from '@/lib/utils/dispatch-helper';
import type { DispatchDocket } from '@/lib/utils/dispatch-helper';
import type { TruckResource } from '@/lib/types/truck';
import { useDispatchMobile } from '../dispatch-mobile-context';
import { TableBadges } from '@/components/table-badges';

function getDispatchStatusStripeClass(status?: string) {
  switch (status) {
    case 'ASSIGNED':
      return 'bg-cyan-400';
    case 'IN_TRANSIT':
      return 'bg-indigo-500';
    case 'DELIVERED':
      return 'bg-green-500';
    case 'ARRIVED':
      return 'bg-yellow-400';
    case 'STOPPED':
      return 'bg-orange-400';
    default:
      return 'bg-gray-300';
  }
}

function resourceStats(
  assignedDockets: DispatchDocket[],
) {
  const trips = assignedDockets.length;
  const volumeM3 = assignedDockets.reduce(
    (sum, d) =>
      sum +
      loadVolumeM3FromProductSellUom(
        d.actualLoadSize || d.plannedLoadSize || 0,
        d.productSellUom || 'TN',
        d.productDensity || 1,
      ),
    0,
  );
  return { trips, volumeM3: Math.round(volumeM3) };
}

function ResourceRow({
  resource,
  dockets,
  defaultExpanded,
  onMove,
  onUnassign,
  onDetails,
}: {
  resource: TruckResource;
  dockets: DispatchDocket[];
  defaultExpanded?: boolean;
  onMove: (docketId: string) => void;
  onUnassign: (docketId: string) => void;
  onDetails: (docketId: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded ?? false);
  const stats = resourceStats(dockets);
  const isInternal = resource.businessType === 'INTERNAL';

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9]">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-[#0F172A]">
              {resource.name}
            </span>
            <span
              className={cn(
                'rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase',
                isInternal
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-800',
              )}
            >
              {resource.businessType || 'EXTERNAL'}
            </span>
          </div>
          <p className="text-sm text-[#64748B]">
            {stats.trips} trips · {stats.volumeM3} m³
          </p>
        </div>
      </button>

      {expanded && dockets.length > 0 && (
        <div className="border-t border-gray-100 bg-[#F5F3FF]/40 p-3">
          <div className="flex flex-col gap-3">
            {dockets.map((docket) => {
              const canUnassign =
                docket.docketStatus === DOCKET_STATUS.ASSIGNED;
              const canMove = docket.docketStatus === DOCKET_STATUS.ASSIGNED;

              return (
                <div
                  key={docket.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <div className="flex">
                    <div
                      className={cn(
                        'w-1 shrink-0',
                        getDispatchStatusStripeClass(docket.docketStatus),
                      )}
                    />
                    <div className="min-w-0 flex-1 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[#8E51FF]">
                          {docket.docketNumber}
                        </span>
                        <span className="rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium text-[#64748B]">
                          {formatTimeRange(
                            docket.deliveryCollectionStartTime,
                            docket.deliveryCollectionEndTime,
                          )}
                        </span>
                        <TableBadges names={[docket.docketStatus]} />
                      </div>
                      <p className="mt-2 text-base font-bold text-[#0F172A]">
                        {docket.customerName || 'Unknown customer'}
                      </p>
                      <p className="text-sm text-[#64748B]">
                        {docket.productName || '—'} ·{' '}
                        {docket.actualLoadSize || docket.plannedLoadSize || 0}{' '}
                        {formatDispatchProductSellUomLabel(
                          docket.productSellUom,
                        )}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!canMove}
                          className="h-9 rounded-lg border-[#C4B5FD] bg-[#F5F3FF] text-[#7C3AED] disabled:opacity-40"
                          onClick={() => onMove(String(docket.id))}
                        >
                          Move…
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!canUnassign}
                          className="h-9 rounded-lg border-red-200 text-red-600 disabled:opacity-40"
                          onClick={() => onUnassign(String(docket.id))}
                        >
                          <UserMinus className="mr-1.5 h-4 w-4" />
                          Unassign
                        </Button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-1 h-8 w-full text-sm text-[#64748B]"
                        onClick={() => onDetails(String(docket.id))}
                      >
                        View details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function AssignedDockets({
  viewType,
}: {
  viewType: 'trucks' | 'drivers';
}) {
  const {
    truckResources,
    driverResources,
    truckAssignedDockets,
    driverAssignedDockets,
    isLoadingTrucks,
    isLoadingDrivers,
    openMove,
    requestUnassign,
    openDetails,
  } = useDispatchMobile();

  const isLoading =
    viewType === 'trucks' ? isLoadingTrucks : isLoadingDrivers;
  const resources =
    viewType === 'trucks' ? truckResources : driverResources;
  const assignedDockets =
    viewType === 'trucks' ? truckAssignedDockets : driverAssignedDockets;

  const resourceCount = resources.length;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-gray-200 text-sm font-medium"
        >
          <SlidersHorizontal className="mr-1.5 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-lg bg-[#0F172A] px-3 py-1.5 text-xs font-semibold text-white">
          {resourceCount} {viewType === 'trucks' ? 'trucks' : 'drivers'}
        </span>
        <span className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A]">
          {assignedDockets.length} trips today
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="medium" />
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center text-sm text-muted-foreground">
          No {viewType === 'trucks' ? 'trucks' : 'drivers'} scheduled for this
          day.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {resources.map((resource, index) => {
            const resourceDockets = assignedDockets.filter(
              (d) => d.uiAssignedTruckId === resource.id,
            );
            return (
              <ResourceRow
                key={resource.id}
                resource={resource}
                dockets={resourceDockets}
                defaultExpanded={index === 0}
                onMove={(docketId) =>
                  openMove(
                    docketId,
                    viewType === 'trucks' ? 'truck' : 'driver',
                  )
                }
                onUnassign={requestUnassign}
                onDetails={openDetails}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
