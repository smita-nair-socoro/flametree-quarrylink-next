import { notifyError } from '@/lib/toast';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function acceptImageFile(
  file: File | undefined,
  onChange: (file: File | null) => void,
  label: string,
) {
  if (!file) {
    onChange(null);
    return;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    notifyError(`${label} must be 5MB or smaller`);
    return;
  }
  onChange(file);
}
