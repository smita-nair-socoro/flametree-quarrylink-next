// Handling customer statuses
// TODO: Combine with quote-helpers.ts to handle all the statuses based on the module

import { CUSTOMER_STATUS } from '../types/customer-enums';

export const formatCustomerStatus = (
  status: CUSTOMER_STATUS | string
): string => {
  switch (status) {
    case CUSTOMER_STATUS.ACTIVE:
    case 'ACTIVE':
      return 'ACTIVE';

    case CUSTOMER_STATUS.ARCHIVED:
    case 'ARCHIVED':
      return 'ARCHIVED';
    default:
      return status.replace(/_/g, ' ');
  }
};
