'use client';

import { CircleCheck, CircleX } from 'lucide-react';

export type QuoteStatus = 'approved' | 'declined' | null;

interface QuoteStatusBannerProps {
  status: QuoteStatus;
  accountManagerName: string;
}

export function QuoteStatusBanner({
  status,
  accountManagerName,
}: QuoteStatusBannerProps) {
  if (!status) return null;

  const isApproved = status === 'approved';

  return (
    <div className="px-8 py-4 mt-4">
      <div
        className={`rounded-lg border-2 p-4 ${
          isApproved
            ? 'bg-[#F0FDF4] border-[#B9F8CF]'
            : 'bg-[#FEF2F2] border-[#FB2C36]'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 ${
              isApproved ? 'text-[#0D542B]' : 'text-[#E7000B]'
            }`}
          >
            {isApproved ? (
              <CircleCheck className="h-6 w-6 text-[#00A63E]" />
            ) : (
              <CircleX className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1">
            <h3
              className={`text-lg font-semibold mb-2 ${
                isApproved ? 'text-[#008236]' : 'text-[#82181A]'
              }`}
            >
              {isApproved ? 'Quote Approved' : 'Quote Declined'}
            </h3>
            {isApproved ? (
              <p className="text-sm text-[#016630]">
                Thank you for approving this quote! Your account manager{' '}
                <span className="font-semibold">{accountManagerName}</span>{' '}
                has been notified and will be in touch with you shortly to
                proceed with the next steps.
              </p>
            ) : (
              <p className="text-sm text-[#9F0712]">
                This quote has been declined. Your account manager{' '}
                <span className="font-semibold">{accountManagerName}</span>{' '}
                has been notified. They will reach out to you shortly to
                discuss your requirements or you can contact them directly for
                further assistance.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
