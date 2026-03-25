'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import rawDocketsJson from '@/lib/tests/docketsResponseData.json';
import { AddressType } from '@/lib/types/address';
import { Docket } from '@/lib/types/docket';
import { GetTodaysDate, parseAsUTC } from '@/lib/utils/date';
import { DocketFormSchema } from '@/app/(protected)/customer-operations/dockets/(components)/forms/schemas/docket-form-schema';
import type { MapMarker } from '@/components/ui/map';
import { useQuery } from '@tanstack/react-query';
import { APIClient } from '@/lib/api/APIClient';
import { JobsListQueryOptions, JobItemsQueryOptions } from '@/lib/api/job';
import { DocketByIdQueryOptions } from '@/lib/api/docket';
import { toAddressType } from '@/lib/utils/address-helper';
import { centsToDollarsNum } from '@/lib/utils/currency';

export const calculateConvertedQty = (
  quantity: number,
  fromUom: string,
  toUom: string,
  density: number = 1
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
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const EMPTY_DOCKET_FORM_VALUES = {
  jobId: 0,
  jobLineItemId: 0,
  loadSize: 0,
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
  QUAD: 'QUAD',
  TRI_AXLE: 'Tri-Axle',
  TAUTLINER: 'Tautliner',
  CRANE_TRUCK: 'Crane Truck',
};

export function useDocketFormState({
  id,
  isQuickDocket = true,
  jobId,
  onDirtyChange,
}: UseDocketFormStateProps) {
  const isEditing = Boolean(id);
  const isJobLocked = !isQuickDocket && !!jobId;

  const docketForm = useForm<FormValues>({
    resolver: zodResolver(DocketFormSchema),
    mode: 'onChange',
    defaultValues: isJobLocked
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

  // Report dirty state to parent
  React.useEffect(() => {
    onDirtyChange?.(docketForm.formState.isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docketForm.formState.isDirty]);

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
    const job = jobsList.find((job) => job.id === selectedJobId);
    return {
      deliveryStartDate: job?.estimatedStartDate ?? '',
      startTimeWindow: job?.startTimeWindow ?? '',
      endTimeWindow: job?.endTimeWindow ?? '',
      poNumber: job?.poNumber ?? '',
      contactName: job?.contactPersonName ?? '',
      contactPhone: job?.contactPersonPhone ?? '',
      docketEmail:
        job?.docketEmail ?? job?.additionalEmailRecipients?.join(', ') ?? '',
      createdBy: '',
      lastModifiedBy: '',
      createdAt: '',
      updatedAt: '',
    };
  }, [selectedJobId, jobsList]);

  // Update form with selected job details (create mode auto-fill)
  React.useEffect(() => {
    if (isEditing) return;

    if (selectedJob.deliveryStartDate) {
      docketForm.setValue(
        'deliveryCollectionDate',
        new Date(selectedJob.deliveryStartDate),
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
    if (selectedJob.docketEmail) {
      docketForm.setValue('docketEmail', selectedJob.docketEmail);
    }
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

  const selectedJobLineItemDetails = React.useCallback(() => {
    const selectedJobLineItemId = docketForm.watch('jobLineItemId');
    const selectedJobLineItem = jobLineItems.find(
      (lineItem) => lineItem.id === selectedJobLineItemId,
    );
    const restoredAllocatedQty =
      isEditing && selectedDocket?.jobItemId === selectedJobLineItemId
        ? selectedDocket.loadSize ?? 0
        : 0;
    return {
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

        // For now, duplicate delivery address to pick up address
        setPickUpAddress(mappedAddress);
        setPickUpSearchInput(address.formattedAddress || '');
        docketForm.setValue(
          'pickUpAddressId',
          details.customerDeliveryAddress.id
            ? String(details.customerDeliveryAddress.id)
            : '',
        );
      }
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

    docketForm.reset({
      jobId: selectedDocket.jobId ?? 0,
      jobLineItemId: selectedDocket.jobItemId ?? 0,
      loadSize: selectedDocket.loadSize ?? 0,
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
      docketEmail: selectedDocket.docketEmailRecipients?.join(', ') ?? '',
      notes: selectedDocket.notes ?? '',
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
  }, [isEditing, selectedDocket, docketForm]);


  const productDetailsQuery = useQuery({
    queryKey: ['product', selectedJobLineItemDetails().productId],
    queryFn: () =>
      APIClient.products.getByIdWithMaterial(
        selectedJobLineItemDetails().productId,
      ),
    enabled: !!selectedJobLineItemDetails().productId,
  });

  const loadSize = docketForm.watch('loadSize');
  const truckQty = docketForm.watch('truckQty');
  const jobLineItemId = docketForm.watch('jobLineItemId');

  const pricingBreakdown = React.useMemo(() => {
    const details = selectedJobLineItemDetails();
    const density = productDetailsQuery.data?.densityTonnagePerM3 || 1;

    // details.productSell is already converted to dollars in selectedJobLineItemDetails
    const productSell = centsToDollarsNum(details.productSell) * (loadSize || 0);

    let calculatedTruckQty = 0;
    if (details.type !== 'COLLECTION') {
      if (details.needTruckQty) {
        calculatedTruckQty = truckQty || 0;
      } else {
        calculatedTruckQty = calculateConvertedQty(
          loadSize || 0,
          details.productUom,
          details.truckUom,
          density
        );
      }
    }

    // details.truckSell is in cents, so we need to convert it to dollars
    const truckSell = centsToDollarsNum(details.truckSell) * calculatedTruckQty;

    const subtotal = productSell + truckSell;
    const gst = subtotal * 0.1;
    const total = subtotal + gst;

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
