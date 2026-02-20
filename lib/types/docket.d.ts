import { DOCKET_STATUS } from './docket-enums';
import { Job } from './job';
import { Address } from './address';

export interface Docket {
  id: number;
  job: Job;
  docketNumber: string;
  status: DOCKET_STATUS;
  selectedJobLineItem: SelectedJobLineItem;
  deliveryDate: string;
  poNumber?: string;
  pickUpAddress?: Address;
  deliveryAddress?: Address;
  startTimeWindow: string;
  endTimeWindow: string;
  contactName: string;
  contactPhone: string;
  docketEmail: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  version: number;
  isDeleted: boolean;
}

export interface SelectedJobLineItem {
  id: number;
  jobLineItemId: number;
  productName: string;
  quarrySupplierId: number;
  quarrySupplierName: string;
  productUoM: string;
  loadSize: number;
  truckType?: string;
  truckSellQty?: number;
  totalProductSell: number;
  totalTruckSell?: number;
  gst: number;
  totalInvoice: number;
}
