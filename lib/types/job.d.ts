import { JOB_STATUS, JOB_LINE_ITEM_TYPE } from './job-enums';
import { CustomerDTO, CustomerWithAddressResponseDTO } from './customer';
import { CustomerDeliveryAddress } from './address';

export interface JobDTO {
  id: number;
  jobNumber?: string;
  customerId: number;
  customerDto?: Partial<CustomerDTO>;
  projectName: string;
  jobStatus: JOB_STATUS;
  poNumber?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  docketEmail?: string;
  uninvoicedDockets?: number;
  quoteId?: number;
  additionalEmails?: string[];
  estimatedStartDate?: string;
  startTimeWindow?: string;
  endTimeWindow?: string;
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
  customerWithAddressResponseDto: CustomerWithAddressResponseDTO;
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

export interface JobItem {
  id: number;
  jobId: number;
  jobItemType: JOB_LINE_ITEM_TYPE;
  addressId?: number;
  address?: {
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

  selectedCostUnit: string;
  selectedSellUnit: string;
  selectedTruckRateType: string;
  selectedTruckType: string;
  version: number;
}

export interface JobDetails extends JobDTO {
  jobItems?: JobItem[];
}
