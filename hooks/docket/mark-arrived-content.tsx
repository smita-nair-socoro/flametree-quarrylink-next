'use client';
import { MapPin, Shield, User, Clock } from 'lucide-react';
import { Docket } from '@/lib/types/docket';
import { formatTimeOnly, formatWeekdayDate } from '@/lib/utils/date';

export function MarkArrivedContent({ docket }: { docket?: Docket | null }) {
  const now = new Date();
  const arrivalTime = formatTimeOnly(now);
  const arrivalDate = formatWeekdayDate(now);

  const destination = docket?.deliveryAddress?.address?.formattedAddress ?? '—';
  const customerName = docket?.job?.customerName ?? '—';

  return (
    <div className="flex flex-col gap-5">
      {/* Docket header */}
      <div className="flex justify-start items-center gap-2">
        <div className="flex w-[42px] h-[42px] justify-center bg-[#DBEAFE] rounded-full flex-shrink-0">
          <span className="flex items-center justify-center">
            <MapPin className="h-[20px] w-[20px] text-[#1E40AF]" />
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{docket?.docketNumber ?? '—'}</span>
          <div className="flex justify-start gap-2">
            <span className="text-sm text-[#6A7282]">
              {docket?.productName}
            </span>
            {docket?.loadSize != null && (
              <>
                <span className="text-sm text-[#6A7282] font-extrabold">·</span>
                <span className="text-sm text-[#6A7282]">
                  {docket.loadSize} {docket.productUoM}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Admin Override warning */}
      <div className="border border-[#FED7AA] rounded-md p-4 bg-[#FFF7ED]">
        <div className="flex justify-start gap-2 self-stretch">
          <Shield className="h-[20px] w-[20px] text-[#C2410C] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[16px] text-[#C2410C] font-medium">
              Admin Override
            </span>
            <span className="text-[14px] font-normal text-[#EA580C]">
              You are marking this docket as arrived on behalf of the driver.
              This action will be logged for audit purposes.
            </span>
          </div>
        </div>
      </div>

      {/* Destination & Customer */}
      <div className="flex flex-col gap-3 rounded-md bg-[#F9FAFB] px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-normal text-[#6A7282] uppercase tracking-wide">
            Destination
          </span>
          <span className="text-[16px] font-medium text-[#101828]">
            {destination}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-normal text-[#6A7282] uppercase tracking-wide">
            Customer
          </span>
          <span className="text-[16px] font-medium text-[#101828]">
            {customerName}
          </span>
        </div>
      </div>

      {/* Driver info */}
      <div className="border border-[#BBF7D0] rounded-md p-3 bg-[#F0FDF4]">
        <div className="flex items-center gap-3">
          <div className="flex w-[36px] h-[36px] justify-center bg-[#F0FDF4] flex-shrink-0">
            <span className="flex items-center justify-center">
              <User className="h-[20px] w-[20px] text-[#166534]" />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-medium text-[#166534]">
              {docket?.contactName ?? '—'}
            </span>
            {docket?.truckType && (
              <span className="text-[12px] font-normal text-[#15803D]">
                {docket.truckType}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Arrival Time */}
      <div className="border border-[#BFDBFE] rounded-md p-4 bg-[#EFF6FF]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Clock className="h-[18px] w-[18px] text-[#2563EB]" />
            <span className="text-[14px] font-medium text-[#1E40AF]">
              Arrival Time
            </span>
          </div>
          <span className="text-[22px] font-bold text-[#1E40AF]">
            {arrivalTime}
          </span>
          <span className="text-[13px] text-[#3B82F6]">{arrivalDate}</span>
        </div>
      </div>

      {/* What happens */}
      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[#101828]">
          What happens when marked as arrived:
        </span>
        <ul className="text-[14px] font-normal text-[#6A7282] space-y-1 list-disc list-outside pl-4">
          {[
            'Docket status changes to "Arrived"',
            'Arrival timestamp is recorded for waiting time calculation',
            'Driver can proceed to unload and complete delivery sign-off',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
