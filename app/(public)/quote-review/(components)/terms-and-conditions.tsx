'use client';

import {
  MessageSquare,
  FileText,
  Link as LinkIcon,
  Download,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type {
  QuoteTermItem,
  QuoteDocument,
} from '@/lib/types/terms-conditions';

export type {
  QuoteTermItem,
  QuoteDocumentFile,
  QuoteDocumentLink,
  QuoteDocument,
} from '@/lib/types/terms-conditions';

export interface TermsAndConditionsProps {
  notes?: string[];
  terms?: QuoteTermItem[];
  documents?: QuoteDocument[];
}

export function TermsAndConditions({
  notes = [],
  terms = [],
  documents = [],
}: Readonly<TermsAndConditionsProps>) {
  const hasNotes = notes.length > 0;
  const hasTerms = terms.length > 0;
  const hasDocuments = documents.length > 0;

  if (!hasNotes && !hasTerms && !hasDocuments) return null;

  return (
    <div className="bg-white px-8 py-4 pt-10 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-5 w-5 text-[#8E51FF]" />
        <h2 className="text-lg text-[#8E51FF] font-semibold">Notes & Terms</h2>
      </div>
      <Separator className="mb-4" />

      {hasNotes && (
        <div className="mb-6">
          <h3 className="font-semibold text-sm text-gray-700 mb-2">Notes</h3>
          <div className="rounded-lg border border-[#E9D5FF] bg-[#FAF5FF] p-4 space-y-3">
            {notes.map((note) => (
              <p key={note} className="text-sm text-gray-700">
                {note}
              </p>
            ))}
          </div>
        </div>
      )}

      {hasTerms && (
        <div className="mb-2">
          <h3 className="font-semibold text-sm text-gray-700 mb-2">
            Terms & Conditions
          </h3>
          <div className="space-y-3">
            {terms.map((term) => (
              <div
                key={term.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  {term.name}
                </p>
                <div
                  className="rte-output text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: term.content }}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            By approving this quote, the customer acknowledges these terms and
            conditions.
          </p>
        </div>
      )}

      {hasDocuments && (
        <div className="mt-6">
          <h3 className="font-semibold text-sm text-gray-700 mb-1">
            Documents
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            The following documents and links apply to this quote.
          </p>
          <div className="space-y-2">
            {documents.map((doc) =>
              doc.type === 'file' ? (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 hover:border-[#8E51FF] transition-colors"
                >
                  <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.fileType} · {doc.fileName} · {doc.fileSizeLabel}
                    </p>
                  </div>
                  <Download className="h-4 w-4 text-gray-400 flex-shrink-0 transition-colors group-hover:text-[#8E51FF]" />
                </a>
              ) : (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 hover:border-[#8E51FF] transition-colors"
                >
                  <LinkIcon className="h-5 w-5 text-[#155DFC] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{doc.url}</p>
                  </div>
                </a>
              ),
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            By approving this quote, the customer acknowledges these documents.
          </p>
        </div>
      )}
    </div>
  );
}
