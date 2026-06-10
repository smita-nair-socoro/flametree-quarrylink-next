'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClipboardList, Truck, AlertTriangle, Package } from 'lucide-react';
import type { DispatchDocket } from '@/lib/utils/dispatch-helper';
import {
  buildDispatchOperationalLoadUpdate,
  formatDispatchProductSellUomLabel,
  formatDispatchTruckFillPct,
  formatTruckMaxCapacityLabel,
  isGenericDispatchTruck,
  loadVolumeM3FromProductSellUom,
  maxLoadInProductSellUom,
} from '@/lib/utils/dispatch-helper';
import type {
  DispatchTruckResource,
  DispatchDriverResource,
  DispatchBoardTruckRef,
} from '@/lib/types/docket';
import { TableBadges } from '@/components/table-badges';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { Input } from '@/components/ui/input';
import { useOperationalUpdateDocket, DocketConflictCheckQueryOptions } from '@/lib/api/docket';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import type { ConflictingDocket } from '@/lib/types/docket';
import { TimeConflictModalContent } from '@/components/ui/schedular/time-conflict-modal';
import { Spinner } from '@/components/ui/spinner';
import {
  buildDispatchAssignmentWindows,
} from '@/lib/utils/dispatch-helper';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

type AssignStep = 'select' | 'checking' | 'conflict' | 'adjust';

interface AssignTruckDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewType: 'trucks' | 'drivers';
  docket: DispatchDocket | null;
  truck: DispatchTruckResource | null;
  driver: DispatchDriverResource | null;
  slotTime: string;
  assignmentDate: Date;
  onAssign: (id: number, adjustedLoadSize?: number) => void;
  onCancel: () => void;
}

