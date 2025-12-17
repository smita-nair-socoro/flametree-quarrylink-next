'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import QuoteReviewDocument from './(components)/quote-review-document';
import { fetchPublicQuoteByToken } from '@/lib/api/quotation';
import { Spinner } from '@/components/ui/spinner';
import { PublicQuoteLinkResponse } from '@/lib/types/quotation';

function QuoteReviewContent() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId') || '0';
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<PublicQuoteLinkResponse | null>(
    null
  );

  useEffect(() => {
    if (!token) {
      setError('Link token is missing.');
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchPublicQuoteByToken(token)
      .then((res) => {
        console.log('[QuoteReview] public link payload:', res);
        setQuoteData(res);
      })
      .catch((err) => {
        console.error('Failed to fetch public quote link:', err);
        setError('Link is invalid or has expired.');
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600 text-center px-4">
          Invalid quote link (missing token).
        </p>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <Spinner className="mr-2" />
          <div className="text-sm text-gray-600">Loading quotation...</div>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center py-6">
          <div className="text-sm text-red-600 text-center px-4">{error}</div>
        </div>
      )}
      {!isLoading && !error && quoteData && token && (
        <QuoteReviewDocument
          quoteId={quoteId}
          quoteData={quoteData}
          token={token}
        />
      )}
    </>
  );
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
