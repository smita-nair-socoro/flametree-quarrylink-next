'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { centsToDollars } from '@/lib/utils/currency';
import { QuoteCurrencyTax } from '@/lib/types/quotation';
import { Info } from 'lucide-react';

export interface SummaryPaymentProps {
  totalProducts: number;
  estimatedDelivery: string;
  subtotal: number;
  gst: number;
  total: number;
  currencyTax: QuoteCurrencyTax;
  includeDeliveryPrices?: boolean;
  productSubtotal?: number;
  deliverySubtotal?: number;
}

export function SummaryPayment({
  totalProducts,
  estimatedDelivery,
  subtotal,
  gst,
  total,
  currencyTax,
  includeDeliveryPrices = false,
  productSubtotal,
  deliverySubtotal,
}: SummaryPaymentProps) {
  const { currencySymbol, taxLabel, taxRateLabel, exTaxLabel } = currencyTax;

  return (
    <div className="bg-[rgba(245,245,245,0.3)] border-b-[1.25px] border-[rgba(229,229,229,1)] px-8 py-8">
      <div className="flex items-center gap-2 rounded-lg border border-[#E4D4FF] bg-[#F5F0FF] px-4 py-3 mb-8">
        <Info className="h-4 w-4 flex-shrink-0 text-[#8E51FF]" />
        <p className="text-sm font-medium text-[#8E51FF]">
          Please note: A digital platform fee of $xx.xx applies per docket.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Summary */}
        <div>
          <h2 className="font-semibold mb-4 text-base text-gray-900">
            Summary
          </h2>

          <div className="mb-8 space-y-2">
            <p className="text-[#0A0A0A] text-sm">
              <span className="font-bold">Total Products:</span> {totalProducts}{' '}
              items
            </p>

            <p className="text-[#0A0A0A] text-sm">
              <span className="font-bold">Estimated Date:</span>{' '}
              {estimatedDelivery}
            </p>
          </div>
        </div>

        {/* Right Column - Payment Breakdown */}
        <div>
          <Card className="border-2 border-[rgba(229,229,229,1)] shadow-lg w-full max-w-sm mx-auto">
            <CardContent className="space-y-3 px-4">
              {includeDeliveryPrices ? (
                <>
                  {/* Product Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[rgba(10,10,10,1)] text-base">
                      Product Subtotal:
                    </span>
                    <span className="font-semibold text-[rgba(10,10,10,1)] text-base">
                      {currencySymbol}
                      {centsToDollars(productSubtotal || 0)}
                    </span>
                  </div>
                  {/* Delivery Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#8E51FF] text-base">
                      Delivery Subtotal:
                    </span>
                    <span className="font-semibold text-[#8E51FF] text-base">
                      {currencySymbol}
                      {centsToDollars(deliverySubtotal || 0)}
                    </span>
                  </div>
                  <Separator />
                  {/* GST */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[rgba(10,10,10,1)] text-base">
                      {taxRateLabel}:
                    </span>
                    <span className="font-semibold text-[rgba(10,10,10,1)] text-base">
                      {currencySymbol}
                      {centsToDollars(gst)}
                    </span>
                  </div>
                  <Separator />
                  {/* Total */}
                  <div className="border-t-2 border-[rgba(142,81,255,1)] pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[rgba(142,81,255,1)] text-base">
                        TOTAL AMOUNT:
                      </span>
                      <span className="font-bold text-[rgba(142,81,255,1)] text-lg">
                        {currencySymbol}
                        {centsToDollars(total)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Subtotal (original layout) */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[rgba(10,10,10,1)] text-base">
                      Subtotal {exTaxLabel}:
                    </span>
                    <span className="font-semibold text-[rgba(10,10,10,1)] text-base">
                      {currencySymbol}
                      {centsToDollars(subtotal)}
                    </span>
                  </div>
                  <Separator />
                  {/* GST */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[rgba(10,10,10,1)] text-base">
                      {taxRateLabel}:
                    </span>
                    <span className="font-semibold text-[rgba(10,10,10,1)] text-base">
                      {currencySymbol}
                      {centsToDollars(gst)}
                    </span>
                  </div>
                  <Separator />
                  {/* Total */}
                  <div className="border-t-2 border-[rgba(142,81,255,1)] pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[rgba(142,81,255,1)] text-base">
                        TOTAL AMOUNT (Incl. {taxLabel}):
                      </span>
                      <span className="font-bold text-[rgba(142,81,255,1)] text-lg">
                        {currencySymbol}
                        {centsToDollars(total)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
