import { QUOTE_STATUS } from '../types/quotation-enums';

export const formatQuoteStatus = (status: QUOTE_STATUS | string): string => {
  switch (status) {
    case QUOTE_STATUS.CONVERTED_TO_JOB:
    case 'CONVERTED_TO_JOB':
      return 'CONVERTED TO JOB';
    case QUOTE_STATUS.DRAFT:
    case 'DRAFT':
      return 'DRAFT';
    case QUOTE_STATUS.PENDING:
    case 'PENDING':
      return 'PENDING';
    case QUOTE_STATUS.APPROVED:
    case 'APPROVED':
      return 'APPROVED';
    case QUOTE_STATUS.EXPIRED:
    case 'EXPIRED':
      return 'EXPIRED';
    case QUOTE_STATUS.DECLINED:
    case 'DECLINED':
      return 'DECLINED';
    case QUOTE_STATUS.ARCHIVED:
    case 'ARCHIVED':
      return 'ARCHIVED';
    default:
      return status.replace(/_/g, ' ');
  }
};
