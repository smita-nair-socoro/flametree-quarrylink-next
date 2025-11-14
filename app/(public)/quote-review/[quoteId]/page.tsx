import { Suspense } from 'react';
import QuoteReviewDocument from '../components/quote-review-document';

type PageProps = {
  params: Promise<{ quoteId: string }>;
  searchParams: Promise<{ payload?: string }>;
};

export default async function QuoteReviewPage({
  params,
  searchParams,
}: PageProps) {
  const { quoteId } = await params;
  const { payload } = await searchParams;

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
      <QuoteReviewDocument quoteId={quoteId} payloadParam={payload} />
    </Suspense>
  );
}
