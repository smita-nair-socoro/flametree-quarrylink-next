import { DocketDTO } from '@/lib/types/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';

export function isInternalTransferDocket(
  docket?: Pick<DocketDTO, 'docketNumber'> & {
    job?: { jobType?: string };
  } | null,
): boolean {
  if (!docket) return false;
  return (
    docket.job?.jobType === 'INTERNAL_TRANSFER' ||
    (docket.docketNumber?.startsWith('IT-') ?? false)
  );
}

export function isInternalTransferJob(job?: {
  jobType?: string;
} | null): boolean {
  return job?.jobType === 'INTERNAL_TRANSFER';
}

export function docketTypeLabel(docket: DocketDTO): string {
  if (isInternalTransferDocket(docket)) return 'Internal Transfer';
  return docket.jobItem?.jobItemType === 'COLLECTION'
    ? 'Collection'
    : 'Delivery';
}

export function isCashSaleEligible(docket: DocketDTO): boolean {
  if (isInternalTransferDocket(docket)) return false;
  const status = docket.docketStatus;
  const type = docket.jobItem?.jobItemType;
  if (type === 'COLLECTION') return status === DOCKET_STATUS.COLLECTED;
  return status === DOCKET_STATUS.DELIVERED;
}

export function isInvoiceEligible(docket: DocketDTO): boolean {
  return isCashSaleEligible(docket);
}
