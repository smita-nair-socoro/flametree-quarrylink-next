'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { sortByLabel } from '@/lib/utils/sort-options';
import { AddressType } from '@/lib/types/address';
import { GetTodaysDate, parseCalendarDate } from '@/lib/utils/date';
import { DocketFormSchema } from '@/app/(protected)/customer-operations/dockets/(components)/forms/schemas/docket-form-schema';
import type { MapMarker } from '@/components/ui/map';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { APIClient } from '@/lib/api/APIClient';
import { useJobsForForm } from '@/hooks/job/use-jobs-for-form';
import { useJobLineItemsForForm } from '@/hooks/job/use-job-line-items-for-form';
import { DocketByIdQueryOptions } from '@/lib/api/docket';
import { DocketDTO } from '@/lib/types/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { toAddressType } from '@/lib/utils/address-helper';
import { centsToDollarsNum, roundToTwoDecimals } from '@/lib/utils/currency';
import { DEFAULT_TAX_PERCENTAGE } from '@/lib/utils/tenant-config-helper';
import {
  calculateConvertedQty,
  formatUomLabel,
} from '@/lib/utils/docket-helper';
import {
  normalizeDeliveryTimeWindowEnd,
  normalizeDeliveryTimeWindowStart,
} from '@/lib/utils/time';
import { RECOVERY_MODE } from '@/lib/types/fee-recovery-enums';
import {
  LinkedProductsInfiniteListQueryOptions,
  QuarryDetailQueryOptions,
} from '@/lib/api/quarries';
import {
  getProductItemsFromInfinitePages,
} from '@/lib/api/product';
import { QuarrySupplierProductDetailQueryOptions } from '@/lib/api/quarry-supplier-product';
import { JOB_LINE_ITEM_TYPE } from '@/lib/types/job-enums';

const DEFAULT_DIGITAL_PLATFORM_FEE_LABEL = 'Digital Platform Fee';

export const EMPTY_DOCKET_FORM_VALUES = {
  jobId: 0,
  jobLineItemId: 0,
  plannedLoadSize: 0,
  actualLoadSize: 0,
  truckQty: 0,
  pickUpAddressId: '',
  deliveryAddressId: '',
  purchaseOrder: '',
  productEstimatedVolume: 0,
  deliveryCollectionDate: GetTodaysDate(),
  deliveryCollectionStartTime: '',
  deliveryCollectionEndTime: '',
  customerContactName: '',
  customerContactPhone: '',
  docketEmail: '',
  notes: '',
  jobLineItemType: '',
};

export const EMPTY_ADDRESS: AddressType = {
  address1: '',
  address2: '',
  formattedAddress: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
  lat: 0,
  lng: 0,
  googlePlaceId: '',
};

type FormValues = z.infer<typeof DocketFormSchema>;

export type SelectOption = { label: string; value: number };

type UseDocketFormStateProps = {
  id?: number;
  initialDocket?: DocketDTO | null;
  isQuickDocket?: boolean;
  jobId?: number;
  onDirtyChange?: (isDirty: boolean) => void;
  taxPercentage?: number;
};

type SelectedJobPrefill = {
  deliveryStartDate: string;
  startTimeWindow: string;
  endTimeWindow: string;
  poNumber: string;
  contactName: string;
  contactPhone: string;
  customerEmail: string;
  additionalDocketEmails: string;
};

const TRUCK_TYPE_MAP: Record<string, string> = {
  TRUCK: 'Truck',
  SEMI_TRAILER: 'Semi-Trailer',
  TRUCK_AND_TRAILER: 'Truck + Trailer',
  RIGID_TRUCK: 'Rigid truck',
  FLATBED: 'Flatbed',
  TIPPER: 'Tipper',
  TANDEM: 'Tandem',
  QUAD: 'Quad',
  TRI_AXLE: 'Tri-Axle',
  TAUTLINER: 'Tautliner',
  CRANE_TRUCK: 'Crane Truck',
};

const getSafeDeliveryDate = (dateString?: string) => {
  const todayDate = GetTodaysDate();
  if (!dateString) return todayDate;

  const jobDate = parseCalendarDate(dateString);
  return jobDate < todayDate ? todayDate : jobDate;
};

