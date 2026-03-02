import { Docket } from './docket';

export enum JOB_STATUS {
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  SETTLED = 'SETTLED',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Job {
  id: number;
  jobNumber: string;
  poNumber?: string;
  status: JOB_STATUS;
  customerId: number;
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
  jobItems?: jobItems[];
}

export interface jobItems {
  id?: number;
  jobId: number;
  productId: number;
  quarrySupplierId: number;
  customerDeliveryAddressId?: number;
  customerDeliveryAddress?: Partial<CustomerDeliveryAddress>;
  quarryProductId?: number;
  productName: string;
  quarryName: string;
  supplierProductName: string;
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

export interface JobDetails extends Job {
  job_items: jobItems[];
  dockets: Docket[];
}
