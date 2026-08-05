'use client';

import { Trash2 } from 'lucide-react';
import { QuoteContentLibraryItem } from '@/lib/types/terms-conditions';
import { formatFileSize } from '@/lib/utils/number';

function RemoveItemDescription({
  item,
  typeLabel,
}: Readonly<{
  item: QuoteContentLibraryItem;
  typeLabel: string;
}>) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center items-center bg-[#FFE2E2] rounded-full flex-shrink-0">
        <Trash2 className="h-[20px] w-[20px] text-[#E7000B]" />
      </div>
      <div className="flex flex-col">
        <span className="text-[16px] text-[#101828] font-medium">
          {item.name}
        </span>
        <span className="text-[14px] text-[#6A7282]">{typeLabel}</span>
      </div>
    </div>
  );
}

const REMOVAL_EFFECTS = [
  'Item is removed from the quote content library',
  'New quotes will no longer see this option',
  'Existing quotes keep their saved attachment selection',
];

function RemovalWarning({
  children,
}: Readonly<{ children?: React.ReactNode }>) {
  return (
    <>
      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to remove this item from your quote content
        library?
      </span>

      <div className="rounded-md border border-[#E80510] bg-[#FFE2E2] p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-[#E7000B] flex-shrink-0" />
          <span className="text-[16px] font-medium text-[#E80510]">
            Content Removal
          </span>
        </div>
        <span className="text-[14px] text-[#E80510] pl-6">
          This item will be removed from your library. Existing quotes that
          already included it will keep their saved content.
        </span>
      </div>

      {children}

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-semibold text-gray-900">
          What happens when this item is removed:
        </span>
        <ul className="flex flex-col gap-1 pl-1">
          {REMOVAL_EFFECTS.map((line) => (
            <li key={line} className="flex gap-2 text-[14px] text-[#6A7282]">
              <span className="mt-[6px] h-[5px] w-[5px] rounded-full bg-[#6A7282] flex-shrink-0" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ─── Text Template ────────────────────────────────────────────────────────────

export function RemoveTextTemplateDescription({
  item,
}: Readonly<{
  item: QuoteContentLibraryItem;
}>) {
  return <RemoveItemDescription item={item} typeLabel="Text template" />;
}

export function RemoveTextTemplateContent() {
  return (
    <div className="flex flex-col gap-5">
      <RemovalWarning />
    </div>
  );
}

// ─── External Link ────────────────────────────────────────────────────────────

export function RemoveExternalLinkDescription({
  item,
}: {
  item: QuoteContentLibraryItem;
}) {
  return <RemoveItemDescription item={item} typeLabel="External link" />;
}

export function RemoveExternalLinkContent({ url }: { url?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <RemovalWarning />
      {url && (
        <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-[14px] text-[#6A7282]">URL:</span>
          <span className="text-[14px] text-[#101828] truncate">{url}</span>
        </div>
      )}
    </div>
  );
}

// ─── Policy Document ────────────────────────────────────────────────────────────

export function RemoveDocumentDescription({
  item,
}: Readonly<{
  item: QuoteContentLibraryItem;
}>) {
  return <RemoveItemDescription item={item} typeLabel="Uploaded document" />;
}

export function RemoveDocumentContent({
  fileName,
  fileSizeBytes,
}: Readonly<{
  fileName?: string;
  fileSizeBytes?: number;
}>) {
  return (
    <div className="flex flex-col gap-5">
      <RemovalWarning>
        {fileName && (
          <div className="rounded-md border border-[#E5E7EB] bg-[#E5E5E5] px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[14px] text-[#6A7282]">File:</span>
              <span className="text-[14px] text-[#101828]">{fileName}</span>
            </div>
            {fileSizeBytes != null && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[14px] text-[#6A7282]">
                  File size:
                </span>
                <span className="text-[14px] text-[#101828]">
                  {formatFileSize(fileSizeBytes)}
                </span>
              </div>
            )}
          </div>
        )}
      </RemovalWarning>
    </div>
  );
}
