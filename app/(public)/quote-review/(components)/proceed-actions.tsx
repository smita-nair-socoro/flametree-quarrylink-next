'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CircleCheck, CircleX } from 'lucide-react';
import { QUOTE_STATUS as QuoteStatus } from '@/lib/types/quotation-enums';

export interface ProceedActionsProps {
  validUntil: string;
  status?: QuoteStatus;
  onApprove: () => void;
  onDecline: () => void;
}

export function ProceedActions({
  validUntil,
  status = QuoteStatus.PENDING,
  onApprove,
  onDecline,
}: ProceedActionsProps) {
  // Render approved state
  if (status === QuoteStatus.APPROVED) {
    return (
      <div className="bg-[rgba(245,245,245,0.5)] px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Green Check Icon */}
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center">
              <CircleCheck className="w-10 h-10 text-[#00A63E]" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-[28px] font-bold text-[#0A0A0A] mb-4">
            Quote Approved
          </h2>

          {/* Info Box */}
          <p className="text-base text-center text-[#737373] mb-4 max-w-[620px] mx-auto">
            This quote has been approved and is now being processed. We will
            contact you with the next steps.
          </p>
        </div>
      </div>
    );
  }

  // Render declined state
  if (status === QuoteStatus.DECLINED) {
    return (
      <div className="bg-[rgba(245,245,245,0.5)] px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Red X Icon */}
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-[#FFE2E2] flex items-center justify-center">
              <CircleX className="w-10 h-10 text-[#E7000B]" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-[28px] font-bold text-[#0A0A0A] mb-4">
            Quote Declined
          </h2>

          {/* Description */}
          <p className="text-base text-[#737373] mb-4 max-w-[620px] mx-auto">
            This quote has been declined. We will be in touch to discuss
            alternative options.
          </p>
        </div>
      </div>
    );
  }

  // Render default pending state
  return (
    <div className="bg-[rgba(245,245,245,0.5)] px-8 py-12">
      {/* Heading Section */}
      <div className="text-center mb-12">
        <h2 className="text-[28px] font-bold text-[rgba(10,10,10,1)] mb-4">
          Ready to Proceed?
        </h2>
        <p className="text-[15px] text-[rgba(115,115,115,1)] max-w-3xl mx-auto">
          Please review the quotation details above and select your preferred
          action below. We&apos;re here to help with any questions or
          modifications you may need.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 mb-10">
        <Button
          onClick={onDecline}
          size="lg"
          className="bg-[rgba(231,0,11,1)] text-white px-10 py-6 text-base font-medium rounded-md"
        >
          Decline Quote
        </Button>
        <Button
          onClick={onApprove}
          size="lg"
          className="bg-[rgba(0,130,54,1)] text-white px-10 py-6 text-base font-medium rounded-md"
        >
          Approve Quote
        </Button>
      </div>

      {/* Validity Card */}
      <Card className="max-w-lg mx-auto bg-white border border-[#E5E5E5] shadow-sm mb-10">
        <div className="p-4 text-center">
          <p className="mb-4 text-sm  text-[#737373]">
            This quotation is valid until{' '}
            <span className="font-bold text-[#8E51FF]">{validUntil}</span>
          </p>
        </div>
      </Card>
    </div>
  );
}
