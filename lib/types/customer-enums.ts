export enum CUSTOMER_TYPE {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
}

export enum CUSTOMER_STATUS {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum PAYMENT_TYPE {
  PREPAID = 'PREPAID',
  CREDIT = 'CREDIT',
}

export enum PAYMENT_TERM_TYPE {
  OFTHEFOLLOWINGMONTH = 'OFFOLLOWINGMONTH',
  OFCURRENTMONTH = 'OFCURRENTMONTH',
  DAYSAFTERBILLMONTH = 'DAYSAFTERBILLMONTH',
  DAYSAFTERBILLDATE = 'DAYSAFTERBILLDATE'
}

export enum CustomerFormBlockState {
  /** Case 1: Customer archived in Xero; QL cannot archive because active dockets/jobs exist */
  XERO_ARCHIVED_QL_BLOCKED = 'XERO_ARCHIVED_QL_BLOCKED',
  /** Case 2: QL attempted to archive; Xero rejected it; QL reverted customer back to ACTIVE */
  XERO_ARCHIVE_REVERTED = 'XERO_ARCHIVE_REVERTED',
  /** Case 3: Xero unarchived customer; QL detected a duplicate; Xero was re-archived */
  XERO_UNARCHIVE_DUPLICATE = 'XERO_UNARCHIVE_DUPLICATE',
  /** Case 4: Customer is archived in QL; editing blocked; no unarchive action available */
  QL_ARCHIVED = 'QL_ARCHIVED',
}