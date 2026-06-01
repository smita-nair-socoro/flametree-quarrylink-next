'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { X, User, Check, MapPin, ExternalLink } from 'lucide-react';
import { formatTimeRange } from '@/lib/utils/dispatch-helper';
import { CUSTOMER_TYPE } from '@/lib/types/customer-enums';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Map } from '@/components/ui/map';
import { TableBadges } from '@/components/table-badges';
import { JOB_LINE_ITEM_TYPE } from '@/lib/types/job-enums';
import {
  DocketByIdQueryOptions,
  useOperationalUpdateDocket,
} from '@/lib/api/docket';
import { useQuery } from '@tanstack/react-query';
import type { Address } from '@/lib/types/address';
import { toast } from 'sonner';
import { calculateConvertedQty } from '@/lib/utils/dispatch-helper';
import { useDocketActions } from '@/hooks/use-docket-actions';

function dispatchAddressLabel(
  addr: string | Partial<Address> | undefined,
): string {
  if (addr == null) return '-';
  if (typeof addr === 'string') return addr;
  return addr.formattedAddress || '-';
}

function dispatchAddressMapsQuery(
  addr: string | Partial<Address> | undefined,
): string {
  const label = dispatchAddressLabel(addr);
  return encodeURIComponent(label === '-' ? '' : label);
}

function coordsFromDeliveryAddress(
  addr: string | Partial<Address> | undefined,
): { lat: number; lng: number } {
  if (addr == null || typeof addr === 'string') {
    return { lat: -37.814, lng: 144.991 };
  }
  return {
    lat: addr.latitude ?? -37.814,
    lng: addr.longitude ?? 144.991,
  };
}

/** Prefer wall-clock from collection window so dispatch assignment matches the board date (detail refetch can lag). */
function getCollectionDayForDisplay(docket: {
  deliveryCollectionDate?: string | null;
}) {
  const dateStr = docket.deliveryCollectionDate;
  if (dateStr) {
    const local = dateStr.includes('T') ? dateStr.replace('Z', '') : dateStr;
    return new Date(local);
  }
  return null;
}

interface DocketDetailsPanelProps {
  docketId: number;
  onClose: () => void;
  onUnassign: () => void;
  isDispatchView?: boolean;
}

