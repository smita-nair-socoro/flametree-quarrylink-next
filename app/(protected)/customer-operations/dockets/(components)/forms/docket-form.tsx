'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import z from 'zod';
import { useMediaQuery } from '@/hooks/use-media-query';
import { DocketFormSchema } from './schemas/docket-form-schema';
import { useDocketFormState } from '@/hooks/docket/use-docket-form-state';
import { Spinner } from '@/components/ui/spinner';
import { addNewRecordId, cn, splitReasonNote } from '@/lib/utils';
import { FormSelect } from '@/components/ui/form-select';
import {
  Calendar,
  Clock,
  FileText,
  Info,
  MapPin,
  Package,
  Truck,
} from 'lucide-react';
import { DatePicker } from '@/components/date-picker';
import { toUTCDateTimeWithoutZ, formatLocalDateTime } from '@/lib/utils/date';
import { AuditInformation } from '@/components/audit-information';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { Map } from '@/components/ui/map';
import { MultipleInput } from '@/components/ui/multiple-input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/ui/phone-input';
import { useCreateDocket, useUpdateDocket } from '@/lib/api/docket';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { notifyError, notifySuccess } from '@/lib/toast';
import { calculateConvertedQty } from '@/hooks/docket/use-docket-form-state';
import { useQuery } from '@tanstack/react-query';
import { UsersListQueryOptions } from '@/lib/api/user';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface FormProps {
  id?: number;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSaved?: () => void;
  className?: string;
  isQuickDocket?: boolean;
  jobId?: number;
  canEdit?: boolean;
}

