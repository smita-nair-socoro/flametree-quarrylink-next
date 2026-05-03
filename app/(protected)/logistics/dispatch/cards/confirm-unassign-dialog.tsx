'use client';

import * as React from 'react';
import { AlertTriangle, Truck, User } from 'lucide-react';
import { ActionDialog } from '@/components/action-dialog';

export type ConfirmUnassignDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docketNumber: string;
  cargoSummary: string;
  destination: string;
  customerName: string;
  truckLabel: string;
  driverLabel: string;
  assignmentDateLabel: string;
  timeWindowLabel: string;
  onConfirm: () => void;
  isConfirming?: boolean;
};

export function ConfirmUnassignDialog({
  open,
  onOpenChange,
  docketNumber,
  cargoSummary,
  destination,
  customerName,
  truckLabel,
  driverLabel,
  assignmentDateLabel,
  timeWindowLabel,
  onConfirm,
  isConfirming,
}: ConfirmUnassignDialogProps) {
  return (
    <ActionDialog
      open={open}
      onOpenChangeAction={onOpenChange}
      customWidth="w-[min(100vw,520px)]"
      title="Confirm unassign"
      description={
        <p className="text-sm text-[#64748B] -mt-1 leading-relaxed">
          Remove{' '}
          <span className="font-semibold text-[#0F172A]">{docketNumber}</span>{' '}
          from its current trip and return it to the Unassigned column.
        </p>
      }
      content={
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100">
              <User className="h-5 w-5 text-pink-600" aria-hidden />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-base font-bold text-[#0F172A]">{docketNumber}</p>
              <p className="text-sm text-[#64748B] mt-0.5">{cargoSummary}</p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 flex gap-3">
            <AlertTriangle
              className="h-5 w-5 shrink-0 text-amber-700 mt-0.5"
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold text-[#92400E]">
                Remove active assignment
              </p>
              <p className="text-sm text-[#78350F] mt-1 leading-relaxed">
                This docket will leave the truck schedule for the assignment
                below. You can assign it again later from Unassigned.
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-gray-50 p-4">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
                Destination
              </p>
              <p className="text-sm font-semibold text-[#0F172A] mt-0.5">
                {destination || '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
                Customer
              </p>
              <p className="text-sm font-semibold text-[#0F172A] mt-0.5">
                {customerName || '—'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100">
                <Truck className="h-4 w-4 text-rose-700" aria-hidden />
              </div>
              <span className="text-sm font-semibold text-rose-900">
                Current assignment
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <p className="text-[11px] font-medium text-[#64748B]">Truck</p>
                <p className="font-semibold text-[#0F172A]">{truckLabel}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#64748B]">Driver</p>
                <p className="font-semibold text-[#0F172A]">{driverLabel}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#64748B]">
                  Assignment date
                </p>
                <p className="font-semibold text-[#0F172A]">
                  {assignmentDateLabel}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#64748B]">
                  Time window
                </p>
                <p className="font-semibold text-[#0F172A]">{timeWindowLabel}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#0F172A] mb-2">
              What happens when you unassign:
            </p>
            <ul className="list-disc pl-5 text-sm text-[#475569] space-y-1.5">
              <li>Trip is removed from the truck / driver for this docket</li>
              <li>
                Docket status returns to Unassigned and appears in the left
                column
              </li>
              <li>
                The driver is notified that they have been unassigned from this
                docket
              </li>
            </ul>
          </div>
        </div>
      }
      cancelText="Cancel"
      confirmText="Unassign docket"
      confirmVariant="destructive"
      confirmDisabled={isConfirming}
      onConfirmAction={onConfirm}
      hideSeparator
    />
  );
}
