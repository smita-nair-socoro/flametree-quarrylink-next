import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { JobItemsQueryOptions } from '@/lib/api/job';
import { calculateJobPricing } from '@/lib/utils/job-helpers';
import { JobLineItem, jobItems } from '@/lib/types/job';

export const EMPTY_JOB_FORM_VALUES = {
  customerId: 0,
  poNumber: '',
  projectName: '',
  deliveryWindowStart: '',
  deliveryWindowEnd: '',
  receiptEmail: '',
  phone: '',
  email: '',
  accountManagerSub: '',
  deliveryStartDate: undefined,
};

export function useJobFormState(jobId: number, isEditing: boolean = false) {
  const { data: jobDetails } = useQuery({
    ...JobItemsQueryOptions(jobId),
    enabled: isEditing && jobId > 0,
  });

  const mappedJobItems: JobLineItem[] = React.useMemo(() => {
    if (!jobDetails?.jobItems) return [];
    return jobDetails.jobItems.map((item: jobItems) => ({
      id: item.id,
      jobId: item.jobId,
      productId: item.productId,
      type: item.jobItemType,
      quarrySupplierId: item.quarrySupplierId,
      customerDeliveryAddressId: item.addressId,
      customerDeliveryAddress: item.address,
      productName: item.product?.productName || '',
      quarryName: '', // Not in DTO
      supplierProductName: '', // Not in DTO
      productCostUom: item.selectedCostUnit,
      productCostQty: item.totalQuantityRequired, // Assuming this maps to cost qty
      productCostPrice: 0, // Missing in DTO
      totalProductCostPrice: 0, // Missing in DTO
      productSellUom: item.selectedSellUnit,
      productSellQty: item.totalQuantityRequired, // Assuming this maps to sell qty
      productSellPrice: 0, // Missing in DTO
      totalProductSellPrice: 0, // Missing in DTO
      truckType: item.selectedTruckType,
      truckCostUom: item.selectedTruckRateType,
      truckCostQty: 0, // Missing in DTO
      truckCostPrice: 0, // Missing in DTO
      totalTruckCostPrice: 0, // Missing in DTO
      truckSellUom: item.selectedTruckRateType, // Assuming same as cost for now
      truckSellQty: 0, // Missing in DTO
      truckSellPrice: 0, // Missing in DTO
      totalTruckSellPrice: 0, // Missing in DTO
      grossProfit: 0, // Missing in DTO
      totalQuantityRequired: item.totalQuantityRequired,
      allocatedQuantity: item.allocatedQuantity,
      remainingQuantity: item.remainingQuantity,
      createdBy: '',
      createdAt: '',
      updatedAt: '',
      lastModifiedBy: '',
      version: item.version,
      isDeleted: false,
    }));
  }, [jobDetails?.jobItems]);

  const pricingBreakdown = React.useMemo(() => {
    if (!isEditing || !mappedJobItems.length) {
      return calculateJobPricing(null);
    }
    return calculateJobPricing(mappedJobItems);
  }, [isEditing, mappedJobItems]);

  return {
    jobDetails,
    jobItems: mappedJobItems,
    pricingBreakdown,
  };
}
