'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from 'react-aria-components';

export interface SummaryPaymentProps {
  totalProducts: number;
  totalQuantity: string;
  estimatedDelivery: string;
  termsAndConditions: string[];
  subtotal: number;
  gst: number;
  total: number;
  avatarUrl?: string;
  avatarFallback?: string;
}

export function SummaryPayment({
  totalProducts,
  totalQuantity,
  estimatedDelivery,
  termsAndConditions,
  subtotal,
  gst,
  total,
  avatarUrl,
  avatarFallback = 'AM',
}: SummaryPaymentProps) {
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="bg-[rgba(245,245,245,0.3)] px-8 py-8 border-b-[1.25px] border-[rgba(229,229,229,1)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Summary */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Summary</h2>

          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-900">
                <span className="text-sm font-bold">Total Products:</span>{' '}
                {totalProducts} items
              </p>
              {avatarUrl && (
                <Avatar className="w-10 h-10 border-2 border-green-500">
                  <AvatarImage src={avatarUrl} alt="Account Manager" />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              )}
            </div>

            <p className="text-sm text-gray-900">
              <span className="text-sm font-bold">Total Quantity:</span>{' '}
              {totalQuantity}
            </p>

            <p className="text-sm text-gray-900">
              <span className="text-sm font-bold">Estimated Delivery:</span>{' '}
              {estimatedDelivery}
            </p>
          </div>

          {/* Terms & Conditions */}
          <div>
            <h3 className="text-base font-semibold text-[rgba(10,10,10,1)] mb-3">
              Terms & Conditions
            </h3>
            <ul className="space-y-2">
              {termsAndConditions.map((term, index) => (
                <li key={index} className="text-sm text-[rgba(115,115,115,1)] font-[Geist] flex">
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
            <CardContent className="px-7  space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-[rgba(10,10,10,1)]">
                  Subtotal:
                </span>
                <span className="text-base font-semibold text-[rgba(10,10,10,1)]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-[rgba(10,10,10,1)]">
                  GST (10%):
                </span>
                <span className="text-base font-semibold text-[rgba(10,10,10,1)]">
                  {formatPrice(gst)}
                </span>
              </div>
              <Separator />
              <div className="border-t-2 border-[rgba(142,81,255,1)] pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[rgba(142,81,255,1)]">
                    TOTAL AMOUNT:
                  </span>
                  <span className="text-lg font-bold text-[rgba(142,81,255,1)]">
                    {formatPrice(total)}
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
