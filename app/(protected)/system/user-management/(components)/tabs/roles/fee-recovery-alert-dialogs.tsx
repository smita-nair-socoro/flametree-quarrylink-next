'use client';

import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';

type FeeChargeMode = 'charge' | 'absorb';

interface SaveFeeDefaultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  mode: FeeChargeMode;
  amount: string;
  currencySymbol: string;
  customerCount: number;
  overrideCount: number;
}

export function SaveFeeDefaultsDialog({
  open,
  onOpenChange,
  onConfirm,
  mode,
  amount,
  currencySymbol,
  customerCount,
  overrideCount,
}: Readonly<SaveFeeDefaultsDialogProps>) {
  return (
    <ActionDialog
      open={open}
      onOpenChangeAction={onOpenChange}
      title="Save global fee defaults?"
      description={
        <div className="space-y-2 text-sm text-muted-foreground">
          {mode === 'charge' ? (
            <p>
              This will apply{' '}
              <span className="font-medium text-foreground">
                charging {currencySymbol}
                {amount} per docket on unlocked invoices
              </span>{' '}
              to{' '}
              <span className="font-medium text-foreground">
                {customerCount} customers
              </span>{' '}
              without a custom override.
            </p>
          ) : (
            <p>
              This will apply{' '}
              <span className="font-medium text-foreground">
                absorbing platform cost (no fee line)
              </span>{' '}
              to all customers without a custom override.
            </p>
          )}

          {mode === 'charge' && (
            <p>
              <span className="font-medium text-foreground">
                {overrideCount}
              </span>{' '}
              custom overrides will{' '}
              <span className="font-medium text-foreground">not</span> change —
              e.g. customers you still charge individually while others absorb.
            </p>
          )}

          <p className="text-xs">
            Only uninvoiced{mode === 'absorb' ? ', unlocked' : ''} dockets are
            affected. Delivered or Collected dockets keep their frozen fee.
          </p>
        </div>
      }
      hideSeparator
      cancelText="Cancel"
      confirmText="Save defaults"
      confirmCustomClass="bg-[#8E51FF] hover:bg-[#7C3FEF] text-white"
      onConfirmAction={onConfirm}
    />
  );
}

interface RemoveCustomOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  customerName: string;
  globalMode: FeeChargeMode;
  amount: string;
  currencySymbol: string;
}

export function RemoveCustomOverrideDialog({
  open,
  onOpenChange,
  onConfirm,
  customerName,
  globalMode,
  amount,
  currencySymbol,
}: Readonly<RemoveCustomOverrideDialogProps>) {
  return (
    <ActionDialog
      open={open}
      onOpenChangeAction={onOpenChange}
      title="Remove custom override?"
      description={
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">{customerName}</span>{' '}
            will follow the global default:{' '}
            <span className="font-medium text-foreground">
              {globalMode === 'charge'
                ? `Charge ${currencySymbol}${amount} per docket.`
                : 'Absorb — no fee line.'}
            </span>
          </p>
          <p className="text-xs">
            Applies to uninvoiced, unlocked dockets only.
          </p>
        </div>
      }
      hideSeparator
      cancelText="Keep override"
      confirmText="Revert to global"
      confirmCustomClass="bg-[#8E51FF] hover:bg-[#7C3FEF] text-white"
      onConfirmAction={onConfirm}
    />
  );
}
