'use client';

import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, MapPin, TriangleAlert } from 'lucide-react';
import { Separator } from 'react-aria-components';

interface SubscriptionDetails {
  billingCycle: 'monthly' | 'yearly';
  monthlyFee: number;
  yearlyFee: number;
  planLimit: number;
  currentOwnedQuarries: number;
}

interface QuarrySubscriptionActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
  quarryName?: string;
  locationType?: string;
  subscriptionDetails: SubscriptionDetails;
}

export function QuarrySubscriptionActions({
  open,
  onOpenChange,
  onConfirm,
  quarryName = 'New Quarry',
  locationType = 'Owned Location',
  subscriptionDetails,
}: QuarrySubscriptionActionsProps) {
  const [isAcknowledged, setIsAcknowledged] = React.useState(false);

  const { monthlyFee, yearlyFee, planLimit, currentOwnedQuarries } =
    subscriptionDetails;
  const isMonthlyBilling = subscriptionDetails.billingCycle === 'monthly';
  const billingDescriptor = isMonthlyBilling ? 'monthly' : 'yearly';
  const quarryFee = isMonthlyBilling ? monthlyFee : yearlyFee;
  const additionalQuarries = Math.max(
    currentOwnedQuarries + 1 - planLimit,
    1 
  );
  const additionalRecurringCost = additionalQuarries * quarryFee;

  const formatCurrency = React.useCallback(
    (value: number) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value),
    []
  );

  React.useEffect(() => {
    if (!open) {
      setIsAcknowledged(false);
    }
  }, [open]);

  return (
    <ActionDialog
      open={open}
      onOpenChangeAction={onOpenChange}
      customWidth="!max-w-[512px]"
      title="Add Quarry - Payment Required"
      description={
        <div className="rounded-lg border border-[#FF8C00] bg-[#FFF4E6] p-4 flex gap-3">
          <div className="flex h-11 w-11 items-top">
            <TriangleAlert className="h-5 w-5 text-[#FF8C00]" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-[#FF8C00]">
              Payment Required
            </p>
            <p className="text-sm text-[#FF8C00]">
              Adding a quarry requires an additional {billingDescriptor} payment
              of ${quarryFee}. This charge will be added to your
              subscription and billed on your usual cycle.
            </p>
          </div>
        </div>
      }
      content={
        <div className="flex flex-col gap-5 text-sm text-[#475467]">
          <section className="space-y-3">
            <div className="flex flex-col gap-4 rounded-xl border border-[#E5E5E5] bg-[#F9FAFB] p-4">
              <p className="text-base font-medium tracking-wide text-[#475467]">
                Quarry Details
              </p>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6] text-white">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-medium text-[#364153]">
                    {quarryName}
                  </p>
                  <p className="text-sm text-[#6A7282]">{locationType}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-base font-medium tracking-wide text-[#364153]">
              Why is there a charge?
            </p>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-[#A6F4C5] bg-[#F6FEF9] p-4 space-y-1">
                <div className="flex items-center gap-2 text-[#16A34A] font-semibold text-base">
                  <MapPin className="h-5 w-5" />
                  Suppliers - FREE
                </div>
                <p className="text-sm text-[#166534] pl-7">
                  Third-party suppliers you partner with. No charge to add these
                  to your network.
                </p>
              </div>
              <div className="rounded-lg border border-[#FCA5A5] bg-[#FEF3F2] p-4 space-y-1">
                <div className="flex items-center gap-2 text-[#DC2626] font-semibold text-base">
                  <Building2 className="h-5 w-5" />
                  Quarries - ${quarryFee}
                </div>
                <p className="text-sm text-[#991B1B] pl-7">
                  Owned or operated locations. Each quarry adds{' '}
                  ${quarryFee} per{' '}
                  {isMonthlyBilling ? 'month' : 'year'} to your subscription.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="rounded-2xl border border-[#E5E5E5] bg-[#F9FAFB] p-4 space-y-4">
              <p className="text-base font-semibold text-[#364153]">
                {isMonthlyBilling ? 'Billing Summary' : 'Payment Summary'}
              </p>
              {isMonthlyBilling ? (
                <div className="space-y-3">
                  {[
                    {
                      label: 'Quarry monthly fee:',
                      value: formatCurrency(monthlyFee),
                    },
                    {
                      label: 'Plan limit:',
                      value: `${planLimit} ${
                        planLimit === 1 ? 'Quarry' : 'Quarries'
                      }`,
                    },
                    {
                      label: 'Additional quarry:',
                      value: `${additionalQuarries}`,
                    }
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2 font-medium text-[#6A7282]">
                        {item.label}
                      </div>
                      <span className="font-medium text-[#364153]">
                        {item.value}
                      </span>
                    </div>
                  ))}
                  <Separator className="h-px w-full bg-[#EAECF0]" />
                    <div
                      className="flex items-center justify-between text-sm text-[#364153]"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        Additional monthly cost:
                      </div>
                      <span className="font-semibold text-[#364153]">
                        {formatCurrency(additionalRecurringCost)}
                      </span>
                    </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-[#475467] font-medium">
                    <div className="flex items-center gap-2">
                      Quarry yearly fee:
                    </div>
                    <span className="font-semibold text-[#101828]">
                      {formatCurrency(quarryFee)}
                    </span>
                  </div>
                  &nbsp;
                  <div className="h-px w-full bg-[#EAECF0]" />
                  <div className="flex items-center justify-between text-base font-semibold text-[#101828]">
                    <span>Total due today:</span>
                    <span>{formatCurrency(additionalRecurringCost)}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="flex items-start gap-3">
            <Checkbox
              id="accept-quarry-upcharge"
              checked={isAcknowledged}
              onCheckedChange={(checked) => setIsAcknowledged(Boolean(checked))}
              className="mt-1"
            />
            <label
              htmlFor="accept-quarry-upcharge"
              className="text-sm leading-5 text-[#475467]"
            >
              I understand that adding this quarry will increase my{' '}
              {billingDescriptor} subscription cost by{' '}
              ${additionalRecurringCost}. This charge will be
              included in my next regular billing cycle.
            </label>
          </div>
        </div>
      }
      confirmText="Confirm"
      confirmCustomClass="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium"
      confirmDisabled={!isAcknowledged}
      onConfirmAction={onConfirm}
    />
  );
}
