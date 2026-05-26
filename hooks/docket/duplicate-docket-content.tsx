'use client';

import * as React from 'react';
import { Copy, AlertTriangle, Info } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { DocketDTO } from '@/lib/types/docket';
import { DatePicker } from '@/components/date-picker';
import { Checkbox } from '@/components/ui/checkbox';


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
        className="rounded-[10px] border-[0.625px] border-[#E5E7EB] p-4"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#101828]"
          />
          <div className="flex w-full flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold tracking-[-0.1504px] text-[#6A7282]">Remaining Quantity Available:</span>
              <span className="font-normal tracking-[-0.1504px] text-[#101828]">
                {remaining} {uom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold tracking-[-0.1504px] text-[#6A7282]">Each Copy Quantity:</span>
              <span className="font-normal tracking-[-0.1504px] text-[#101828]">
                {loadSize} {uom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold tracking-[-0.1504px] text-[#6A7282]">Total Requested:</span>
              <span className="font-normal tracking-[-0.1504px] text-[#101828]">
                {totalRequested} {uom}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Number of copies */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#364153]">
          Number of Copies <span className="text-[#111827]">*</span>
        </label>
        <input
          type="number"
          min={1}
          max={maxCopies > 0 ? maxCopies : 1}
          value={copies}
          onChange={(e) => onCopiesChange(Number(e.target.value))}
          className="h-10 w-[184px] rounded-[10px] border-[0.625px] border-[#E5E7EB] px-3 text-sm text-[#0A0A0A] outline-none focus:border-[#0A0A0A]"
        />
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
        {retainPoNumber && (
          <input
            type="text"
            defaultValue={docket?.purchaseOrder ?? ''}
            placeholder="PO number"
            className="h-10 w-[184px] rounded-[10px] border-[0.625px] border-[#E5E7EB] px-3 text-sm text-[#0A0A0A] outline-none focus:border-[#0A0A0A]"
          />
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
