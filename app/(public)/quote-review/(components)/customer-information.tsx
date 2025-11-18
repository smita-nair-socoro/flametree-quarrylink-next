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
  forPdf?: boolean;
}

export function CustomerInformation({
  customerName,
  email,
  phone,
  billingAddress,
  forPdf = false,
}: CustomerInformationProps) {
  return (
    <div className={`bg-white ${forPdf ? 'px-10 py-6 pt-8 mb-3' : 'px-8 py-4 pt-10 mb-4'}`}>
      <h2 className={`font-semibold text-[rgba(142,81,255,1)] mb-3 ${forPdf ? 'text-4xl' : 'text-lg'}`}>
        Customer Information
      </h2>
      <Separator className="mb-3 border-gray-200" />
      <div className={`grid grid-cols-1 md:grid-cols-2 ${forPdf ? 'gap-3' : 'gap-12'}`}>
        {/* Left Column - Customer Details */}
        <div>
          <h3 className={`font-semibold text-gray-700 mb-2 ${forPdf ? 'text-2xl' : 'text-sm'}`}>Customer</h3>
          <div className="space-y-2">
            <p className={`font-semibold text-gray-900 ${forPdf ? 'text-2xl' : 'text-base'}`}>{customerName}</p>
            <p className={`text-gray-600 ${forPdf ? 'text-xl' : 'text-sm'}`}>{email}</p>
            <p className={`text-gray-600 ${forPdf ? 'text-xl' : 'text-sm'}`}>Phone: {phone}</p>
          </div>
        </div>

        {/* Right Column - Billing Address */}
        <div>
          <h3 className={`font-semibold text-gray-700 mb-2 ${forPdf ? 'text-2xl' : 'text-sm'}`}>
            Billing Address
          </h3>
          <div className="space-y-1">
            <p className={`text-gray-600 ${forPdf ? 'text-xl' : 'text-sm'}`}>{billingAddress.line1}</p>
            <p className={`text-gray-600 ${forPdf ? 'text-xl' : 'text-sm'}`}>{billingAddress.line2}</p>
            <p className={`text-gray-600 ${forPdf ? 'text-xl' : 'text-sm'}`}>{billingAddress.country}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
