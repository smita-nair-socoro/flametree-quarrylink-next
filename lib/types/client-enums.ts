export enum ClientStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
  ACTIVE = 'ACTIVE',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
}

export enum InvoiceStatus {
  PAID = 'PAID',
  DUE_PAYMENT = 'DUE_PAYMENT',
}

export enum SubscriptionPlan {
  ESSENTIAL = 'ESSENTIAL',
  PLUS = 'PLUS',
  PRO = 'PRO',
}
