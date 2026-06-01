'use client';

import * as React from 'react';
import {
  Package,
  CircleCheckBig,
  CircleAlert,
  Clock3,
  Eye,
  Upload,
  X,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';
import { Input } from '@/components/ui/input';
import { Signature } from '@/components/ui/signature';
import { DocketDTO } from '@/lib/types/docket';
import { toast } from 'sonner';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function acceptImageFile(
  file: File | undefined,
  onChange: (file: File | null) => void,
  label: string,
) {
  if (!file) {
    onChange(null);
    return;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    toast.error(`${label} must be 5MB or smaller`);
    return;
  }
  onChange(file);
}

export function MarkDeliveredDescription({
  docket,
}: {
  docket?: DocketDTO | null;
}) {
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
          <span>{docket?.jobItem?.product?.productName ?? '—'}</span>
          <span className="font-bold">•</span>
          <span>
            {docket?.actualLoadSize || docket?.plannedLoadSize}{' '}
            {docket?.jobItem?.productSellUom === 'M3'
              ? 'm³'
              : docket?.jobItem?.productSellUom === 'KG_20'
                ? 'x 20kg'
                : docket?.jobItem?.productSellUom === 'TN'
                  ? 'TN'
                  : docket?.jobItem?.productSellUom === 'BULKA'
                    ? 'Bulka'
                    : docket?.jobItem?.productSellUom}
          </span>
        </div>
      </div>
    </div>
  );
}

interface MarkDeliveredContentProps {
  deliveredProductsConfirmed: boolean;
  onDeliveredProductsConfirmedChange: (checked: boolean) => void;
  unloadedPhoto: File | null;
  onUnloadedPhotoChange: (file: File | null) => void;
  receiptPhoto: File | null;
  onReceiptPhotoChange: (file: File | null) => void;
  receiverOnSite: boolean;
  onReceiverOnSiteChange: (checked: boolean) => void;
  receiverName: string;
  onReceiverNameChange: (value: string) => void;
  receiverSignature: string;
  onReceiverSignatureChange: (value: string) => void;
  onClearSignature: () => void;
}