const mapDocketAddressToAddressType = (
  address?: DocketDTO['pickUpAddress'] | DocketDTO['deliveryAddress'] | null,
): AddressType => {
  if (!address) return EMPTY_ADDRESS;

  return {
    address1: address.streetDetailsPrimary || '',
    address2: address.streetDetailsOptional || '',
    formattedAddress: address.formattedAddress || '',
    city: address.city || '',
    region: address.state || '',
    postalCode: address.postcode || '',
    country: address.country || '',
    lat: address.latitude || 0,
    lng: address.longitude || 0,
    googlePlaceId: address.googlePlaceId || '',
  };
};

const mapDocketToFormValues = (
  docket: DocketDTO,
  currentCustomerEmail = '',
): FormValues => ({
  jobId: docket.jobId ?? 0,
  jobLineItemId: docket.jobItemId ?? 0,
  plannedLoadSize: docket.plannedLoadSize ?? 0,
  actualLoadSize: docket.actualLoadSize ?? 0,
  truckQty: docket.deliveryDistanceQuantity ?? 0,
  pickUpAddressId: String(docket.pickUpAddress?.id ?? ''),
  deliveryAddressId: docket.deliveryAddress?.id
    ? String(docket.deliveryAddress.id)
    : '',
  purchaseOrder: docket.purchaseOrder ?? '',
  productEstimatedVolume: docket.productEstimatedVolume ?? 0,
  deliveryCollectionDate: docket.deliveryCollectionDate
    ? parseCalendarDate(docket.deliveryCollectionDate as unknown as string)
    : GetTodaysDate(),
  deliveryCollectionStartTime: normalizeDeliveryTimeWindowStart(
    docket.deliveryCollectionStartTime,
  ),
  deliveryCollectionEndTime: normalizeDeliveryTimeWindowEnd(
    docket.deliveryCollectionEndTime,
  ),
  customerContactName: docket.customerContactName ?? '',
  customerContactPhone: docket.customerContactPhone ?? '',
  docketEmail:
    docket.docketEmailRecipients
      ?.filter((email) => email !== currentCustomerEmail)
      .join(', ') ?? '',
  notes: docket.notes ?? '',
  truckType: docket.truckType ?? '',
  jobLineItemType: docket.jobItem?.jobItemType ?? '',
});

const mapSelectedJobToFormValues = (
  currentValues: FormValues,
  selectedJob: SelectedJobPrefill,
  nextJobId: number,
): FormValues => ({
  ...currentValues,
  jobId: nextJobId,
  deliveryCollectionDate:
    getSafeDeliveryDate(selectedJob.deliveryStartDate) ??
    currentValues.deliveryCollectionDate,
  purchaseOrder: selectedJob.poNumber || currentValues.purchaseOrder,
  customerContactName:
    selectedJob.contactName || currentValues.customerContactName,
  customerContactPhone:
    selectedJob.contactPhone || currentValues.customerContactPhone,
  docketEmail: selectedJob.additionalDocketEmails || currentValues.docketEmail,

  deliveryCollectionStartTime:
    normalizeDeliveryTimeWindowStart(selectedJob.startTimeWindow) ||
    currentValues.deliveryCollectionStartTime,

  deliveryCollectionEndTime:
    normalizeDeliveryTimeWindowEnd(selectedJob.endTimeWindow) ||
    currentValues.deliveryCollectionEndTime,
});

const resetJobDependentFields = (values: FormValues): FormValues => ({
  ...values,
  jobLineItemId: 0,
  plannedLoadSize: 0,
  actualLoadSize: 0,
  truckQty: 0,
  pickUpAddressId: '',
  deliveryAddressId: '',
  productEstimatedVolume: 0,
});

