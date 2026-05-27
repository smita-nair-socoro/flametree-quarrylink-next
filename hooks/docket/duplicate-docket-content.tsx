'use client';

import * as React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { DocketDTO } from '@/lib/types/docket';
import { DatePicker } from '@/components/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { formatTruckType } from '@/lib/types/truck-enums';


// ─── Description: quantity summary card only ───────────────────────────────

export interface DuplicateDocketDescriptionProps {
  docket?: DocketDTO | null;
  copies: number;
}

export function DuplicateDocketDescription({
  docket,
  copies,
}: DuplicateDocketDescriptionProps) {
  const loadSize = docket?.plannedLoadSize || docket?.actualLoadSize || docket?.loadSize || 0;
  const remaining = docket?.jobItem?.remainingQuantity ?? 0;
  const uom = docket?.jobItem?.productSellUom ?? '';
  const totalRequested = copies * loadSize;
  const exceedsBy = totalRequested - remaining;
  const isExceeding = exceedsBy > 0;

  return (
    <div className="rounded-[10px] border-[0.625px] border-[#E5E7EB] p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#101828]" />
        <div className="flex w-full flex-col gap-3 text-sm">
          <p className="tracking-[-0.1504px]">
            <span className="font-semibold text-[#6A7282]">Remaining Quantity Available: </span>
            <span className="font-normal text-[#101828]">{remaining} {uom}</span>
          </p>
          <p className="tracking-[-0.1504px]">
            <span className="font-semibold text-[#6A7282]">Each Copy Quantity: </span>
            <span className="font-normal text-[#101828]">{loadSize} {uom}</span>
          </p>
          <div className="flex flex-col gap-[10px]">
            <p className="tracking-[-0.1504px]">
              <span className="font-semibold text-[#6A7282]">Total Requested: </span>
              <span className="font-normal text-[#101828]">{totalRequested} {uom}</span>
            </p>
            {isExceeding && (
              <p className="text-[14px] font-medium leading-5 text-[#E7000B]">
                ⚠️ This would exceed the remaining quantity by {exceedsBy} {uom}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Content: copies + PO + docket info + note ─────────────────────────────

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
  const loadSize = docket?.plannedLoadSize || docket?.actualLoadSize || docket?.loadSize || 0;
  const remaining = docket?.jobItem?.remainingQuantity ?? 0;
  const uom = docket?.jobItem?.productSellUom ?? '';
  const maxCopies = loadSize > 0 ? Math.floor(remaining / loadSize) : 99;

  const originalDateString = docket?.deliveryCollectionDate;
  const originalDate = originalDateString ? parseISO(originalDateString) : null;
  const isDateInPast = originalDate ? isPast(originalDate) : false;
  const originalDateFormatted = originalDate ? format(originalDate, 'MMMM do, yyyy') : null;

  const startTime = docket?.deliveryCollectionStartTime?.slice(0, 5) ?? '';
  const endTime = docket?.deliveryCollectionEndTime?.slice(0, 5) ?? '';
  const jobRef = [docket?.job?.jobNumber, docket?.job?.projectName].filter(Boolean).join(' - ');

  const deliveryFormattedAddress = docket?.deliveryAddress?.formattedAddress;
  const pickUpFormattedAddress = docket?.pickUpAddress?.formattedAddress;
  const addressLabel = deliveryFormattedAddress ? 'Delivery Address:' : 'Pick Up Address:';
  const addressValue = deliveryFormattedAddress ?? pickUpFormattedAddress ?? '';

const truckTypeLabel = formatTruckType(docket?.jobItem?.truckType || docket?.truckType || docket?.truck?.truckType);

  // Local string state so the input can be cleared and won't show leading zeros
  const [rawCopies, setRawCopies] = React.useState(String(copies));

  const handleCopiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setRawCopies(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0) onCopiesChange(num);
  };

  const handleCopiesBlur = () => {
    const num = parseInt(rawCopies, 10);
    if (isNaN(num) || num < 0) {
      setRawCopies('0');
      onCopiesChange(0);
    } else {
      setRawCopies(String(num));
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Group 1: copies + PO */}
      <div className="flex flex-col gap-6">

        {/* Number of copies */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#364153]">
            Number of Copies <span className="text-[#111827]">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={rawCopies}
            onChange={handleCopiesChange}
            onBlur={handleCopiesBlur}
            onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
            className="h-10 w-[208px] rounded-[10px] border-[0.625px] border-[#E5E7EB] px-3 text-sm text-[#0A0A0A] outline-none focus:border-[#0A0A0A]"
          />
          {copies > maxCopies && (
            <p className="text-[14px] font-normal leading-5 text-[#FB2C36]">
              Cannot create {copies} copies. This would exceed the remaining quantity of {remaining} {uom}.<br />
              Maximum copies allowed: {maxCopies}
            </p>
          )}
        </div>

        {/* Retain PO number */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="retain-po"
              checked={retainPoNumber}
              onCheckedChange={(checked) => onRetainPoNumberChange(Boolean(checked))}
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
              className="h-10 w-[208px] rounded-[10px] border-[0.625px] border-[#E5E7EB] px-3 text-sm text-[#0A0A0A] outline-none focus:border-[#0A0A0A]"
            />
          )}
        </div>
      </div>

      {/* Group 2: bordered container — banner + grid + note */}
      <div className="overflow-hidden rounded-[14px] border-[0.625px] border-[#F3F4F6] pt-[0.625px] pr-[0.625px] pl-[0.625px] pb-[24.62px]">

        {/* Banner */}
        <div className="flex h-[82px] flex-col gap-0.5 border-b-[0.625px] border-[#F3F4F6] bg-[#F9FAFB]/50 px-4 pt-4">
          <h3 className="text-[18px] font-semibold text-[#101828]">
            Original Docket Information
          </h3>
          <p className="text-sm text-[#6A7282]">
            The following information will be copied to the new docket
          </p>
        </div>

        {/* Docket grid + note */}
        <div className="flex flex-col gap-6 px-6 pt-6">

          {/* Docket info grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 text-sm">

            <InfoCell label="Job Reference:" value={jobRef} />
            <InfoCell label="Product:" value={docket?.jobItem?.product?.productName ?? ''} />

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
                  Original date was {originalDateFormatted}.<br />Please update.
                </p>
              )}
            </div>

            <InfoCell label="Load Size:" value={`${loadSize} ${uom}`} />

            <div className="col-span-2">
              <InfoCell label={addressLabel} value={addressValue} />
            </div>

            <InfoCell label="Contact Name:" value={docket?.customerContactName ?? ''} />
            <InfoCell label="Contact Phone:" value={docket?.customerContactPhone ?? ''} />
            <InfoCell label="Time Window:" value={startTime && endTime ? `${startTime} – ${endTime}` : ''} />
            {truckTypeLabel && <InfoCell label="Truck Type:" value={truckTypeLabel} />}

            {docket?.notes && (
              <div className="col-span-2 flex flex-col gap-1.5">
                <span className="w-[133px] text-sm font-medium leading-5 tracking-[-0.1504px] text-[#6A7282]">
                  Special Instructions
                </span>
                <div
                  className="w-full rounded-[4px] bg-[#F9FAFB] text-sm text-[#101828]"
                  style={{
                    paddingTop: '12.24px',
                    paddingRight: '20.77px',
                    paddingBottom: '11.74px',
                    paddingLeft: '11.99px',
                    minHeight: '63.98px',
                  }}
                >
                  {docket.notes}
                </div>
              </div>
            )}
          </div>

          {/* Bottom note */}
          <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Note:</span> All duplicates will be
              created with &ldquo;Pending / Unassigned&rdquo; status.<br />PO numbers
              can be cleared and can be added individually later.
            </p>
          </div>

        </div>
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
