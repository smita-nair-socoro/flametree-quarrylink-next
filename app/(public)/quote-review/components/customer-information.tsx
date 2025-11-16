'use client';

import { Separator } from '@/components/ui/separator';


export interface CustomerInformationProps {
  customerName: string;
  email: string;
  phone: string;
  billingAddress: {
    line1: string;
    line2: string;
    country: string;
  };
}

export function CustomerInformation({
  customerName,
  email,
  phone,
  billingAddress,
}: CustomerInformationProps) {
  return (
    <div className="bg-white px-8 py-4 pt-10 mb-4">
      <h2 className="text-lg font-semibold text-[rgba(142,81,255,1)] mb-3">
        Customer Information
      </h2>
      <Separator className="mb-3 border-gray-200" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column - Customer Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer</h3>
          <div className="space-y-2">
            <p className="text-base font-semibold text-gray-900 font-[Geist]">{customerName}</p>
            <p className="text-sm text-gray-600 font-[Geist]">{email}</p>
            <p className="text-sm text-gray-600 font-[Geist]">Phone: {phone}</p>
          </div>
        </div>

        {/* Right Column - Billing Address */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Billing Address
          </h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 font-[Geist]">{billingAddress.line1}</p>
            <p className="text-sm text-gray-600 font-[Geist]">{billingAddress.line2}</p>
            <p className="text-sm text-gray-600 font-[Geist]">{billingAddress.country}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
