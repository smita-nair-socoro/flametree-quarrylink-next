'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { AddressType } from '@/lib/types/address';
import { GetTodaysDate, parseCalendarDate } from '@/lib/utils/date';
import { DocketFormSchema } from '@/app/(protected)/customer-operations/dockets/(components)/forms/schemas/docket-form-schema';
import type { MapMarker } from '@/components/ui/map';
import { useQuery } from '@tanstack/react-query';
import { APIClient } from '@/lib/api/APIClient';
import { JobsListQueryOptions, JobItemsQueryOptions } from '@/lib/api/job';
import { DocketByIdQueryOptions } from '@/lib/api/docket';
import { DocketDTO } from '@/lib/types/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { JOB_STATUS } from '@/lib/types/job-enums';
import { toAddressType } from '@/lib/utils/address-helper';
import { centsToDollarsNum, roundToTwoDecimals } from '@/lib/utils/currency';
import { DEFAULT_TAX_PERCENTAGE } from '@/lib/utils/tenant-config-helper';
import { calculateConvertedQty } from '@/lib/utils/docket-helper';
import { BADGE_COLORS } from '@/lib/utils';

const formatTimeString = (dateString?: string | null) => {
  if (!dateString) return '';

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateString)) {
    return dateString.substring(0, 5);
  }

  if (dateString.includes('T')) {
    const timePart = dateString.split('T')[1];
    return timePart ? timePart.substring(0, 5) : '';
  }

  if (dateString.includes(' ')) {
    const timePart = dateString.split(' ')[1];
    return timePart ? timePart.substring(0, 5) : '';
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
};

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
  createdBy: string;
  lastModifiedBy: string;
  createdAt: string;
  updatedAt: string;
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
  deliveryCollectionStartTime: formatTimeString(
    docket.deliveryCollectionStartTime,
  ),
  deliveryCollectionEndTime: formatTimeString(docket.deliveryCollectionEndTime),
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
    formatTimeString(selectedJob.startTimeWindow) ||
    currentValues.deliveryCollectionStartTime,

  deliveryCollectionEndTime:
    formatTimeString(selectedJob.endTimeWindow) ||
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

  const { data: jobsData } = useQuery(JobsListQueryOptions());
  const jobsList = Array.isArray(jobsData)
    ? jobsData
    : (jobsData?.content ?? []);

  const allJobs = React.useMemo(
    () =>
      jobsList.map((job) => {
        const isPaused = job.jobStatus === JOB_STATUS.PAUSED;
        return {
          label: `${job.jobNumber} - ${job.projectName}`,
          value: job.id,
          disabled: isPaused,
          badge: isPaused
            ? { label: 'Paused', className: BADGE_COLORS.PAUSED }
            : undefined,
        };
      }),
    [jobsList],
  );

  const effectiveJobId = isJobLocked && jobId ? jobId : selectedJobId;

  const { data: selectedJobDetails } = useQuery({
    ...JobItemsQueryOptions(effectiveJobId),
    enabled: !!effectiveJobId,
  });

  const jobLineItems = React.useMemo(() => {
    return selectedJobDetails?.jobItems ?? [];
  }, [selectedJobDetails]);

  const jobLineItemOptions = React.useMemo(
    () =>
      jobLineItems
        .filter((lineItem) => lineItem.id !== undefined)
        .map((lineItem) => ({
          label: lineItem.product?.productName ?? 'Unknown Product',
          value: lineItem.id as number,
        })),
    [jobLineItems],
  );

  const selectedJob = React.useMemo<SelectedJobPrefill>(() => {
    const jobFromList = jobsList.find((job) => job.id === effectiveJobId);
    const jobDetails = selectedJobDetails;

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

      customerEmail:
        jobDetails?.customerWithAddressResponse?.contactPersonEmail ??
        jobFromList?.customerWithAddressResponse?.contactPersonEmail ??
        '',

      additionalDocketEmails: (() => {
        const contactEmail =
          jobDetails?.customerWithAddressResponse?.contactPersonEmail ??
          jobFromList?.customerWithAddressResponse?.contactPersonEmail ??
          '';
        const recipients =
          jobDetails?.emailRecipients ?? jobFromList?.emailRecipients ?? [];
        return recipients.filter((e) => e !== contactEmail).join(', ');
      })(),

      createdBy: '',
      lastModifiedBy: '',
      createdAt: '',
      updatedAt: '',
    };
  }, [effectiveJobId, jobsList, selectedJobDetails]);

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

    if (!selectedJob.startTimeWindow || !selectedJob.endTimeWindow) {
      return;
    }

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

    if (!selectedJob.startTimeWindow || !selectedJob.endTimeWindow) {
      return;
    }

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
    const selectedJobLineItem = jobLineItems.find(
      (lineItem) => lineItem.id === selectedJobLineItemId,
    );

    const restoredAllocatedQty =
      isEditing && selectedDocket?.jobItemId === selectedJobLineItemId
        ? selectedDocket.actualLoadSize || selectedDocket.plannedLoadSize || 0
        : 0;

    return {
      pickUpAddress: selectedJobLineItem?.quarrySupplier ?? null,
      customerDeliveryAddress:
        selectedJobLineItem?.customerDeliveryAddress ?? null,
      productName: selectedJobLineItem?.product?.productName ?? '',
      quarryName: selectedJobLineItem?.quarrySupplierName ?? '',
      densityTonnagePerM3:
        selectedJobLineItem?.densityTonnagePerM3 ??
        selectedJobLineItem?.product?.densityTonnagePerM3 ??
        0,
      productUom:
        selectedJobLineItem?.productSellUom === 'TN'
          ? 'TN'
          : selectedJobLineItem?.productSellUom === 'M3' ||
              selectedJobLineItem?.productSellUom === 'm3'
            ? 'm3'
            : selectedJobLineItem?.productSellUom === 'BULKA'
              ? 'Bulka'
              : selectedJobLineItem?.productSellUom === 'KG_20'
                ? '20kg'
                : '',
      truckType: selectedJobLineItem?.truckType ?? '',
      truckTypeLabel: selectedJobLineItem?.truckType
        ? (TRUCK_TYPE_MAP[selectedJobLineItem.truckType] ??
          selectedJobLineItem.truckType)
        : '',
      truckSell: selectedJobLineItem?.truckSellPrice ?? 0,
      truckSellQty: selectedJobLineItem?.truckSellQty ?? 0,
      truckUom:
        selectedJobLineItem?.truckSellUom === 'TN'
          ? 'TN'
          : selectedJobLineItem?.truckSellUom === 'M3' ||
              selectedJobLineItem?.truckSellUom === 'm3'
            ? 'm3'
            : selectedJobLineItem?.truckSellUom === 'BULKA'
              ? 'Bulka'
              : selectedJobLineItem?.truckSellUom === 'KG_20'
                ? '20kg'
                : selectedJobLineItem?.truckSellUom === 'HOURLY'
                  ? 'Hourly'
                  : selectedJobLineItem?.truckSellUom === 'LOAD'
                    ? 'Load'
                    : selectedJobLineItem?.truckSellUom === 'KM'
                      ? 'km'
                      : '',
      productSell: selectedJobLineItem?.productSellPrice ?? 0,
      productSellQty: selectedJobLineItem?.productSellQty ?? 0,
      remainingQty:
        (selectedJobLineItem?.remainingQuantity ?? 0) + restoredAllocatedQty,
      type: selectedJobLineItem?.jobItemType ?? '',
      productId: selectedJobLineItem?.productId ?? 0,
      needTruckQty:
        selectedJobLineItem?.truckSellUom === 'HOURLY' ||
        selectedJobLineItem?.truckSellUom === 'LOAD' ||
        selectedJobLineItem?.truckSellUom === 'KM',
    };
  }, [jobLineItems, docketForm, isEditing, selectedDocket]);

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
    const currentJobLineItemId = docketForm.getValues('jobLineItemId');
    const lineItem = jobLineItems.find(
      (item) => item.id === currentJobLineItemId,
    );
    docketForm.setValue('jobLineItemType', lineItem?.jobItemType ?? '');
  }, [docketForm.watch('jobLineItemId'), jobLineItems, docketForm]);

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

    const subtotal = roundToTwoDecimals(productSell + truckSell);
    const gst = roundToTwoDecimals(subtotal * (taxPercentage / 100));
    const total = roundToTwoDecimals(subtotal + gst);

    return {
      productSell,
      truckSell,
      subtotal,
      gst,
      total,
    };
  }, [
    selectedJobLineItemDetails,
    loadSize,
    actualLoadSize,
    truckQty,
    jobLineItemId,
    isEditing,
    selectedDocket?.docketStatus,
    taxPercentage,
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
    allJobs,
    jobLineItemOptions,
    selectedJobId: effectiveJobId,
    selectedJob,
    selectedJobLineItemDetails,
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
