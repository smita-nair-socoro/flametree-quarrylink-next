import { DOCKET_STATUS, DOCKET_TYPE } from './docket-enums';
import type { DRIVER_STATUS } from './driver-enums';
import { CHECKLIST_STATUS } from './checklist-enums';
import { Job } from './job';
import { Address } from './address';
import { DriverDTO } from './driver';
import { CustomerDTO } from './customer';
import { TruckDTO } from './truck';
import { TRUCK_BUSINESS_TYPE, TRUCK_STATUS } from './truck-enums';
import { HaulierDTO } from './haulier';
import { INVOICE_STATUS } from './invoice-enums';
import { RECOVERY_MODE, EFFECTIVE_SOURCE } from './fee-recovery-enums';

/** Platform fee frozen onto the docket, as returned by GET /dockets/{id}. */
export interface DocketPlatformFeeDto {
  mode: RECOVERY_MODE;
  configuredAmount: number;
  customerChargeAmount: number;
  description: string;
  source: EFFECTIVE_SOURCE;
  frozen: boolean;
}

export interface Docket {
  id: number;
  job: Job;
  docketType?: DOCKET_TYPE;
  docketNumber: string;
  status: DOCKET_STATUS;
  jobLineItemId: number;
  productName: string;
  productId: number;
  quarrySupplierId: number;
  quarrySupplierName: string;
  productUoM: string;
  productSell: number;
  loadSize: number;
  truckType?: string;
  truckSellUom?: string;
  truckSell?: number;
  truckSellQty?: number;
  totalProductSell: number;
  totalTruckSell?: number;
  sutotal: number;
  gst: number;
  totalInvoice: number;
  deliveryDate: string;
  poNumber?: string;
  pickUpAddress?: Partial<Address>;
  deliveryAddress?: Partial<Address>;
  startTimeWindow: string;
  endTimeWindow: string;
  contactName: string;
  contactPhone: string;
  docketEmail: string;
  notes?: string;
  createdBy: string;
  lastModifiedBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  isDeleted: boolean;
}

export interface DocketAssignRequest {
  docketId: number;
  truckId: number;
  driverId: number;
  deliveryStartWindow: string;
  deliveryEndWindow: string;
  plannedLoadSize?: number;
}

export interface DriverAppStatusUpdateRequest {
  docketStatus: DOCKET_STATUS;
  reason?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  deliveredProductsConfirmed?: boolean;
  receiverOnSite?: boolean;
  receiverName?: string;
  signatureImage?: Blob | File;
  deliveryNotes?: string;
  unloadedPhotos?: File[];
  receivedPhotos?: File[];
}

export interface DocketOperationalUpdateRequest {
  checkWindowTimeConflict?: boolean;
  docketEmailRecipients?: string[];
  actualLoadSize?: number;
  plannedLoadSize?: number;
  driverId?: number;
  truckId?: number;
  deliveryCollectionDate?: string;
  deliveryCollectionStartTime?: string;
  deliveryCollectionEndTime?: string;
  deliveryStartWindow?: string;
  deliveryEndWindow?: string;
  deliveryDistanceQuantity?: number;
  tareTruckWeight?: number;
}

export interface DocketOperationalUpdateResponse {
  docket?: DocketDTO;
  conflictingDocketIds: number[];
}

export interface DocketDTO {
  id: number;
  docketNumber: string;
  jobId: number;
  truckInspectionRequired: boolean;

  // Remove this once API is ready
  preStartRequired?: boolean;

