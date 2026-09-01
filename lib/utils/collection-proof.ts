import { z } from 'zod';

export const COLLECTOR_NAME_REQUIRED_MESSAGE = "Enter the collector's name.";
export const EMPTY_COLLECTION_PROOF_CONFIRMATION =
  'No proof of collection captured. Continue?';

export const collectionProofSchema = z
  .object({
    photo1: z.custom<File | null>(),
    photo2: z.custom<File | null>(),
    collectorName: z.string(),
    collectorSignature: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.collectorSignature.trim() && !data.collectorName.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['collectorName'],
        message: COLLECTOR_NAME_REQUIRED_MESSAGE,
      });
    }
  });

export type CollectionProofInput = z.infer<typeof collectionProofSchema>;

export function hasAnyCollectionProof(data: CollectionProofInput): boolean {
  return Boolean(
    data.photo1 ||
      data.photo2 ||
      data.collectorName.trim() ||
      data.collectorSignature.trim(),
  );
}