export function useDocketFormState({
  id,
  initialDocket,
  isQuickDocket = true,
  jobId,
  onDirtyChange,
  taxPercentage = DEFAULT_TAX_PERCENTAGE,
}: UseDocketFormStateProps) {
  const isEditing = Boolean(id);

  /**
   * - isQuickDocket=true means the user selects jobId manually.
   * - isQuickDocket=false means jobId is passed in.
   */
  const isJobLocked = !isEditing && !isQuickDocket && !!jobId;

  const [isDirtyTrackingReady, setIsDirtyTrackingReady] = React.useState(false);

  const hydratedKeyRef = React.useRef<string | null>(null);
  const previousSelectedJobIdRef = React.useRef<number | null>(null);

  const docketForm = useForm<FormValues>({
    resolver: zodResolver(DocketFormSchema),
    mode: 'onChange',
    defaultValues: initialDocket
      ? mapDocketToFormValues(initialDocket)
      : {
          ...EMPTY_DOCKET_FORM_VALUES,
          jobId: isJobLocked && jobId ? jobId : 0,
        },
  });

  const [pickUpAddress, setPickUpAddress] =
    React.useState<AddressType>(EMPTY_ADDRESS);
  const [deliveryAddress, setDeliveryAddress] =
    React.useState<AddressType>(EMPTY_ADDRESS);
  const [pickUpSearchInput, setPickUpSearchInput] = React.useState('');
  const [deliverySearchInput, setDeliverySearchInput] = React.useState('');

  const { data: selectedDocket } = useQuery({
    ...DocketByIdQueryOptions(id || 0),
    enabled: isEditing,
  });

  const selectedJobId = docketForm.watch('jobId');
  const effectiveJobId = isJobLocked && jobId ? jobId : selectedJobId;

  /**
   * Product select: infinite load of the selected job's line items. The
   * product can't change on an existing docket and the docket embeds its own
   * jobItem, so this is only fetched when creating.
   */
  const {
    jobDetails: selectedJobDetails,
    jobLineItems,
    lineItemSelectProps,
  } = useJobLineItemsForForm({
    jobId: effectiveJobId,
    enabled: !isEditing,
  });

  const isInternalTransfer =
    selectedJobDetails?.jobType === 'INTERNAL_TRANSFER';
  const fromSiteId = selectedJobDetails?.fromSiteId ?? 0;
  const toSiteId = selectedJobDetails?.toSiteId ?? 0;
  const watchedProductOrLineItemId = docketForm.watch('jobLineItemId');

  const {
    data: linkedProductsData,
    fetchNextPage: fetchNextLinkedProductsPage,
    hasNextPage: hasMoreLinkedProducts,
    isFetchingNextPage: isFetchingMoreLinkedProducts,
  } = useInfiniteQuery({
    ...LinkedProductsInfiniteListQueryOptions(fromSiteId, { pageSize: 25 }),
    enabled: !isEditing && isInternalTransfer && fromSiteId > 0,
  });

  const linkedProducts = React.useMemo(
    () => getProductItemsFromInfinitePages(linkedProductsData?.pages),
    [linkedProductsData?.pages],
  );

  const { data: fromSiteDetails } = useQuery({
    ...QuarryDetailQueryOptions(fromSiteId),
    enabled: isInternalTransfer && fromSiteId > 0,
  });
  const { data: toSiteDetails } = useQuery({
    ...QuarryDetailQueryOptions(toSiteId),
    enabled: isInternalTransfer && toSiteId > 0,
  });

  const { data: selectedTransferProductPricing } = useQuery({
    ...QuarrySupplierProductDetailQueryOptions(
      fromSiteId,
      watchedProductOrLineItemId || 0,
    ),
    enabled:
      !isEditing &&
      isInternalTransfer &&
      fromSiteId > 0 &&
      watchedProductOrLineItemId > 0,
  });

  /**
   * Job select: infinite load + server-side search (same pattern as the
   * customer select in the quotation form). Not fetched in edit mode where
   * the job is locked and comes embedded in the docket.
   */
  const { jobs: jobsList, jobSelectProps } = useJobsForForm({
    enabled: !isEditing,
    selectedJobId: effectiveJobId,
    fallbackJob:
      selectedJobDetails?.id === effectiveJobId
        ? selectedJobDetails
        : selectedDocket?.job?.id === effectiveJobId
          ? selectedDocket.job
          : null,
  });

  const jobLineItemOptions = React.useMemo(() => {
    if (isEditing) {
      return selectedDocket?.jobItem
        ? [
            {
              label:
                selectedDocket.jobItem.product?.productName ??
                'Unknown Product',
              value: selectedDocket.jobItem.id,
            },
          ]
        : [];
    }

    if (isInternalTransfer) {
      return sortByLabel(
        linkedProducts
          .filter((product) => product.id !== undefined)
          .map((product) => ({
            label: product.productName ?? 'Unknown Product',
            value: product.id as number,
          })),
        (option) => option.label,
      );
    }

    return sortByLabel(
      jobLineItems
        .filter((lineItem) => lineItem.id !== undefined)
        .map((lineItem) => ({
          label: lineItem.product?.productName ?? 'Unknown Product',
          value: lineItem.id as number,
        })),
      (option) => option.label,
    );
  }, [
    isEditing,
    isInternalTransfer,
    selectedDocket?.jobItem,
    jobLineItems,
    linkedProducts,
  ]);

  const jobLineItemSelectProps = React.useMemo(() => {
    if (!isInternalTransfer) return lineItemSelectProps;
    return {
      onDropdownOpenChange: lineItemSelectProps.onDropdownOpenChange,
      onOptionsListScrollEnd: () => {
        if (!hasMoreLinkedProducts || isFetchingMoreLinkedProducts) return;
        void fetchNextLinkedProductsPage();
      },
      hasMoreOptions: hasMoreLinkedProducts,
      isLoadingMoreOptions: isFetchingMoreLinkedProducts,
    };
  }, [
    isInternalTransfer,
    lineItemSelectProps,
    hasMoreLinkedProducts,
    isFetchingMoreLinkedProducts,
    fetchNextLinkedProductsPage,
  ]);

  const selectedJob = React.useMemo<SelectedJobPrefill>(() => {
    const jobFromList = jobsList.find((job) => job.id === effectiveJobId);
    const jobDetails = selectedJobDetails;

    // The docket's embedded customerDto uses a flat `email` field rather than
    // CustomerDTO's `contactPersonEmail`.
    const customerEmail =
      jobDetails?.customerWithAddressResponse?.contactPersonEmail ??
      jobFromList?.customerWithAddressResponse?.contactPersonEmail ??
      selectedDocket?.job?.customerDto?.email ??
      '';

    return {
      deliveryStartDate:
        jobDetails?.estimatedStartDate ?? jobFromList?.estimatedStartDate ?? '',

      startTimeWindow:
        jobDetails?.startTimeWindow ?? jobFromList?.startTimeWindow ?? '',

      endTimeWindow:
        jobDetails?.endTimeWindow ?? jobFromList?.endTimeWindow ?? '',

      poNumber: jobDetails?.poNumber ?? jobFromList?.poNumber ?? '',

      contactName:
        jobDetails?.contactPersonName ?? jobFromList?.contactPersonName ?? '',

      contactPhone:
        jobDetails?.contactPersonPhone ?? jobFromList?.contactPersonPhone ?? '',

      customerEmail,

      additionalDocketEmails: (() => {
        const recipients =
          jobDetails?.emailRecipients ?? jobFromList?.emailRecipients ?? [];
        return recipients.filter((e) => e !== customerEmail).join(', ');
      })(),
    };
  }, [effectiveJobId, jobsList, selectedJobDetails, selectedDocket]);

  const resetAddressState = React.useCallback(() => {
    setPickUpAddress(EMPTY_ADDRESS);
    setDeliveryAddress(EMPTY_ADDRESS);
    setPickUpSearchInput('');
    setDeliverySearchInput('');
  }, []);

  React.useEffect(() => {
    setIsDirtyTrackingReady(false);
    hydratedKeyRef.current = null;
    previousSelectedJobIdRef.current = null;

    if (!isEditing) {
      resetAddressState();
    }
  }, [id, isEditing, isQuickDocket, jobId, resetAddressState]);

  React.useEffect(() => {
    onDirtyChange?.(
      isDirtyTrackingReady ? docketForm.formState.isDirty : false,
    );
  }, [docketForm.formState.isDirty, isDirtyTrackingReady, onDirtyChange]);

  /**
   * 1. Edit mode
   * Prepopulate from selectedDocket.
   */
  React.useEffect(() => {
    if (!isEditing || !selectedDocket) return;

    const hydrationKey = `edit-${selectedDocket.id}-${selectedDocket.updatedAt ?? ''}`;

    if (hydratedKeyRef.current === hydrationKey) return;

    docketForm.reset(
      mapDocketToFormValues(selectedDocket, selectedJob.customerEmail),
    );

    const mappedPickUp = mapDocketAddressToAddressType(
      selectedDocket.pickUpAddress,
    );
    setPickUpAddress(mappedPickUp);
    setPickUpSearchInput(mappedPickUp.formattedAddress);

    const mappedDelivery = mapDocketAddressToAddressType(
      selectedDocket.deliveryAddress,
    );
    setDeliveryAddress(mappedDelivery);
    setDeliverySearchInput(mappedDelivery.formattedAddress);

    hydratedKeyRef.current = hydrationKey;
    setIsDirtyTrackingReady(true);
  }, [docketForm, isEditing, selectedDocket, selectedJob.customerEmail]);

  /**
   * 2. Create mode + quick docket
   * jobId is passed in. Hydrate from the passed jobId and lock the job field.
   */
  React.useEffect(() => {
    if (isEditing || isQuickDocket || !jobId) return;

    const hydrationKey = `locked-create-${jobId}`;

    if (hydratedKeyRef.current === hydrationKey) return;

    const isJobLoaded =
      selectedJobDetails || jobsList.find((job) => job.id === jobId);

    if (!isJobLoaded) return;

    const currentValues = docketForm.getValues();

    docketForm.reset(
      resetJobDependentFields(
        mapSelectedJobToFormValues(currentValues, selectedJob, jobId),
      ),
    );

    resetAddressState();

    hydratedKeyRef.current = hydrationKey;
    setIsDirtyTrackingReady(true);
  }, [
    docketForm,
    isEditing,
    isQuickDocket,
    jobId,
    resetAddressState,
    selectedJob,
    selectedJobDetails,
    jobsList,
  ]);

  /**
   * 3. Create mode + normal docket
   * User selects jobId from the form, then prefill job-related fields.
   */
  React.useEffect(() => {
    if (isEditing || !isQuickDocket) return;

    setIsDirtyTrackingReady(true);

    if (!selectedJobId) return;

    if (previousSelectedJobIdRef.current === selectedJobId) return;

    const isJobLoaded =
      selectedJobDetails || jobsList.find((job) => job.id === selectedJobId);

    if (!isJobLoaded) return;

    previousSelectedJobIdRef.current = selectedJobId;

    const currentValues = docketForm.getValues();

    docketForm.reset(
      resetJobDependentFields(
        mapSelectedJobToFormValues(currentValues, selectedJob, selectedJobId),
      ),
    );

    resetAddressState();
  }, [
    docketForm,
    isEditing,
    isQuickDocket,
    resetAddressState,
    selectedJob,
    selectedJobId,
    selectedJobDetails,
    jobsList,
  ]);

  const selectedJobLineItemDetails = React.useCallback(() => {
    const selectedJobLineItemId = docketForm.watch('jobLineItemId');

    if (isInternalTransfer && !isEditing) {
      const product = linkedProducts.find(
        (item) => item.id === selectedJobLineItemId,
      );
      const costPrice =
        selectedTransferProductPricing?.perTnCostPrice ??
        selectedTransferProductPricing?.perM3CostPrice ??
        selectedTransferProductPricing?.per20kgCostPrice ??
        selectedTransferProductPricing?.perBulkaCostPrice ??
        0;
      const productUom =
        selectedTransferProductPricing?.perTnCostPrice &&
        selectedTransferProductPricing.perTnCostPrice > 0
          ? 'TN'
          : selectedTransferProductPricing?.perM3CostPrice &&
              selectedTransferProductPricing.perM3CostPrice > 0
            ? 'M3'
            : product?.densityTonnagePerM3
              ? 'TN'
              : 'TN';

      return {
        pickUpAddress: fromSiteDetails
          ? {
              id: fromSiteDetails.id,
              name: fromSiteDetails.name,
              address: fromSiteDetails.address,
            }
          : null,
        customerDeliveryAddress: toSiteDetails
          ? {
              id: toSiteDetails.id,
              address: toSiteDetails.address,
            }
          : null,
        productName: product?.productName ?? '',
        quarryName: fromSiteDetails?.name ?? selectedJobDetails?.fromSiteName ?? '',
        densityTonnagePerM3:
          selectedTransferProductPricing?.densityTonnagePerM3 ??
          product?.densityTonnagePerM3 ??
          0,
        productUom,
        productUomLabel: formatUomLabel(productUom),
        truckType: '',
        truckTypeLabel: '',
        truckSell: 0,
        truckSellQty: 0,
        truckUom: '',
        truckUomLabel: '',
        productSell: costPrice,
        productSellQty: 0,
        productCostPrice: costPrice,
        remainingQty: Number.MAX_SAFE_INTEGER,
        type: JOB_LINE_ITEM_TYPE.DELIVERY,
        productId: product?.id ?? selectedJobLineItemId ?? 0,
        needTruckQty: false,
      };
    }

    // In edit mode the product is locked, so read the line item embedded in
    // the docket instead of the (not fetched) job line items.
    const selectedJobLineItem = isEditing
      ? selectedDocket?.jobItem
      : jobLineItems.find((lineItem) => lineItem.id === selectedJobLineItemId);

    const restoredAllocatedQty =
      isEditing && selectedDocket?.jobItemId === selectedJobLineItemId
        ? selectedDocket.actualLoadSize || selectedDocket.plannedLoadSize || 0
        : 0;

    // Raw API UOM enums ('M3', 'KG_20', ...): the conversion helpers
    // normalize case themselves. Display sites use the pre-formatted
    // *UomLabel values instead of re-converting.
    const productUom = selectedJobLineItem?.productSellUom ?? '';
    const truckUom = selectedJobLineItem?.truckSellUom ?? '';

    return {
      pickUpAddress: selectedJobLineItem?.quarrySupplier ?? null,
      customerDeliveryAddress:
        selectedJobLineItem?.customerDeliveryAddress ?? null,
      productName: selectedJobLineItem?.product?.productName ?? '',
      quarryName: selectedJobLineItem?.quarrySupplier?.name ?? '',
      densityTonnagePerM3:
        selectedJobLineItem?.densityTonnagePerM3 ??
        selectedJobLineItem?.product?.densityTonnagePerM3 ??
        0,
      productUom,
      productUomLabel: formatUomLabel(productUom),
      truckType: selectedJobLineItem?.truckType ?? '',
      truckTypeLabel: selectedJobLineItem?.truckType
        ? (TRUCK_TYPE_MAP[selectedJobLineItem.truckType] ??
          selectedJobLineItem.truckType)
        : '',
      truckSell: selectedJobLineItem?.truckSellPrice ?? 0,
      truckSellQty: selectedJobLineItem?.truckSellQty ?? 0,
      truckUom,
      truckUomLabel: formatUomLabel(truckUom),
      productSell: selectedJobLineItem?.productSellPrice ?? 0,
      productSellQty: selectedJobLineItem?.productSellQty ?? 0,
      productCostPrice: selectedJobLineItem?.productCostPrice ?? 0,
      remainingQty:
        (selectedJobLineItem?.remainingQuantity ?? 0) + restoredAllocatedQty,
      type: selectedJobLineItem?.jobItemType ?? '',
      productId: selectedJobLineItem?.productId ?? 0,
      needTruckQty:
        selectedJobLineItem?.truckSellUom === 'HOURLY' ||
        selectedJobLineItem?.truckSellUom === 'LOAD' ||
        selectedJobLineItem?.truckSellUom === 'KM',
    };
  }, [
    jobLineItems,
    docketForm,
    isEditing,
    selectedDocket,
    isInternalTransfer,
    linkedProducts,
    selectedTransferProductPricing,
    fromSiteDetails,
    toSiteDetails,
    selectedJobDetails?.fromSiteName,
  ]);

  /**
   * Prefill IT site addresses and contact defaults from From/To sites.
   */
  React.useEffect(() => {
    if (isEditing || !isInternalTransfer) return;

    if (fromSiteDetails?.address) {
      const mappedPickup = toAddressType(fromSiteDetails.address);
      setPickUpAddress(mappedPickup);
      setPickUpSearchInput(mappedPickup.formattedAddress || '');
      docketForm.setValue(
        'pickUpAddressId',
        String(
          fromSiteDetails.address?.googlePlaceId ||
            fromSiteDetails.id ||
            'from-site',
        ),
        { shouldDirty: false },
      );
      if (!docketForm.getValues('customerContactName')) {
        docketForm.setValue(
          'customerContactName',
          fromSiteDetails.contactPersonName || fromSiteDetails.name || 'Internal Transfer',
          { shouldDirty: false },
        );
      }
      if (!docketForm.getValues('customerContactPhone')) {
        docketForm.setValue(
          'customerContactPhone',
          fromSiteDetails.contactPersonPhone || fromSiteDetails.phone || '+61400000000',
          { shouldDirty: false },
        );
      }
    }

    if (toSiteDetails?.address) {
      const mappedDelivery = toAddressType(toSiteDetails.address);
      setDeliveryAddress(mappedDelivery);
      setDeliverySearchInput(mappedDelivery.formattedAddress || '');
      docketForm.setValue(
        'deliveryAddressId',
        String(
          toSiteDetails.address?.googlePlaceId ||
            toSiteDetails.id ||
            'to-site',
        ),
        { shouldDirty: false },
      );
      docketForm.setValue('jobLineItemType', JOB_LINE_ITEM_TYPE.DELIVERY, {
        shouldDirty: false,
      });
    }
  }, [
    isEditing,
    isInternalTransfer,
    fromSiteDetails,
    toSiteDetails,
    docketForm,
  ]);

  /**
   * Update addresses when job line item changes.
   * Create mode only.
   */
  React.useEffect(() => {
    if (isEditing) return;

    const details = selectedJobLineItemDetails();

    if (details.customerDeliveryAddress) {
      const address = details.customerDeliveryAddress.address;

      if (address) {
        const mappedAddress = toAddressType(address);

        setDeliveryAddress(mappedAddress);
        setDeliverySearchInput(address.formattedAddress || '');

        if (details.type !== 'COLLECTION') {
          docketForm.setValue(
            'deliveryAddressId',
            details.customerDeliveryAddress.id
              ? String(details.customerDeliveryAddress.id)
              : '',
          );
        }
      }
    }

    if (details.pickUpAddress) {
      const pickUp = details.pickUpAddress.address;

      if (pickUp) {
        const mappedPickupAddress = toAddressType(pickUp);

        setPickUpAddress(mappedPickupAddress);
        setPickUpSearchInput(pickUp.formattedAddress || '');

        docketForm.setValue(
          'pickUpAddressId',
          details.pickUpAddress.id ? String(details.pickUpAddress.id) : '',
        );
      }
    }

    if (details.truckType) {
      docketForm.setValue('truckType', details.truckType);
    }
  }, [
    docketForm.watch('jobLineItemId'),
    isEditing,
    selectedJobLineItemDetails,
    docketForm,
  ]);

  React.useEffect(() => {
    // Edit mode hydrates jobLineItemType from the docket itself; job line
    // items are not fetched there, so this would wipe the value.
    if (isEditing) return;

    const currentJobLineItemId = docketForm.getValues('jobLineItemId');
    const lineItem = jobLineItems.find(
      (item) => item.id === currentJobLineItemId,
    );
    docketForm.setValue('jobLineItemType', lineItem?.jobItemType ?? '');
  }, [docketForm.watch('jobLineItemId'), jobLineItems, docketForm, isEditing]);

  const productDetailsQuery = useQuery({
    queryKey: ['product', selectedJobLineItemDetails().productId],
    queryFn: () =>
      APIClient.products.getByIdWithMaterial(
        selectedJobLineItemDetails().productId,
      ),
    enabled: !!selectedJobLineItemDetails().productId,
  });

  const loadSize = docketForm.watch('plannedLoadSize');
  const actualLoadSize = docketForm.watch('actualLoadSize');
  const truckQty = docketForm.watch('truckQty');
  const jobLineItemId = docketForm.watch('jobLineItemId');

  const pricingBreakdown = React.useMemo(() => {
    const details = selectedJobLineItemDetails();
    const density = details.densityTonnagePerM3 || 1;

    const currentStatus = selectedDocket?.docketStatus;
    const effectiveLoadSize =
      isEditing &&
      currentStatus !== DOCKET_STATUS.UNASSIGNED &&
      currentStatus !== DOCKET_STATUS.ASSIGNED &&
      currentStatus !== DOCKET_STATUS.PENDING
        ? actualLoadSize || 0
        : loadSize || 0;

    const productSell = roundToTwoDecimals(
      centsToDollarsNum(details.productSell) * effectiveLoadSize,
    );

    let calculatedTruckQty = 0;

    if (details.type !== 'COLLECTION') {
      if (details.needTruckQty) {
        calculatedTruckQty = truckQty || 0;
      } else {
        calculatedTruckQty = calculateConvertedQty(
          effectiveLoadSize,
          details.productUom,
          details.truckUom,
          density,
        );
      }
    }

    const truckSell = roundToTwoDecimals(
      centsToDollarsNum(details.truckSell) * calculatedTruckQty,
    );

    // Editing a docket: the fee was frozen at creation time on the docket
    // itself. Creating one: the fee comes from the job's (customer's)
    // current fee-recovery settings.
    const platformFee = selectedDocket?.platformFee;
    const feeRecovery = selectedJobDetails?.feeRecovery;
    const showDigitalPlatformFee = isEditing
      ? platformFee?.mode === RECOVERY_MODE.RECOVER
      : feeRecovery?.mode === RECOVERY_MODE.RECOVER;
    const digitalPlatformFee = showDigitalPlatformFee
      ? (isEditing ? platformFee?.customerChargeAmount : feeRecovery?.feeAmount) || 0
      : 0;
    const digitalPlatformFeeLabel =
      (isEditing ? platformFee?.description : feeRecovery?.invoiceLineDescription) ||
      DEFAULT_DIGITAL_PLATFORM_FEE_LABEL;

    const subtotal = roundToTwoDecimals(productSell + truckSell);
    const gst = roundToTwoDecimals(subtotal * (taxPercentage / 100));
    const total = roundToTwoDecimals(subtotal + gst + digitalPlatformFee);

    const productCostUnit = roundToTwoDecimals(
      centsToDollarsNum(details.productCostPrice),
    );
    const productCost = roundToTwoDecimals(productCostUnit * effectiveLoadSize);

    return {
      productSell,
      truckSell,
      digitalPlatformFee,
      digitalPlatformFeeLabel,
      showDigitalPlatformFee,
      subtotal,
      gst,
      total,
      productCostUnit,
      productCost,
      missingCostPrice: productCostUnit <= 0,
    };
  }, [
    selectedJobLineItemDetails,
    loadSize,
    actualLoadSize,
    truckQty,
    jobLineItemId,
    isEditing,
    selectedDocket?.docketStatus,
    selectedDocket?.platformFee,
    taxPercentage,
    selectedJobDetails?.feeRecovery,
  ]);

  const mapMarkers = React.useMemo<MapMarker[]>(
    () => [
      { lat: pickUpAddress.lat, lng: pickUpAddress.lng, color: 'red' },
      { lat: deliveryAddress.lat, lng: deliveryAddress.lng, color: 'green' },
    ],
    [pickUpAddress, deliveryAddress],
  );

  const today = React.useMemo(() => GetTodaysDate(), []);

  return {
    docketForm,
    isEditing,
    isJobLocked,
    jobSelectProps,
    jobLineItemOptions,
    jobLineItemSelectProps,
    selectedJobId: effectiveJobId,
    selectedJobEmail: selectedJob.customerEmail,
    selectedJobDetails,
    jobLineItems,
    selectedJobLineItemDetails,
    isInternalTransfer,
    pricingBreakdown,
    mapMarkers,
    today,
    pickUpAddress,
    setPickUpAddress,
    deliveryAddress,
    setDeliveryAddress,
    pickUpSearchInput,
    setPickUpSearchInput,
    deliverySearchInput,
    setDeliverySearchInput,
    productDetails: productDetailsQuery.data,
    selectedDocket,
  };
}
