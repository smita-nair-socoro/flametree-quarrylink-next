import React from 'react';
import { DocketDTO } from '@/lib/types/docket';
import { Switch } from '@/components/ui/switch';
import { centsToDollars } from '@/lib/utils/currency';

interface InvoiceDocketContentProps {
  docket: DocketDTO | null | undefined;
  includeDeliveryPrices: boolean;
  setIncludeDeliveryPrices: (val: boolean) => void;
}

export function InvoiceDocketContent({
  docket,
  includeDeliveryPrices,
  setIncludeDeliveryPrices,
}: InvoiceDocketContentProps) {
  if (!docket) return null;

  const hasDeliveryCost = docket.jobItem?.jobItemType !== 'COLLECTION';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-xl bg-slate-100 p-4">
        {hasDeliveryCost && includeDeliveryPrices ? (
          <>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-gray-700">Total Product Amount:</span>
              <span className="font-bold v text-lg">
                ${centsToDollars(docket.totalProductAmount || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-gray-700">Total Delivery Amount:</span>
              <span className="font-bold text-[#101828] text-lg">
                ${centsToDollars(docket.totalDeliveryAmount || 0)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-700">Total Amount:</span>
            <span className="font-bold text-[#101828] text-lg">
              ${centsToDollars(docket.totalInvoiceAmount || 0)}
            </span>
          </div>
        )}
      </div>

      {hasDeliveryCost && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-md font-semibold text-[#101828]">
                Separate Delivery Line Items
              </p>
              <p className="text-sm leading-relaxed text-[#6A7282]">
                {includeDeliveryPrices ? (
                  <>
                    Delivery charges will appear as a separate invoice.
                  </>
                ) : (
                  <>
                    Delivery charges will be included in the product line item totals.
                  </>
                )}
              </p>
            </div>
            <Switch
              checked={includeDeliveryPrices}
              onCheckedChange={setIncludeDeliveryPrices}
              className="mt-0.5 shrink-0 data-[state=checked]:bg-[#8E51FF]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