export function DocketDetailsPanel({
  docketId,
  onClose,
  onUnassign,
  isDispatchView = false,
}: DocketDetailsPanelProps) {
  const { data: fullDocket, isLoading } = useQuery({
    ...DocketByIdQueryOptions(docketId),
    enabled: !!docketId,
  });

  const [plannedLoadSizeValue, setPlannedLoadSizeValue] = useState<string>('');
  const [actualLoadSizeValue, setActualLoadSizeValue] = useState<string>('');

  const operationalUpdateMutation = useOperationalUpdateDocket();
  const { actions, confirmDialogs, viewDialog } = useDocketActions(fullDocket);

  useEffect(() => {
    setPlannedLoadSizeValue(
      fullDocket?.plannedLoadSize?.toString() ||
      fullDocket?.actualLoadSize?.toString() ||
      '0',
    );
    setActualLoadSizeValue(
      fullDocket?.actualLoadSize?.toString() ||
      fullDocket?.plannedLoadSize?.toString() ||
      '0',
    );
  }, [fullDocket?.id, fullDocket?.plannedLoadSize, fullDocket?.actualLoadSize]);

  const handleSaveLoadSize = (type: 'planned' | 'actual') => {
    if (!fullDocket) return;

    let payload: {
      plannedLoadSize?: number;
      actualLoadSize?: number;
      deliveryDistanceQuantity?: number;
    } = {};
    let val = 0;

    if (
      fullDocket.docketStatus === DOCKET_STATUS.UNASSIGNED ||
      fullDocket.docketStatus === DOCKET_STATUS.ASSIGNED
    ) {
      val =
        parseFloat(
          type === 'planned' ? plannedLoadSizeValue : actualLoadSizeValue,
        ) || 0;
      payload = { plannedLoadSize: val, actualLoadSize: val };
    } else if (
      fullDocket.docketStatus === DOCKET_STATUS.IN_TRANSIT ||
      fullDocket.docketStatus === DOCKET_STATUS.ARRIVED ||
      fullDocket.docketStatus === DOCKET_STATUS.DELIVERED
    ) {
      val = parseFloat(actualLoadSizeValue) || 0;
      payload = { actualLoadSize: val };
    } else {
      return;
    }

    const isCollection = fullDocket.jobItem?.jobItemType === 'COLLECTION';
    let deliveryDistanceQuantity = fullDocket.deliveryDistanceQuantity || 0;

    if (!isCollection) {
      // needTruckQty is true if truck uom is Hourly, Load, KM (as per use-docket-form-state.tsx)
      const needTruckQty =
        fullDocket.jobItem?.truckSellUom === 'HOURLY' ||
        fullDocket.jobItem?.truckSellUom === 'LOAD' ||
        fullDocket.jobItem?.truckSellUom === 'KM';

      if (!needTruckQty) {
        let deliveryDistanceUom = fullDocket.jobItem?.truckSellUom || 'TN';
        const validUoms = [
          'KG_20',
          'KM',
          'LOAD',
          'TN',
          'BULKA',
          'HOURLY',
          'M3',
        ];
        if (!validUoms.includes(deliveryDistanceUom)) {
          const uomMap: Record<string, string> = {
            '20kg': 'KG_20',
            km: 'KM',
            Load: 'LOAD',
            TN: 'TN',
            Bulka: 'BULKA',
            Hourly: 'HOURLY',
            m3: 'M3',
          };
          deliveryDistanceUom = uomMap[deliveryDistanceUom] || 'TN';
        }

        deliveryDistanceQuantity = calculateConvertedQty(
          val,
          fullDocket.jobItem?.productSellUom || 'TN',
          deliveryDistanceUom,
          fullDocket.jobItem?.product?.densityTonnagePerM3 || 1,
        );
      }
    }

    payload.deliveryDistanceQuantity = deliveryDistanceQuantity;
    console.log(payload);

    operationalUpdateMutation.mutate(
      { id: docketId, data: payload },
      {
        onSuccess: () => toast.success('Load size updated successfully'),
        onError: () => toast.error('Failed to update load size'),
      },
    );
  };

  const docket = fullDocket;

  if (isLoading || !docket) {
    return (
      <>
        {viewDialog}
        {confirmDialogs}
        <div className="flex flex-col bg-[#F8FAFC] overflow-y-auto h-full p-4 items-center justify-center">
          <div className="text-gray-500">Loading docket details...</div>
        </div>
      </>
    );
  }

  const isUnassigned = docket.docketStatus === DOCKET_STATUS.UNASSIGNED;
  const isAssigned = docket.docketStatus === DOCKET_STATUS.ASSIGNED;
  const showActualLoadSize =
    docket.docketStatus === DOCKET_STATUS.IN_TRANSIT ||
    docket.docketStatus === DOCKET_STATUS.ARRIVED ||
    docket.docketStatus === DOCKET_STATUS.DELIVERED;
  const isDocketFinalised = docket.docketStatus === DOCKET_STATUS.INVOICED;

  const collectionDay = getCollectionDayForDisplay(docket);

  return (
    <>
      {viewDialog}
      {confirmDialogs}
    <div className="flex flex-col bg-[#F8FAFC] overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky">
        <div>
          <div className="text-sm text-gray-500 font-medium">
            {collectionDay
              ? format(collectionDay, 'EEEE, d MMMM yyyy')
              : 'Date TBD'}
          </div>
          <div className="text-base font-semibold text-gray-900 mt-1">
            {docket.job?.customerDto?.customerType === CUSTOMER_TYPE.BUSINESS
              ? docket.job?.customerDto?.businessName
              : docket.job?.contactPersonName || 'Unknown Customer'}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        {/* Docket Number & Badge */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => actions.view(fullDocket)}
            className="text-2xl font-bold underline cursor-pointer text-primary hover:opacity-80 transition-opacity"
          >
            {docket.docketNumber || 'No Number'}
          </button>
          <TableBadges
            names={[
              docket.docketStatus === 'READY_FOR_COLLECTION'
                ? 'READY'
                : docket.docketStatus,
            ]}
            visibleCount={1}
          />
        </div>

        {/* JOB DETAILS */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">
              Job Details
            </h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Job reference</div>
              <div className="text-sm font-medium text-gray-900">
                {docket.job?.jobNumber || ''}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Project name</div>
              <div className="text-sm font-medium text-gray-900">
                {docket.job?.projectName || ''}
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCT & LOAD */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">
              Product & Load
            </h3>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Product</div>
              <div className="text-sm font-medium text-gray-900">
                {docket.jobItem?.product?.productName || ''}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">
                Quarry / Supplier
              </div>
              <div className="text-sm font-medium text-gray-900">
                {docket.jobItem?.quarrySupplier?.name || ''}
              </div>
            </div>

            {docket.jobItem?.jobItemType === JOB_LINE_ITEM_TYPE.DELIVERY && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Truck type</div>
                <div className="text-sm font-medium text-gray-900">
                  {docket.truckType || ''}
                </div>
              </div>
            )}

            {!isDocketFinalised ||
              (docket.jobItem?.jobItemType === JOB_LINE_ITEM_TYPE.COLLECTION &&
                docket.docketStatus !== DOCKET_STATUS.COLLECTED) ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-gray-500 mb-1">
                    Planned Load Size
                  </div>
                  <div className="flex justify-between gap-2">
                    <Input
                      type="text"
                      key={`planned-${docket.id}`}
                      suffix={
                        docket.jobItem?.productSellUom === 'M3'
                          ? 'm³'
                          : docket.jobItem?.productSellUom === 'KG_20'
                            ? 'x 20kg'
                            : docket.jobItem?.productSellUom === 'BULKA'
                              ? 'Bulka'
                              : docket.jobItem?.productSellUom
                      }
                      value={plannedLoadSizeValue}
                      onChange={(e) => {
                        const inputVal = e.target.value;
                        const numVal = parseFloat(inputVal);
                        const maxVal =
                          (docket.plannedLoadSize || 0) +
                          (docket.jobItem?.remainingQuantity || 0);

                        if (!isNaN(numVal) && numVal > maxVal) {
                          setPlannedLoadSizeValue(maxVal.toString());
                        } else {
                          setPlannedLoadSizeValue(inputVal);
                        }
                      }}
                      disabled={!isDispatchView || isDocketFinalised || showActualLoadSize}
                      isNumber
                      allowDecimal
                      maxDecimals={2}
                      minDecimals={1}
                    />
                    {isDispatchView && !isDocketFinalised && !showActualLoadSize && (
                      <Button
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => handleSaveLoadSize('planned')}
                        disabled={operationalUpdateMutation.isPending}
                      >
                        Save
                      </Button>
                    )}
                  </div>
                </div>
                {showActualLoadSize && (
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-gray-500 mb-1">
                      Actual Load Size
                    </div>
                    <div className="flex justify-between gap-2">
                      <Input
                        type="text"
                        key={`actual-${docket.id}`}
                        suffix={
                          docket.jobItem?.productSellUom === 'M3'
                            ? 'm³'
                            : docket.jobItem?.productSellUom === 'KG_20'
                              ? 'x 20kg'
                              : docket.jobItem?.productSellUom === 'BULKA'
                                ? 'Bulka'
                                : docket.jobItem?.productSellUom
                        }
                        value={actualLoadSizeValue}
                        onChange={(e) => setActualLoadSizeValue(e.target.value)}
                        disabled={!isDispatchView || isDocketFinalised}
                        isNumber
                        allowDecimal
                        maxDecimals={2}
                        minDecimals={1}
                      />
                      {isDispatchView && !isDocketFinalised && (
                        <Button
                          variant="default"
                          className="cursor-pointer"
                          onClick={() => handleSaveLoadSize('actual')}
                          disabled={operationalUpdateMutation.isPending}
                        >
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500">Quantity</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatNumberThousandSeparator(docket.actualLoadSize)}{' '}
                  {docket.jobItem?.productSellUom === 'M3'
                    ? 'm³'
                    : docket.jobItem?.productSellUom === 'KG_20'
                      ? 'x 20kg'
                      : docket.jobItem?.productSellUom}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h3 className="text-xs font-bold text-[#475569] tracking-widest uppercase">
              Job Progress
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <div className="text-[13px] font-medium text-[#475569] mb-1">
                  Total ordered
                </div>
                <div className="text-md font-bold text-[#0F172A]">
                  {docket.jobItem.totalQuantityRequired?.toFixed(1) || '0.0'}{' '}
                  {docket.jobItem.productSellUom === 'M3'
                    ? 'm³'
                    : docket.jobItem?.productSellUom === 'KG_20'
                      ? 'x 20kg'
                      : docket.jobItem?.productSellUom === 'BULKA'
                        ? 'Bulka'
                        : docket.jobItem?.productSellUom === 'TN'
                          ? 'TN'
                          : docket.jobItem?.productSellUom}
                </div>
              </div>
              <div>
                <div className="text-[13px] font-medium text-[#475569] mb-1">
                  Remaining
                </div>
                <div className="text-md font-bold text-[#0F172A]">
                  {docket.jobItem.remainingQuantity?.toFixed(1) || '0.0'}{' '}
                  {docket.jobItem.productSellUom === 'M3'
                    ? 'm³'
                    : docket.jobItem?.productSellUom === 'KG_20'
                      ? 'x 20kg'
                      : docket.jobItem?.productSellUom === 'BULKA'
                        ? 'Bulka'
                        : docket.jobItem?.productSellUom === 'TN'
                          ? 'TN'
                          : docket.jobItem?.productSellUom}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-[13px] font-medium text-[#475569]">
                Delivered:{' '}
                {docket.jobItem.deliveredQuantity?.toFixed(1) || '0.0'}{' '}
                {docket.jobItem.productSellUom === 'TN'
                  ? 'TN'
                  : docket.jobItem.productSellUom === 'M3'
                    ? 'm³'
                    : docket.jobItem.productSellUom === 'KG_20'
                      ? 'x 20kg'
                      : docket.jobItem.productSellUom === 'BULKA'
                        ? 'Bulka'
                        : docket.jobItem.productSellUom}
              </span>
              <span className="text-[13px] font-bold text-[#0F172A]">
                {docket.jobItem.totalQuantityRequired > 0
                  ? Math.round(
                    (docket.jobItem.deliveredQuantity /
                      docket.jobItem.totalQuantityRequired) *
                    100,
                  )
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#6366F1] h-1.5 rounded-full"
                style={{
                  width: `${Math.min(
                    docket.jobItem.totalQuantityRequired > 0
                      ? (docket.jobItem.deliveredQuantity /
                        docket.jobItem.totalQuantityRequired) *
                      100
                      : 0,
                    100,
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* LOCATIONS */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">
              Locations
            </h3>
          </div>
          <div className="flex flex-col gap-5 p-4">
            <div className="flex flex-col gap-1 text-sm font-medium">
              <div className=" text-gray-500">Pickup</div>
              <div className=" text-gray-900">
                {dispatchAddressLabel(docket.pickUpAddress)}
              </div>
            </div>
            {(!docket.jobItem ||
              docket.jobItem.jobItemType === JOB_LINE_ITEM_TYPE.DELIVERY) && (
                <div className="flex flex-col gap-0 text-sm font-medium">
                  <div className=" text-gray-500">Delivery</div>
                  <div className=" text-gray-900">
                    {dispatchAddressLabel(docket.deliveryAddress)}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* SITE MAP */}
        {docket.jobItem?.jobItemType === JOB_LINE_ITEM_TYPE.DELIVERY && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                Site Map
              </h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Drop-off location
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${dispatchAddressMapsQuery(docket.deliveryAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Open <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="h-[140px] rounded-lg overflow-hidden border border-gray-200">
                <Map
                  markers={[
                    {
                      ...coordsFromDeliveryAddress(docket.deliveryAddress),
                      color: 'green',
                    },
                  ]}
                  defaultZoom={14}
                  disableDefaultUI={true}
                  className="h-full w-full [&_.gmnoprint]:scale-[0.8] [&_.gmnoprint]:origin-right"
                />
              </div>

              <div className="text-xs font-mono text-gray-500">
                {(() => {
                  const { lat, lng } = coordsFromDeliveryAddress(
                    docket.deliveryAddress,
                  );
                  const addr = docket.deliveryAddress;
                  if (addr == null || typeof addr === 'string') return '—';
                  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* SCHEDULE & CONTACT */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">
              Schedule & Contact
            </h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-x-0 gap-y-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">
                {docket.jobItem?.jobItemType === JOB_LINE_ITEM_TYPE.DELIVERY
                  ? 'Delivery date'
                  : 'Collection date'}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {collectionDay ? format(collectionDay, 'dd/MM/yyyy') : 'TBD'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">PO number</div>
              <div className="text-sm font-medium text-gray-900">
                {docket.job?.poNumber || ''}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Time window</div>
              <div className="text-sm font-medium text-gray-900">
                {formatTimeRange(
                  docket.deliveryCollectionStartTime,
                  docket.deliveryCollectionEndTime,
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Site contact</div>
              <div className="text-sm font-medium text-gray-900">
                {docket.jobItem?.quarrySupplier?.contactPersonName || ''}
              </div>
              <div className="text-xs text-blue-600 mt-0.5 break-all">
                {docket.jobItem?.quarrySupplier?.contactPersonEmail || ''}
              </div>
            </div>
          </div>
        </div>

        {/* ASSIGNMENT */}
        {docket.jobItem?.jobItemType === JOB_LINE_ITEM_TYPE.DELIVERY &&
          !isUnassigned && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                  Assignment
                </h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Driver</div>
                  <div className="text-sm font-medium text-gray-900">
                    {!isUnassigned
                      ? docket.driver?.driverName || 'Unassigned'
                      : 'Unassigned'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Truck (rego)</div>
                  <div className="text-sm font-medium text-gray-900">
                    {!isUnassigned
                      ? docket.truck?.licensePlate || 'Unassigned'
                      : 'Unassigned'}
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* COMPLIANCE */}
        {docket.jobItem?.jobItemType === JOB_LINE_ITEM_TYPE.DELIVERY &&
          !isUnassigned && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                  Compliance
                </h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                {/* Pre-start Column */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-600">
                    Pre-start
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      {docket.driverChecklist ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300" />
                      )}
                      Driver OK
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      {docket.driverChecklist ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300" />
                      )}
                      BAC
                    </div>
                  </div>
                </div>

                {/* Truck inspection Column */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-600">
                    Truck inspection
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      {docket.truckChecklist ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300" />
                      )}
                      Truck OK
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      {docket.truckChecklist ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300" />
                      )}
                      Trailer OK
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* NOTES */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 className="text-xs font-bold text-gray-500 mb-4 tracking-wider uppercase">
            Notes
          </h3>
          <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            {docket.notes || 'No notes'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border border-gray-200 bg-white sticky bottom-0 z-10 flex flex-col gap-3">
        {isDispatchView && isAssigned && (
          <button
            onClick={onUnassign}
            className="w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" /> Unassign from trip
          </button>
        )}
        <button
          onClick={() => actions.duplicate()}
          className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
        >
          Duplicate
        </button>
      </div>
    </div>
    </>
  );
}
