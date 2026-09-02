'use client';

import * as React from 'react';
import {
  Package,
  CircleCheckBig,
  CircleAlert,
  Eye,
  Upload,
  X,
} from 'lucide-react';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';
import { Input } from '@/components/ui/input';
import { Signature } from '@/components/ui/signature';
import { DocketDTO } from '@/lib/types/docket';
import { formatUomLabel } from '@/lib/utils/docket-helper';
import { acceptImageFile } from '@/lib/utils/image-file-size';
import { EMPTY_COLLECTION_PROOF_CONFIRMATION } from '@/lib/utils/collection-proof';

export function MarkCollectedDescription({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
  const productLabel =
    docket?.jobItem?.product?.productCode ||
    docket?.jobItem?.product?.productName ||
    '—';

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#E8F5EC]">
        <Package className="h-5 w-5 text-[#16A34A]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-[#111827]">
          {docket?.docketNumber ?? '—'}
        </span>
        <div className="flex items-center gap-2 text-sm text-[#6A7282]">
          <span>{productLabel}</span>
          <span className="font-bold">•</span>
          <span>
            {docket?.actualLoadSize || docket?.plannedLoadSize}{' '}
            {formatUomLabel(docket?.jobItem?.productSellUom ?? '')}
          </span>
        </div>
      </div>
    </div>
  );
}

interface CollectionPhotoSlotProps {
  label: string;
  photo: File | null;
  onPhotoChange: (file: File | null) => void;
  onPreview: (src: string, title: string) => void;
}

function CollectionPhotoSlot({
  label,
  photo,
  onPhotoChange,
  onPreview,
}: CollectionPhotoSlotProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const previewUrl = React.useMemo(
    () => (photo ? URL.createObjectURL(photo) : ''),
    [photo],
  );

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-[#374151]">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          acceptImageFile(event.target.files?.[0], onPhotoChange, label);
          event.currentTarget.value = '';
        }}
      />
      {previewUrl ? (
        <div className="flex flex-col gap-2">
          <div className="relative overflow-hidden rounded-md border border-[#D1D5DB] bg-[#F9FAFB]">
            <img
              src={previewUrl}
              alt={`Uploaded ${label}`}
              className="h-36 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onPreview(previewUrl, label)}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/30 text-white transition-colors hover:bg-black/40"
              aria-label={`Preview ${label}`}
            >
              <Eye className="mb-2 h-6 w-6" />
              <span className="flex items-center gap-2 text-sm font-medium">
                <CircleCheckBig className="h-4 w-4 text-[#22C55E]" />
                Photo Uploaded
              </span>
            </button>
            <button
              type="button"
              onClick={() => onPhotoChange(null)}
              className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-3 text-[#374151] shadow"
              aria-label={`Remove ${label}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-[#6B7280] underline underline-offset-2 transition-colors hover:text-[#374151]"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onPhotoChange(null)}
              className="text-xs text-[#6B7280] underline underline-offset-2 transition-colors hover:text-[#374151]"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-36 w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] text-[#9CA3AF] transition-colors hover:border-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280]"
        >
          <Upload className="mb-2 h-7 w-7" />
          <span className="text-sm">Tap to upload photo</span>
        </button>
      )}
    </div>
  );
}

interface MarkCollectedContentProps {
  docket?: DocketDTO | null;
  photo1: File | null;
  onPhoto1Change: (file: File | null) => void;
  photo2: File | null;
  onPhoto2Change: (file: File | null) => void;
  collectorName: string;
  onCollectorNameChange: (value: string) => void;
  collectorSignature: string;
  onCollectorSignatureChange: (value: string) => void;
  onClearSignature: () => void;
  collectorNameError?: string;
  emptyProofConfirming?: boolean;
  onDismissEmptyProofConfirm?: () => void;
}

export function MarkCollectedContent({
  photo1,
  onPhoto1Change,
  photo2,
  onPhoto2Change,
  collectorName,
  onCollectorNameChange,
  collectorSignature,
  onCollectorSignatureChange,
  onClearSignature,
  collectorNameError,
  emptyProofConfirming,
  onDismissEmptyProofConfirm,
}: MarkCollectedContentProps) {
  const [previewImage, setPreviewImage] = React.useState<{
    src: string;
    title: string;
  } | null>(null);

  return (
    <>
      <ImagePreviewDialog
        open={previewImage !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null);
        }}
        src={previewImage?.src ?? ''}
        alt={previewImage?.title ?? 'Photo preview'}
        title={previewImage?.title ?? 'Photo Preview'}
      />
      <div className="flex flex-col gap-6">
        {emptyProofConfirming ? (
          <div className="rounded-md border border-[#FEF08A] bg-[#FFFBEB] px-4 py-4">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#CA8A04]" />
              <div className="flex flex-1 flex-col gap-2">
                <span className="text-sm text-[#A16207]">
                  {EMPTY_COLLECTION_PROOF_CONFIRMATION}
                </span>
                <button
                  type="button"
                  onClick={onDismissEmptyProofConfirm}
                  className="w-fit text-xs text-[#A16207] underline underline-offset-2 hover:text-[#854D0E]"
                >
                  Go back
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-[#111827]">
            Proof of Collection
          </h3>

          <CollectionPhotoSlot
            label="Photo 1"
            photo={photo1}
            onPhotoChange={onPhoto1Change}
            onPreview={(src, title) => setPreviewImage({ src, title })}
          />

          <CollectionPhotoSlot
            label="Photo 2"
            photo={photo2}
            onPhotoChange={onPhoto2Change}
            onPreview={(src, title) => setPreviewImage({ src, title })}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#374151]">
              Collector Name
              {collectorSignature.trim() ? (
                <span className="text-[#111827]"> *</span>
              ) : null}
            </label>
            <Input
              value={collectorName}
              onChange={(event) => onCollectorNameChange(event.target.value)}
              placeholder="Enter collector name"
            />
            {collectorNameError ? (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                {collectorNameError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#374151]">
                Collector Signature
              </label>
              <button
                type="button"
                onClick={onClearSignature}
                className="text-xs text-[#6B7280] underline underline-offset-2 transition-colors hover:text-[#374151]"
              >
                Clear
              </button>
            </div>
            <Signature
              value={collectorSignature}
              onChange={onCollectorSignatureChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}
