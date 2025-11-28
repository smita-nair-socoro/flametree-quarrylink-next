'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { centsToDollars } from '@/lib/utils/currency';

export interface SummaryPaymentProps {
  totalProducts: number;
  totalQuantity: string;
  estimatedDelivery: string;
  termsAndConditions: string[];
  subtotal: number;
  gst: number;
  total: number;
}

export function SummaryPayment({
  totalProducts,
  totalQuantity,
  estimatedDelivery,
  termsAndConditions,
  subtotal,
  gst,
  total,
}: SummaryPaymentProps) {
  return (
    <div className="bg-[rgba(245,245,245,0.3)] border-b-[1.25px] border-[rgba(229,229,229,1)] px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
              <span className="font-bold">Total Quantity:</span> {totalQuantity}
            </p>

            <p className="text-[#0A0A0A] text-sm">
              <span className="font-bold">Estimated Delivery:</span>{' '}
              {estimatedDelivery}
            </p>
          </div>

          {/* Terms & Conditions */}
          <div>
            <h3 className="font-semibold text-[rgba(10,10,10,1)] mb-3 text-base">
              Terms & Conditions
            </h3>
            <ul className="space-y-2">
              {termsAndConditions.map((term, index) => (
                <li
                  key={index}
                  className="text-[rgba(115,115,115,1)] flex text-sm"
                >
                  <span className="mr-2">•</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Payment Breakdown */}
        <div>
          <Card className="border-2 border-[rgba(229,229,229,1)] shadow-lg w-full max-w-sm mx-auto">
            <CardContent className="space-y-3 px-7">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[rgba(10,10,10,1)] text-base">
                  Subtotal:
                </span>
                <span className="font-semibold text-[rgba(10,10,10,1)] text-base">
                  ${centsToDollars(subtotal)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[rgba(10,10,10,1)] text-base">
                  GST (10%):
                </span>
                <span className="font-semibold text-[rgba(10,10,10,1)] text-base">
                  ${centsToDollars(gst)}
                </span>
              </div>
              <Separator />
              <div className="border-t-2 border-[rgba(142,81,255,1)] pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[rgba(142,81,255,1)] text-lg">
                    TOTAL AMOUNT:
                  </span>
                  <span className="font-bold text-[rgba(142,81,255,1)] text-lg">
                    ${centsToDollars(total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
