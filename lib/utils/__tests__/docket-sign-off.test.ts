import { describe, expect, test } from 'vitest';
import { getDocketSignOffCopy } from '../docket-sign-off';

describe('getDocketSignOffCopy', () => {
  test('uses collection labels and omits receiver on site', () => {
    const copy = getDocketSignOffCopy(true);
    expect(copy.atPrefix).toBe('Collected at');
    expect(copy.nameLabel).toBe('Collector Name');
    expect(copy.photo1Label).toBe('Photo 1');
    expect(copy.photo2Label).toBe('Photo 2');
    expect(copy.signatureLabel).toBe('Collector Signature');
    expect(copy.emptyPhotoPlaceholder).toBe('No photo provided');
    expect(copy.emptySignaturePlaceholder).toBe('No photo provided');
    expect(copy.showReceiverOnSite).toBe(false);
  });

  test('keeps delivery labels unchanged', () => {
    const copy = getDocketSignOffCopy(false);
    expect(copy.atPrefix).toBe('Delivered at');
    expect(copy.nameLabel).toBe('Receiver Name');
    expect(copy.photo1Label).toBe('Unloaded Photo');
    expect(copy.photo2Label).toBe('Receipt Photo');
    expect(copy.signatureLabel).toBe('Receiver Signature');
    expect(copy.emptySignaturePlaceholder).toBe('No signature provided');
    expect(copy.showReceiverOnSite).toBe(true);
  });
});
