'use client';

import * as React from 'react';

import { DocketDTO } from '@/lib/types/docket';
import { CustomerDTO } from '@/lib/types/customer';
import { CUSTOMER_TYPE } from '@/lib/types/customer-enums';
import { CHECKLIST_STATUS } from '@/lib/types/checklist-enums';
import { formatTruckType } from '@/lib/types/truck-enums';
import { format } from 'date-fns';
import {
  MapPin,
  Package,
  Truck,
  Clock,
  Info,
  X,
  Pencil,
  CheckCircle,
  Pause,
  Delete,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { TableBadges } from '@/components/table-badges';
import { Separator } from '@/components/ui/separator';
import { useDocketActions } from '@/hooks/use-docket-actions';
import { useDriverAppOperationalUpdate } from '@/lib/api/driver-app';
import { Map } from '@/components/ui/map';
import type { MapMarker } from '@/components/ui/map';
import { resolveAddressCoords } from '@/components/ui/address-autocomplete/Geodata-match';

const getCustomerName = (customerDto?: CustomerDTO): string => {
  if (!customerDto) return 'Unknown Customer';
  if (customerDto.customerType === CUSTOMER_TYPE.BUSINESS) {
    return customerDto.businessName || 'Unknown Customer';
  }
  return customerDto.individualContactName || 'Unknown Customer';
};

interface DocketsTabProps {
  dockets: DocketDTO[];
  onOpenChecklist?: (
    type: 'pre-start' | 'vehicle-inspection',
    truckLicensePlate?: string,
    docketId?: number,
    truckId?: number,
  ) => void;
}

type ActionType =
  | 'view'
  | 'cancel'
  | 'markArrived'
  | 'markDelivered'
  | 'markReady'
  | 'markCollected'
  | 'stop'
  | 'void'
  | 'remove'
  | 'duplicate'
  | 'startTransit'
  | 'resumeTransit'
  | 'unassign'
  | 'startPreparing'
  | 'cashSale'
  | 'invoice'
  | 'cashReceipts'
  | 'viewInvoice'
  | 'assign'
  | 'backToPending'
  | 'backToPreparing';

export default function DocketsTab({
  dockets,
  onOpenChecklist,
}: DocketsTabProps) {
  const [selectedDocket, setSelectedDocket] = React.useState<DocketDTO | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = React.useState(false);
  const [updateValue, setUpdateValue] = React.useState('');

  const { actions, confirmDialogs, isDialogOpen } =
    useDocketActions(selectedDocket);
  const operationalUpdate = useDriverAppOperationalUpdate();

  const handleAction = (actionType: ActionType) => {
    actions[actionType]();
  };

  const [resolvedPickup, setResolvedPickup] = React.useState<{ lat: number; lng: number } | null>(null);
  const [resolvedDelivery, setResolvedDelivery] = React.useState<{ lat: number; lng: number } | null>(null);

  React.useEffect(() => {
    setResolvedPickup(null);
    setResolvedDelivery(null);
    if (!selectedDocket) return;

    const pickup = selectedDocket.pickUpAddress;
    if (pickup?.latitude && pickup?.longitude) {
      setResolvedPickup({ lat: pickup.latitude, lng: pickup.longitude });
    } else if (pickup) {
      resolveAddressCoords(pickup).then(setResolvedPickup);
    }

    const delivery = selectedDocket.deliveryAddress;
    if (delivery?.latitude && delivery?.longitude) {
      setResolvedDelivery({ lat: delivery.latitude, lng: delivery.longitude });
    } else if (delivery) {
      resolveAddressCoords(delivery).then(setResolvedDelivery);
    }
  }, [selectedDocket?.id]);

  const checklistsComplete =
    selectedDocket?.driverChecklist?.checklistStatus ===
      CHECKLIST_STATUS.PASS &&
    selectedDocket?.truckChecklist?.checklistStatus === CHECKLIST_STATUS.PASS;

  const activeDocket = dockets.find((d) => d.docketStatus === 'IN_TRANSIT');
  const otherDockets = dockets.filter((d) => d.docketStatus !== 'IN_TRANSIT');

  const formatTimeWindow = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return `${format(startDate, 'EEE, d MMM')} · ${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`;
    } catch {
      return 'Invalid Date';
    }
  };

  const openDocketDetails = (docket: DocketDTO) => {
    setSelectedDocket(docket);
    setIsDrawerOpen(true);
  };

  const renderDocketCard = (docket: DocketDTO, isActive: boolean = false) => {
    return (
      <div
        key={docket.id}
        className={cn(
          'bg-white rounded-xl cursor-pointer transition-all active:scale-[0.98]',
          isActive
            ? 'border-2 border-[#8E51FF] shadow-sm'
            : 'border border-gray-200 shadow-sm',
        )}
        onClick={() => openDocketDetails(docket)}
      >
        {isActive && (
          <div className="bg-[#F3E8FF] text-[#8E51FF] text-[10px] font-bold px-3 py-1.5 rounded-tl-lg rounded-br-xl inline-flex items-center gap-1.5 tracking-wider uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8E51FF] font-bold" />
            <span className="font-extrabold">ACTIVE DELIVERY</span>
          </div>
        )}

        <div className={cn('p-4', isActive ? 'pt-3' : '')}>
          <div className="flex justify-between items-start mb-1">
            <span className="text-[13px] font-bold text-gray-900">
              {docket.docketNumber}
            </span>
            <div className="flex items-center gap-2">
              <TableBadges names={[docket.docketStatus]} />
            </div>
          </div>

          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-[18px] font-bold text-[#0F172A] leading-tight mb-0.5">
                {getCustomerName(docket.job?.customerDto)}
              </h3>
              <p className="text-[14px] text-gray-500">
                {docket.jobItem?.product?.productName}
              </p>
            </div>
            <span className="text-[14px] font-medium text-gray-400 mt-1">
              {docket.loadSize}
              {docket.jobItem?.productSellUom === 'TN'
                ? 'T'
                : docket.jobItem?.productSellUom === 'M3'
                  ? 'm³'
                  : ''}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 mb-4">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span className="text-[14px] text-[#45556C] leading-snug">
                {docket.deliveryAddress?.formattedAddress}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-[14px] text-[#45556C]">
                {docket.jobItem?.product?.productName}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-[14px] text-[#45556C]">
                {docket.truck?.licensePlate ||
                  formatTruckType(docket.truckType)}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-[14px] text-[#45556C]">
                {formatTimeWindow(
                  docket.deliveryCollectionStartTime,
                  docket.deliveryCollectionEndTime,
                )}
              </span>
            </div>
          </div>

          {docket.notes && (
            <div className="bg-[#F8FAFC] rounded-lg p-3 flex items-start gap-2 border border-gray-100">
              <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span className="text-[13px] text-gray-500 italic">
                {docket.notes}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {activeDocket && renderDocketCard(activeDocket, true)}
      {otherDockets.map((docket) => renderDocketCard(docket, false))}

      {confirmDialogs}

      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          if (!open && isDialogOpen) return;
          setIsDrawerOpen(open);
        }}
      >
        <DrawerContent className="bg-[#F8FAFC] flex flex-col rounded-t-2xl max-h-[90vh]">
          {selectedDocket && (
            <>
              <DrawerHeader className="border-b border-gray-100 pb-4 pt-6 px-6 shrink-0 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="text-[22px] font-bold text-[#0F172A]">
                    {selectedDocket.docketNumber}
                  </DrawerTitle>
                  <div className="flex items-center gap-3">
                    <TableBadges names={[selectedDocket.docketStatus]} />
                    <DrawerClose asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </DrawerClose>
                  </div>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Customer Information */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-[14px] font-bold text-gray-900 mb-4">
                    Customer Information
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2">
                      <span className="text-[13px] text-gray-400">
                        Customer
                      </span>
                      <span className="text-[14px] font-medium text-gray-900">
                        {getCustomerName(selectedDocket.job?.customerDto)}
                      </span>
                    </div>
                    <Separator className="bg-gray-100 -my-1" />
                    <div className="grid grid-cols-2">
                      <span className="text-[13px] text-gray-400">Contact</span>
                      <span className="text-[14px] font-medium text-gray-900">
                        {selectedDocket.customerContactName ||
                          selectedDocket.job?.contactPersonName}
                      </span>
                    </div>
                    <Separator className="bg-gray-100 -my-1" />

                    <div className="grid grid-cols-2">
                      <span className="text-[13px] text-gray-400">Phone</span>
                      <span className="text-[14px] font-medium text-gray-900">
                        {selectedDocket.customerContactPhone ||
                          selectedDocket.job?.contactPersonPhone}
                      </span>
                    </div>
                    <Separator className="bg-gray-100 -my-1" />

                    <div className="grid grid-cols-2">
                      <span className="text-[13px] text-gray-400">
                        Account Manager
                      </span>
                      <span className="text-[14px] font-medium text-gray-900">
                        {selectedDocket.job?.customerDto?.accountManagerName ||
                          '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-[14px] font-bold text-gray-900 mb-4">
                    Delivery Information
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 items-center -my-2">
                      <span className="text-[13px] text-gray-400">
                        Load Size
                      </span>
                      <div className="grid grid-cols-2 items-center">
                        <span className="text-[14px] font-bold text-gray-900">
                          {selectedDocket.docketStatus === 'ASSIGNED'
                            ? selectedDocket.plannedLoadSize
                            : selectedDocket.actualLoadSize ||
                              selectedDocket.plannedLoadSize}
                          {selectedDocket.jobItem?.productSellUom === 'TN'
                            ? 'T'
                            : selectedDocket.jobItem?.productSellUom === 'M3'
                              ? 'm³'
                              : selectedDocket.jobItem?.productSellUom}
                        </span>
                        <Button
                          variant="ghost"
                          className="text-[#8E51FF] hover:bg-transparent underline text-[13px] font-medium gap-1"
                          onClick={() => {
                            const displayLoad =
                              selectedDocket.docketStatus === 'ASSIGNED'
                                ? selectedDocket.plannedLoadSize
                                : selectedDocket.actualLoadSize ||
                                  selectedDocket.plannedLoadSize;
                            setUpdateValue(displayLoad?.toString() || '');
                            setIsUpdateDrawerOpen(true);
                          }}
                        >
                          <Pencil className="h-2 w-2" size="xs" /> Update
                        </Button>
                      </div>
                    </div>
                    <Separator className="bg-gray-100 -my-1" />

                    <div className="grid grid-cols-2">
                      <span className="text-[13px] text-gray-400">Product</span>
                      <span className="text-[14px] font-medium text-gray-900">
                        {selectedDocket.jobItem?.product?.productName ?? '--'}
                      </span>
                    </div>
                    <Separator className="bg-gray-100 -my-1" />

                    <div className="grid grid-cols-2">
                      <span className="text-[13px] text-gray-400">
                        Assigned Truck
                      </span>
                      <span className="text-[14px] font-medium text-gray-900">
                        {selectedDocket.truck?.licensePlate ??
                          selectedDocket.truckType}
                      </span>
                    </div>
                    <Separator className="bg-gray-100 -my-1" />

                    <div className="grid grid-cols-2">
                      <span className="text-[13px] text-gray-400">
                        Time Window
                      </span>
                      <span className="text-[14px] font-medium text-gray-900">
                        {formatTimeWindow(
                          selectedDocket.deliveryCollectionStartTime,
                          selectedDocket.deliveryCollectionEndTime,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-[14px] font-bold text-gray-900 mb-3">
                    Addresses
                  </h3>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] text-gray-400 mb-1">
                        Collection
                      </span>
                      <span className="text-[14px] font-bold text-gray-900">
                        {selectedDocket.jobItem?.product?.productName ?? '--'}
                      </span>
                      <span className="text-[13px] text-gray-500 leading-snug">
                        {selectedDocket.pickUpAddress?.formattedAddress}
                      </span>
                    </div>
                    <Separator className="bg-gray-100" />

                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] text-gray-400 mb-1">
                        Delivery
                      </span>
                      <span className="text-[14px] font-bold text-gray-900">
                        {selectedDocket.job?.projectName}
                      </span>
                      <span className="text-[13px] text-gray-500 leading-snug">
                        {selectedDocket.deliveryAddress?.formattedAddress}
                      </span>
                    </div>

                    {(() => {
                      const markers: MapMarker[] = [];
                      if (resolvedPickup) markers.push({ ...resolvedPickup, color: 'red' });
                      if (resolvedDelivery) markers.push({ ...resolvedDelivery, color: 'green' });
                      return markers.length > 0 ? (
                        <Map markers={markers} className="h-[280px] w-full rounded-xl overflow-hidden" disableDefaultUI />
                      ) : null;
                    })()}
                  </div>
                </div>

                {/* Notes */}
                {selectedDocket.notes && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-[14px] font-bold text-gray-900 mb-2">
                      Notes
                    </h3>
                    <span className="text-[14px] text-gray-500 italic block">
                      {selectedDocket.notes}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pb-2">
                {selectedDocket.driverChecklist?.checklistStatus !==
                  CHECKLIST_STATUS.PASS && (
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl text-[16px] shadow-lg cursor-pointer"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenChecklist?.('pre-start');
                    }}
                  >
                    <span className="flex items-center gap-2">
                      Pre-Start Checklist Required
                    </span>
                  </Button>
                )}
                {selectedDocket.truckChecklist?.checklistStatus !==
                  CHECKLIST_STATUS.PASS && (
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl text-[16px] shadow-lg cursor-pointer"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenChecklist?.(
                        'vehicle-inspection',
                        selectedDocket.truck?.licensePlate,
                        selectedDocket.id,
                        selectedDocket.truckId,
                      );
                    }}
                  >
                    <span className="flex items-center gap-2">
                      Truck Inspection Required
                    </span>
                  </Button>
                )}
                {selectedDocket.docketStatus === 'IN_TRANSIT' && (
                  <Button
                    onClick={() => handleAction('markArrived')}
                    disabled={!checklistsComplete}
                    className="w-full bg-[#8E51FF] hover:bg-[#7c46e0] text-white h-12 rounded-xl text-[16px] shadow-lg shadow-purple-200 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Mark Arrived
                    </span>
                  </Button>
                )}
                {selectedDocket.docketStatus === 'ASSIGNED' && (
                  <Button
                    className="w-full bg-[#8E51FF] hover:bg-[#7c46e0] text-white h-12 rounded-xl text-[16px] shadow-lg shadow-purple-200 cursor-pointer"
                    onClick={() => {
                      handleAction('startTransit');
                    }}
                    disabled={!checklistsComplete}
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Start Delivery
                    </span>
                  </Button>
                )}
                {selectedDocket.docketStatus !== 'STOPPED' &&
                  selectedDocket.docketStatus !== 'ARRIVED' &&
                  selectedDocket.docketStatus !== 'ASSIGNED' && (
                    <Button
                      variant="outline"
                      onClick={() => handleAction('stop')}
                      className="w-full border-[#FF6900] text-[#FF6900] hover:bg-orange-50 hover:text-[#FF6900] h-12 rounded-xl text-[16px] font-semibold cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Pause className="h-4 w-4" />
                        Stop
                      </span>
                    </Button>
                  )}
                {selectedDocket.docketStatus === 'STOPPED' && (
                  <Button
                    className="w-full bg-[#008236] text-white h-12 rounded-xl text-[16px] font-semibold cursor-pointer"
                    onClick={() => handleAction('resumeTransit')}
                  >
                    Resume Transit
                  </Button>
                )}
                {selectedDocket.docketStatus === 'ARRIVED' && (
                  <>
                    <Button
                      disabled={!checklistsComplete}
                      className="w-full bg-[#8E51FF] hover:bg-[#7c46e0] text-white h-12 rounded-xl text-[16px] shadow-lg shadow-purple-200 cursor-pointer"
                      onClick={() => handleAction('markDelivered')}
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Mark Delivered
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-[#6366F1] text-[#6366F1] h-12 rounded-xl text-[16px] font-semibold cursor-pointer"
                    >
                      Back to In Transit
                    </Button>
                  </>
                )}
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <Drawer open={isUpdateDrawerOpen} onOpenChange={setIsUpdateDrawerOpen}>
        <DrawerContent className="bg-[#E2E8F0] flex flex-col rounded-t-3xl pb-safe">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Update Actual Load Size</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col items-center pt-8 pb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-[56px] font-medium text-[#0F172A] leading-none tracking-tight">
                {updateValue || '0'}
              </span>
              <span className="text-[24px] text-[#64748B] font-medium">
                {selectedDocket?.jobItem?.productSellUom === 'TN'
                  ? 'T'
                  : selectedDocket?.jobItem?.productSellUom === 'M3'
                    ? 'm³'
                    : (selectedDocket?.jobItem?.productSellUom ?? '')}
              </span>
            </div>
            <span className="text-[13px] text-[#64748B] font-medium mt-2">
              Current:{' '}
              <span className="font-bold">
                {selectedDocket?.docketStatus === 'ASSIGNED'
                  ? selectedDocket?.plannedLoadSize
                  : selectedDocket?.actualLoadSize ||
                    selectedDocket?.plannedLoadSize}
                {selectedDocket?.jobItem?.productSellUom === 'TN'
                  ? 'T'
                  : selectedDocket?.jobItem?.productSellUom === 'M3'
                    ? 'm³'
                    : selectedDocket?.jobItem?.productSellUom}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-3 bg-[#CBD5E1] gap-[1px] border-y border-[#CBD5E1]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
              <button
                key={key}
                className="h-[68px] bg-white text-[28px] text-[#0F172A] active:bg-gray-50 flex items-center justify-center font-normal"
                onClick={() => setUpdateValue((prev) => prev + key)}
              >
                {key}
              </button>
            ))}
            <button
              className="h-[68px] bg-[#94A3B8]/30 text-[28px] text-[#0F172A] active:bg-[#94A3B8]/50 flex items-center justify-center font-normal"
              onClick={() =>
                setUpdateValue((prev) =>
                  prev.includes('.') ? prev : prev + '.',
                )
              }
            >
              .
            </button>
            <button
              className="h-[68px] bg-white text-[28px] text-[#0F172A] active:bg-gray-50 flex items-center justify-center font-normal"
              onClick={() => setUpdateValue((prev) => prev + '0')}
            >
              0
            </button>
            <button
              className="h-[68px] bg-[#94A3B8]/30 text-[#0F172A] active:bg-[#94A3B8]/50 flex items-center justify-center"
              onClick={() => setUpdateValue((prev) => prev.slice(0, -1))}
            >
              <Delete className="h-6 w-6 text-[#334155]" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center gap-4 p-5 bg-[#E2E8F0]">
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-2xl text-[16px] font-bold bg-white border-white text-[#475569] shadow-sm hover:bg-gray-50"
              onClick={() => setIsUpdateDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-14 rounded-2xl text-[16px] font-bold bg-[#8E51FF] hover:bg-[#7c46e0] text-white shadow-sm"
              disabled={operationalUpdate.isPending}
              onClick={async () => {
                if (!selectedDocket?.id || !updateValue) return;
                const numericValue = parseFloat(updateValue);
                if (isNaN(numericValue)) return;
                await operationalUpdate.mutateAsync({
                  id: selectedDocket.id,
                  actualLoadSize: numericValue,
                });
                setIsUpdateDrawerOpen(false);
              }}
            >
              Confirm
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
