'use client';

import { MessageSquare, FileText, Link as LinkIcon, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export interface QuoteDocumentFile {
  id: string;
  type: 'file';
  name: string;
  fileType: string;
  fileName: string;
  fileSizeLabel: string;
  url: string;
}

export interface QuoteDocumentLink {
  id: string;
  type: 'link';
  name: string;
  url: string;
}

export type QuoteDocument = QuoteDocumentFile | QuoteDocumentLink;

export interface TermsAndConditionsProps {
  notes?: string[];
  terms?: string[];
  documents?: QuoteDocument[];
}

export const DUMMY_NOTES = [
  'Site access is via the rear loading dock on Rosella Circuit. Please call John on 0412 345 678 at least 30 minutes before arrival.',
  'Deliveries are restricted to 2:00 PM – 4:00 PM as noted above. A signed delivery docket is required on every drop.',
];

export const DUMMY_TERMS = [
  'Prices quoted are valid until the expiry date shown on this quote and are exclusive of GST unless stated otherwise.',
  'Delivery times are estimates only and may vary due to weather, site access, or operational constraints.',
  'The customer must provide safe and reasonable site access for delivery vehicles.',
  "Payment terms apply as per the customer's account arrangement with the supplier.",
  'Title to goods passes to the customer upon delivery unless otherwise agreed in writing.',
  'The supplier reserves the right to suspend supply where accounts are overdue.',
];

export const DUMMY_DOCUMENTS: QuoteDocument[] = [
  {
    id: 'standard-supply-policy',
    type: 'file',
    name: 'Standard Supply Policy',
    fileType: 'PDF',
    fileName: 'standard-supply-policy.pdf',
    fileSizeLabel: '242.5 KB',
    url: '#',
  },
  {
    id: 'credit-policy',
    type: 'link',
    name: 'Credit Policy (SharePoint)',
    url: 'https://company.sharepoint.com/sites/policies/credit-policy',
  },
  {
    id: 'whs-site-safety',
    type: 'link',
    name: 'WHS Site Safety Requirements',
    url: 'https://drive.google.com/file/d/example-whs-policy',
  },
];

export function TermsAndConditions({
  notes = DUMMY_NOTES,
  terms = DUMMY_TERMS,
  documents = DUMMY_DOCUMENTS,
}: TermsAndConditionsProps) {
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
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <ol className="list-decimal list-outside pl-5 space-y-1.5 text-sm text-gray-700">
              {terms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ol>
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
            By approving this quote, the customer acknowledges these
            documents.
          </p>
        </div>
      )}
    </div>
  );
}
