'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type QuoteExpiredProps = {
  accountManagerEmail?: string;
  businessEmail?: string;
};

export default function QuoteExpired({
  accountManagerEmail = 'AccountManager@quarrylink.com.au',
  businessEmail = 'support@quarrylink.com.au',
}: QuoteExpiredProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#D187001A] flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[#CB8A00]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-center text-[#090B0F] mb-8">
          This Quote Has Expired
        </h1>

        {/* Description */}
        <p className="text-center text-[#67696F] mb-10">
          Unfortunately, this quote is no longer valid. Quotes typically expire
          after 30 days to ensure pricing accuracy.
        </p>

        {/* Need a new quote section */}
        <div className="bg-[#F2F2EE80] rounded-lg p-4 my-6">
          <h2 className="text-sm font-medium text-[#090B0F] mb-2">
            Need a new quote?
          </h2>
          <p className="text-sm text-[#67696F]">
            Contact our sales team to request an updated quote with current
            pricing and terms.
          </p>
        </div>

        {/* Contact Sales Button */}
        <Button
          asChild
          className="w-full bg-[#8E51FF] hover:bg-[#7A3FE0] text-white font-medium py-6 rounded-lg my-4"
        >
          <a href={`mailto:${accountManagerEmail}`}>Contact Sales</a>
        </Button>

        <Separator className="my-6" />
        {/* Support Email */}
        <div className="text-center">
          <p className="text-sm text-[#67696F]">
            Questions? Email us at{' '}
            <a
              href={`mailto:${businessEmail}`}
              className="text-[#090B0F] font-medium text-sm"
            >
              {businessEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
