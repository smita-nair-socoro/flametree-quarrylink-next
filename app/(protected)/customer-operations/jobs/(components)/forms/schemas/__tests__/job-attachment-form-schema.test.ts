import { describe, expect, test } from 'vitest';
import { JOB_ATTACHMENT_CATEGORY } from '@/lib/types/job-enums';
import {
  JOB_ATTACHMENT_CATEGORY_OPTIONS,
  JOB_ATTACHMENT_MAX_COUNT,
  displayNameFromFileName,
  formatAttachmentFileSizeMb,
  jobAttachmentFormSchema,
} from '../job-attachment-form-schema';

function makeFile(name: string, type: string, sizeBytes = 1024) {
  const contents = new Uint8Array(sizeBytes);
  return new File([contents], name, { type });
}

describe('jobAttachmentFormSchema', () => {
  test('accepts a valid PDF under 10 MB', () => {
    const result = jobAttachmentFormSchema.safeParse({
      category: JOB_ATTACHMENT_CATEGORY.PURCHASE_ORDER,
      fileName: 'Site PO',
      file: makeFile('po.pdf', 'application/pdf'),
    });

    expect(result.success).toBe(true);
  });

  test('requires category, file name, and file', () => {
    const result = jobAttachmentFormSchema.safeParse({
      category: '',
      fileName: '  ',
      file: undefined,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain('Category is required');
      expect(messages).toContain('File name is required');
      expect(messages).toContain('File is required');
    }
  });

  test('rejects files over 10 MB with the actual size in the message', () => {
    const oversized = Math.round(14.2 * 1024 * 1024);
    const result = jobAttachmentFormSchema.safeParse({
      category: JOB_ATTACHMENT_CATEGORY.OTHER,
      fileName: 'Large scan',
      file: makeFile('scan.pdf', 'application/pdf', oversized),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'This file is 14.2 MB. The maximum is 10 MB.',
      );
    }
  });

  test('rejects unsupported types with the accepted list', () => {
    const result = jobAttachmentFormSchema.safeParse({
      category: JOB_ATTACHMENT_CATEGORY.CORRESPONDENCE,
      fileName: 'Notes',
      file: makeFile('notes.txt', 'text/plain'),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Only PDF, Word, Excel (xlsx), JPEG, JPG, PNG, and .eml files are accepted',
      );
    }
  });
});

describe('job attachment helpers', () => {
  test('lists the seven job categories in spec order', () => {
    expect(JOB_ATTACHMENT_CATEGORY_OPTIONS.map((option) => option.label)).toEqual(
      [
        'Purchase Order',
        'Quote / Contract',
        'Site Map / Access',
        'Permit / Approval',
        'Safety Documentation',
        'Correspondence',
        'Other',
      ],
    );
    expect(JOB_ATTACHMENT_MAX_COUNT).toBe(3);
  });

  test('strips the extension when pre-filling the display name', () => {
    expect(displayNameFromFileName('site-map.pdf')).toBe('site-map');
    expect(displayNameFromFileName('quote')).toBe('quote');
  });

  test('formats file size to one decimal place in MB', () => {
    expect(formatAttachmentFileSizeMb(10 * 1024 * 1024)).toBe('10.0 MB');
  });
});
