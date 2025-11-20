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

const pdfStyles = {
  title: { letterSpacing: '0.5px', fontWeight: 600 } as const,
  label: {
    letterSpacing: '0.3px',
    lineHeight: '13px',
    fontWeight: 400,
  } as const,
  billingLabel: {
    color: '#4A5565',
    letterSpacing: '0.3px',
    lineHeight: '26px',
    fontWeight: 400,
  } as const,
  address: { lineHeight: '16px' } as const,
};

export function CustomerInformation({
  customerName,
  email,
  phone,
  billingAddress,
  forPdf = false,
}: CustomerInformationProps) {
  return (
    <div
      className={`bg-white ${
        forPdf ? 'px-10 py-6 pt-2 mb-3' : 'px-8 py-4 pt-10 mb-4'
      }`}
    >
      <h2
        className={`mb-3 ${
          forPdf
            ? 'text-3xl text-[#9810FA] pb-2'
            : 'text-lg text-[#8E51FF] font-semibold'
        }`}
        style={forPdf ? pdfStyles.title : undefined}
      >
        Customer Information
      </h2>
      <Separator className={`${forPdf ? 'hidden' : 'mb-3'}`} />
      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${
          forPdf ? 'gap-2 mt-4' : 'gap-12'
        }`}
      >
        {/* Left Column - Customer Details */}
        <div>
          <h3
            className={`font-semibold mb-2 ${
              forPdf ? 'text-2xl text-[#4A5565]' : 'text-sm text-gray-700'
            }`}
            style={forPdf ? pdfStyles.label : undefined}
          >
            Customer
          </h3>
          <div className="space-y-2">
            <p
              className={`font-semibold text-gray-900 ${
                forPdf ? 'text-3xl' : 'text-base'
              }`}
            >
              {customerName}
            </p>
            <p
              className={` ${
                forPdf
                  ? 'text-2xl text-[#4A5565] mb-2'
                  : 'text-sm text-gray-600'
              }`}
              style={forPdf ? pdfStyles.label : undefined}
            >
              {email}
            </p>
            <p
              className={` ${
                forPdf ? 'text-2xl text-[#4A5565]' : 'text-sm text-gray-600'
              }`}
              style={forPdf ? pdfStyles.label : undefined}
            >
              Phone: {phone}
            </p>
          </div>
        </div>

        {/* Right Column - Billing Address */}
        <div>
          <h3
            className={`font-semibold ${
              forPdf ? 'text-2xl' : 'text-sm text-gray-700'
            }`}
            style={forPdf ? pdfStyles.billingLabel : undefined}
          >
            Billing Address
          </h3>
          <div
            className={`${
              forPdf
                ? 'text-[28px] text-[#0A0A0A]'
                : 'text-sm text-gray-600 space-y-1'
            }`}
            style={forPdf ? pdfStyles.address : undefined}
          >
            <p>{billingAddress.line1}</p>
            <p>{billingAddress.line2}</p>
            <p>{billingAddress.country}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
