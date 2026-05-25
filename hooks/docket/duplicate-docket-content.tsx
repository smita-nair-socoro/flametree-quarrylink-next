'use client';

import * as React from 'react';
import { Copy, AlertTriangle, Info } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { DocketDTO } from '@/lib/types/docket';
import { InputWithPlusMinusButtons } from '@/components/ui/input-with-plus-minus-buttons';
import { DatePicker } from '@/components/date-picker';
import { Checkbox } from '@/components/ui/checkbox';

export function DuplicateDocketDescription({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
        <Copy className="h-6 w-6 text-[#3B82F6]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-[#101828]">
          {docket?.docketNumber ?? '—'}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#6A7282]">
          <span>{docket?.jobItem?.product?.productName ?? '—'}</span>
          <span className="font-bold">•</span>
          <span>
            {docket?.actualLoadSize || docket?.plannedLoadSize}
            {docket?.jobItem?.productSellUom}
          </span>
        </div>
      </div>
    </div>
  );
}

export interface DuplicateDocketContentProps {
  docket?: DocketDTO | null;
  copies: number;
  onCopiesChange: (value: number) => void;
  retainPoNumber: boolean;
  onRetainPoNumberChange: (checked: boolean) => void;
  newDeliveryDate: Date | undefined;
  onNewDeliveryDateChange: (date: Date | undefined) => void;
}

export function DuplicateDocketContent({
  docket,
  copies,
  onCopiesChange,
  retainPoNumber,
  onRetainPoNumberChange,
  newDeliveryDate,
  onNewDeliveryDateChange,
}: DuplicateDocketContentProps) {
  const loadSize = (docket?.plannedLoadSize || docket?.actualLoadSize) ?? 0;
  const remaining = docket?.jobItem?.remainingQuantity ?? 0;
  const uom = docket?.jobItem?.productSellUom ?? 'TN';
  const totalRequested = copies * loadSize;
  const exceeds = loadSize > 0 && totalRequested > remaining;
  const exceedBy = totalRequested - remaining;
  const maxCopies = loadSize > 0 ? Math.floor(remaining / loadSize) : 99;

  const originalDateString = docket?.deliveryCollectionDate;
  const originalDate = originalDateString ? parseISO(originalDateString) : null;
  const isDateInPast = originalDate ? isPast(originalDate) : false;
  const originalDateFormatted = originalDate
    ? format(originalDate, 'MMMM do, yyyy')
    : null;

  const address = docket?.deliveryAddress?.formattedAddress ?? '—';
  const startTime = docket?.deliveryCollectionStartTime?.substring(0, 5) ?? '—';
  const endTime = docket?.deliveryCollectionEndTime?.substring(0, 5) ?? '—';
  const jobRef = [docket?.job?.jobNumber, docket?.job?.projectName]
    .filter(Boolean)
    .join(' - ');

  return (
    <div className="flex flex-col gap-6">

      {/* Quantity summary */}
      <div
        className={`rounded-md border px-4 py-3 ${
          exceeds
            ? 'border-red-300 bg-red-50'
            : 'border-amber-300 bg-amber-50'
        }`}
      >
        <div className="flex items-start gap-2">
          <AlertTriangle
            className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
              exceeds ? 'text-red-500' : 'text-amber-500'
            }`}
          />
          <div className="flex w-full flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Remaining Quantity Available:</span>
              <span className="font-medium text-[#364153]">
                {remaining} {uom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Each Copy Quantity:</span>
              <span className="font-medium text-[#364153]">
                {loadSize} {uom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Total Requested:</span>
              <span className="font-medium text-[#364153]">
                {totalRequested} {uom}
              </span>
            </div>
            {exceeds && (
              <p className="mt-1 font-medium text-red-600">
                This would exceed the remaining quantity by {exceedBy} {uom}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Number of copies */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#364153]">
          Number of Copies <span className="text-[#111827]">*</span>
        </label>
        <InputWithPlusMinusButtons
          value={copies}
          minValue={1}
          maxValue={maxCopies > 0 ? maxCopies : 1}
          onChange={onCopiesChange}
        />
        {exceeds && (
          <p className="text-sm text-red-600">
            Cannot create {copies} {copies === 1 ? 'copy' : 'copies'}. This
            would exceed the remaining quantity of {remaining} {uom}. Maximum
            copies allowed: {maxCopies}.
          </p>
        )}
      </div>

      {/* Retain PO number */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="retain-po"
            checked={retainPoNumber}
            onCheckedChange={(checked) =>
              onRetainPoNumberChange(Boolean(checked))
            }
          />
          <label
            htmlFor="retain-po"
            className="cursor-pointer select-none text-sm font-medium text-[#364153]"
          >
            Retain existing PO number
          </label>
        </div>
        {retainPoNumber && docket?.purchaseOrder && (
          <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm text-[#6B7280]">
            {docket.purchaseOrder}
          </div>
        )}
      </div>

      {/* Original docket info */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">
            Original Docket Information
          </h3>
          <p className="text-xs text-[#6B7280]">
            The following information will be copied to the new docket
          </p>
        </div>

        <div className="rounded-md border border-gray-200 bg-[#F9FAFB] p-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">

            <InfoCell label="Job Reference:" value={jobRef || '—'} />
            <InfoCell
              label="Product:"
              value={docket?.jobItem?.product?.productName ?? '—'}
            />

            {/* Delivery date — editable */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-[#6B7280]">Delivery Date:</span>
              <DatePicker
                value={newDeliveryDate}
                onChangeAction={onNewDeliveryDateChange}
                placeholder="Pick a date"
                disabled={{ before: new Date() }}
              />
              {isDateInPast && !newDeliveryDate && (
                <p className="text-xs text-red-500">
                  Original date was {originalDateFormatted}. Please update.
                </p>
              )}
            </div>

            <InfoCell
              label="Load Size:"
              value={`${loadSize} ${uom}`}
            />

            <div className="col-span-2">
              <InfoCell label="Delivery Address:" value={address} />
            </div>

            <InfoCell
              label="Contact Name:"
              value={docket?.customerContactName ?? '—'}
            />
            <InfoCell
              label="Contact Phone:"
              value={docket?.customerContactPhone ?? '—'}
            />
            <InfoCell
              label="Time Window:"
              value={`${startTime} – ${endTime}`}
            />
            <InfoCell
              label="Truck Type:"
              value={docket?.truckType ?? '—'}
            />

            {docket?.notes && (
              <div className="col-span-2">
                <InfoCell
                  label="Special Instructions:"
                  value={docket.notes}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Note:</span> All duplicates will be
          created with &ldquo;Pending / Unassigned&rdquo; status. PO numbers
          can be cleared and can be added individually later.
        </p>
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[#6B7280]">{label}</span>
      <span className="font-medium text-[#364153]">{value}</span>
    </div>
  );
}
