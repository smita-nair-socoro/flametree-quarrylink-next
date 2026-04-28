import { format } from 'date-fns';
import { X, User, Check, MapPin, ExternalLink } from 'lucide-react';
import {
  DispatchDocket,
  formatTimeRange,
} from '@/app/(protected)/logistics/dispatch/views/dispatch-view';
import { CUSTOMER_TYPE } from '@/lib/types/customer-enums';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Map } from '@/components/ui/map';
import { TableBadges } from '@/components/table-badges';
import { JOB_LINE_ITEM_TYPE } from '@/lib/types/job-enums';

interface DocketDetailsPanelProps {
  docket: DispatchDocket;
  onClose: () => void;
  onUnassign: () => void;
}

import { DocketByIdQueryOptions } from '@/lib/api/docket';
import { useQuery } from '@tanstack/react-query';

export function DocketDetailsPanel({
  docket: initialDocket,
  onClose,
  onUnassign,
}: DocketDetailsPanelProps) {
  const { data: fullDocket } = useQuery({
    ...DocketByIdQueryOptions(initialDocket.id),
    enabled: !!initialDocket.id,
  });

  const docket = fullDocket ? { ...initialDocket, ...fullDocket } : initialDocket;

  const isUnassigned = docket.docketStatus === DOCKET_STATUS.UNASSIGNED;
  const isAssigned = docket.docketStatus === DOCKET_STATUS.ASSIGNED;

  return (
    <div className="flex flex-col bg-[#F8FAFC] overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky">
        <div>
          <div className="text-sm text-gray-500 font-medium">
            {docket.deliveryCollectionDate
              ? format(
                  new Date(docket.deliveryCollectionDate),
                  'EEEE, d MMMM yyyy',
                )
              : 'Date TBD'}
          </div>
          <div className="text-base font-semibold text-gray-900 mt-1">
            {docket.job?.customerDto?.customerType === CUSTOMER_TYPE.BUSINESS
              ? docket.job?.customerDto?.businessName
              : docket.job?.contactPersonName || docket.customerName || 'Unknown Customer'}
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
          <h2 className="text-2xl font-bold text-gray-900">
            {docket.docketNumber || 'No Number'}
          </h2>
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
                JOB-2024-001
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Project name</div>
              <div className="text-sm font-medium text-gray-900">
                Main Street Project
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
                {docket.jobItem?.product?.productName || docket.productName || ''}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">
                Quarry / supplier
              </div>
              <div className="text-sm font-medium text-gray-900">
                {docket.jobItem?.quarrySupplierName || 'HANSON'}
              </div>
            </div>

            {docket.jobItem?.jobItemType === JOB_LINE_ITEM_TYPE.DELIVERY && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Truck type</div>
                <div className="text-sm font-medium text-gray-900">
                  {docket.truckType || 'Semi Trailer'}
                </div>
              </div>
            )}

            {isUnassigned ||
            (docket.jobItem?.jobItemType === JOB_LINE_ITEM_TYPE.COLLECTION &&
              docket.docketStatus !== DOCKET_STATUS.COLLECTED) ? (
              <div>
                <div className="text-xs text-gray-500 mb-1">Load quantity</div>
                <div className="flex justify-between gap-2">
                  <Input
                    type="text"
                    suffix={
                      (docket.jobItem?.productSellUom || docket.productSellUom) === 'M3'
                        ? 'm³'
                        : (docket.jobItem?.productSellUom || docket.productSellUom) === 'KG_20'
                          ? 'x 20kg'
                          : (docket.jobItem?.productSellUom || docket.productSellUom)
                    }
                    defaultValue={docket.loadSize || '10'}
                    className=""
                  />
                  <Button variant="default" className="cursor-pointer">
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500">Quantity</span>
                <span className="text-sm font-medium text-gray-900">
                  {docket.loadSize}{' '}
                  {(docket.jobItem?.productSellUom || docket.productSellUom) === 'M3'
                    ? 'm³'
                    : (docket.jobItem?.productSellUom || docket.productSellUom) === 'KG_20'
                      ? 'x 20kg'
                      : (docket.jobItem?.productSellUom || docket.productSellUom)}
                </span>
              </div>
            )}
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
                {typeof docket.pickUpAddress === 'string' ? docket.pickUpAddress : docket.pickUpAddress?.formattedAddress || 'TBD'}
              </div>
            </div>
            {(!docket.jobItem || docket.jobItem.jobItemType === JOB_LINE_ITEM_TYPE.DELIVERY) && (
              <div className="flex flex-col gap-0 text-sm font-medium">
                <div className=" text-gray-500">Delivery</div>
                <div className=" text-gray-900">
                  {typeof docket.deliveryAddress === 'string' ? docket.deliveryAddress : docket.deliveryAddress?.formattedAddress || 'TBD'}
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
                  href={`https://www.google.com/maps/search/?api=1&query=${docket.deliveryAddress?.formattedAddress || ''}`}
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
                      lat: docket.deliveryAddress?.latitude || -37.814,
                      lng: docket.deliveryAddress?.longitude || 144.991,
                      color: 'green',
                    },
                  ]}
                  defaultZoom={14}
                  disableDefaultUI={true}
                  className="h-full w-full [&_.gmnoprint]:scale-[0.8] [&_.gmnoprint]:origin-right"
                />
              </div>

              <div className="text-xs font-mono text-gray-500">
                {docket.deliveryAddress?.latitude?.toFixed(5) || '-37.81400'},{' '}
                {docket.deliveryAddress?.longitude?.toFixed(5) || '144.99100'}
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
                {docket.deliveryCollectionDate
                  ? format(
                      new Date(docket.deliveryCollectionDate),
                      'dd/MM/yyyy',
                    )
                  : 'TBD'}
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
                    {!isUnassigned ? 'Sarah Wilson' : 'Unassigned'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Truck (rego)</div>
                  <div className="text-sm font-medium text-gray-900">
                    {docket.uiAssignedTruckId ||
                      docket.truckType ||
                      'Unassigned'}
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
                      <Check className="w-4 h-4 text-green-500" />
                      Driver OK
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      <Check className="w-4 h-4 text-green-500" />
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
                      <Check className="w-4 h-4 text-green-500" />
                      Truck OK
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      <Check className="w-4 h-4 text-green-500" />
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
            Call site supervisor 30 mins before arrival. Beware of tight turning
            circle at gate 3.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 z-10 flex flex-col gap-3">
        {isAssigned && (
          <button
            onClick={onUnassign}
            className="w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" /> Unassign from trip
          </button>
        )}
        <button className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center">
          Duplicate
        </button>
      </div>
    </div>
  );
}