  jobItemId: number;
  invoiceId?: number;
  invoiceStatus?: INVOICE_STATUS;
  docketStatus: DOCKET_STATUS;
  stopReason?: string;
  resumeReason?: string;
  cancelledReason?: string;
  voidedReason?: string;
  stoppedAt?: string;
  resumedAt?: string;
  pickUpAddressId: number;
  pickUpAddress: Partial<Address>;
  deliveryAddressId: number;
  deliveryAddress: Partial<Address>;
  deliveryCollectionDate: string;
  deliveryCollectionStartTime: string;
  deliveryCollectionEndTime: string;
  customerContactName: string;
  customerContactPhone: string;
  docketEmailRecipients: string[];
  notes: string;
  driverId: number;
  driver?: DriverDTO;
  truckId: number;
  truck?: TruckDTO;
  deliveredProductsConfirmed?: boolean;
  driverChecklistId: number;
  truckChecklistId: number;
  truckType: string;
  plannedLoadSize?: number;
  actualLoadSize?: number;
  loadSize: number;
  deliveredLoadSize: number;
  overDelivered?: boolean;
  deliveryDistance?: number;
  deliveryDistanceQuantity: number;
  deliveryDistanceUom: string;
  grossTruckWeight?: number;
  tareTruckWeight?: number;
  actualMaterialWeight?: number;
  deliveryStartedAt?: string;
  arrivedAt?: string;
  arrivalLatitude?: number;
  arrivalLongitude?: number;
  deliveredAt: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  signatureImage: string;
  deliveryNotes: string;
  deliveryPhotos: string[];
  unloadedPhotos?: string[];
  receivedPhotos?: string[];
  receiverName?: string;
  receiverOnSite?: boolean;
  gpsLocation: string;
  productEstimatedVolume: number;
  purchaseOrder: string;
  totalInvoiceAmount: number;
  totalProductAmount: number;
  totalDeliveryAmount: number;
  job: {
    id: number;
    jobNumber: string;
    customerId: number;
    customerName?: string;
    // The embedded customer uses flat contact fields (contactName/phone/email)
    // rather than CustomerDTO's contactPerson* fields.
    customerDto?: CustomerDTO & { email?: string; phone?: string };
    accountManagerName?: string;
    projectName: string;
    jobStatus: JOB_STATUS;
    jobType?: 'CUSTOMER' | 'INTERNAL_TRANSFER';
    fromSiteName?: string;
    toSiteName?: string;
    poNumber: string;
    contactPersonName: string;
    contactPersonPhone: string;
    docketEmail: string;
    uninvoicedDockets: number;
    quoteId: number;
    emailRecipients: string[];
    estimatedStartDate?: string;
    startTimeWindow?: string;
    endTimeWindow?: string;
    version: number;
  };
  jobItem: {
    id: number;
    jobId: number;
    jobItemType: JOB_LINE_ITEM_TYPE;
    customerDeliveryAddressId: number;
    customerDeliveryAddress: CustomerDeliveryAddress;
    productId: number;
    product: {
      id: number;
      productName: string;
      productCode: string;
      materialId: number;
      densityTonnagePerM3: number;
      productDescription: string;
      isActive: boolean;
      version: number;
    };
    quarrySupplierId: number;
    quarrySupplierName?: string;
    densityTonnagePerM3?: number;
    quarrySupplier?: Partial<QuarrySupplier>;
    totalQuantityRequired: number;
    allocatedQuantity: number;
    remainingQuantity: number;
    deliveredQuantity: number;
    productCostUom: string;
    productCostQty: number;
    productCostPrice: number;
    totalProductCostPrice: number;
    productSellUom: string;
    productSellQty: number;
    productSellPrice: number;
    totalProductSellPrice: number;
    truckCostUom: string;
    truckCostQty: number;
    truckCostPrice: number;
    totalTruckCostPrice: number;
    truckSellUom: string;
    truckSellQty: number;
    truckSellPrice: number;
    totalTruckSellPrice: number;
    truckType: string;
    grossProfit: number;
    version: number;
  };
  pickUpAddress: {
    id: number;
    googlePlaceId: string;
    formattedAddress: string;
    streetDetailsPrimary: string;
    streetDetailsOptional: string;
    city: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
    latitude: number;
    longitude: number;
    version: number;
  };
  deliveryAddress: {
    id: number;
    googlePlaceId: string;
    formattedAddress: string;
    streetDetailsPrimary: string;
    streetDetailsOptional: string;
    city: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
    latitude: number;
    longitude: number;
    version: number;
  };
  driverChecklist?: {
    id: number;
    checklistDate: string;
    completedAt: string;
    checklistStatus: CHECKLIST_STATUS;
    hasIssues: boolean;
    notes: string;
    version: number;
  };
  truckChecklist?: {
    id: number;
    checklistDate: string;
    completedAt: string;
    checklistStatus: CHECKLIST_STATUS;
    hasIssues: boolean;
    notes: string;
    version: number;
  };
  driverChecklistSubmissionId?: number;
  truckChecklistSubmissionId?: number;
  driverChecklistSubmission?: {
    id: number;
    checklistDate: string;
    completedAt: string;
    checklistStatus: CHECKLIST_STATUS;
    hasIssues: boolean;
    notes: string;
    version: number;
  };
  truckChecklistSubmission?: {
    id: number;
    checklistDate: string;
    completedAt: string;
    checklistStatus: CHECKLIST_STATUS;
    hasIssues: boolean;
    notes: string;
    version: number;
  };
  hasTodayDriverPreStart?: boolean;
  hasTodayTruckInspectionByCurrentDriver?: boolean;
  version: number;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  platformFee?: DocketPlatformFeeDto;
}

