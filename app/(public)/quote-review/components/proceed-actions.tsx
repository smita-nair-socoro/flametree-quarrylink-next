'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
  avatarUrl,
  avatarFallback = 'AM',
  onApprove,
  onDecline,
}: ProceedActionsProps) {
  return (
    <div className="bg-white px-8 py-12">
      {/* Purple top border */}
      <div className="border-t-4 border-purple-600 mb-8"></div>

      {/* Heading Section */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Ready to Proceed?
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Please review the quotation details above and select your preferred
          action below. We're here to help with any questions or modifications
          you may need.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6 mb-12">
        <Button
          onClick={onDecline}
          size="lg"
          className="bg-red-500 hover:bg-red-600 text-white px-12 py-6 text-lg font-semibold rounded-lg"
        >
          Decline Quote
        </Button>
        <Button
          onClick={onApprove}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-12 py-6 text-lg font-semibold rounded-lg"
        >
          Approve Quote
        </Button>
      </div>

      {/* Contact Card */}
      <Card className="max-w-3xl mx-auto bg-gray-50 border border-gray-200 shadow-sm">
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg text-gray-700">
              This quotation is valid until{' '}
              <span className="font-bold text-purple-600">{validUntil}</span>
            </p>
            {avatarUrl && (
              <Avatar className="w-12 h-12 border-2 border-green-500">
                <AvatarImage src={avatarUrl} alt="Account Manager" />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            )}
          </div>

          <p className="text-base text-gray-600 text-center">
            Need assistance? Contact your account manager{' '}
            <span className="font-semibold text-purple-600">
              {accountManager}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}
