import { CustomerAttachmentDTO } from '@/lib/types/customer';
import { CUSTOMER_ATTACHMENT_CATEGORY } from '@/lib/types/customer-enums';

export const MOCK_ATTACHMENT_DATA: CustomerAttachmentDTO[] = [
  {
    id: 1,
    fileName: 'Signed Terms & Conditions 2024',
    category: CUSTOMER_ATTACHMENT_CATEGORY.SIGNED_TERMS_AND_CONDITIONS,
    uploadedAt: '2025-06-15T08:30:00',
    fileExtension: '.pdf',
    fileSizeBytes: 245_760,
  },
  {
    id: 2,
    fileName: 'Credit Application Portal',
    category: CUSTOMER_ATTACHMENT_CATEGORY.CREDIT_APPLICATION,
    uploadedAt: '2025-05-20T14:00:00',
    fileExtension: '.pdf',
    fileSizeBytes: 128_000,
  },
  {
    id: 3,
    fileName: 'ABN Registration Certificate',
    category: CUSTOMER_ATTACHMENT_CATEGORY.ABN_GST_REGISTRATION,
    uploadedAt: '2025-04-02T09:15:00',
    fileExtension: '.pdf',
    fileSizeBytes: 98_304,
  },
];