/** Response from GET /driver-app/assigned */
export interface DriverAppAssignedDTO extends Omit<DriverDTO, 'trucks'> {
  latestDriverChecklist?: DocketDTO['driverChecklist'];
  trucks: {
    id: number;
    licensePlate: string;
    truckType: string;
    truckStatus: string;
    tankVolumeM3: number;
  }[];
  dockets: DocketDTO[];
}

/** Truck row from GET scheduler/trucks */
export interface DispatchTruckResource {
  id: number;
  licensePlate: string;
  tankVolumeM3: number;
  truckStatus: TRUCK_STATUS;
  truckBusinessType: TRUCK_BUSINESS_TYPE;
  drivers?: DriverDTO[];
  dockets?: DispatchAssignedDocket[];
  haulier?: HaulierDTO;
}

/** Minimal truck refs nested under driver rows (scheduler/drivers payload). */
export interface DispatchBoardTruckRef {
  id?: number;
  licensePlate: string;
  truckType?: string;
  truckStatus?: string;
  businessType?: string;
  tankVolumeM3?: number;
}

/** Driver row from GET scheduler/drivers */
export interface DispatchDriverResource {
  id: number;
  driverName: string;
  driverType?: string;
  /** Present when the scheduler API returns driver roster status. */
  driverStatus?: DRIVER_STATUS;
  haulierId?: number;
  haulier?: HaulierDTO;
  trucks: DispatchBoardTruckRef[];
  dockets?: DispatchAssignedDocket[];
}

export type Resource = DispatchTruckResource | DispatchDriverResource;

export interface DispatchDocketDTO {
  resources: Resource[];
  unassignedDockets: DispatchUnassignedDocket[];
}

export interface DispatchAssignedDocket {
  id: number;
  docketNumber: string;
  docketStatus: DOCKET_STATUS;
  deliveryCollectionDate?: string;
  deliveryCollectionStartTime: string;
  deliveryCollectionEndTime: string;
  productName: string;
  plannedLoadSize?: number;
  actualLoadSize?: number;
  customerName: string;
  pickUpSuburb: string;
  pickUpState: string;
  deliverySuburb: string;
  productDensity: number;
  deliveryState: string;
  productSellUom: string;
  truckSellQty: number;
  truckSellUom: string;
  truckSellPrice: number;
}

export interface DispatchUnassignedDocket {
  id: number;
  docketNumber: string;
  docketStatus: DOCKET_STATUS;
  deliveryCollectionDate?: string;
  deliveryCollectionStartTime: string;
  deliveryCollectionEndTime: string;
  productName: string;
  plannedLoadSize?: number;
  actualLoadSize?: number;
  loadSize: number;
  customerName: string;
  pickUpSuburb: string;
  pickUpState: string;
  productDensity: number;
  deliverySuburb: string;
  deliveryState: string;
  productSellUom: string;
  truckSellQty: number;
  truckSellUom: string;
  truckSellPrice: number;
}

/** Flat row from GET /dockets/unassigned-dockets (dispatch all-dates queue). */
export interface UnassignedDocketListItem {
  id: number;
  docketNumber: string;
  docketStatus: DOCKET_STATUS;
  deliveryCollectionDate?: string;
  deliveryCollectionStartTime: string;
  deliveryCollectionEndTime: string;
  productName: string;
  plannedLoadSize?: number;
  actualLoadSize?: number;
  deliveryDistanceUom?: string;
  deliveryDistanceQuantity?: number;
  customerName: string;
  pickUpSuburb: string;
  pickUpState: string;
  deliverySuburb: string;
  deliveryState: string;
  productSellUom: string;
  productDensity: number;
  truckSellQty: number;
  truckSellUom: string;
  truckSellPrice: number;
}