export default function DocketForm({
  id,
  onCancel,
  onSuccess,
  onDirtyChange,
  onSaved,
  className,
  isQuickDocket = true,
  jobId,
  canEdit = true,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isReadOnly = Boolean(id) && !canEdit;
  const createDocket = useCreateDocket();
  const updateDocket = useUpdateDocket();
  const { data: users = [] } = useQuery(UsersListQueryOptions());

  const {
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
    productDetails,
    selectedDocket,
  } = useDocketFormState({
    id,
    isQuickDocket,
    jobId,
    onDirtyChange,
  });

  const combineDateAndTime = (
    date: Date | undefined,
    timeString: string,
  ): string | null => {
    if (!date || !timeString) return null;

    const [hours, minutes] = timeString.split(':');
    const combined = new Date(date);
    combined.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    return toUTCDateTimeWithoutZ(combined);
  };

  const getActorName = React.useCallback(
    (actor?: string | null) => {
      if (!actor) return 'Unknown';

      const matchedUser = users.find((user) => user.sub === actor)?.name;
      if (matchedUser) return matchedUser;

      const [, parsedName] = actor.split('-', 2);
      return parsedName || actor;
    },
    [users],
  );

  const statusBanner = React.useMemo(() => {
    if (!isEditing || !selectedDocket) return null;

    const bannerConfig: Partial<
      Record<DOCKET_STATUS, 'stopped' | 'cancelled' | 'voided'>
    > = {
      [DOCKET_STATUS.STOPPED]: 'stopped',
      [DOCKET_STATUS.CANCELLED]: 'cancelled',
      [DOCKET_STATUS.VOIDED]: 'voided',
    };

    const actionLabel = bannerConfig[selectedDocket.docketStatus];
    if (!actionLabel) return null;

    const actorName = getActorName(selectedDocket.lastModifiedBy);
    const actionDate = formatLocalDateTime(
      actionLabel === 'stopped'
        ? (selectedDocket.stoppedAt ?? selectedDocket.updatedAt)
        : selectedDocket.updatedAt,
    );
    const rawReason =
      actionLabel === 'stopped'
        ? selectedDocket.stopReason
        : actionLabel === 'cancelled'
          ? selectedDocket.cancelledReason
          : selectedDocket.voidedReason;

    const { reason: parsedReason, note } = splitReasonNote(rawReason);
    const reason = parsedReason || 'N/A';
    return (
      <div className="border border-[#DC2626] bg-[#FEF2F2] p-4 rounded-md mb-4 flex flex-col">
        <div className="flex items-start gap-2 font-medium text-sm">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#EF4444]" />
          <div className="flex flex-col text-[#7F1D1D]">
            <span>
              This docket was {actionLabel} by {actorName} - Reason: {reason} (
              {actionDate}).
            </span>
            {note && <span>Note: {note}.</span>}
          </div>
        </div>
      </div>
    );
  }, [getActorName, isEditing, selectedDocket]);

  async function onSubmit(values: z.infer<typeof DocketFormSchema>) {
    if (isReadOnly) return;

    try {
      const lineItemDetails = selectedJobLineItemDetails();
      const isCollection = lineItemDetails.type === 'COLLECTION';

      setIsSubmitting(true);

      const density = productDetails?.densityTonnagePerM3 || 1;
      let estimatedVolumeM3 = 0;
      const loadSize = values.loadSize || 0;
      const additionalDocketEmails = values.docketEmail
        ? values.docketEmail
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean)
        : [];
      const docketEmailRecipients = Array.from(
        new Set(
          [selectedJob.customerEmail, ...additionalDocketEmails].filter(
            Boolean,
          ),
        ),
      );

      if (
        lineItemDetails.productUom === 'M3' ||
        'm3' ||
        lineItemDetails.productUom === 'BULKA' ||
        'Bulka'
      ) {
        estimatedVolumeM3 = loadSize;
      } else if (lineItemDetails.productUom === 'TN') {
        estimatedVolumeM3 = loadSize / density;
      } else if (lineItemDetails.productUom === 'KG_20' || '20kg') {
        estimatedVolumeM3 = loadSize / 50 / density;
      }

      // Round to 2 decimal places to avoid out of bounds errors on the backend
      estimatedVolumeM3 = Math.round(estimatedVolumeM3 * 100) / 100;

      let startDateTime = values.deliveryCollectionStartTime;
      let endDateTime = values.deliveryCollectionEndTime;

      if (values.deliveryCollectionDate) {
        if (
          values.deliveryCollectionStartTime &&
          !values.deliveryCollectionStartTime.includes('T')
        ) {
          startDateTime =
            combineDateAndTime(
              values.deliveryCollectionDate,
              values.deliveryCollectionStartTime,
            ) ?? startDateTime;
        }
        if (
          values.deliveryCollectionEndTime &&
          !values.deliveryCollectionEndTime.includes('T')
        ) {
          endDateTime =
            combineDateAndTime(
              values.deliveryCollectionDate,
              values.deliveryCollectionEndTime,
            ) ?? endDateTime;
        }
      }

      let deliveryDistanceQuantity = 0;
      let deliveryDistanceUom = lineItemDetails.truckUom || 'TN';

      // Ensure deliveryDistanceUom matches the backend enum
      const validUoms = ['KG_20', 'KM', 'LOAD', 'TN', 'BULKA', 'HOURLY', 'M3'];
      if (!validUoms.includes(deliveryDistanceUom)) {
        const uomMap: Record<string, string> = {
          '20kg': 'KG_20',
          km: 'KM',
          Load: 'LOAD',
          TN: 'TN',
          Bulka: 'BULKA',
          Hourly: 'HOURLY',
          m3: 'M3',
        };
        deliveryDistanceUom = uomMap[deliveryDistanceUom] || 'TN';
      }

      if (!isCollection) {
        if (lineItemDetails.needTruckQty) {
          deliveryDistanceQuantity = values.truckQty || 0;
        } else {
          deliveryDistanceQuantity = calculateConvertedQty(
            loadSize,
            lineItemDetails.productUom,
            deliveryDistanceUom,
            density,
          );
        }
      }

      const payload = {
        jobId: values.jobId,
        jobItemId: values.jobLineItemId,
        pickUpAddress: {
          googlePlaceId: pickUpAddress.googlePlaceId,
          formattedAddress: pickUpAddress.formattedAddress,
          streetDetailsPrimary: pickUpAddress.address1,
          streetDetailsOptional: pickUpAddress.address2,
          city: pickUpAddress.city,
          suburb: pickUpAddress.city,
          state: pickUpAddress.region,
          postcode: pickUpAddress.postalCode,
          country: pickUpAddress.country,
          latitude: pickUpAddress.lat,
          longitude: pickUpAddress.lng,
        },
        deliveryAddress: isCollection
          ? undefined
          : deliveryAddress.googlePlaceId
            ? {
                googlePlaceId: deliveryAddress.googlePlaceId,
                formattedAddress: deliveryAddress.formattedAddress,
                streetDetailsPrimary: deliveryAddress.address1,
                streetDetailsOptional: deliveryAddress.address2,
                city: deliveryAddress.city,
                suburb: deliveryAddress.city,
                state: deliveryAddress.region,
                postcode: deliveryAddress.postalCode,
                country: deliveryAddress.country,
                latitude: deliveryAddress.lat,
                longitude: deliveryAddress.lng,
              }
            : undefined,
        purchaseOrder: values.purchaseOrder,
        productEstimatedVolume: estimatedVolumeM3,
        deliveryCollectionDate: values.deliveryCollectionDate,
        deliveryCollectionStartTime: startDateTime,
        deliveryCollectionEndTime: endDateTime,
        customerContactName: values.customerContactName,
        customerContactPhone: values.customerContactPhone,
        docketEmailRecipients,
        notes: values.notes,
        truckType: isCollection ? undefined : lineItemDetails.truckType,
        loadSize: values.loadSize,
        grossTruckWeight: 100,
        tareTruckWeight: 0,
        deliveryDistanceQuantity: deliveryDistanceQuantity,
        deliveryDistanceUom: deliveryDistanceUom,
        ...(isEditing && selectedDocket
          ? { docketStatus: selectedDocket.docketStatus }
          : {}),
      };

      if (isEditing && id) {
        await updateDocket.mutateAsync({
          id,
          data: payload,
        });
        notifySuccess('Docket updated successfully');
      } else {
        const newDocket = await createDocket.mutateAsync(payload);
        if (newDocket && typeof newDocket.id === 'number') {
          addNewRecordId('docket_main_data_table', newDocket.id);
        }
        notifySuccess('Docket created successfully');
      }

      onSaved?.();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating docket:', error);
      notifyError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full relative">
      {isSubmitting && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10',
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              {isEditing ? 'Updating Docket...' : 'Adding Docket...'}
            </p>
          </div>
        </div>
      )}
      <Form {...docketForm}>
        <form
          id="add-new-docket-form"
          className={cn('w-full flex flex-col', className)}
          onSubmit={docketForm.handleSubmit(onSubmit)}
        >
          {statusBanner}
          <div className={cn('p-1 flex flex-col gap-4 w-full', className)}>
            <div className="border rounded-md p-4 flex flex-col gap-8">
              <div className="items-center flex gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-[17px] font-medium">Job Reference</span>
              </div>
              <FormSelect
                control={docketForm.control}
                name="jobId"
                label="Job Reference*"
                searchLabel="Job References"
                options={allJobs}
                placeholder="Select Job"
                disabled={isJobLocked || isReadOnly || isEditing}
                formItemClassName={
                  isEditing && isDesktop
                    ? 'col-span-1 col-start-1'
                    : 'col-span-2'
                }
              />
            </div>
            <div className="border rounded-md p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="items-center flex gap-2">
                  <Package className="w-5 h-5" />
                  <span className="text-[17px] font-medium">
                    Product & Vehicle Details
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Product selection and vehicle configuration
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    control={docketForm.control}
                    name="jobLineItemId"
                    label="Product*"
                    searchLabel="Products"
                    options={jobLineItemOptions}
                    placeholder={
                      !selectedJobId
                        ? 'Select Job First'
                        : jobLineItemOptions.length === 0
                          ? 'No Products Found'
                          : 'Select Product'
                    }
                    disabled={
                      isReadOnly ||
                      !selectedJobId ||
                      jobLineItemOptions.length === 0 ||
                      isEditing
                    }
                  />

                  <FormField
                    name="quarryName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quarry / Supplier</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            readOnly
                            value={
                              field.value ??
                              selectedJobLineItemDetails().quarryName ??
                              ''
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div
                  className={cn(
                    !docketForm.watch('jobLineItemId') ||
                      selectedJobLineItemDetails().type === 'COLLECTION'
                      ? 'grid grid-cols-2 gap-4'
                      : !selectedJobLineItemDetails().needTruckQty
                        ? 'grid grid-cols-3 gap-4'
                        : 'grid grid-cols-4 gap-4',
                  )}
                >
                  {selectedJobLineItemDetails().type === 'DELIVERY' && (
                    <FormField
                      name="truckType"
                      render={() => (
                        <FormItem>
                          <FormLabel>Truck Type</FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              readOnly
                              value={
                                selectedJobLineItemDetails().truckTypeLabel ??
                                ''
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    name="productUoM"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product UoM</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            readOnly
                            value={
                              field.value ??
                              selectedJobLineItemDetails().productUom ??
                              ''
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="loadSize"
                    render={({ field }) => {
                      const maxLoadSize =
                        selectedJobLineItemDetails().remainingQty;

                      return (
                        <FormItem>
                          <FormLabel>Load Size</FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              isNumber
                              max={maxLoadSize}
                              disabled={
                                isReadOnly || !docketForm.watch('jobLineItemId')
                              }
                              onChange={(e) => {
                                const nextValue = e.target.value;

                                if (nextValue === '') {
                                  field.onChange(e);
                                  return;
                                }

                                e.target.value = String(
                                  Math.min(Number(nextValue), maxLoadSize),
                                );
                                field.onChange(e);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {selectedJobLineItemDetails().type === 'DELIVERY' &&
                    selectedJobLineItemDetails().needTruckQty && (
                      <FormField
                        name="truckQty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Distance</FormLabel>
                            <FormControl>
                              <Input
                                className="w-full"
                                {...field}
                                isNumber
                                disabled={isReadOnly}
                                suffix={
                                  selectedJobLineItemDetails().truckUom
                                    ? selectedJobLineItemDetails().truckUom
                                    : ''
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                </div>

                <div className="border rounded-md bg-[#F9FAFB] p-4 flex flex-col gap-4">
                  <div className="flex justify-between">
                    <span className="text-md font-medium">
                      Product Quantity Available
                    </span>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Current docket:
                      </span>
                      <span className="text-sm font-medium">
                        {docketForm.watch('loadSize')}{' '}
                        {selectedJobLineItemDetails().productUom === '20kg'
                          ? 'x 20kg'
                          : selectedJobLineItemDetails().productUom === 'm3'
                            ? 'm³'
                            : selectedJobLineItemDetails().productUom}{' '}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Remaining Product Availability in Job
                      </span>
                      <span className="text-sm font-medium">
                        {selectedJobLineItemDetails().remainingQty}{' '}
                        {selectedJobLineItemDetails().productUom === '20kg'
                          ? 'x 20kg'
                          : selectedJobLineItemDetails().productUom === 'm3'
                            ? 'm³'
                            : selectedJobLineItemDetails().productUom}{' '}
                        total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-md p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="items-center flex gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-[17px] font-medium">
                    {selectedJobLineItemDetails().type === 'COLLECTION'
                      ? 'Collection Information'
                      : 'Delivery Information'}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {selectedJobLineItemDetails().type === 'COLLECTION'
                    ? 'Collection date, address, and purchase order'
                    : 'Delivery date, address, and purchase order'}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={docketForm.control}
                    name="deliveryCollectionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Date*</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChangeAction={field.onChange}
                            placeholder="Pick a date"
                            disabled={{ before: today }}
                            readOnly={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="purchaseOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PO Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            {...field}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="pickUpAddressId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <MapPin className="w-4 h-4 text-red-500" />
                          Pick Up Address
                        </FormLabel>
                        <FormControl>
                          <AddressAutoComplete
                            address={pickUpAddress}
                            setAddress={setPickUpAddress}
                            searchInput={pickUpSearchInput}
                            setSearchInput={setPickUpSearchInput}
                            dialogTitle="Pick Up Address"
                            placeholder="Enter site address..."
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            readOnly={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedJobLineItemDetails().type !== 'COLLECTION' && (
                    <FormField
                      name="deliveryAddressId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <MapPin className="w-4 h-4 text-green-500" />
                            Delivery Address
                          </FormLabel>
                          <FormControl>
                            <AddressAutoComplete
                              address={deliveryAddress}
                              setAddress={setDeliveryAddress}
                              searchInput={deliverySearchInput}
                              setSearchInput={setDeliverySearchInput}
                              dialogTitle="Delivery Address"
                              placeholder="Enter site address..."
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              readOnly={isReadOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                {<Map markers={mapMarkers} className="h-[400px] w-full mt-5" />}
              </div>
            </div>

            <div className="border rounded-md p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="items-center flex gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-[17px] font-medium">
                    Time & Contact Details
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {selectedJobLineItemDetails().type === 'COLLECTION'
                    ? 'Collection timing and contact information'
                    : 'Delivery timing and contact information'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={docketForm.control}
                    name="deliveryCollectionStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time Window</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>

                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = String(i).padStart(2, '0');
                                return (
                                  <SelectItem key={hour} value={`${hour}:00`}>
                                    {hour}:00
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={docketForm.control}
                    name="deliveryCollectionEndTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time Window</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>

                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = String(i).padStart(2, '0');
                                return (
                                  <SelectItem key={hour} value={`${hour}:00`}>
                                    {hour}:00
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    name="customerContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full"
                            {...field}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={docketForm.control}
                    name="customerContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <PhoneInput
                            className="w-full"
                            defaultCountry="AU"
                            {...field}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={docketForm.control}
                  name="docketEmail"
                  render={({ field }) => {
                    const fixedValues = selectedJob.customerEmail
                      ? [selectedJob.customerEmail]
                      : [];
                    return (
                      <FormItem className={'col-span-2 col-start-1'}>
                        <FormLabel>Docket Email</FormLabel>
                        <FormControl>
                          <MultipleInput
                            className="w-full"
                            placeholder={
                              docketForm.watch('jobId') === 0
                                ? 'Select Job First'
                                : 'Enter Docket Emails'
                            }
                            fixedValues={fixedValues}
                            validate={(s) =>
                              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
                            }
                            label="Press Enter or comma to add email addresses for docket notifications"
                            {...field}
                            disabled={
                              isReadOnly || docketForm.watch('jobId') === 0
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={docketForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          className="w-full min-h-[80px]"
                          placeholder="Enter important FYI notes"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg border shadow-md px-4 py-3">
              <h3 className="text-lg font-bold mb-3">Sale Summary</h3>
              <div className="flex flex-col gap-3 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-normal">
                <div>
                  <span>Product Sell</span>
                  <span>
                    $
                    {formatNumberThousandSeparator(
                      pricingBreakdown.productSell,
                    )}
                  </span>
                </div>
                {selectedJobLineItemDetails().type !== 'COLLECTION' && (
                  <div>
                    <span>Truck Sell</span>
                    <span>
                      $
                      {formatNumberThousandSeparator(
                        pricingBreakdown.truckSell,
                      )}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-dashed border-purple-300">
                  <span>Subtotal (ex-GST)</span>
                  <span>
                    ${formatNumberThousandSeparator(pricingBreakdown.subtotal)}
                  </span>
                </div>
                <div>
                  <span>GST (10%)</span>
                  <span>
                    ${formatNumberThousandSeparator(pricingBreakdown.gst)}
                  </span>
                </div>
                <div className="pt-2 border-t border-dashed border-purple-300">
                  <span className="font-bold text-lg">Total Invoice</span>
                  <span className="font-bold text-lg">
                    ${formatNumberThousandSeparator(pricingBreakdown.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <AuditInformation
              createdBy={getActorName(selectedDocket?.createdBy)}
              lastModifiedBy={getActorName(selectedDocket?.lastModifiedBy)}
              createdAt={selectedDocket?.createdAt}
              updatedAt={selectedDocket?.updatedAt}
              className="px-1"
            />
          )}

          {isDesktop && (
            <div className="flex justify-end space-x-2 col-span-2 my-6">
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
              <Button
                className="cursor-pointer"
                type="button"
                onClick={() => docketForm.handleSubmit(onSubmit)()}
                disabled={isReadOnly || isSubmitting}
              >
                {isEditing ? 'Save Changes' : 'Create Docket'}
              </Button>
            </div>
          )}

          {!isDesktop && (
            <div className="flex flex-col col-span-2 gap-3 my-6">
              <Button
                type="button"
                className="cursor-pointer"
                onClick={() => docketForm.handleSubmit(onSubmit)()}
                disabled={isReadOnly || isSubmitting}
              >
                {isEditing ? 'Save Changes' : 'Create Docket'}
              </Button>
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
