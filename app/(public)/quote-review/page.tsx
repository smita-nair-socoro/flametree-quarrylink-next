'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import QuoteReviewDocument from './components/quote-review-document';

function QuoteReviewContent() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId') || '0';
  const payload = searchParams.get('payload') || undefined;

  return <QuoteReviewDocument quoteId={quoteId} payloadParam={payload} />;
}

export default function QuoteReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quotation...</p>
          </div>
        </div>
      }
    >
      <QuoteReviewContent />
    </Suspense>
  );
}