export function AssignTruckDriverModal({
  open,
  onOpenChange,
  viewType,
  docket,
  truck,
  driver,
  slotTime,
  assignmentDate,
  onAssign,
  onCancel,
}: AssignTruckDriverModalProps) {
  const [step, setStep] = useState<AssignStep>('select');
  const [adjustingTruck, setAdjustingTruck] =
    useState<DispatchBoardTruckRef | null>(null);
  const [adjustLoadValue, setAdjustLoadValue] = useState<string>('');
  const [pendingAssignId, setPendingAssignId] = useState<number | null>(null);
  const [pendingTruckId, setPendingTruckId] = useState<number | null>(null);
  const [pendingDriverId, setPendingDriverId] = useState<number | null>(null);
  const [conflicts, setConflicts] = useState<ConflictingDocket[]>([]);
  const conflictHandledRef = useRef(false);

  const isDesktop = useMediaQuery('(min-width: 777px)');

  const operationalUpdateMutation = useOperationalUpdateDocket();

  const resetFlow = useCallback(() => {
    setStep('select');
    setAdjustingTruck(null);
    setAdjustLoadValue('');
    setPendingAssignId(null);
    setPendingTruckId(null);
    setPendingDriverId(null);
    setConflicts([]);
    conflictHandledRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      resetFlow();
    }
  }, [open, resetFlow]);

  const conflictRequest = useMemo(() => {
    if (
      step !== 'checking' ||
      !docket?.id ||
      pendingTruckId == null ||
      pendingDriverId == null ||
      !slotTime
    ) {
      return null;
    }
    return {
      truckId: pendingTruckId,
      driverId: pendingDriverId,
      ...buildDispatchAssignmentWindows(
        assignmentDate,
        slotTime,
        docket.uiAssignedDuration || 2,
      ),
    };
  }, [
    step,
    docket?.id,
    docket?.uiAssignedDuration,
    pendingTruckId,
    pendingDriverId,
    slotTime,
    assignmentDate,
  ]);

  const {
    data: conflictData,
    isFetching: isConflictFetching,
    isError: isConflictError,
  } = useQuery(DocketConflictCheckQueryOptions(docket?.id, conflictRequest));

  const getPendingTruckRef = useCallback((): DispatchBoardTruckRef | null => {
    if (viewType === 'trucks' && truck) {
      return truck as DispatchBoardTruckRef;
    }
    if (viewType === 'drivers' && driver && pendingTruckId != null) {
      return driver.trucks?.find((t) => t.id === pendingTruckId) ?? null;
    }
    return null;
  }, [viewType, truck, driver, pendingTruckId]);

  const needsVolumeAdjust = useCallback(
    (truckRef: DispatchBoardTruckRef | null) => {
      if (!docket || !truckRef || isGenericDispatchTruck(truckRef)) return false;
      const docketVol = loadVolumeM3FromProductSellUom(
        docket.actualLoadSize || docket.plannedLoadSize || 0,
        docket.productSellUom || 'TN',
        docket.productDensity || 1,
      );
      const truckVol = truckRef.tankVolumeM3 || 0;
      return truckVol > 0 && docketVol > truckVol;
    },
    [docket],
  );

  const proceedAfterConflictCheck = useCallback(() => {
    const truckRef = getPendingTruckRef();
    if (needsVolumeAdjust(truckRef) && pendingAssignId != null) {
      setAdjustingTruck(truckRef);
      setStep('adjust');
      return;
    }
    if (pendingAssignId != null) {
      onAssign(pendingAssignId);
    }
  }, [getPendingTruckRef, needsVolumeAdjust, pendingAssignId, onAssign]);

  useEffect(() => {
    if (step !== 'checking' || !conflictRequest || isConflictFetching) return;
    if (conflictHandledRef.current) return;

    if (isConflictError) {
      conflictHandledRef.current = true;
      toast.error('Failed to check scheduling conflicts');
      resetFlow();
      return;
    }

    if (!conflictData) return;

    conflictHandledRef.current = true;
    const activeConflicts = (
      conflictData.hasConflicts ? conflictData.conflictingDocketIds : []
    ).filter((c) => c.docketStatus !== DOCKET_STATUS.DELIVERED);

    if (activeConflicts.length > 0) {
      setConflicts(activeConflicts);
      setStep('conflict');
    } else {
      proceedAfterConflictCheck();
    }
  }, [
    step,
    conflictRequest,
    isConflictFetching,
    isConflictError,
    conflictData,
    proceedAfterConflictCheck,
    resetFlow,
  ]);

  const handleResourceSelect = (assignId: number) => {
    if (!docket) return;
    const truckId = viewType === 'trucks' ? truck!.id : assignId;
    const driverId = viewType === 'trucks' ? assignId : driver!.id;
    conflictHandledRef.current = false;
    setPendingAssignId(assignId);
    setPendingTruckId(truckId);
    setPendingDriverId(driverId);
    setStep('checking');
  };

  const conflictResourceName = useMemo(() => {
    if (viewType === 'trucks' && truck && pendingDriverId != null) {
      return (
        truck.drivers?.find((d) => d.id === pendingDriverId)?.driverName ?? ''
      );
    }
    if (viewType === 'drivers' && driver && pendingTruckId != null) {
      return (
        driver.trucks?.find((t) => t.id === pendingTruckId)?.licensePlate ?? ''
      );
    }
    return '';
  }, [viewType, truck, driver, pendingDriverId, pendingTruckId]);

  const maxAdjustLoad = useMemo(() => {
    if (!adjustingTruck || !docket) return 0;
    return maxLoadInProductSellUom(
      adjustingTruck.tankVolumeM3 || 0,
      docket.productSellUom || 'TN',
      docket.productDensity || 1,
    );
  }, [adjustingTruck, docket]);

  const productUomLabel = formatDispatchProductSellUomLabel(
    docket?.productSellUom,
  );

  const truckMaxCapacityLabel = useMemo(() => {
    if (!adjustingTruck || !docket) return '';
    return formatTruckMaxCapacityLabel(
      adjustingTruck.tankVolumeM3 || 0,
      docket.productSellUom || 'TN',
      docket.productDensity || 1,
      formatNumberThousandSeparator,
    );
  }, [adjustingTruck, docket]);

  useEffect(() => {
    if (adjustingTruck && docket) {
      setAdjustLoadValue(maxAdjustLoad.toString());
    }
  }, [adjustingTruck, docket, maxAdjustLoad]);

  const handleAdjustLoadClick = () => {
    if (!docket || !adjustingTruck || !adjustLoadValue || pendingAssignId == null)
      return;

    const loadSize = Number(adjustLoadValue);
    if (!Number.isFinite(loadSize) || loadSize <= 0) {
      toast.error('Enter a valid load amount');
      return;
    }
    if (loadSize > maxAdjustLoad) {
      toast.error(
        `Load cannot exceed ${formatNumberThousandSeparator(maxAdjustLoad)} ${productUomLabel}`,
      );
      return;
    }

    operationalUpdateMutation.mutate(
      {
        id: docket.id,
        data: buildDispatchOperationalLoadUpdate(docket, loadSize),
      },
      {
        onSuccess: () => {
          toast.success('Load size adjusted successfully');
          const assignId = pendingAssignId;
          setPendingAssignId(null);
          setAdjustingTruck(null);
          onAssign(assignId, loadSize);
        },
        onError: () => {
          toast.error('Failed to adjust load size');
        },
      },
    );
  };

  const handleBackToSelect = () => {
    resetFlow();
  };

  const trucksWithStats = useMemo(() => {
    if (!driver?.trucks || !docket) return [];
    const docketVol = loadVolumeM3FromProductSellUom(
      docket.actualLoadSize || docket.plannedLoadSize || 0,
      docket.productSellUom || 'TN',
      docket.productDensity || 1,
    );

    return driver.trucks
      .map((t) => {
        const isGeneric = isGenericDispatchTruck(t);
        const truckVol = t.tankVolumeM3 || 0;
        const fillPct = truckVol > 0 ? (docketVol / truckVol) * 100 : 0;
        const isOverVolume =
          !isGeneric && truckVol > 0 && docketVol > truckVol;
        return { ...t, truckVol, docketVol, fillPct, isOverVolume, isGeneric };
      })
      .sort((a, b) => {
        if (a.isOverVolume && !b.isOverVolume) return 1;
        if (!a.isOverVolume && b.isOverVolume) return -1;
        if (!a.isOverVolume && !b.isOverVolume) {
          return b.fillPct - a.fillPct; // highest fill first
        }
        return a.fillPct - b.fillPct; // over volume: lowest fill first
      });
  }, [driver?.trucks, docket]);

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetFlow();
      window.requestAnimationFrame(() => {
        if (document.body.style.pointerEvents === 'none') {
          document.body.style.pointerEvents = '';
        }
      });
    }
    onOpenChange(isOpen);
  };

  const handleCancel = () => {
    resetFlow();
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] p-0 gap-0 overflow-hidden">
        {step === 'checking' ? (
          <>
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Checking assignment
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-6">
              <Spinner size="small" />
              <span className="text-sm text-gray-500">
                Checking for scheduling conflicts...
              </span>
            </div>
          </>
        ) : step === 'conflict' && docket ? (
          <TimeConflictModalContent
            viewType={viewType}
            resourceName={conflictResourceName}
            conflicts={conflicts}
            onConfirm={proceedAfterConflictCheck}
            onCancel={handleBackToSelect}
          />
        ) : step === 'adjust' && adjustingTruck && docket ? (
          <>
            <DialogHeader className="px-6">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Adjust load to use this truck
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar max-h-[75vh]">
              <p className="text-sm text-gray-500">
                This load does not fit the truck's body volume and/or payload limit. Enter a lower amount in the same unit as the docket to continue.
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-yellow-700" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">
                    {docket.docketNumber}
                  </span>
                  <span className="text-sm text-gray-500">
                    {docket.productName} •{' '}
                    {formatNumberThousandSeparator(
                      docket.actualLoadSize || docket.plannedLoadSize,
                    )}{' '}
                    {productUomLabel}
                  </span>
                </div>
              </div>

              <div className="border-1 rounded-md p-3 bg-yellow-50 border-yellow-200">
                <div className="flex items-start gap-2 self-stretch">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-orange-800" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[16px] text-yellow-800 font-medium">
                      Load vs truck limits
                    </span>
                    <span className="text-[15px] text-yellow-800">
                      <span className="font-bold">
                        {formatNumberThousandSeparator(
                          docket.actualLoadSize || docket.plannedLoadSize,
                        )}{' '}
                        {productUomLabel}
                      </span>{' '}
                      exceeds capacity. Truck {adjustingTruck.licensePlate}{' '}
                      allows up to{' '}
                      <span className="font-bold">{truckMaxCapacityLabel}</span>{' '}
                      per trip. After you adjust the load, the assignment will
                      use this truck and your chosen driver.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-1">
                  <Truck className="w-4 h-4" />
                  Target truck
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Registration</span>
                  <span className="font-bold text-gray-900">
                    {adjustingTruck.licensePlate}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Max Capacity</span>
                  <span className="font-bold text-gray-900">
                    {truckMaxCapacityLabel}
                  </span>
                </div>
              </div>

              <div className="border border-gray-200 bg-purple-50/50 rounded-xl p-4 flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-500 tracking-wider">
                  NEW LOAD{' '}({productUomLabel})
                </label>
                <Input
                  type="number"
                  value={adjustLoadValue}
                  onChange={(e) => setAdjustLoadValue(e.target.value)}
                  className="bg-white"
                />
                <span className="text-xs text-gray-500">
                  Enter up to {formatNumberThousandSeparator(maxAdjustLoad)}{' '}
                  {productUomLabel} for this truck.
                </span>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <span className="font-bold text-gray-900 text-sm">
                  When you continue:
                </span>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>
                    The docket load amount and display label are updated to the
                    value you enter (unit unchanged)
                  </li>
                  <li>
                    Your assignment continues (driver selection or drop target)
                    using the adjusted load
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-5 bg-white border-t border-gray-100 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleBackToSelect}
                className="px-6 rounded-lg font-medium"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="px-6 rounded-lg font-medium bg-blue-600 hover:bg-blue-700"
                onClick={handleAdjustLoadClick}
                disabled={!adjustLoadValue || operationalUpdateMutation.isPending}
              >
                {operationalUpdateMutation.isPending ? 'Adjusting...' : 'Adjust load and continue'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="text-xl font-bold text-gray-900">
                {viewType === 'trucks' ? 'Select Driver' : 'Select truck'}
              </DialogTitle>
              {docket && (
                <p className="text-gray-500 text-sm mt-1">
                  {viewType === 'trucks' && truck ? (
                    <>
                      Choose which driver to use for{' '}
                      <span className="font-semibold text-gray-900">
                        {truck.licensePlate}
                      </span>{' '}
                      on this trip.
                    </>
                  ) : viewType === 'drivers' && driver ? (
                    <>
                      Choose which vehicle to use for{' '}
                      <span className="font-semibold text-gray-900">
                        {driver.driverName}
                      </span>{' '}
                      on this trip.
                    </>
                  ) : null}
                </p>
              )}
            </DialogHeader>

            {docket && viewType === 'trucks' && truck && (
              <div className="flex flex-col">
                <div className="px-6 pb-6">
                  <div className={cn("bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between", isDesktop ? 'flex-row' : 'flex-col gap-4')}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-[15px]">
                          {docket.docketNumber}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {docket.customerName || 'Unknown Customer'}
                        </span>
                      </div>
                    </div>
                    <div className={cn("flex flex-col items-end", isDesktop ? 'items-end' : 'items-center')}>
                      <span className="text-[10px] font-bold text-gray-500 tracking-wider">
                        LOAD
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-xl text-gray-900">
                          {formatNumberThousandSeparator(docket.actualLoadSize || docket.plannedLoadSize)}{' '}
                        </span>
                        <span className="font-bold text-gray-900">
                          {docket.productSellUom === 'M3'
                            ? 'm³'
                            : docket.productSellUom === 'KG_20'
                              ? 'x 20kg'
                              : docket.productSellUom === 'BULKA'
                                ? 'Bulka'
                                : docket.productSellUom || 'TN'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="flex flex-col gap-3">
                    {truck.drivers?.map((d, index) => (
                      <div
                        key={d.id ?? d.driverName}
                        onClick={() => {
                          if (d.id != null) {
                            handleResourceSelect(d.id);
                          }
                        }}
                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${index === 0
                          ? 'border-purple-400 bg-white'
                          : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                      >
                        <span className="font-bold text-gray-900 text-[15px]">
                          {d.driverName}
                        </span>
                      </div>
                    ))}
                    {(!truck.drivers || truck.drivers.length === 0) && (
                      <div className="text-center text-gray-500 text-sm py-8 border border-dashed rounded-xl">
                        No drivers found for this truck.
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="px-6 rounded-lg font-medium"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {docket && viewType === 'drivers' && driver && (
              <div className="flex flex-col">
                <div className="px-6 pb-6">
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between max-md:flex-row flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-[15px]">
                          {docket.docketNumber}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {docket.customerName || 'Unknown Customer'}
                        </span>
                      </div>
                    </div>
                    <div className={cn("flex flex-col", isDesktop ? 'items-end' : 'items-center')}>
                      <span className="text-[10px] font-bold text-gray-500 tracking-wider">
                        LOAD
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-xl text-gray-900">
                          {formatNumberThousandSeparator(docket.actualLoadSize || docket.plannedLoadSize)}{' '}
                        </span>
                        <span className="font-bold text-gray-900">
                          {docket.productSellUom === 'M3'
                            ? 'm³'
                            : docket.productSellUom === 'KG_20'
                              ? 'x 20kg'
                              : docket.productSellUom === 'BULKA'
                                ? 'Bulka'
                                : docket.productSellUom || 'TN'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 bg-white">
                  <div className="px-6 py-4">
                    <div className="flex flex-col gap-1 mb-4">
                      <span className="text-[11px] font-bold text-gray-500 tracking-wider">
                        FLEET
                      </span>
                      <span className="text-xs text-gray-500">
                        Highest body fill first (best trip efficiency).
                        Over-volume trucks are listed last.
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                      {trucksWithStats.map((t, index) => (
                        <div
                          key={t.id ?? t.licensePlate}
                          onClick={() => {
                            if (t.id != null) {
                              handleResourceSelect(t.id);
                            }
                          }}
                          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${t.isOverVolume
                            ? 'border-yellow-200 bg-yellow-50/30 hover:bg-yellow-50/50'
                            : index === 0
                              ? 'border-green-400 bg-green-50/30 hover:bg-green-50/50'
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${t.isOverVolume
                                ? 'bg-yellow-100 border-yellow-200'
                                : 'bg-gray-50 border-gray-100'
                                }`}
                            >
                              <Truck
                                className={`w-5 h-5 ${t.isOverVolume ? 'text-yellow-700' : 'text-gray-600'}`}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-[15px]">
                                  {t.licensePlate}
                                </span>
                                <TableBadges
                                  names={[t.businessType || 'INTERNAL']}
                                />
                                {!t.isOverVolume && index === 0 && (
                                  <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded">
                                    BEST FIT
                                  </span>
                                )}
                              </div>
                              <span className="text-[13px] text-gray-600">
                                Capacity: {t.tankVolumeM3} m³
                              </span>
                              {t.isOverVolume ? (
                                <span className="text-xs font-medium text-red-700 mt-0.5">
                                  Does not fit — {formatNumberThousandSeparator(docket.actualLoadSize || docket.plannedLoadSize)}{' '}
                                  {docket.productSellUom} exceeds capacity
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-green-700 mt-0.5">
                                  This load utilises {formatDispatchTruckFillPct(t.fillPct)}% of the
                                  truck's capacity
                                </span>
                              )}
                            </div>
                          </div>
                          {t.isOverVolume ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded uppercase">
                                OVER VOLUME
                              </span>
                              <span className="text-xs text-yellow-800 font-medium">
                                Tap to select
                              </span>
                            </div>
                          ) : (
                            <span className="text-purple-600 text-sm font-medium">
                              Select
                            </span>
                          )}
                        </div>
                      ))}
                      {(!driver.trucks || driver.trucks.length === 0) && (
                        <div className="text-center text-gray-500 text-sm py-8 border border-dashed rounded-xl">
                          No trucks found for this driver.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="px-6 rounded-lg font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