export interface UnassignedDocketsPage {
  content: UnassignedDocketListItem[];
  totalElements: number;
  totalPages: number;
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  size?: number;
}

/** Slim board docket (assigned or unassigned list item — same fields). */
export type DispatchBoardDocketRow =
  | DispatchAssignedDocket
  | DispatchUnassignedDocket;

export interface ActiveDocketInfo {
  id: number;
  docketNumber: string;
  docketStatus: string;
}

export interface BlockedOperationResponse {
  success: boolean;
  message?: string;
  driverId?: number;
  activeDockets?: ActiveDocketInfo[];
}

export interface UnassignOperationResponse {
  canUnassign: boolean;
  reason?: string;
  truck?: TruckDTO;
  driverId?: number;
  truckId?: number;
  activeDockets?: ActiveDocketInfo[];
}

export interface ConflictCheckRequest {
  truckId?: number;
  driverId?: number;
  deliveryCollectionDate: string;
  deliveryStartWindow: string;
  deliveryEndWindow: string;
}

export interface ConflictingDocket {
  id: number;
  docketNumber: string;
  docketStatus: string;
  deliveryCollectionDate: string;
  deliveryCollectionStartTime: string;
  deliveryCollectionEndTime: string;
  plannedLoadSize: number;
}

export interface ConflictCheckResponse {
  hasConflicts: boolean;
  conflictingDocketIds: ConflictingDocket[];
}

export interface DuplicateDocketRequest {
  numberOfCopies: number;
  retainPurchaseOrder: boolean;
  purchaseOrder?: string;
  deliveryCollectionDate: string;
}

export interface DuplicateDocketResponse {
  remainingQuantityBeforeDuplication: number;
  remainingQuantityAfterDuplication: number;
  eachCopyQuantity: number;
  totalRequestedQuantity: number;
  maximumCopiesAllowed: number;
  dockets: DocketDTO[];
}

export interface DocketStatistics {
  scheduledDocketsToday: number;
  scheduledDeliveryDocketsToday: number;
  scheduledCollectionDocketsToday: number;
  unassignedDocketsNext7Days: number;
  uninvoicedDocketsValue: number;
  uninvoicedDeliveryDockets: number;
  uninvoicedCollectionDockets: number;
  quantityScheduledToday: number;
  quantityScheduledTodayUnit: string;
  quantityScheduledTodayDockets: number;
}

export interface DocketListFacetOption {
  id: number;
  name: string;
}

export interface DocketsPage {
  content: DocketDTO[];
  totalElements: number;
  totalPages: number;
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  size?: number;
}

/** Paginated dockets list with facet metadata from GET /dockets (legacy nested rows). */
export interface DocketsListResponse {
  customers?: DocketListFacetOption[];
  products?: DocketListFacetOption[];
  statuses?: string[];
  types?: string[];
  dockets: DocketsPage;
}

/** Flat row from GET /dockets/table (default dockets list). */
export interface DocketTableItem {
  id: number;
  docketNumber: string;
  type: string;
  jobReference: string;
  status: string;
  customerId: number;
  customerName: string;
  productId: number;
  productName: string;
  deliveryDate: string;
  quantity: number;
  quantityUom: string;
  totalLoadSize?: number;
  actualLoadSize?: number;
  totalInvoiceAmount: number;
  invoiceStatus?: INVOICE_STATUS;
}

export interface DocketsTablePage {
  content: DocketTableItem[];
  totalElements: number;
  totalPages: number;
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  size?: number;
}

/** Paginated table list with facet metadata from GET /dockets/table. */
export interface DocketsTableResponse {
  customers?: DocketListFacetOption[];
  products?: DocketListFacetOption[];
  statuses?: string[];
  types?: string[];
  dockets: DocketsTablePage;
}

/**
 * Normalized row used by the dockets DataTable columns (both /table flat
 * rows and nested DocketDTO sources map into this shape).
 */
export interface DocketTableRow {
  id: number;
  docketNumber: string;
  type: string;
  jobReference: string;
  status: string;
  customerId: number;
  customerName: string;
  productId: number;
  productName: string;
  deliveryDate: string;
  /** Fallback quantity when actualLoadSize is absent (planned / API quantity). */
  quantity: number;
  quantityUom: string;
  actualLoadSize?: number | null;
  totalInvoiceAmount: number;
  invoiceStatus?: INVOICE_STATUS;
}
