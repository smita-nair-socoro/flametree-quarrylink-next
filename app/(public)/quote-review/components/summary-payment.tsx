'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
    <div className="bg-gray-50 px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Summary */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Summary</h2>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3">
              <p className="text-lg text-gray-900">
                <span className="font-semibold">Total Products:</span>{' '}
                {totalProducts} items
              </p>
              {avatarUrl && (
                <Avatar className="w-10 h-10 border-2 border-green-500">
                  <AvatarImage src={avatarUrl} alt="Account Manager" />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              )}
            </div>

            <p className="text-lg text-gray-900">
              <span className="font-semibold">Total Quantity:</span>{' '}
              {totalQuantity}
            </p>

            <p className="text-lg text-gray-900">
              <span className="font-semibold">Estimated Delivery:</span>{' '}
              {estimatedDelivery}
            </p>
          </div>

          {/* Terms & Conditions */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Terms & Conditions
            </h3>
            <ul className="space-y-2">
              {termsAndConditions.map((term, index) => (
                <li key={index} className="text-base text-gray-600 flex">
                  <span className="mr-2">•</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Payment Breakdown */}
        <div>
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900">
                  Subtotal:
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900">
                  GST (10%):
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(gst)}
                </span>
              </div>

              <div className="border-t-2 border-purple-600 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-purple-600">
                    TOTAL AMOUNT:
                  </span>
                  <span className="text-3xl font-bold text-purple-600">
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