export function MarkDeliveredContent({
  deliveredProductsConfirmed,
  onDeliveredProductsConfirmedChange,
  unloadedPhoto,
  onUnloadedPhotoChange,
  receiptPhoto,
  onReceiptPhotoChange,
  receiverOnSite,
  onReceiverOnSiteChange,
  receiverName,
  onReceiverNameChange,
  receiverSignature,
  onReceiverSignatureChange,
  onClearSignature,
}: MarkDeliveredContentProps) {
  const unloadedPhotoInputRef = React.useRef<HTMLInputElement>(null);
  const receiptPhotoInputRef = React.useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = React.useState<{
    src: string;
    title: string;
  } | null>(null);

  const unloadedPhotoPreviewUrl = React.useMemo(
    () => (unloadedPhoto ? URL.createObjectURL(unloadedPhoto) : ''),
    [unloadedPhoto],
  );
  const receiptPhotoPreviewUrl = React.useMemo(
    () => (receiptPhoto ? URL.createObjectURL(receiptPhoto) : ''),
    [receiptPhoto],
  );

  React.useEffect(() => {
    return () => {
      if (unloadedPhotoPreviewUrl) URL.revokeObjectURL(unloadedPhotoPreviewUrl);
      if (receiptPhotoPreviewUrl) URL.revokeObjectURL(receiptPhotoPreviewUrl);
    };
  }, [receiptPhotoPreviewUrl, unloadedPhotoPreviewUrl]);

  const waitingTime = '0h 46m';

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
        <div className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-4">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2563EB]" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-[16px] text-[#1E40AF]">
                  Waiting Time at Site
                </span>
                <span className="text-lg font-semibold text-[#1E40AF]">
                  {waitingTime}
                </span>
              </div>
              <span className="text-[13px] text-[#3B82F6]">
                Time between arrival and delivery completion will be recorded on
                the docket.
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-[#111827]">Sign Off</h3>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-[#374151]">
              Delivered Products Confirmed{' '}
              <span className="text-[#111827]">*</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-[#6A7282]">
              <Checkbox
                checked={deliveredProductsConfirmed}
                onCheckedChange={(checked) =>
                  onDeliveredProductsConfirmedChange(checked === true)
                }
              />
              <span>Please check this box</span>
            </label>
            {!deliveredProductsConfirmed && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                You must confirm the delivered products before proceeding.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-[#374151]">
              Unloaded Photo <span className="text-[#111827]">*</span>
            </label>
            <input
              ref={unloadedPhotoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                acceptImageFile(
                  event.target.files?.[0],
                  onUnloadedPhotoChange,
                  'Unloaded photo',
                );
                event.currentTarget.value = '';
              }}
            />
            {!unloadedPhotoPreviewUrl && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                Unloaded photo is required before marking as delivered.
              </p>
            )}
            {unloadedPhotoPreviewUrl ? (
              <div className="relative overflow-hidden rounded-md border border-[#D1D5DB] bg-[#F9FAFB]">
                <img
                  src={unloadedPhotoPreviewUrl}
                  alt="Uploaded unloaded photo"
                  className="h-36 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPreviewImage({
                      src: unloadedPhotoPreviewUrl,
                      title: 'Unloaded Photo',
                    })
                  }
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/30 text-white transition-colors hover:bg-black/40"
                  aria-label="Preview unloaded photo"
                >
                  <Eye className="mb-2 h-6 w-6" />
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <CircleCheckBig className="h-4 w-4 text-[#22C55E]" />
                    Photo Uploaded
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onUnloadedPhotoChange(null)}
                  className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-3 text-[#374151] shadow"
                  aria-label="Remove unloaded photo"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => unloadedPhotoInputRef.current?.click()}
                className="flex h-36 w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] text-[#9CA3AF] transition-colors hover:border-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280]"
              >
                <Upload className="mb-2 h-7 w-7" />
                <span className="text-sm">Tap to upload photo</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-[#374151]">
              Receipt Photo
            </label>
            <input
              ref={receiptPhotoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                acceptImageFile(
                  event.target.files?.[0],
                  onReceiptPhotoChange,
                  'Receipt photo',
                );
                event.currentTarget.value = '';
              }}
            />
            {receiptPhotoPreviewUrl ? (
              <div className="relative overflow-hidden rounded-md border border-[#D1D5DB] bg-[#F9FAFB]">
                <img
                  src={receiptPhotoPreviewUrl}
                  alt="Uploaded receipt photo"
                  className="h-36 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPreviewImage({
                      src: receiptPhotoPreviewUrl,
                      title: 'Receipt Photo',
                    })
                  }
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/30 text-white transition-colors hover:bg-black/40"
                  aria-label="Preview receipt photo"
                >
                  <Eye className="mb-2 h-6 w-6" />
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <CircleCheckBig className="h-4 w-4 text-[#22C55E]" />
                    Photo Uploaded
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onReceiptPhotoChange(null)}
                  className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-3 text-[#374151] shadow"
                  aria-label="Remove receipt photo"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => receiptPhotoInputRef.current?.click()}
                className="flex h-36 w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] text-[#9CA3AF] transition-colors hover:border-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280]"
              >
                <Upload className="mb-2 h-7 w-7" />
                <span className="text-sm">Tap to upload photo</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-[#374151]">
              Receiver on Site?
            </label>
            <label className="flex items-center gap-3 text-sm text-[#6A7282]">
              <Checkbox
                checked={receiverOnSite}
                onCheckedChange={(checked) =>
                  onReceiverOnSiteChange(checked === true)
                }
              />
              <span>Please check this box</span>
            </label>
          </div>

          {receiverOnSite ? (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#374151]">
                  Receiver Name <span className="text-[#111827]">*</span>
                </label>
                <Input
                  value={receiverName}
                  onChange={(event) => onReceiverNameChange(event.target.value)}
                  placeholder="Enter receiver name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#374151]">
                    Receiver Signature <span className="text-[#111827]">*</span>
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
                  value={receiverSignature}
                  onChange={onReceiverSignatureChange}
                />
              </div>
            </>
          ) : (
            <div className="rounded-md border border-[#FEF08A] bg-[#FFFBEB] px-4 py-4">
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#CA8A04]" />
                <span className="text-sm text-[#A16207]">
                  No receiver on site. Delivery will be marked as "Unattended
                  Delivery" for record keeping.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
