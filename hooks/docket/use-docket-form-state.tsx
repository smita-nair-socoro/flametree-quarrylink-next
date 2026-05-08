'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { AddressType } from '@/lib/types/address';
import { GetTodaysDate, parseAsUTC } from '@/lib/utils/date';
import { DocketFormSchema } from '@/app/(protected)/customer-operations/dockets/(components)/forms/schemas/docket-form-schema';
import type { MapMarker } from '@/components/ui/map';
import { useQuery } from '@tanstack/react-query';
import { APIClient } from '@/lib/api/APIClient';
import { JobsListQueryOptions, JobItemsQueryOptions } from '@/lib/api/job';
import { DocketByIdQueryOptions } from '@/lib/api/docket';
import { DocketDTO } from '@/lib/types/docket';
import { toAddressType } from '@/lib/utils/address-helper';
import { centsToDollarsNum, roundToTwoDecimals } from '@/lib/utils/currency';

export const calculateConvertedQty = (
  quantity: number,
  fromUom: string,
  toUom: string,
  density: number = 1,
) => {
  if (fromUom === toUom) return quantity;

  let quantityInTn = quantity;
  const normalizedFrom = fromUom.toLowerCase();
  const normalizedTo = toUom.toLowerCase();
  if (normalizedFrom === 'm3' || normalizedFrom === 'bulka') {
    quantityInTn = quantity * density;
  } else if (normalizedFrom === '20kg' || normalizedFrom === 'kg_20') {
    quantityInTn = quantity / 50;
  }
  if (normalizedTo === 'm3' || normalizedTo === 'bulka') {
    return quantityInTn / density;
  } else if (normalizedTo === '20kg' || normalizedTo === 'kg_20') {
    return quantityInTn * 50;
  }

  return quantityInTn; // Default to TN
};

