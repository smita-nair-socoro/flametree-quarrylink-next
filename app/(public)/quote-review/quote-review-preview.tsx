'use client';

import type { Quotation } from '@/lib/types/quotation';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

type QuoteReviewPreviewProps = {
  svgMarkup?: string;
};

const parsePreviewPayload = (raw?: string | null) => {
  if (!raw) return null;

  try {
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded) as Quotation;
  } catch (error) {
    console.error('Unable to parse quote preview payload:', error);
    return null;
  }
};

export default function QuoteReviewPreview({
  svgMarkup,
}: QuoteReviewPreviewProps) {
  const searchParams = useSearchParams();

  const previewQuotation = useMemo(
    () => parsePreviewPayload(searchParams.get('payload')),
    [searchParams]
  );

  const quoteId = searchParams.get('quoteId') ?? 'preview';

  const summaryFields = [
    { label: 'Customer', value: previewQuotation?.customer_name },
    { label: 'Customer Email', value: previewQuotation?.customer_email },
    { label: 'Account Manager', value: previewQuotation?.account_manager_name },
    { label: 'Project', value: previewQuotation?.project_name },
    {
      label: 'Total Sell (ex GST)',
      value: previewQuotation?.total_sell_price
        ? `$${(previewQuotation.total_sell_price / 100).toFixed(2)}`
        : undefined,
    },
    {
      label: 'Expiry Date',
      value: previewQuotation?.expiry_date
        ? new Date(previewQuotation.expiry_date).toLocaleDateString()
        : undefined,
    },
    { label: 'Status', value: previewQuotation?.status },
  ];

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="mx-auto flex max-w-[1024px] flex-col gap-6">
        <section className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
            Quote Review
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Draft Quote {quoteId}
          </h1>
          <p className="mt-2 text-base text-slate-600">
            This is the public preview that gets emailed to the customer. The
            view currently renders a static mock (see{' '}
            <code className="rounded bg-slate-200 px-1 py-0.5 text-xs">
              app/svg1.svg
            </code>
            ) until the quote API is wired up.
          </p>
        </section>

        {previewQuotation && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              {summaryFields.map((field) => (
                <div key={field.label} className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {field.label}
                  </p>
                  <p className="text-base font-medium text-slate-900">
                    {field.value ?? '—'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-xl">
          {svgMarkup ? (
            <div
              aria-label="Quote mock"
              className="flex justify-center overflow-hidden rounded-3xl bg-white"
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center p-10 text-center">
              <p className="text-lg font-semibold text-slate-800">
                Unable to render quote mock
              </p>
              <p className="mt-2 max-w-md text-slate-500">
                The SVG reference at <code>app/svg1.svg</code> could not be
                loaded. Please verify the file exists or replace this section
                with dynamic quote content.
              </p>
            </div>
          )}
        </section>

        {previewQuotation && (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-left shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              Raw quotation payload
            </p>
            <pre className="mt-2 max-h-[360px] overflow-auto rounded-2xl bg-slate-900/90 p-4 text-xs text-slate-100">
              {JSON.stringify(previewQuotation, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </main>
  );
}
