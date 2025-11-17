'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import QuoteReviewDocument from './(components)/quote-review-document';

/**
 * Quote Review Content Component
 *
 * This component uses URL search params (?quoteId=123&payload=xyz) instead of
 * dynamic routes to ensure compatibility with static site deployment (S3 + CloudFront).
 *
 * CURRENT STATE:
 * - Uses hardcoded mock data (quoteId is extracted but not used for data fetching yet)
 * - Ready for backend integration when API is available
 *
 * FUTURE BACKEND INTEGRATION:
 * - Use quoteId to fetch quote data from API endpoint
 * - Use payload parameter if needed for authentication/verification
 * - Example: await fetch(`/api/quotes/${quoteId}?payload=${payload}`)
 */
function QuoteReviewContent() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId') || '0';
  const payload = searchParams.get('payload') || undefined;
  const action = searchParams.get('action');

  // Parse action parameter to determine if a dialog should auto-open
  const initialAction =
    action === 'approve' || action === 'decline'
      ? (action as 'approve' | 'decline')
      : undefined;

  // TODO: When backend is ready, fetch quote data here using quoteId
  // Example:
  // const [quoteData, setQuoteData] = useState(null);
  // useEffect(() => {
  //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotes/${quoteId}?payload=${payload}`)
  //     .then(res => res.json())
  //     .then(data => setQuoteData(data));
  // }, [quoteId, payload]);

  return (
    <QuoteReviewDocument
      quoteId={quoteId}
      payloadParam={payload}
      initialAction={initialAction}
    />
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
