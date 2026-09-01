export enum JOB_STATUS {
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  SETTLED = 'SETTLED',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum JOB_LINE_ITEM_TYPE {
  COLLECTION = 'COLLECTION',
  DELIVERY = 'DELIVERY',
}

export enum JOB_ATTACHMENT_CATEGORY {
  PURCHASE_ORDER = 'Purchase Order',
  QUOTE_CONTRACT = 'Quote / Contract',
  SITE_MAP_ACCESS = 'Site Map / Access',
  PERMIT_APPROVAL = 'Permit / Approval',
  SAFETY_DOCUMENTATION = 'Safety Documentation',
  CORRESPONDENCE = 'Correspondence',
  OTHER = 'Other',
}
