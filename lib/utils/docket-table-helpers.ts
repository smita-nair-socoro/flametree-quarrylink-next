import { CUSTOMER_TYPE } from '@/lib/types/customer-enums';
import type {
  DocketDTO,
  DocketTableItem,
  DocketTableRow,
} from '@/lib/types/docket';

/**
 * Maps a flat GET /dockets/table item into the shared table row.
 * invoiceStatus is stubbed as FAILED until the backend includes it.
 */
export function mapDocketTableItemToRow(item: DocketTableItem): DocketTableRow {
  return {
    id: item.id,
    docketNumber: item.docketNumber,
    type: item.type,
    jobReference: item.jobReference,
    status: item.status,
    customerId: item.customerId,
    customerName: item.customerName,
    productId: item.productId,
    productName: item.productName,
    deliveryDate: item.deliveryDate,
    quantity: item.quantity,
    quantityUom: item.quantityUom,
    actualLoadSize: item.actualLoadSize,
    totalInvoiceAmount: item.totalInvoiceAmount,
    invoiceStatus: item.invoiceStatus,
  };
}

/** Maps a nested DocketDTO (job/driver/truck lists) into the shared table row. */
export function mapDocketDtoToTableRow(docket: DocketDTO): DocketTableRow {
  const customer = docket.job?.customerDto;
  const customerName =
    customer?.customerType === CUSTOMER_TYPE.BUSINESS
      ? customer.businessName || 'N/A'
      : customer?.individualContactName || 'N/A';

  return {
    id: docket.id,
    docketNumber: docket.docketNumber,
    type: docket.jobItem?.jobItemType ?? '',
    jobReference: docket.job?.jobNumber ?? '',
    status: docket.docketStatus,
    customerId: customer?.id ?? docket.job?.customerId ?? 0,
    customerName,
    productId: docket.jobItem?.product?.id ?? docket.jobItem?.productId ?? 0,
    productName: docket.jobItem?.product?.productName ?? 'N/A',
    deliveryDate: docket.deliveryCollectionDate,
    quantity:
      docket.actualLoadSize ?? docket.plannedLoadSize ?? docket.loadSize ?? 0,
    quantityUom: docket.jobItem?.productSellUom ?? '',
    actualLoadSize: docket.actualLoadSize,
    totalInvoiceAmount: docket.totalInvoiceAmount,
    invoiceStatus: docket.invoiceStatus,
  };
}
