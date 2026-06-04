import { notifyError } from '@/lib/toast';

const DEFAULT_MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function acceptImageFile(
  file: File | undefined,
  onChange: (file: File | null) => void,
  label: string,
  maxSize: number = DEFAULT_MAX_IMAGE_SIZE,
) {
  if (!file) {
    onChange(null);
    return;
  }
  if (file.size > maxSize) {
    notifyError(`${label} must be ${maxSize / (1024 * 1024)}MB or smaller`);
    return;
  }
  onChange(file);
}
