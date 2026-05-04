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
  QUARRYLINK_ARCHIVE_BLOCKED = 'QUARRYLINK_ARCHIVE_BLOCKED',
  /** Case 2: QL attempted to archive; Xero rejected it; QL reverted customer back to ACTIVE */
  XERO_ARCHIVE_FAILED = 'XERO_ARCHIVE_FAILED',
  /** Case 3: Xero unarchived customer; QL detected a duplicate; Xero was re-archived */
  UNARCHIVE_XERO_REARCHIVED = 'UNARCHIVE_XERO_REARCHIVED',
  /** Case 4: Customer is archived in QL; editing blocked; no unarchive action available */
  ARCHIVED_IN_QUARRYLINK = 'ARCHIVED_IN_QUARRYLINK',
}