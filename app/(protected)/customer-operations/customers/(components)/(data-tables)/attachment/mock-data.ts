import { CustomerAttachmentDTO } from '@/lib/types/customer';
import {
  CUSTOMER_ATTACHMENT_CATEGORY,
  CUSTOMER_ATTACHMENT_SOURCE_TYPE,
} from '@/lib/types/customer-enums';

export const MOCK_ATTACHMENT_DATA: CustomerAttachmentDTO[] = [
  {
    id: 1,
    customerId: 1,
    fileName: 'Signed Terms & Conditions 2024.pdf',
    category: CUSTOMER_ATTACHMENT_CATEGORY.SIGNED_TERMS_AND_CONDITIONS,
    uploadedAt: '2025-06-15T08:30:00',
    sourceType: CUSTOMER_ATTACHMENT_SOURCE_TYPE.FILE,
    href: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 2,
    customerId: 1,
    fileName: 'Credit Application Portal',
    category: CUSTOMER_ATTACHMENT_CATEGORY.CREDIT_APPLICATION,
    uploadedAt: '2025-05-20T14:00:00',
    sourceType: CUSTOMER_ATTACHMENT_SOURCE_TYPE.LINK,
    href: 'https://example.com/credit-application',
  },
  {
    id: 3,
    customerId: 1,
    fileName: 'ABN Registration Certificate.pdf',
    category: CUSTOMER_ATTACHMENT_CATEGORY.ABN_GST_REGISTRATION,
    uploadedAt: '2025-04-02T09:15:00',
    sourceType: CUSTOMER_ATTACHMENT_SOURCE_TYPE.FILE,
    href: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
];
