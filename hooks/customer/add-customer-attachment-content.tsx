'use client';

import * as React from 'react';
import { Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CUSTOMER_ATTACHMENT_ACCEPT,
  CUSTOMER_ATTACHMENT_CATEGORY_OPTIONS,
} from '@/app/(protected)/customer-operations/customers/(components)/forms/schemas/customer-attachment-form-schema';
import { cn } from '@/lib/utils';
import { CUSTOMER_ATTACHMENT_CATEGORY } from '@/lib/types/customer-enums';

type AttachmentFieldErrors = Partial<
  Record<'category' | 'fileName' | 'file', string>
>;

function FieldMessage({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-destructive -mt-1 text-sm">{message}</p>;
}

export function AddCustomerAttachmentDescription() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#F3E8FF]">
        <Upload className="h-5 w-5 text-[#8B5CF6]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-[#111827]">Add Attachment</span>
        <span className="text-sm text-[#6A7282]">
          Upload a file and assign a category below.
        </span>
      </div>
    </div>
  );
}

interface AddCustomerAttachmentContentProps {
  category: CUSTOMER_ATTACHMENT_CATEGORY | '';
  onCategoryChange: (value: CUSTOMER_ATTACHMENT_CATEGORY) => void;
  fileName: string;
  onFileNameChange: (value: string) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  fieldErrors?: AttachmentFieldErrors;
}

export function AddCustomerAttachmentContent({
  category,
  onCategoryChange,
  fileName,
  onFileNameChange,
  file,
  onFileChange,
  fieldErrors = {},
}: AddCustomerAttachmentContentProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    onFileChange(nextFile);

    if (nextFile && !fileName.trim()) {
      onFileNameChange(nextFile.name);
    }

    event.currentTarget.value = '';
  };

  const handleClearFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-4 overflow-hidden">
      <div className="flex flex-col gap-2">
        <Label htmlFor="attachment-category">Category*</Label>
        <Select
          value={category || undefined}
          onValueChange={(value) =>
            onCategoryChange(value as CUSTOMER_ATTACHMENT_CATEGORY)
          }
        >
          <SelectTrigger
            id="attachment-category"
            className="w-full"
            aria-invalid={Boolean(fieldErrors.category)}
          >
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
          <SelectContent>
            {CUSTOMER_ATTACHMENT_CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldMessage message={fieldErrors.category} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="attachment-file-name">File Name*</Label>
        <Input
          id="attachment-file-name"
          placeholder="Enter file name"
          value={fileName}
          aria-invalid={Boolean(fieldErrors.fileName)}
          onChange={(event) => onFileNameChange(event.target.value)}
        />
        <FieldMessage message={fieldErrors.fileName} />
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={CUSTOMER_ATTACHMENT_ACCEPT}
          className="hidden"
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
            <span
              className="min-w-0 flex-1 truncate text-sm text-[#364153]"
              title={file.name}
            >
              {file.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleClearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Label>File Upload*</Label>
            <div
              className={cn(
                'flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 transition-colors hover:border-gray-400',
                fieldErrors.file && 'border-destructive',
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mb-2 h-8 w-8 text-[#9F9FA9]" />
              <span className="text-sm font-medium text-[#364153]">
                Click to upload a file
              </span>
              <span className="mt-1 text-center text-xs text-[#6A7282]">
                PDF, Word, Excel (xlsx), JPEG, JPG, PNG, .eml
              </span>
            </div>
          </>
        )}
        <FieldMessage message={fieldErrors.file} />
      </div>
    </div>
  );
}
