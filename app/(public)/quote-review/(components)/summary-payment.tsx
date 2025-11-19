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
  forPdf?: boolean;
}

export function SummaryPayment({
  totalProducts,
  totalQuantity,
  estimatedDelivery,
  termsAndConditions,
  subtotal,
  gst,
  total,
  forPdf = false,
}: SummaryPaymentProps) {
  return (
    <div
      className={`bg-[rgba(245,245,245,0.3)] border-b-[1.25px] border-[rgba(229,229,229,1)] ${
        forPdf ? 'px-10 py-6 pt-8 mb-3' : 'px-8 py-8'
      }`}
    >
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 ${
          forPdf ? 'gap-2' : 'gap-12'
        }`}
      >
        {/* Left Column - Summary */}
        <div>
          <h2
            className={`font-semibold text-gray-900 mb-4 ${
              forPdf ? 'text-4xl' : 'text-base'
            }`}
          >
            Summary
          </h2>

          <div className={`space-y-2 ${forPdf ? 'mb-4' : 'mb-8'}`}>
            <div className="flex items-center gap-3">
              <p className={`text-gray-900 ${forPdf ? 'text-2xl' : 'text-sm'}`}>
                <span className={`font-bold ${forPdf ? 'text-2xl' : 'text-sm'}`}>
                  Total Products:
                </span>{' '}
                {totalProducts} items
              </p>
            </div>

            <p className={`text-gray-900 ${forPdf ? 'text-2xl' : 'text-sm'}`}>
              <span className={`font-bold ${forPdf ? 'text-2xl' : 'text-sm'}`}>
                Total Quantity:
              </span>{' '}
              {totalQuantity}
            </p>

            <p className={`text-gray-900 ${forPdf ? 'text-2xl' : 'text-sm'}`}>
              <span className={`font-bold ${forPdf ? 'text-2xl' : 'text-sm'}`}>
                Estimated Delivery:
              </span>{' '}
              {estimatedDelivery}
            </p>
          </div>

          {/* Terms & Conditions */}
          <div>
            <h3
              className={`font-semibold text-[rgba(10,10,10,1)] mb-3 ${
                forPdf ? 'text-4xl' : 'text-base'
              }`}
              style={forPdf ? { letterSpacing: '0.3px' } : undefined}
            >
              Terms & Conditions
            </h3>
            <ul className="space-y-2">
              {termsAndConditions.map((term, index) => (
                <li
                  key={index}
                  className={`text-[rgba(115,115,115,1)] flex ${
                    forPdf ? 'text-2xl' : 'text-sm'
                  }`}
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
          <Card className="border-2 border-[rgba(229,229,229,1)] shadow-lg">
            <CardContent className={`space-y-3 ${forPdf ? 'px-8' : 'px-7'}`}>
              <div className="flex justify-between items-center">
                <span
                  className={`font-semibold text-[rgba(10,10,10,1)] ${
                    forPdf ? 'text-3xl' : 'text-base'
                  }`}
                >
                  Subtotal:
                </span>
                <span
                  className={`font-semibold text-[rgba(10,10,10,1)] ${
                    forPdf ? 'text-3xl' : 'text-base'
                  }`}
                >
                  ${centsToDollars(subtotal)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span
                  className={`font-semibold text-[rgba(10,10,10,1)] ${
                    forPdf ? 'text-3xl' : 'text-base'
                  }`}
                >
                  GST (10%):
                </span>
                <span
                  className={`font-semibold text-[rgba(10,10,10,1)] ${
                    forPdf ? 'text-3xl' : 'text-base'
                  }`}
                >
                  ${centsToDollars(gst)}
                </span>
              </div>
              <Separator />
              <div className="border-t-2 border-[rgba(142,81,255,1)] pt-4">
                <div className="flex justify-between items-center">
                  <span
                    className={`font-bold text-[rgba(142,81,255,1)] ${
                      forPdf ? 'text-4xl' : 'text-lg'
                    }`}
                  >
                    TOTAL AMOUNT:
                  </span>
                  <span
                    className={`font-bold text-[rgba(142,81,255,1)] ${
                      forPdf ? 'text-4xl' : 'text-lg'
                    }`}
                  >
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
