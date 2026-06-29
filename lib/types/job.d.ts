import { JOB_STATUS, JOB_LINE_ITEM_TYPE } from './job-enums';
import { CustomerDTO, CustomerWithAddressResponseDTO } from './customer';
import { CustomerDeliveryAddress } from './address';
import { QuarrySupplier } from './quarry-supplier';
import { INVOICE_STATUS } from './invoice-enums';

export interface JobDTO {
  id: number;
  jobNumber?: string;
  customerId: number;
  customerDto?: Partial<CustomerDTO>;
  customerWithAddressResponse?: CustomerWithAddressResponseDTO;
  projectName: string;
  jobStatus: JOB_STATUS;
  poNumber?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  docketEmail?: string;
  uninvoicedDockets?: number;
  uninvoicedDocketsAmount?: number;
  quoteId?: number;
  emailRecipients?: string[];
  estimatedStartDate?: string;
  startTimeWindow?: string;
  endTimeWindow?: string;
  reason?: string;
  notes?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export interface Job {
  id: number;
  jobNumber: string;
  poNumber?: string;
  status: JOB_STATUS;
  customerId: number;
  email: string;
  phone: string;
  customerWithAddressResponse: CustomerWithAddressResponseDTO;
  accountManagerSub: string;
  accountManagerName: string;
  uninvoicedDockets: number;
  customerName: string;
  projectName: string;
  quoteId?: number;
  deliveryStartDate: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  receiptEmail: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
}

export interface JobLineItem {
  id?: number;
  quoteId?: number;
  jobId: number;
  productId: number;
  type: JOB_LINE_ITEM_TYPE;
  quarrySupplierId: number;
  customerDeliveryAddressId?: number;
  customerDeliveryAddress?: Partial<CustomerDeliveryAddress>;
  quarryProductId?: number;
  quarrySupplier: Partial<QuarrySupplier>;
  productName: string;
  quarryName: string;
  supplierProductName: string;
  densityTonnagePerM3: number;
  productCostUom: string;
  productCostQty: number;
  productCostPrice: number;
  totalProductCostPrice: number;
  productSellUom: string;
  productSellQty: number;
  productSellPrice: number;
  totalProductSellPrice: number;
  truckType: string;
  truckCostUom: string;
  truckCostQty: number;
  truckCostPrice: number;
  totalTruckCostPrice: number;
  truckSellUom: string;
  truckSellQty: number;
  truckSellPrice: number;
  totalTruckSellPrice: number;
  grossProfit: number;
  totalQuantityRequired: number;
  allocatedQuantity: number;
  remainingQuantity: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  version: number;
  isDeleted: boolean;
}

export interface JobItem {
  id: number;
  jobId: number;
  jobItemType: JOB_LINE_ITEM_TYPE;
  addressId?: number;
  customerDeliveryAddressId?: number;
  customerDeliveryAddress?: Partial<CustomerDeliveryAddress>;
  productId: number;
  product: {
    id: number;
    productName: string;
    productCode: string;
    materialId: number;
    densityTonnagePerM3: number;
    productDescription: string;
    isActive: boolean;
    deleted?: boolean;
    version: number;
  };
  quarrySupplierId: number;
  quarrySupplier: Partial<QuarrySupplier>;
  quarrySupplierName: string;
  densityTonnagePerM3: number;

  totalQuantityRequired: number;
  allocatedQuantity: number;
  remainingQuantity: number;

  productCostUom: string;
  productCostQty: number;
  productCostPrice: number;
  totalProductCostPrice: number;
  productSellUom: string;
  productSellQty: number;
  productSellPrice: number;
  totalProductSellPrice: number;

  truckType: string;
  truckCostUom: string;
  truckCostQty: number;
  truckCostPrice: number;
  totalTruckCostPrice: number;
  truckSellUom: string;
  truckSellQty: number;
  truckSellPrice: number;
  totalTruckSellPrice: number;

  grossProfit: number;
  selectedCostUnit: string;
  selectedSellUnit: string;
  selectedTruckRateType: string;
  selectedTruckType: string;
  version: number;
}

export interface JobDetails extends JobDTO {
  jobItems?: JobItem[];
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SettleJobResponse {
  job?: JobDTO;
  unfinalisedDocketsCount: number;
  unfinalisedDocketsAmount: number;
}

export interface CompleteJobResponse {
  job: JobDTO;
  unfinalisedDocketsCount: number;
  unfinalisedDocketsAmount: number;
  remainingQuantityPresent: boolean;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  docketCount: number;
  amount: number;
  dueDate: string;
  status: INVOICE_STATUS;
}

export interface InvoiceDetails {
  id: number;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  invoiceDate: string;
  dueDate: string;
  status: INVOICE_STATUS;
  externalStatus: string;
  externalInvoiceId: string;
  failureReason: string;
  dockets: DocketDTO[];
}

interface RetrySyncResult {
  internalInvoiceId: number;
  externalInvoiceId: string;
  idempotencyKey: string;
  internalStatus: string;
  externalStatus: string;
  externalinvoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  errorMessage: string;
}

export interface RetrySyncResponse {
  totalAttempted: number;
  successCount: number;
  failureCount: number;
  results: {
    invoices: RetrySyncResult[];
  };
}

export interface InvoiceUrlResponse {
  externalInvoiceId: string;
  invoiceLink: string;
}

export interface CreatedInvoiceDTO {
  internalInvoiceId: number;
  externalInvoiceId: string;
  idempotencyKey: string;
  internalStatus: string;
  externalStatus: string;
  externalInvoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
}

export interface CreateInvoiceResponseDTO {
  invoices: CreatedInvoiceDTO[];
}

export interface JobStatistics {
  jobsInProgress: number;
  uninvoicedDocketsValue: number;
  uninvoicedDeliveryDockets: number;
  uninvoicedCollectionDockets: number;
  completedJobsReadyForInvoicing: number;
  completedDocketsReadyForInvoicing: number;
  pausedJobs: number;
}

export interface JobsPage {
  content: JobDTO[];
  totalElements: number;
  totalPages: number;
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  size?: number;
}

export interface JobsFacetOption {
  id: string;
  name: string;
}

export interface JobsListResponse {
  jobs: JobsPage;
  statuses?: string[];
  customers?: JobsFacetOption[];
  accountManagers?: JobsFacetOption[];
}
