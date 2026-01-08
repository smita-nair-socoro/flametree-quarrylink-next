'use client';

import { Separator } from '@/components/ui/separator';

export interface CustomerInformationProps {
  customerName: string;
  email: string;
  phone: string;
  billingAddress: {
    line1: string;
    line2: string;
    line3: string;
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
      <h2 className="mb-3 text-lg text-[#8E51FF] font-semibold">
        Customer Information
      </h2>
      <Separator className="mb-3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column - Customer Details */}
        <div>
          <h3 className="font-semibold mb-2 text-sm text-gray-700">
            Customer
          </h3>
          <div className="space-y-2">
            <p className="font-semibold text-gray-900 text-base">
              {customerName}
            </p>
            <p className="text-sm text-gray-600">{email}</p>
            <p className="text-sm text-gray-600">Phone: {phone}</p>
          </div>
        </div>

        {/* Right Column - Billing Address */}
        <div>
          <h3 className="font-semibold text-sm text-gray-700">
            Billing Address
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{billingAddress.line1}</p>
            <p>{billingAddress.line2}</p>
            <p>{billingAddress.line3}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
