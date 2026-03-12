'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import rawJson from '@/lib/tests/jobsDetailResponseData.json';
import rawDocketsJson from '@/lib/tests/docketsResponseData.json';
import { JobLineItem } from '@/lib/types/job';
import { AddressType } from '@/lib/types/address';
import { Docket } from '@/lib/types/docket';
import { GetTodaysDate, parseAsUTC } from '@/lib/utils/date';
import { DocketFormSchema } from '@/app/(protected)/customer-operations/dockets/(components)/forms/schemas/docket-form-schema';
import type { MapMarker } from '@/components/ui/map';

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

const TRUCK_TYPE_OPTIONS = [
  { label: 'Truck', value: 'Truck' },
  { label: 'Semi-Trailer', value: 'Semi-Trailer' },
  { label: 'Truck + Trailer', value: 'Truck + Trailer' },
  { label: 'Rigid truck', value: 'Rigid truck' },
];

type FormValues = z.infer<typeof DocketFormSchema>;

export type SelectOption = { label: string; value: number };

type UseDocketFormStateProps = {
  id?: number;
  isQuickDocket?: boolean;
  jobId?: number;
  onDirtyChange?: (isDirty: boolean) => void;
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

  const selectedDocket = React.useMemo(() => {
    if (!id) return null;
    // TODO: replace mock lookup with get-docket-by-id API once backend integration is ready.
    const source = rawDocketsJson as unknown as { items: Docket[] };
    return source.items.find((item) => item.id === id) ?? null;
  }, [id]);

  // Sync jobId when form opens with locked job (isQuickDocket=false + jobId)
  React.useEffect(() => {
    if (isJobLocked && jobId) {
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

  const allJobs = React.useMemo(
    () =>
      rawJson.items.map((job) => ({
        label: `${job.jobNumber} - ${job.projectName}`,
        value: job.id,
      })),
    []
  );

  const jobLineItems = React.useMemo(() => {
    if (!selectedJobId) return [];
    const selectedJob = rawJson.items.find((job) => job.id === selectedJobId);
    return (selectedJob?.jobLineItems ?? []) as unknown as JobLineItem[];
  }, [selectedJobId]);

  const jobLineItemOptions = React.useMemo(
    () =>
      jobLineItems
        .filter((lineItem) => lineItem.id !== undefined)
        .map((lineItem) => ({
          label: lineItem.productName,
          value: lineItem.id as number,
        })),
    [jobLineItems]
  );

  const selectedJob = React.useMemo(() => {
    const job = rawJson.items.find((job) => job.id === selectedJobId);
    return {
      deliveryStartDate: job?.deliveryStartDate ?? '',
      startTimeWindow: job?.deliveryWindowStart ?? '',
      endTimeWindow: job?.deliveryWindowEnd ?? '',
      poNumber: job?.poNumber ?? '',
      contactName: job?.customerName ?? '',
      contactPhone: '+61444333222',
      docketEmail: job?.receiptEmail ?? '',
      createdBy: job?.createdBy ?? '',
      lastModifiedBy: job?.lastModifiedBy ?? '',
      createdAt: job?.createdAt ?? '',
      updatedAt: job?.updatedAt ?? '',
    };
  }, [selectedJobId]);

  // Update form with selected job details (create mode auto-fill)
  React.useEffect(() => {
    if (isEditing) return;

    if (selectedJob.deliveryStartDate) {
      docketForm.setValue('deliveryCollectionDate', new Date(selectedJob.deliveryStartDate));
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
      console.log(selectedJob.startTimeWindow);
      docketForm.setValue('deliveryCollectionStartTime', formatTimeString(selectedJob.startTimeWindow));
    }
    if (selectedJob.endTimeWindow) {
      console.log(selectedJob.endTimeWindow);
      docketForm.setValue('deliveryCollectionEndTime', formatTimeString(selectedJob.endTimeWindow));
    }
  }, [selectedJob, docketForm, isEditing]);

  const selectedJobLineItemDetails = React.useCallback(() => {
    const selectedJobLineItemId = docketForm.watch('jobLineItemId');
    const selectedJobLineItem = jobLineItems.find(
      (lineItem) => lineItem.id === selectedJobLineItemId
    );
    return {
      customerDeliveryAddress: selectedJobLineItem?.customerDeliveryAddress ?? '',
      productName: selectedJobLineItem?.productName ?? '',
      quarryName: selectedJobLineItem?.quarryName ?? '',
      productUom:
        selectedJobLineItem?.productSellUom === 'TN'
          ? 't'
          : selectedJobLineItem?.productSellUom === 'M3'
            ? 'm3'
            : selectedJobLineItem?.productSellUom === 'BULKA'
              ? 'Bulka'
              : selectedJobLineItem?.productSellUom === 'KG_20'
                ? '20kg'
                : '',
      truckType: selectedJobLineItem?.truckType ?? '',
      truckSell: selectedJobLineItem?.truckSellPrice ?? 0,
      truckUom:
        selectedJobLineItem?.truckSellUom === 'TN'
          ? 't'
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
      remainingQty: selectedJobLineItem?.remainingQuantity ?? 0,
      type: selectedJobLineItem?.type ?? '',
      needTruckQty:
        selectedJobLineItem?.truckSellUom === 'HOURLY' ||
        selectedJobLineItem?.truckSellUom === 'LOAD' ||
        selectedJobLineItem?.truckSellUom === 'KM',
    };
  }, [jobLineItems, docketForm]);

  // Update delivery address when job line item changes
  React.useEffect(() => {
    const details = selectedJobLineItemDetails();
    if (details.customerDeliveryAddress) {
      const address = details.customerDeliveryAddress.address;
      if (address) {
        setDeliveryAddress({
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
        });

        setPickUpAddress(MOCK_PICK_UP_ADDRESS);

        setDeliverySearchInput(address.formattedAddress || '');
        if (details.type !== 'COLLECTION') {
          docketForm.setValue('deliveryAddressId', details.customerDeliveryAddress.id || '');
        }

        setPickUpSearchInput(address.formattedAddress || '');
        docketForm.setValue('pickUpAddressId', details.customerDeliveryAddress.id || '');
      }
    }
  }, [docketForm.watch('jobLineItemId')]);

  // Populate edit form from docket mock data
  React.useEffect(() => {
    if (!isEditing || !selectedDocket) return;

    docketForm.reset({
      jobId: selectedDocket.job?.id ?? 0,
      jobLineItemId: selectedDocket.jobLineItemId ?? 0,
      truckType: selectedDocket.truckType ?? '',
      loadSize: selectedDocket.loadSize ?? 0,
      pickUpAddressId: String(selectedDocket.pickUpAddress?.id ?? ''),
      deliveryAddressId: selectedDocket.deliveryAddress?.id
        ? String(selectedDocket.deliveryAddress.id)
        : '',
      purchaseOrder: selectedDocket.poNumber ?? '',
      productEstimatedVolume: selectedDocket.loadSize ?? 0,
      deliveryCollectionDate: selectedDocket.deliveryDate
        ? parseAsUTC(selectedDocket.deliveryDate)
        : undefined,
      deliveryCollectionStartTime: formatTimeString(selectedDocket.startTimeWindow),
      deliveryCollectionEndTime: formatTimeString(selectedDocket.endTimeWindow),
      customerContactName: selectedDocket.contactName ?? '',
      customerContactPhone: selectedDocket.contactPhone ?? '',
      docketEmail: selectedDocket.docketEmail ?? '',
      notes: selectedDocket.notes ?? '',
    });

    const pickUp = selectedDocket.pickUpAddress?.address;
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

    const delivery = selectedDocket.deliveryAddress?.address;
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

  const loadSize = docketForm.watch('loadSize');
  const jobLineItemId = docketForm.watch('jobLineItemId');
  const pricingBreakdown = React.useMemo(() => {
    const details = selectedJobLineItemDetails();
    const productSell = details.productSell * (loadSize || 0);
    const truckSell = details.truckSell;
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
  }, [selectedJobLineItemDetails, loadSize, jobLineItemId]);

  const mapMarkers = React.useMemo<MapMarker[]>(
    () => [
      { lat: pickUpAddress.lat, lng: pickUpAddress.lng, color: 'red' },
      { lat: deliveryAddress.lat, lng: deliveryAddress.lng, color: 'green' },
    ],
    [pickUpAddress, deliveryAddress]
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
    truckTypeOptions: TRUCK_TYPE_OPTIONS,
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
  };
}
