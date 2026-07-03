import { CustomerAttachmentDTO } from '@/lib/types/customer';

export function openCustomerAttachment(attachment: CustomerAttachmentDTO) {
  if (!attachment.href) return;

  window.open(attachment.href, '_blank', 'noopener,noreferrer');
}
