import { describe, expect, test } from 'vitest';
import {
  COLLECTOR_NAME_REQUIRED_MESSAGE,
  collectionProofSchema,
  hasAnyCollectionProof,
} from '../collection-proof';

const emptyProof = {
  photo1: null,
  photo2: null,
  collectorName: '',
  collectorSignature: '',
};

describe('collectionProofSchema', () => {
  test('allows collecting with nothing captured', () => {
    expect(collectionProofSchema.safeParse(emptyProof).success).toBe(true);
  });

  test('allows a name without a signature', () => {
    expect(
      collectionProofSchema.safeParse({
        ...emptyProof,
        collectorName: 'Jane Collector',
      }).success,
    ).toBe(true);
  });

  test('allows photos without a signature or name', () => {
    expect(
      collectionProofSchema.safeParse({
        ...emptyProof,
        photo2: new File(['x'], 'photo.jpg', { type: 'image/jpeg' }),
      }).success,
    ).toBe(true);
  });

  test('requires a collector name when a signature is drawn', () => {
    const result = collectionProofSchema.safeParse({
      ...emptyProof,
      collectorSignature: 'data:image/png;base64,abc',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        COLLECTOR_NAME_REQUIRED_MESSAGE,
      );
      expect(result.error.issues[0]?.path).toEqual(['collectorName']);
    }
  });
});

describe('hasAnyCollectionProof', () => {
  test('is false when every field is empty', () => {
    expect(hasAnyCollectionProof(emptyProof)).toBe(false);
  });

  test('is true when any photo, name, or signature is present', () => {
    expect(
      hasAnyCollectionProof({ ...emptyProof, collectorName: 'Jane' }),
    ).toBe(true);
    expect(
      hasAnyCollectionProof({
        ...emptyProof,
        collectorSignature: 'data:image/png;base64,abc',
      }),
    ).toBe(true);
    expect(
      hasAnyCollectionProof({
        ...emptyProof,
        photo1: new File(['x'], 'photo.jpg', { type: 'image/jpeg' }),
      }),
    ).toBe(true);
  });
});
