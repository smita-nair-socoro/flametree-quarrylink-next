'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import QuoteReviewDocument from './(components)/quote-review-document';
import QuoteExpired from './(components)/quote-expired';
import {
  fetchPublicQuoteByToken,
  fetchQuotePreview,
} from '@/lib/api/quotation';
import { Spinner } from '@/components/ui/spinner';
import { PublicQuoteLinkResponse } from '@/lib/types/quotation';

function QuoteReviewContent() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId') || '0';
  const token = searchParams.get('token');
  // Preview mode: inclDeliveryCost parameter controls delivery price display
  const inclDeliveryCostParam = searchParams.get('inclDeliveryCost');
  const isPreviewMode = inclDeliveryCostParam !== null;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [quoteData, setQuoteData] = useState<PublicQuoteLinkResponse | null>(
    null,
  );

  useEffect(() => {
    // Case 1: Authenticated preview mode (admin previewing before sending)
    if (isPreviewMode && quoteId && quoteId !== '0') {
      setIsLoading(true);
      setError(null);

      fetchQuotePreview(Number(quoteId))
        .then((res) => {
          // Override inclDeliveryCost with the URL parameter value
          const inclDeliveryCost = inclDeliveryCostParam === 'true';
          res.quoteDto.inclDeliveryCost = inclDeliveryCost;
          setQuoteData(res);
        })
        .catch((err) => {
          console.error('Failed to fetch quote preview:', err);
          setError('Failed to load preview data.');
        })
        .finally(() => setIsLoading(false));
      return;
    }

    // Case 2: Public access with token (customer viewing via email link)
    if (!token) {
      setError('Link token is missing.');
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchPublicQuoteByToken(token)
      .then((res) => {
        setQuoteData(res);
      })
      .catch((err) => {
        console.error('Failed to fetch public quote link:', err);
        // Check if the error indicates an expired quote
        const errorMessage = err?.message || '';
        if (
          errorMessage.includes('Current status is EXPIRED') ||
          errorMessage.includes('Quote expired on')
        ) {
          setIsExpired(true);
        } else {
          setError('Link is invalid.');
        }
      })
      .finally(() => setIsLoading(false));
  }, [token, isPreviewMode, quoteId, inclDeliveryCostParam]);

  if (!token && !isPreviewMode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600 text-center px-4">
          Invalid quote link (missing token or preview data).
        </p>
      </div>
    );
  }

  // Show expired page when quote is expired (detected from API error)
  if (isExpired) {
    return <QuoteExpired />;
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
      {!isLoading && !error && quoteData && (
        <QuoteReviewDocument
          quoteId={quoteId}
          quoteData={quoteData}
          token={token || ''}
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
