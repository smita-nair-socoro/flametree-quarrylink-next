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
import type {
  DispatchTruckResource,
  DispatchDriverResource,
  DispatchBoardTruckRef,
} from '@/lib/types/docket';
import { TableBadges } from '@/components/table-badges';
import { useState, useMemo, useEffect } from 'react';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { Input } from '@/components/ui/input';
import { useOperationalUpdateDocket } from '@/lib/api/docket';
import { toast } from 'sonner';

function calculateVolumeM3(
  loadSize: number,
  uom: string,
  density: number,
): number {
  if (!density) density = 1;
  const upperUom = uom.toUpperCase();
  if (upperUom === 'M3' || upperUom === 'BULKA') {
    return loadSize;
  }
  if (upperUom === 'TN') {
    return loadSize / density;
  }
  if (upperUom === 'KG_20' || upperUom === '20KG') {
    return loadSize / 50 / density;
  }
  return loadSize;
}

interface AssignTruckDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewType: 'trucks' | 'drivers';
  docket: DispatchDocket | null;
  truck: DispatchTruckResource | null;
  driver: DispatchDriverResource | null;
  onAssign: (id: number) => void;
  onCancel: () => void;
}

export function AssignTruckDriverModal({
  open,
  onOpenChange,
  viewType,
  docket,
  truck,
  driver,
  onAssign,
  onCancel,
}: AssignTruckDriverModalProps) {
  const [adjustingTruck, setAdjustingTruck] =
    useState<DispatchBoardTruckRef | null>(null);
  const [adjustLoadValue, setAdjustLoadValue] = useState<string>('');

  const operationalUpdateMutation = useOperationalUpdateDocket();

  useEffect(() => {
    if (adjustingTruck && docket) {
      const defaultLoad = Math.floor(
        (adjustingTruck.tankVolumeM3 || 0) * (docket.productDensity || 1)
      );
      setAdjustLoadValue(defaultLoad.toString());
    }
  }, [adjustingTruck, docket]);

  const handleAdjustLoadClick = () => {
    if (!docket || !adjustingTruck || !adjustLoadValue) return;

    operationalUpdateMutation.mutate(
      {
        id: docket.id,
        data: {
          actualLoadSize: Number(adjustLoadValue),
          plannedLoadSize: Number(adjustLoadValue),
          checkWindowTimeConflict: false,
        },
      },
      {
        onSuccess: () => {
          toast.success('Load size adjusted successfully');
          setAdjustingTruck(null);
        },
        onError: () => {
          toast.error('Failed to adjust load size');
        },
      }
    );
  };

  const trucksWithStats = useMemo(() => {
    if (!driver?.trucks || !docket) return [];

    const docketVol = calculateVolumeM3(
      docket.actualLoadSize || docket.plannedLoadSize || 0,
      docket.productSellUom || 'TN',
      docket.productDensity || 1,
    );

    return driver.trucks
      .map((t) => {
        const truckVol = t.tankVolumeM3 || 0;
        const fillPct = truckVol > 0 ? (docketVol / truckVol) * 100 : 0;
        const isOverVolume = docketVol > truckVol;
        return { ...t, truckVol, docketVol, fillPct, isOverVolume };
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
      setAdjustingTruck(null);
    }
    onOpenChange(isOpen);
  };

  const handleCancel = () => {
    setAdjustingTruck(null);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] p-0 gap-0 overflow-hidden">
        {adjustingTruck && docket ? (
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
                    {docket.productName} • {formatNumberThousandSeparator(docket.actualLoadSize || docket.plannedLoadSize)}{' '}
                    {docket.productSellUom}
                  </span>
                </div>
              </div>

              <div className="border-1 rounded-md p-3 bg-yellow-50 border-yellow-200">
                <div className="flex items-start gap-2 self-stretch">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-1 text-orange-800" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[16px] text-yellow-800 font-medium">
                      Load vs truck limits
                    </span>
                    <span className="text-[15px] text-yellow-800">
                      <span className="font-bold">
                        {formatNumberThousandSeparator(docket.actualLoadSize || docket.plannedLoadSize)}{' '}
                        {docket.productSellUom}
                      </span>{' '}
                      exceeds capacity. Truck {adjustingTruck.licensePlate}{' '}
                      allows up to{' '}
                      <span className="font-bold">
                        {adjustingTruck.tankVolumeM3} m³
                      </span>{' '}
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
                    {adjustingTruck.tankVolumeM3} m³
                  </span>
                </div>
              </div>

              <div className="border border-gray-200 bg-purple-50/50 rounded-xl p-4 flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
                  NEW LOAD ({docket.productSellUom})
                </label>
                <Input
                  type="number"
                  defaultValue={Math.floor(
                    (adjustingTruck.tankVolumeM3 || 0) *
                    (docket.productDensity || 1),
                  )}
                  onChange={(e) => setAdjustLoadValue(e.target.value)}
                  className="bg-white"
                />
                <span className="text-xs text-gray-500">
                  Enter up to{' '}
                  {Math.floor(
                    (adjustingTruck.tankVolumeM3 || 0) *
                    (docket.productDensity || 1),
                  )}{' '}
                  {docket.productSellUom} for this truck.
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
                onClick={() => setAdjustingTruck(null)}
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
                      {docket.docketNumber} → {truck.licensePlate}
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
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">Load</span>
                      <span className="font-bold text-gray-900">
                        {formatNumberThousandSeparator(docket.actualLoadSize || docket.plannedLoadSize)}{' '}
                        {docket.productSellUom === 'M3'
                          ? 'm³'
                          : docket.productSellUom === 'KG_20'
                            ? 'x 20kg'
                            : docket.productSellUom || 'TN'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">
                        Truck limits
                      </span>
                      <span className="font-bold text-gray-900">
                        6 m³ / 8 TN
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">
                        Trip fill
                      </span>
                      <span className="font-bold text-gray-900">75%</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="flex flex-col gap-3">
                    {truck.drivers?.map((d, index) => (
                      <div
                        key={d.id ?? d.driverName}
                        onClick={() => {
                          const docketVol = calculateVolumeM3(
                            docket.actualLoadSize || docket.plannedLoadSize || 0,
                            docket.productSellUom || 'TN',
                            docket.productDensity || 1,
                          );
                          const truckVol = truck.tankVolumeM3 || 0;
                          if (truckVol > 0 && docketVol > truckVol) {
                            setAdjustingTruck(truck as DispatchBoardTruckRef);
                          } else if (d.id != null) {
                            onAssign(d.id);
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
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-md">
                          AVAILABLE
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
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
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
                    <div className="flex flex-col items-end">
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
                            if (t.isOverVolume) {
                              setAdjustingTruck(t);
                            } else if (t.id != null) {
                              onAssign(t.id);
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
                                  This load: {Math.round(t.fillPct)}% of the
                                  tighter truck limit (body or payload)
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
                                Tap to adjust load
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
