/**
 * Proceed Actions PDF Preview Component
 * Renders the approval/decline actions for PDF export with clickable hyperlinks
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface ProceedActionsPdfPreviewProps {
  validUntil: string;
  accountManager: string;
  quoteId: string;
  baseUrl?: string;
  status?: 'PENDING' | 'APPROVED' | 'DECLINED' | 'DRAFT';
}

export function ProceedActionsPdfPreview({
  validUntil,
  accountManager,
  quoteId,
  baseUrl = 'https://quarrylink.com',
  status,
}: ProceedActionsPdfPreviewProps) {
  const approveUrl = `${baseUrl}/quote-review?quoteId=${quoteId}&action=approve`;
  const declineUrl = `${baseUrl}/quote-review?quoteId=${quoteId}&action=decline`;

  // Only show buttons for PENDING status
  if (status !== 'PENDING' && status !== 'DRAFT') {
    return null;
  }

  return (
    <div className="bg-[rgba(245,245,245,0.5)] px-8 py-12">
      {/* Heading Section */}
      <div className="text-center mb-12">
        <h2 className="text-[28px] font-bold text-[rgba(10,10,10,1)] mb-4">
          Ready to Proceed?
        </h2>
        <p className="text-[15px] text-[rgba(115,115,115,1)] max-w-3xl mx-auto">
          Please review the quotation details above and select your preferred
          action below. We're here to help with any questions or modifications
          you may need.
        </p>
      </div>

      {/* Action Buttons - Using anchor tags for PDF hyperlinks */}
      <div className="flex justify-center gap-2 mb-10">
        <a
          href={declineUrl}
          className="inline-block no-underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            size="lg"
            className="bg-[rgba(231,0,11,1)] text-white px-10 py-6 text-base font-medium rounded-md hover:bg-[rgba(231,0,11,0.9)] cursor-pointer"
            asChild
          >
            <span>Decline Quote</span>
          </Button>
        </a>
        <a
          href={approveUrl}
          className="inline-block no-underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            size="lg"
            className="bg-[rgba(0,130,54,1)] text-white px-10 py-6 text-base font-medium rounded-md hover:bg-[rgba(0,130,54,0.9)] cursor-pointer"
            asChild
          >
            <span>Approve Quote</span>
          </Button>
        </a>
      </div>

      {/* Contact Card */}
      <Card className="max-w-lg mx-auto bg-white border border-[#E5E5E5] shadow-sm mb-10">
        <div className="p-4 text-center">
          <p className="mb-4 text-sm text-[#737373]">
            This quotation is valid until{' '}
            <span className="font-bold text-[#8E51FF]">{validUntil}</span>
          </p>

          <p className="text-sm text-[#737373]">
            Need assistance? Contact your account manager{' '}
            <span className="font-semibold text-[#8E51FF]">
              {accountManager}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}
