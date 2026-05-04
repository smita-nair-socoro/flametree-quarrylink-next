'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClipboardList, Truck } from 'lucide-react';
import type { DispatchDocket } from '@/app/(protected)/logistics/dispatch/views/dispatch-view';
import type { DispatchTruckResource, DispatchDriverResource } from '@/lib/types/docket';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {viewType === 'trucks' ? 'Select driver' : 'Select truck'}
          </DialogTitle>
          {docket && (
            <p className="text-gray-500 text-sm mt-1">
              {viewType === 'trucks' && truck ? (
                <>Choose which driver to use for <span className="font-semibold text-gray-900">{truck.licensePlate}</span> on this trip.</>
              ) : viewType === 'drivers' && driver ? (
                <>Choose which vehicle to use for <span className="font-semibold text-gray-900">{driver.driverName}</span> on this trip.</>
              ) : null}
            </p>
          )}
        </DialogHeader>

        {docket && (truck || driver) && (
          <div className="flex flex-col">
            <div className="px-6 pb-6">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-[15px]">{docket.docketNumber}</span>
                    <span className="text-gray-500 text-sm">{docket.customerName || 'Unknown Customer'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-500 tracking-wider">LOAD</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-xl text-gray-900">{docket.loadSize}</span>
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
                    {viewType === 'trucks' ? 'DRIVERS' : 'FLEET'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {viewType === 'trucks' 
                      ? 'Available drivers for this truck.' 
                      : 'Highest body fill first (best trip efficiency). Over-volume trucks are listed last.'}
                  </span>
                </div>

                <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                  {viewType === 'trucks' && truck?.drivers?.map((d, index) => (
                    <div
                      key={d.id ?? d.driverName}
                      onClick={() => {
                        if (d.id != null) onAssign(d.id);
                      }}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                        index === 0 
                          ? 'border-green-400 bg-green-50/30 hover:bg-green-50/50' 
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                          <Truck className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-[15px]">{d.driverName}</span>
                            {index === 0 && (
                              <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded">
                                BEST FIT
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            Available for dispatch
                          </span>
                        </div>
                      </div>
                      <span className="text-purple-600 text-sm font-medium">Select</span>
                    </div>
                  ))}
                  {viewType === 'trucks' && (!truck?.drivers || truck.drivers.length === 0) && (
                    <div className="text-center text-gray-500 text-sm py-8 border border-dashed rounded-xl">
                      No drivers found for this truck.
                    </div>
                  )}

                  {viewType === 'drivers' && driver?.trucks?.map((t, index) => (
                    <div
                      key={t.id ?? t.licensePlate}
                      onClick={() => {
                        if (t.id != null) onAssign(t.id);
                      }}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                        index === 0 
                          ? 'border-green-400 bg-green-50/30 hover:bg-green-50/50' 
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                          <Truck className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-[15px]">{t.licensePlate}</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                              INTERNAL
                            </span>
                            {index === 0 && (
                              <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded">
                                BEST FIT
                              </span>
                            )}
                          </div>
                          <span className="text-[13px] text-gray-600">
                            10 m³ • 15 TN • Rapid Logistics
                          </span>
                          <span className="text-xs font-medium text-green-700 mt-0.5">
                            This load: {index === 0 ? '80%' : '43%'} of the tighter truck limit (body or payload)
                          </span>
                        </div>
                      </div>
                      <span className="text-purple-600 text-sm font-medium">Select</span>
                    </div>
                  ))}
                  {viewType === 'drivers' && (!driver?.trucks || driver.trucks.length === 0) && (
                    <div className="text-center text-gray-500 text-sm py-8 border border-dashed rounded-xl">
                      No trucks found for this driver.
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
