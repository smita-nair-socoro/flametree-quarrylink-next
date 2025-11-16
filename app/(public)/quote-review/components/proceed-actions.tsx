'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface ProceedActionsProps {
  validUntil: string;
  accountManager: string;
  avatarUrl?: string;
  avatarFallback?: string;
  onApprove: () => void;
  onDecline: () => void;
}

export function ProceedActions({
  validUntil,
  accountManager,

  onApprove,
  onDecline,
}: ProceedActionsProps) {
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

      {/* Contact Card */}
      <Card className="max-w-lg mx-auto bg-white border border-[#E5E5E5] shadow-sm mb-10">
        <div className="p-4 text-center">
          <p className="mb-4 text-sm  text-[#737373]">
            This quotation is valid until{" "}
            <span className="font-bold text-[#8E51FF]">{validUntil}</span>
          </p>

          <p className="text-sm text-[#737373]">
            Need assistance? Contact your account manager{" "}
            <span className="font-semibold text-[#8E51FF]"> 
              {accountManager}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}
