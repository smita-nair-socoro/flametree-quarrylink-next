'use client';

import { useState } from 'react';
import {
  MessageSquare,
  FileText,
  Link as LinkIcon,
  Download,
  ChevronDown,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { notifyError } from '@/lib/toast';
import type {
  QuoteTermItem,
  QuoteDocument,
  QuoteDocumentFile,
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleTerm = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const downloadDocumentFile = async (
    e: React.MouseEvent,
    doc: QuoteDocumentFile,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch(doc.url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName || doc.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      notifyError('Failed to download the file.');
    }
  };

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
            {terms.map((term) => {
              const expanded = expandedIds.has(term.id);
              return (
                <div
                  key={term.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 text-left cursor-pointer"
                    onClick={() => toggleTerm(term.id)}
                    aria-expanded={expanded}
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {term.name}
                    </p>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expanded && (
                    <div
                      className="rte-output text-sm text-gray-700 mt-2"
                      dangerouslySetInnerHTML={{ __html: term.content }}
                    />
                  )}
                </div>
              );
            })}
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
                <div
                  key={doc.id}
                  className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 hover:border-[#8E51FF] transition-colors"
                >
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 min-w-0 items-center gap-3"
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
                  </a>
                  <button
                    type="button"
                    aria-label={`Download ${doc.name}`}
                    onClick={(e) => downloadDocumentFile(e, doc)}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-gray-400 transition-colors group-hover:text-[#8E51FF]" />
                  </button>
                </div>
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
