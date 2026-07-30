import { describe, expect, test, vi } from 'vitest';
import { acceptImageFile } from '../image-file-size';
import { notifyError } from '@/lib/toast';

vi.mock('@/lib/toast', () => ({
  notifyError: vi.fn(),
}));

function makeFile(sizeInBytes: number): File {
  return { size: sizeInBytes } as File;
}

describe('acceptImageFile', () => {
  test('calls onChange(null) when no file is provided', () => {
    const onChange = vi.fn();
    acceptImageFile(undefined, onChange, 'Logo');
    expect(onChange).toHaveBeenCalledWith(null);
    expect(notifyError).not.toHaveBeenCalled();
  });

  test('accepts a file within the default max size', () => {
    const onChange = vi.fn();
    const file = makeFile(1024 * 1024); // 1MB
    acceptImageFile(file, onChange, 'Logo');
    expect(onChange).toHaveBeenCalledWith(file);
    expect(notifyError).not.toHaveBeenCalled();
  });

  test('rejects a file over the default max size and notifies with the label', () => {
    const onChange = vi.fn();
    const file = makeFile(9 * 1024 * 1024); // 9MB
    acceptImageFile(file, onChange, 'Logo');
    expect(onChange).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledWith('Logo must be 8MB or smaller');
  });

  test('respects a custom max size', () => {
    const onChange = vi.fn();
    const file = makeFile(3 * 1024 * 1024); // 3MB
    acceptImageFile(file, onChange, 'Avatar', 2 * 1024 * 1024);
    expect(onChange).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledWith('Avatar must be 2MB or smaller');
  });
});
