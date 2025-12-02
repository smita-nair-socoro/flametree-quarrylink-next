'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuoteExpired() {
  const handleContactSales = () => {
    // TODO: Implement contact sales logic (e.g., redirect to contact page or open email)
    window.location.href = 'mailto:support@company.com';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
          This Quote Has Expired
        </h1>

        {/* Description */}
        <p className="text-center text-gray-600 mb-8">
          Unfortunately, this quote is no longer valid. Quotes typically expire
          after 30 days to ensure pricing accuracy.
        </p>

        {/* Need a new quote section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            Need a new quote?
          </h2>
          <p className="text-sm text-gray-600">
            Contact our sales team to request an updated quote with current
            pricing and terms.
          </p>
        </div>

        {/* Contact Sales Button */}
        <Button
          onClick={handleContactSales}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-6 rounded-lg mb-6"
        >
          Contact Sales
        </Button>

        {/* Support Email */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Questions? Email us at{' '}
            <a
              href="mailto:support@company.com"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              support@company.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
