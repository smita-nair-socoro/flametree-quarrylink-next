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

export enum ACC_SOFTWARE_SYNC_DIRECTION {
  QL_TO_ACC_SOFTWARE = 'QL_TO_ACC_SOFTWARE',
  ACC_SOFTWARE_TO_QL = 'ACC_SOFTWARE_TO_QL',
}

export enum ACC_SOFTWARE_SYNC_STATUS {
  FAILED = 'FAILED',
  SUCCEEDED = 'SUCCEEDED',
}

export enum CustomerFormBlockState {
  /** Case 1: Customer archived in the accounting software; QL cannot archive because active dockets/jobs exist */
  QUARRYLINK_ARCHIVE_BLOCKED = 'QUARRYLINK_ARCHIVE_BLOCKED',
  /** Case 2: QL attempted to archive; the accounting software rejected it; QL reverted customer back to ACTIVE */
  ACCOUNTING_SOFTWARE_ARCHIVE_FAILED = 'ACCOUNTING_SOFTWARE_ARCHIVE_FAILED',
  /** Case 3: Accounting software unarchived customer; QL detected a duplicate; it was re-archived */
  UNARCHIVE_ACCOUNTING_SOFTWARE_REARCHIVED = 'UNARCHIVE_ACCOUNTING_SOFTWARE_REARCHIVED',
  /** Case 4: Customer is archived in QL; editing blocked; no unarchive action available */
  ARCHIVED_IN_QUARRYLINK = 'ARCHIVED_IN_QUARRYLINK',
}