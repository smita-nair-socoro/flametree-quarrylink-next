import {
  CUSTOMER_STATUS,
  CUSTOMER_TYPE,
  PAYMENT_TYPE,
  PAYMENT_TERM_TYPE,
} from './customer-enums';
import { Address } from './address';
import { DOCKET_STATUS } from './docket-enums';
import { QUOTE_STATUS } from './quotation-enums';
import { JobDTO } from './job';

export interface CustomerDTO {
  id?: number;
  customerType: CUSTOMER_TYPE;

  businessName?: string;
  individualContactName?: string;

  businessPhone?: string;
  businessEmail?: string;

  billingAddressId?: number;
  billingAddress?: AddressDTO;

  creditLimit: number;
  accountManagerName?: string;
  accountManagerSub: string;
  invoiceDueDateDayCount?: number;
  paymentTermType?: PAYMENT_TERM_TYPE;
  customerStatus?: CUSTOMER_STATUS;
  paymentType: PAYMENT_TYPE;

  contactPersonFirstName?: string;
  contactPersonLastName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  contactName?: string;
  abn?: string;
  acn?: string;
  vatNumber?: string;

  govId?: string;

  version: number;

  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  lastModifiedBy?: string;
  isDeleted?: boolean;

  accSoftwareContactId?: string | null;
  customerLocationId?: string;
  customerClassification?: string;
  accSoftwareNotes?: string;
  lastAccSoftwareSyncDirection?: string | null;
  lastAccSoftwareSyncStatus?: string | null;
  lastSyncedAt?: string | null;
}

export interface CustomerWithAddressResponseDTO {
  id?: number; // Optional for create, required for update
  customerType: CUSTOMER_TYPE;
  contactName: string;
  phone: string;
  email: string;
  contactPersonEmail?: string;
  billingAddressId?: number;
  billingAddress: Address;
  creditLimit: number;
  accountManagerSub: string;
  invoiceDueDate: number;
  paymentTermType: string;
  customerStatus: CUSTOMER_STATUS;
  jobsCount: number;
  paymentType: string;
  version: number;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;

  // Optional metadata fields
  accountManagerName?: string;
  accountManagerEmail?: string;
  remainingCredit?: number;

  // BUSINESS type specific fields
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  legalName?: string;
  tradingName?: string;
  abn?: string;
  acn?: string;
  vatNumber?: string;

  // INDIVIDUAL type specific fields
  firstName?: string;
  lastName?: string;
  govId?: string;
}

export interface CustomerDetails extends Customer {
  jobs: Job[];
}

export interface CustomerReporting {
  totalCustomers: number;
  totalCustomersChangePercentThisMonth: number;
  totalActiveCustomers: number;
  activeCustomersPercentOfTotal: number;
  totalActiveBusinessCustomers: number;
  businessCustomerQuotesPercent: number;
  totalActiveIndividualCustomers: number;
  individualCustomerQuotesPercent: number;
}

export interface CustomerListAccountManager {
  id: string;
  name: string;
}

export interface CustomersPage {
  content: CustomerDTO[];
  totalElements: number;
  totalPages: number;
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  size?: number;
}

/** Paginated customers list with facet metadata from GET /customer. */
export interface CustomersListResponse {
  customers: CustomersPage;
  accountManagers?: CustomerListAccountManager[];
  statuses?: string[];
  types?: string[];
}

export interface ArchiveCustomerBlockingQuote {
  id: number;
  quoteNumber: string;
  customerId: number;
  customerName: string;
  email: string;
  phone: string;
  projectName: string;
  quoteStatus: QUOTE_STATUS;
  declineReason?: string;
  customerResponseAt?: string;
  jobId: number;
  deliveryStartDate?: string;
  expiryDate?: string;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  totalCostPrice: number;
  totalSellPrice: number;
  convertedAt?: string;
  accountManagerName: string;
  accountManagerSub: string;
  accountManagerEmail: string;
  emailRecipients: string[];
  lineItemsCount: number;
  inclDeliveryCost: boolean;
  version: number;
}

export interface ArchiveCustomerBlockingDocket {
  id: number;
  docketNumber: string;
  jobId: number;
  jobItemId: number;
  docketStatus: DOCKET_STATUS;
  stopReason?: string;
  stoppedAt?: string;
  resumedAt?: string;
  deliveryStartedAt?: string;
  pickUpAddressId: number;
  deliveryAddressId: number;
  purchaseOrder: string;
  deliveryCollectionDate: string;
  deliveryCollectionStartTime: string;
  deliveryCollectionEndTime: string;
  customerContactName: string;
  customerContactPhone: string;
  docketEmailRecipients: string[];
  notes: string;
  driverId: number;
  truckId: number;
  driverChecklistId: number;
  truckChecklistId: number;
  truckType: string;
  plannedLoadSize?: number;
  actualLoadSize?: number;
  overDelivered?: boolean;
  deliveryDistance?: number;
  grossTruckWeight: number;
  tareTruckWeight: number;
  deliveryDistanceQuantity: number;
  deliveryDistanceUom: string;
  arrivedAt?: string;
  deliveredAt: string;
  arrivalLatitude?: number;
  arrivalLongitude?: number;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  signatureImage: string;
  deliveryNotes: string;
  unloadedPhotos?: string[];
  receivedPhotos?: string[];
  productEstimatedVolume: number;
  version: number;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
}

export interface ArchiveCustomerResponseDTO {
  blockingQuotes: ArchiveCustomerBlockingQuote[];
  blockingDockets: ArchiveCustomerBlockingDocket[];
  blockingJobs: JobDTO[];
  success: boolean;
  errorMessage?: string;
}

export interface UnarchiveCustomerResponseDTO {
  success: boolean;
  duplicateExistsInQuarryLink: boolean;
  duplicateExistsInXero: boolean;
  duplicateCustomerName: string;
  duplicateCustomerId: number;
  reason: string;
}

export interface AdditionalContactMethodDTO {
  type: string;
  value: string;
}

export interface AdditionalContactApiDTO {
  id: number;
  firstName: string;
  lastName: string;
  positionRole: string;
  contactMethods: AdditionalContactMethodDTO[];
}

export interface AdditionalContactsPage {
  content: AdditionalContactApiDTO[];
  totalElements: number;
  totalPages: number;
  number?: number;
  size?: number;
}

export interface CustomerNoteDTO {
  id: number;
  customerId: number;
  authorSub?: string;
  authorName: string;
  body: string;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
}

export interface CreateCustomerNoteRequest {
  body: string;
  authorName: string;
}

export interface UpdateCustomerNoteRequest {
  body: string;
}

export interface CustomerNotesPage {
  content: CustomerNoteDTO[];
  totalElements: number;
  totalPages: number;
  number?: number;
  size?: number;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface AdditionalContactDTO {
  id?: number;
  customerId?: number;
  firstName?: string;
  lastName?: string;
  positionRole?: string;
  contactMethods?: AdditionalContactMethodDTO[];
}

// Get all and Post
export interface CustomerAttachmentDTO {
  id: number;
  fileName: string;
  category: string;
  uploadedAt: string;
  fileExtension: string;
  fileSizeBytes: number;
}

interface syncResult {
  success: boolean;
  accSoftwareContactId: string;
  externalStatus: string;
  reason: string;
}

export interface SyncAllFromAccSoftwareResponse {
  totalAttempted: number;
  successCount: number;
  failureCount: number;
  result: syncResult[];
}