// Helper to format Date to HH:MM time string
const formatTimeString = (dateString?: string | null) => {
  if (!dateString) return '';

  // If it's already just a time string like "14:00" or "14:00:00"
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateString)) {
    return dateString.substring(0, 5);
  }

  // If it's an ISO string, we can just extract the time part to avoid timezone shifts
  if (dateString.includes('T')) {
    const timePart = dateString.split('T')[1];
    if (timePart) {
      return timePart.substring(0, 5);
    }
  } else if (dateString.includes(' ')) {
    const timePart = dateString.split(' ')[1];
    if (timePart) {
      return timePart.substring(0, 5);
    }
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
  deliveryCollectionDate: undefined,
  deliveryCollectionStartTime: '',
  deliveryCollectionEndTime: '',
  customerContactName: '',
  customerContactPhone: '',
  docketEmail: '',
  notes: '',
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

const MOCK_PICK_UP_ADDRESS: AddressType = {
  address1: '123 George St',
  address2: 'Unit 5',
  formattedAddress: '123 George St Unit 5, Sydney, NSW 2000 Australia',
  city: 'Sydney',
  region: 'NSW',
  postalCode: '2000',
  country: 'Australia',
  lat: -33.86785,
  lng: 151.20732,
  googlePlaceId: '123456789012',
};

type FormValues = z.infer<typeof DocketFormSchema>;

export type SelectOption = { label: string; value: number };

type UseDocketFormStateProps = {
  id?: number;
  initialDocket?: DocketDTO | null;
  isQuickDocket?: boolean;
  jobId?: number;
  onDirtyChange?: (isDirty: boolean) => void;
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

export function useDocketFormState({
  id,
  initialDocket,
  isQuickDocket = true,
  jobId,
  onDirtyChange,
}: UseDocketFormStateProps) {
  const isEditing = Boolean(id);
  const isJobLocked = !isQuickDocket && !!jobId;
  const [isDirtyTrackingReady, setIsDirtyTrackingReady] = React.useState(false);

  const docketForm = useForm<FormValues>({
    resolver: zodResolver(DocketFormSchema),
    mode: 'onChange',
    defaultValues: initialDocket
      ? {
          jobId: initialDocket.jobId ?? 0,
          jobLineItemId: initialDocket.jobItemId ?? 0,
          plannedLoadSize:
            initialDocket.plannedLoadSize ?? initialDocket.loadSize ?? 0,
          actualLoadSize: initialDocket.actualLoadSize ?? 0,
          truckQty: initialDocket.deliveryDistanceQuantity ?? 0,
          pickUpAddressId: String(initialDocket.pickUpAddress?.id ?? ''),
          deliveryAddressId: initialDocket.deliveryAddress?.id
            ? String(initialDocket.deliveryAddress.id)
            : '',
          purchaseOrder: initialDocket.purchaseOrder ?? '',
          productEstimatedVolume: initialDocket.productEstimatedVolume ?? 0,
          deliveryCollectionDate: initialDocket.deliveryCollectionDate
            ? parseAsUTC(initialDocket.deliveryCollectionDate as unknown as string)
            : undefined,
          deliveryCollectionStartTime: formatTimeString(
            initialDocket.deliveryCollectionStartTime,
          ),
          deliveryCollectionEndTime: formatTimeString(
            initialDocket.deliveryCollectionEndTime,
          ),
          customerContactName: initialDocket.customerContactName ?? '',
          customerContactPhone: initialDocket.customerContactPhone ?? '',
          docketEmail: initialDocket.docketEmailRecipients?.join(', ') ?? '',
          notes: initialDocket.notes ?? '',
        }
      : isJobLocked
        ? { ...EMPTY_DOCKET_FORM_VALUES, jobId: jobId! }
        : EMPTY_DOCKET_FORM_VALUES,
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

  // Sync jobId when form opens with locked job (isQuickDocket=false + jobId)
  React.useEffect(() => {
    if (isJobLocked && jobId && docketForm.getValues('jobId') !== jobId) {
      docketForm.setValue('jobId', jobId);
    }
  }, [isJobLocked, jobId, docketForm]);

  // Reset address state when not editing
  React.useEffect(() => {
    if (!isEditing) {
      setPickUpAddress(EMPTY_ADDRESS);
      setDeliveryAddress(EMPTY_ADDRESS);
      setPickUpSearchInput('');
      setDeliverySearchInput('');
    }
  }, [isEditing]);

  // Delay dirty tracking until initial form hydration/prefill is complete
  React.useEffect(() => {
    setIsDirtyTrackingReady(false);
  }, [id, isQuickDocket, jobId]);

  // Report dirty state to parent
  React.useEffect(() => {
    onDirtyChange?.(
      isDirtyTrackingReady ? docketForm.formState.isDirty : false,
    );
  }, [docketForm.formState.isDirty, isDirtyTrackingReady, onDirtyChange]);

  const selectedJobId = docketForm.watch('jobId');

  const { data: jobsData } = useQuery(JobsListQueryOptions());
  const jobsList = Array.isArray(jobsData)
    ? jobsData
    : (jobsData?.content ?? []);

  const allJobs = React.useMemo(
    () =>
      jobsList.map((job) => ({
        label: `${job.jobNumber} - ${job.projectName}`,
        value: job.id,
      })),
    [jobsList],
  );

  const { data: selectedJobDetails } = useQuery({
    ...JobItemsQueryOptions(selectedJobId),
    enabled: !!selectedJobId,
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

  const selectedJob = React.useMemo(() => {
    const job =
      selectedJobDetails ?? jobsList.find((job) => job.id === selectedJobId);

    return {
      deliveryStartDate: job?.estimatedStartDate ?? '',
      startTimeWindow: job?.startTimeWindow ?? '',
      endTimeWindow: job?.endTimeWindow ?? '',
      poNumber: job?.poNumber ?? '',
      contactName: job?.contactPersonName ?? '',
      contactPhone: job?.contactPersonPhone ?? '',
      customerEmail: job?.customerWithAddressResponse?.email ?? '',
      additionalDocketEmails: job?.emailRecipients?.join(', ') ?? '',
      createdBy: '',
      lastModifiedBy: '',
      createdAt: '',
      updatedAt: '',
    };
  }, [selectedJobId, jobsList, selectedJobDetails]);

  // Update form with selected job details (create mode auto-fill)
  React.useEffect(() => {
    if (isEditing) return;

    if (selectedJob.deliveryStartDate) {
      const jobDate = new Date(selectedJob.deliveryStartDate);
      const todayDate = GetTodaysDate();
      docketForm.setValue(
        'deliveryCollectionDate',
        jobDate < todayDate ? todayDate : jobDate,
      );
    }
    if (selectedJob.contactName) {
      docketForm.setValue('customerContactName', selectedJob.contactName);
    }
    if (selectedJob.poNumber) {
      docketForm.setValue('purchaseOrder', selectedJob.poNumber);
    }
    if (selectedJob.contactPhone) {
      docketForm.setValue('customerContactPhone', selectedJob.contactPhone);
    }
    docketForm.setValue('docketEmail', selectedJob.additionalDocketEmails);
    if (selectedJob.startTimeWindow) {
      docketForm.setValue(
        'deliveryCollectionStartTime',
        formatTimeString(selectedJob.startTimeWindow),
      );
    }
    if (selectedJob.endTimeWindow) {
      docketForm.setValue(
        'deliveryCollectionEndTime',
        formatTimeString(selectedJob.endTimeWindow),
      );
    }

    // Reset job line item and addresses when job changes
    if (docketForm.getValues('jobLineItemId') !== 0) {
      docketForm.setValue('jobLineItemId', 0);
      docketForm.setValue('truckQty', 0);
      setPickUpAddress(EMPTY_ADDRESS);
      setDeliveryAddress(EMPTY_ADDRESS);
      setPickUpSearchInput('');
      setDeliverySearchInput('');
      docketForm.setValue('pickUpAddressId', '');
      docketForm.setValue('deliveryAddressId', '');
    }
  }, [selectedJob, docketForm, isEditing]);

  // Establish a clean baseline for new dockets after initial prefill.
  React.useEffect(() => {
    if (isEditing || isDirtyTrackingReady) return;

    if (!isJobLocked) {
      setIsDirtyTrackingReady(true);
      return;
    }

    if (!jobId || docketForm.getValues('jobId') !== jobId) return;
    if (!jobsData) return;

    docketForm.reset({
      ...docketForm.getValues(),
      jobId,
      deliveryCollectionDate: selectedJob.deliveryStartDate
        ? new Date(selectedJob.deliveryStartDate) < GetTodaysDate()
          ? GetTodaysDate()
          : new Date(selectedJob.deliveryStartDate)
        : docketForm.getValues('deliveryCollectionDate'),
      purchaseOrder:
        selectedJob.poNumber || docketForm.getValues('purchaseOrder'),
      customerContactName:
        selectedJob.contactName || docketForm.getValues('customerContactName'),
      customerContactPhone:
        selectedJob.contactPhone ||
        docketForm.getValues('customerContactPhone'),
      docketEmail: selectedJob.additionalDocketEmails,
      deliveryCollectionStartTime: selectedJob.startTimeWindow
        ? formatTimeString(selectedJob.startTimeWindow)
        : docketForm.getValues('deliveryCollectionStartTime'),
      deliveryCollectionEndTime: selectedJob.endTimeWindow
        ? formatTimeString(selectedJob.endTimeWindow)
        : docketForm.getValues('deliveryCollectionEndTime'),
    });
    setIsDirtyTrackingReady(true);
  }, [
    docketForm,
    isDirtyTrackingReady,
    isEditing,
    isJobLocked,
    jobId,
    jobsData,
    selectedJob,
  ]);

  const selectedJobLineItemDetails = React.useCallback(() => {
    const selectedJobLineItemId = docketForm.watch('jobLineItemId');
    const selectedJobLineItem = jobLineItems.find(
      (lineItem) => lineItem.id === selectedJobLineItemId,
    );
    const restoredAllocatedQty =
      isEditing && selectedDocket?.jobItemId === selectedJobLineItemId
        ? (selectedDocket.loadSize ?? 0)
        : 0;
    return {
      pickUpAddress: selectedJobLineItem?.quarrySupplier ?? null,
      customerDeliveryAddress:
        selectedJobLineItem?.customerDeliveryAddress ?? null,
      productName: selectedJobLineItem?.product?.productName ?? '',
      quarryName: selectedJobLineItem?.quarrySupplierName ?? '',
      productUom:
        selectedJobLineItem?.productSellUom === 'TN'
          ? 'TN'
          : selectedJobLineItem?.productSellUom === 'M3'
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
          : selectedJobLineItem?.truckSellUom === 'M3'
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

  // Update delivery address when job line item changes
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
      const pickUpAddress = details.pickUpAddress.address;
      if (pickUpAddress) {
        const mappedPickupAddress = toAddressType(pickUpAddress);
        setPickUpAddress(mappedPickupAddress);
        setPickUpSearchInput(pickUpAddress.formattedAddress || '');
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

  // Populate edit form from docket mock data
  React.useEffect(() => {
    if (!isEditing || !selectedDocket) return;

    const currentCustomerEmail = selectedJob.customerEmail;

    docketForm.reset({
      jobId: selectedDocket.jobId ?? 0,
      jobLineItemId: selectedDocket.jobItemId ?? 0,
      plannedLoadSize:
        selectedDocket.plannedLoadSize ?? selectedDocket.loadSize ?? 0,
      actualLoadSize: selectedDocket.actualLoadSize ?? 0,
      truckQty: selectedDocket.deliveryDistanceQuantity ?? 0,
      pickUpAddressId: String(selectedDocket.pickUpAddress?.id ?? ''),
      deliveryAddressId: selectedDocket.deliveryAddress?.id
        ? String(selectedDocket.deliveryAddress.id)
        : '',
      purchaseOrder: selectedDocket.purchaseOrder ?? '',
      productEstimatedVolume: selectedDocket.productEstimatedVolume ?? 0,
      deliveryCollectionDate: selectedDocket.deliveryCollectionDate
        ? parseAsUTC(selectedDocket.deliveryCollectionDate as unknown as string)
        : undefined,
      deliveryCollectionStartTime: formatTimeString(
        selectedDocket.deliveryCollectionStartTime,
      ),
      deliveryCollectionEndTime: formatTimeString(
        selectedDocket.deliveryCollectionEndTime,
      ),
      customerContactName: selectedDocket.customerContactName ?? '',
      customerContactPhone: selectedDocket.customerContactPhone ?? '',
      docketEmail:
        selectedDocket.docketEmailRecipients
          ?.filter((email) => email !== currentCustomerEmail)
          .join(', ') ?? '',
      notes: selectedDocket.notes ?? '',
      truckType: selectedDocket.truckType ?? '',
    });

    const pickUp = selectedDocket.pickUpAddress;
    if (pickUp) {
      const mappedPickUp: AddressType = {
        address1: pickUp.streetDetailsPrimary || '',
        address2: pickUp.streetDetailsOptional || '',
        formattedAddress: pickUp.formattedAddress || '',
        city: pickUp.city || '',
        region: pickUp.state || '',
        postalCode: pickUp.postcode || '',
        country: pickUp.country || '',
        lat: pickUp.latitude || 0,
        lng: pickUp.longitude || 0,
        googlePlaceId: pickUp.googlePlaceId || '',
      };
      setPickUpAddress(mappedPickUp);
      setPickUpSearchInput(mappedPickUp.formattedAddress);
    }

    const delivery = selectedDocket.deliveryAddress;
    if (delivery) {
      const mappedDelivery: AddressType = {
        address1: delivery.streetDetailsPrimary || '',
        address2: delivery.streetDetailsOptional || '',
        formattedAddress: delivery.formattedAddress || '',
        city: delivery.city || '',
        region: delivery.state || '',
        postalCode: delivery.postcode || '',
        country: delivery.country || '',
        lat: delivery.latitude || 0,
        lng: delivery.longitude || 0,
        googlePlaceId: delivery.googlePlaceId || '',
      };
      setDeliveryAddress(mappedDelivery);
      setDeliverySearchInput(mappedDelivery.formattedAddress);
    }
    setIsDirtyTrackingReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, selectedDocket, docketForm]);

  const productDetailsQuery = useQuery({
    queryKey: ['product', selectedJobLineItemDetails().productId],
    queryFn: () =>
      APIClient.products.getByIdWithMaterial(
        selectedJobLineItemDetails().productId,
      ),
    enabled: !!selectedJobLineItemDetails().productId,
  });

  const loadSize = docketForm.watch('plannedLoadSize');
  const truckQty = docketForm.watch('truckQty');
  const jobLineItemId = docketForm.watch('jobLineItemId');

  const pricingBreakdown = React.useMemo(() => {
    const details = selectedJobLineItemDetails();
    const density = productDetailsQuery.data?.densityTonnagePerM3 || 1;

    // details.productSell is already converted to dollars in selectedJobLineItemDetails
    const productSell = roundToTwoDecimals(
      centsToDollarsNum(details.productSell) * (loadSize || 0)
    );

    let calculatedTruckQty = 0;
    if (details.type !== 'COLLECTION') {
      if (details.needTruckQty) {
        calculatedTruckQty = truckQty || 0;
      } else {
        calculatedTruckQty = calculateConvertedQty(
          loadSize || 0,
          details.productUom,
          details.truckUom,
          density,
        );
      }
    }

    // details.truckSell is in cents, so we need to convert it to dollars
    const truckSell = roundToTwoDecimals(
      centsToDollarsNum(details.truckSell) * calculatedTruckQty
    );

    const subtotal = roundToTwoDecimals(productSell + truckSell);
    const gst = roundToTwoDecimals(subtotal * 0.1);
    const total = roundToTwoDecimals(subtotal + gst);

    return {
      productSell,
      truckSell,
      subtotal,
      gst,
      total,
    };
  }, [selectedJobLineItemDetails, loadSize, truckQty, jobLineItemId]);

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
    selectedJobId,
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
