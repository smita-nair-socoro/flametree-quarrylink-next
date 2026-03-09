'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt?: string;
  title?: string;
}

export function ImagePreviewDialog({
  open,
  onOpenChange,
  src,
  alt = 'Preview image',
  title = 'Photo Preview',
}: ImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[92vw] p-4 lg:w-[60vw] lg:max-w-[60vw]">
        <DialogHeader className="mt-0">
          <DialogTitle className="mt-0">{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-hidden rounded-md border border-[#E5E7EB] bg-[#F9FAFB]">
          {src ? (
            <Image
              src={src}
              alt={alt}
              className="max-h-[75vh] w-full object-contain"
              width={600}
              height={300}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
