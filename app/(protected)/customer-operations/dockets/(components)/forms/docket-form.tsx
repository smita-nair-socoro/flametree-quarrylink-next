'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  CircleCheckBig,
  Eye,
  FileX,
  ImageOff,
  Clock,
  FileText,
  Info,
  MapPin,
  Package,
  Truck,
  User,
  UserPlus,
} from 'lucide-react';
import { DatePicker } from '@/components/date-picker';
import {
  toLocalDateTime,
  formatLocalDateTime,
  appendUtcSuffix,
} from '@/lib/utils/date';
import { AuditInformation } from '@/components/audit-information';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { Map } from '@/components/ui/map';
import { MultipleInput } from '@/components/ui/multiple-input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/ui/phone-input';
import {
  useCreateDocket,
  useUpdateDocket,
  useOperationalUpdateDocket,
} from '@/lib/api/docket';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { notifyError, notifySuccess } from '@/lib/toast';
import { calculateConvertedQty } from '@/hooks/docket/use-docket-form-state';
import { format } from 'date-fns';
import { ActionDialog } from '@/components/action-dialog';
import {
  ChecklistReportModal,
  CHECKLIST_TYPE,
} from '@/components/checklist-report-modal';

import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { TRUCK_TYPE } from '@/lib/types/truck-enums';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DocketOperationalUpdateRequest, DocketDTO } from '@/lib/types/docket';

const truckTypeOptions: FormSelectOption[] = [
  { label: 'Truck', value: TRUCK_TYPE.TRUCK },
  { label: 'Truck & Trailer', value: TRUCK_TYPE.TRUCK_AND_TRAILER },
  { label: 'Semi-Trailer', value: TRUCK_TYPE.SEMI_TRAILER },
  { label: 'Rigid Truck', value: TRUCK_TYPE.RIGID_TRUCK },
  { label: 'Flatbed', value: TRUCK_TYPE.FLATBED },
  { label: 'Tipper', value: TRUCK_TYPE.TIPPER },
  { label: 'Tandem', value: TRUCK_TYPE.TANDEM },
  { label: 'Quad', value: TRUCK_TYPE.QUAD },
  { label: 'Tri-Axle', value: TRUCK_TYPE.TRI_AXLE },
  { label: 'Tautliner', value: TRUCK_TYPE.TAUTLINER },
  { label: 'Crane Truck', value: TRUCK_TYPE.CRANE_TRUCK },
];

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
  initialDocket?: DocketDTO | null;
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
  initialDocket,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [timeConflictOpen, setTimeConflictOpen] = React.useState(false);
  const [conflictingDocketIds, setConflictingDocketIds] = React.useState<
    number[]
  >([]);
  const [checklistModalOpen, setChecklistModalOpen] = React.useState(false);
  const [checklistModalType, setChecklistModalType] =
    React.useState<CHECKLIST_TYPE>(CHECKLIST_TYPE.DRIVER);
  const router = useRouter();
  const isReadOnly = Boolean(id) && !canEdit;
  const createDocket = useCreateDocket();
  const updateDocket = useUpdateDocket();
  const operationalUpdateDocket = useOperationalUpdateDocket();
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
    initialDocket,
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

    return toLocalDateTime(combined);
  };

  const currentStatus = selectedDocket?.docketStatus;
  const isDelivery = selectedJobLineItemDetails().type === 'DELIVERY';

  const isAssigned = currentStatus === DOCKET_STATUS.ASSIGNED;
  const canEditTruckType =
    !isEditing || currentStatus === DOCKET_STATUS.UNASSIGNED;
  const canEditPlannedLoadSize =
    !isEditing ||
    currentStatus === DOCKET_STATUS.UNASSIGNED ||
    currentStatus === DOCKET_STATUS.PENDING ||
    currentStatus === DOCKET_STATUS.ASSIGNED;

  const canEditDocketEmail =
    !isEditing ||
    (isDelivery
      ? currentStatus === DOCKET_STATUS.UNASSIGNED ||
      currentStatus === DOCKET_STATUS.ASSIGNED ||
      currentStatus === DOCKET_STATUS.IN_TRANSIT ||
      currentStatus === DOCKET_STATUS.STOPPED ||
      currentStatus === DOCKET_STATUS.ARRIVED
      : currentStatus === DOCKET_STATUS.PENDING ||
      currentStatus === DOCKET_STATUS.PREPARING ||
      currentStatus === DOCKET_STATUS.READY);

  const canActualLoadSize =
    isEditing &&
    (isDelivery
      ? currentStatus === DOCKET_STATUS.IN_TRANSIT ||
      currentStatus === DOCKET_STATUS.ARRIVED ||
      currentStatus === DOCKET_STATUS.DELIVERED ||
      currentStatus === DOCKET_STATUS.STOPPED
      : currentStatus === DOCKET_STATUS.PREPARING ||
      currentStatus === DOCKET_STATUS.READY ||
      currentStatus === DOCKET_STATUS.COLLECTED);

  const ASSIGNED_STATUSES = new Set([
    DOCKET_STATUS.ASSIGNED,
    DOCKET_STATUS.IN_TRANSIT,
    DOCKET_STATUS.STOPPED,
    DOCKET_STATUS.ARRIVED,
    DOCKET_STATUS.DELIVERED,
    DOCKET_STATUS.INVOICED,
  ]);

  const showAssignment =
    isEditing &&
    selectedDocket?.docketStatus != null &&
    ASSIGNED_STATUSES.has(selectedDocket.docketStatus) &&
    (selectedDocket.driver != null || selectedDocket.truck != null);

  const assignedDriverName = selectedDocket?.driver?.driverName ?? '—';
  const assignedLicensePlate = selectedDocket?.truck?.licensePlate ?? '—';

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

    const actorName = selectedDocket.lastModifiedBy;
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
  }, [isEditing, selectedDocket]);

  async function onSubmit(values: z.infer<typeof DocketFormSchema>) {
    if (isReadOnly) {
      if (isEditing && (canActualLoadSize || canEditDocketEmail)) {
        const actualLoadSize = values.actualLoadSize;
        const docketEmails = values.docketEmail
          ? values.docketEmail.split(',').map((e) => e.trim())
          : [];
        const payload: DocketOperationalUpdateRequest = {
          checkWindowTimeConflict: false,
        };
        if (canEditDocketEmail) {
          payload.docketEmailRecipients = docketEmails;
        }
        if (canActualLoadSize) {
          if (!actualLoadSize) {
            notifyError('Actual load size is required');
            return;
          }
          payload.actualLoadSize = actualLoadSize;

          const lineItemDetails = selectedJobLineItemDetails();
          const isCollection = lineItemDetails.type === 'COLLECTION';

          if (!isCollection) {
            if (lineItemDetails.needTruckQty) {
              payload.deliveryDistanceQuantity = values.truckQty || 0;
            } else {
              const density = productDetails?.densityTonnagePerM3 || 1;
              let deliveryDistanceUom = lineItemDetails.truckUom || 'TN';
              const validUoms = [
                'KG_20',
                'KM',
                'LOAD',
                'TN',
                'BULKA',
                'HOURLY',
                'M3',
              ];
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

              const manualInputUoms = ['HOURLY', 'LOAD', 'KM'];
              if (manualInputUoms.includes(deliveryDistanceUom)) {
                payload.deliveryDistanceQuantity = values.truckQty || 0;
              } else {
                payload.deliveryDistanceQuantity = calculateConvertedQty(
                  actualLoadSize,
                  lineItemDetails.productUom,
                  deliveryDistanceUom,
                  density,
                );
              }
            }
          }
        }
        try {
          setIsSubmitting(true);
          await operationalUpdateDocket.mutateAsync({
            id: selectedDocket?.id ?? 0,
            data: payload,
          });
          notifySuccess('Docket updated successfully');
          onSaved?.();
          onSuccess?.();
          return;
        } catch (error) {
          console.error('Error updating docket:', error);
          notifyError(extractErrorMessage(error));
          return;
        } finally {
          setIsSubmitting(false);
        }
      }
      return;
    }

    if (isEditing && selectedDocket?.docketStatus === DOCKET_STATUS.ASSIGNED) {
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
      const additionalEmails = values.docketEmail
        ? values.docketEmail.split(',').map((e) => e.trim())
        : [];
      const docketEmailRecipients = Array.from(
        new Set(
          [selectedJob.customerEmail, ...additionalEmails].filter(Boolean),
        ),
      );
      try {
        setIsSubmitting(true);
        const result = await operationalUpdateDocket.mutateAsync({
          id: selectedDocket.id,
          data: {
            checkWindowTimeConflict: true,
            deliveryCollectionDate: values.deliveryCollectionDate
              ? appendUtcSuffix(
                format(
                  values.deliveryCollectionDate,
                  "yyyy-MM-dd'T'00:00:00.000",
                ),
              )
              : undefined,
            deliveryCollectionStartTime: startDateTime
              ? appendUtcSuffix(startDateTime)
              : undefined,
            deliveryCollectionEndTime: endDateTime
              ? appendUtcSuffix(endDateTime)
              : undefined,
            plannedLoadSize: values.plannedLoadSize,
            actualLoadSize: values.plannedLoadSize,
            docketEmailRecipients,
            truckId: selectedDocket.truckId,
            driverId: selectedDocket.driverId,
          },
        });
        if (
          result.conflictingDocketIds &&
          result.conflictingDocketIds.length > 0
        ) {
          setConflictingDocketIds(result.conflictingDocketIds);
          setTimeConflictOpen(true);
        } else {
          notifySuccess('Docket updated successfully');
          onSaved?.();
          onSuccess?.();
        }
      } catch (error) {
        notifyError(extractErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    await doSave(values);
  }

  async function doSave(values: z.infer<typeof DocketFormSchema>) {
    try {
      const lineItemDetails = selectedJobLineItemDetails();
      const isCollection = lineItemDetails.type === 'COLLECTION';

      setIsSubmitting(true);

      const density = productDetails?.densityTonnagePerM3 || 1;
      let estimatedVolumeM3 = 0;
      const loadSize = values.plannedLoadSize || 0;
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

      // Round to 2 decimal places to avoid out of bounds errors on the backend
      deliveryDistanceQuantity = Math.round(deliveryDistanceQuantity * 100) / 100;

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
        deliveryCollectionDate: values.deliveryCollectionDate
          ? format(values.deliveryCollectionDate, "yyyy-MM-dd'T'00:00:00.000")
          : undefined,
        deliveryCollectionStartTime: startDateTime,
        deliveryCollectionEndTime: endDateTime,
        customerContactName: values.customerContactName,
        customerContactPhone: values.customerContactPhone,
        docketEmailRecipients,
        notes: values.notes,
        truckType: isCollection
          ? undefined
          : values.truckType || lineItemDetails.truckType || undefined,
        plannedLoadSize: values.plannedLoadSize,
        actualLoadSize:
          isEditing &&
            (currentStatus === DOCKET_STATUS.UNASSIGNED ||
              currentStatus === DOCKET_STATUS.ASSIGNED ||
              currentStatus === DOCKET_STATUS.PENDING)
            ? values.plannedLoadSize
            : values.actualLoadSize,
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

  const deliveryDate = selectedDocket?.deliveryCollectionDate
    ? new Date(selectedDocket.deliveryCollectionDate)
    : null;
  const newStart = docketForm.watch('deliveryCollectionStartTime');
  const newEnd = docketForm.watch('deliveryCollectionEndTime');

  const timeLabel =
    newStart && newEnd && deliveryDate
      ? `${newStart} – ${newEnd} on ${format(deliveryDate, 'd MMM')}`
      : newStart && newEnd
        ? `${newStart} – ${newEnd}`
        : 'the new time';

  return (
    <>
      <ChecklistReportModal
        open={
          checklistModalOpen && checklistModalType === CHECKLIST_TYPE.DRIVER
        }
        onOpenChange={setChecklistModalOpen}
        type={CHECKLIST_TYPE.DRIVER}
        submissionId={selectedDocket?.driverChecklist?.id ?? 0}
      />
      <ChecklistReportModal
        open={checklistModalOpen && checklistModalType === CHECKLIST_TYPE.TRUCK}
        onOpenChange={setChecklistModalOpen}
        type={CHECKLIST_TYPE.TRUCK}
        submissionId={selectedDocket?.truckChecklist?.id ?? 0}
        truckLicensePlate={selectedDocket?.truck?.licensePlate}
      />

      <ActionDialog
        open={timeConflictOpen}
        onOpenChangeAction={setTimeConflictOpen}
        title="Confirm Delivery Time Change"
        description={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
              <UserPlus className="h-5 w-5 text-[#193CB8]" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-[#101828] text-sm">
                {selectedDocket?.docketNumber ?? '—'}
              </span>
              <span className="text-xs text-[#6A7282]">
                {selectedDocket?.jobItem?.product?.productName ?? '—'}
                {(selectedDocket?.actualLoadSize ??
                  selectedDocket?.plannedLoadSize) != null && (
                    <>
                      {' '}
                      ·{' '}
                      {formatNumberThousandSeparator(
                        selectedDocket?.actualLoadSize ??
                        selectedDocket?.plannedLoadSize,
                      )}{' '}
                      {selectedDocket?.jobItem?.productSellUom}
                    </>
                  )}
              </span>
            </div>
          </div>
        }
        content={
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-[#101828]">
                  New time {timeLabel} conflicts with existing dockets
                </span>
                <span className="text-xs text-[#973C00]">
                  The following dockets are already scheduled for this truck and
                  driver at this time. You can still save this change.
                </span>
              </div>
            </div>
            <div className="rounded-md border border-[#FFD6A7] bg-[#FFF7ED] px-3 py-2 text-xs text-[#364153]">
              <span
                className="font-medium underline cursor-pointer text-[#155DFC]"
                onClick={() => {
                  setTimeConflictOpen(false);
                  onCancel?.();
                  router.push(
                    `/customer-operations/dockets/?docketId=${conflictingDocketIds.join(',')}`,
                  );
                }}
              >
                Conflict Dockets
              </span>
            </div>
          </div>
        }
        confirmText="Save Changes"
        onConfirmAction={async () => {
          setTimeConflictOpen(false);
          notifySuccess('Docket updated successfully');
          onSaved?.();
          onSuccess?.();
        }}
      />

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
            className={cn('w-full flex flex-col gap-8', className)}
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
                          <FormLabel>Quarry / Supplier*</FormLabel>
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
                  {(() => {
                    const jobLineItemId = docketForm.watch('jobLineItemId');
                    const details = selectedJobLineItemDetails();
                    const needTruckQty = details.needTruckQty;
                    // const truckQtyOverflows =
                    //   isDelivery && needTruckQty && canActualLoadSize;

                    const showActualLoadSize =
                      isEditing &&
                      currentStatus !== DOCKET_STATUS.UNASSIGNED &&
                      currentStatus !== DOCKET_STATUS.ASSIGNED &&
                      currentStatus !== DOCKET_STATUS.PENDING;

                    const showTruckQty = isDelivery && needTruckQty;

                    let cols = 2;
                    if (jobLineItemId) {
                      cols = 1; // Product UoM
                      if (isDelivery) cols += 1; // Suggested Truck Type
                      cols += 1; // Planned Load Size
                      if (showActualLoadSize) cols += 1;
                      if (showTruckQty) cols += 1;
                    }

                    const gridCols =
                      {
                        2: 'grid-cols-2',
                        3: 'grid-cols-3',
                        4: 'grid-cols-4',
                        5: 'grid-cols-5',
                      }[cols] || 'grid-cols-2';

                    const truckQtyField = showTruckQty ? (
                      <FormField
                        name="truckQty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {details.truckUom === 'Hourly'
                                ? 'Hours Required*'
                                : 'Delivery Distance*'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="w-full"
                                {...field}
                                value={field.value ?? ''}
                                isNumber
                                disabled={isReadOnly || isAssigned}
                                suffix={
                                  details.truckUom === 'Hourly'
                                    ? 'hrs'
                                    : details.truckUom
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : null;

                    return (
                      <>
                        <div className={cn('grid gap-4', gridCols)}>
                          {isDelivery && (
                            <FormSelect
                              control={docketForm.control}
                              name="truckType"
                              label="Suggested Truck Type*"
                              searchLabel="Truck Type"
                              options={truckTypeOptions}
                              placeholder="Select Truck Type"
                              disabled={isReadOnly || !canEditTruckType}
                            />
                          )}

                          <FormField
                            name="productUoM"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product UoM*</FormLabel>
                                <FormControl>
                                  <Input
                                    className="w-full"
                                    readOnly
                                    value={
                                      field.value ?? details.productUom ?? ''
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            name="plannedLoadSize"
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel>Planned Load Size*</FormLabel>
                                  <FormControl>
                                    <Input
                                      className="w-full"
                                      {...field}
                                      onChange={(e) => {
                                        const maxLimit = details.remainingQty;
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val) && val > maxLimit) {
                                          field.onChange(maxLimit);
                                        } else {
                                          field.onChange(e);
                                        }
                                      }}
                                      value={field.value ?? ''}
                                      isNumber
                                      disabled={
                                        isReadOnly ||
                                        !jobLineItemId ||
                                        !canEditPlannedLoadSize
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />

                          {showActualLoadSize && (
                            <FormField
                              name="actualLoadSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Actual Load Size*</FormLabel>
                                  <FormControl>
                                    <Input
                                      className="w-full"
                                      {...field}
                                      value={field.value ?? ''}
                                      isNumber
                                      disabled={!canActualLoadSize}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {truckQtyField}
                        </div>
                      </>
                    );
                  })()}

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
                          {formatNumberThousandSeparator(
                            isEditing &&
                              currentStatus !== DOCKET_STATUS.UNASSIGNED &&
                              currentStatus !== DOCKET_STATUS.ASSIGNED &&
                              currentStatus !== DOCKET_STATUS.PENDING
                              ? docketForm.watch('actualLoadSize') || 0
                              : docketForm.watch('plannedLoadSize') || 0,
                          )}{' '}
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
                          {formatNumberThousandSeparator(
                            selectedJobLineItemDetails().remainingQty -
                            (isEditing &&
                              currentStatus !== DOCKET_STATUS.UNASSIGNED &&
                              currentStatus !== DOCKET_STATUS.ASSIGNED &&
                              currentStatus !== DOCKET_STATUS.PENDING
                              ? docketForm.watch('actualLoadSize') || 0
                              : docketForm.watch('plannedLoadSize') || 0),
                          )}{' '}
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
                          <FormLabel>PO Number</FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              disabled={isReadOnly || isAssigned}
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
                            Pick Up Address*
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
                              readOnly={isReadOnly || isAssigned}
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
                              Delivery Address*
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
                                readOnly={isReadOnly || isAssigned}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  {
                    <Map
                      markers={mapMarkers}
                      className="h-[400px] w-full mt-5"
                    />
                  }
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
                          <FormLabel>Start Time Window*</FormLabel>
                          <FormControl>
                            <Select
                              key={`start-${field.value || 'empty'}`}
                              value={field.value || ''}
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
                          <FormLabel>End Time Window*</FormLabel>
                          <FormControl>
                            <Select
                              key={`end-${field.value || 'empty'}`}
                              value={field.value || ''}
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
                          <FormLabel>Contact Name*</FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              disabled={isReadOnly || isAssigned}
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
                          <FormLabel>Contact Phone*</FormLabel>
                          <FormControl>
                            <PhoneInput
                              className="w-full"
                              defaultCountry="AU"
                              {...field}
                              disabled={isReadOnly || isAssigned}
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
                          <FormLabel>Docket Email*</FormLabel>
                          <FormControl>
                            <MultipleInput
                              className="w-full"
                              placeholder={
                                docketForm.watch('jobId') === 0
                                  ? 'Select Job First'
                                  : 'Enter Docket Emails'
                              }
                              fixedValues={fixedValues}
                              label="Press Enter or comma to add email addresses for docket notifications"
                              {...field}
                              disabled={
                                docketForm.watch('jobId') === 0 ||
                                !canEditDocketEmail
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
                            disabled={isReadOnly || isAssigned}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Assignment Section */}
              {showAssignment && (
                <div className="border rounded-md p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[17px] font-bold">Assignment</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        Driver
                      </span>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {assignedDriverName}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        Truck Rego
                      </span>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {assignedLicensePlate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Checklist Section */}
              {isEditing &&
                (selectedDocket?.driverChecklist ||
                  selectedDocket?.truckChecklist) && (
                  <div className="border rounded-md p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      <span className="text-[17px] font-medium">
                        Checklists
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {selectedDocket?.driverChecklist && (
                        <div className="flex items-center justify-between rounded-md border bg-[#F9FAFB] px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">
                              Pre-Start Checklist
                            </span>
                            <span
                              className={`text-xs font-semibold ${selectedDocket.driverChecklist
                                  .checklistStatus === 'PASS'
                                  ? 'text-green-600'
                                  : selectedDocket.driverChecklist
                                    .checklistStatus === 'FAIL'
                                    ? 'text-red-600'
                                    : 'text-muted-foreground'
                                }`}
                            >
                              {selectedDocket.driverChecklist.checklistStatus ??
                                'Pending'}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setChecklistModalType(CHECKLIST_TYPE.DRIVER);
                              setChecklistModalOpen(true);
                            }}
                          >
                            View Report
                          </Button>
                        </div>
                      )}
                      {selectedDocket?.truckChecklist && (
                        <div className="flex items-center justify-between rounded-md border bg-[#F9FAFB] px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">
                              Truck Inspection
                            </span>
                            <span
                              className={`text-xs font-semibold ${selectedDocket.truckChecklist
                                  .checklistStatus === 'PASS'
                                  ? 'text-green-600'
                                  : selectedDocket.truckChecklist
                                    .checklistStatus === 'FAIL'
                                    ? 'text-red-600'
                                    : 'text-muted-foreground'
                                }`}
                            >
                              {selectedDocket.truckChecklist.checklistStatus ??
                                'Pending'}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setChecklistModalType(CHECKLIST_TYPE.TRUCK);
                              setChecklistModalOpen(true);
                            }}
                          >
                            View Report
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Sign Off Section */}
              {isEditing &&
                isDelivery &&
                (currentStatus === DOCKET_STATUS.DELIVERED ||
                  currentStatus === DOCKET_STATUS.INVOICED) &&
                !!(
                  selectedDocket?.signatureImage ||
                  selectedDocket?.unloadedPhotos?.length ||
                  selectedDocket?.receivedPhotos?.length ||
                  selectedDocket?.receiverName
                ) && (
                  <div className="border rounded-md p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-[17px] font-medium">
                          Sign Off
                        </span>
                      </div>
                      {selectedDocket?.deliveredAt && (
                        <span className="text-sm text-muted-foreground">
                          Delivered at{' '}
                          {format(
                            new Date(selectedDocket.deliveredAt),
                            'hh:mm a',
                          )}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                          Receiver Name
                        </span>
                        <span
                          className={cn(
                            'font-semibold',
                            selectedDocket?.receiverName
                              ? 'text-base'
                              : 'text-sm text-[#99A1AF]',
                          )}
                        >
                          {selectedDocket?.receiverName ?? 'N/A'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                          Receiver On Site
                        </span>
                        <span
                          className={cn(
                            'font-semibold',
                            selectedDocket?.receiverName
                              ? 'text-base'
                              : 'text-sm text-[#99A1AF]',
                          )}
                        >
                          {selectedDocket?.receiverName ? 'Yes' : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">
                          Unloaded Photo
                        </span>
                        {selectedDocket?.unloadedPhotos?.[0] ? (
                          <div className="relative rounded-md overflow-hidden aspect-video bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedDocket.unloadedPhotos[0]}
                              alt="Unloaded photo"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-1.5">
                              <Eye className="w-7 h-7 text-white" />
                              <div className="flex items-center gap-1 text-white text-xs font-medium">
                                <CircleCheckBig className="w-3.5 h-3.5 text-green-400" />
                                Photo Captured
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2 rounded-md bg-gray-100 aspect-video">
                            <ImageOff className="w-5 h-5 text-[#99A1AF]" />
                            <span className="text-xs text-[#99A1AF]">
                              No photo provided
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">
                          Receipt Photo
                        </span>
                        {selectedDocket?.receivedPhotos?.[0] ? (
                          <div className="relative rounded-md overflow-hidden aspect-video bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedDocket.receivedPhotos[0]}
                              alt="Receipt photo"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-1.5">
                              <Eye className="w-7 h-7 text-white" />
                              <div className="flex items-center gap-1 text-white text-xs font-medium">
                                <CircleCheckBig className="w-3.5 h-3.5 text-green-400" />
                                Photo Captured
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2 rounded-md bg-gray-100 aspect-video">
                            <ImageOff className="w-5 h-5 text-[#99A1AF]" />
                            <span className="text-xs text-[#99A1AF]">
                              No photo provided
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">
                          Receiver Signature
                        </span>
                        {selectedDocket?.signatureImage ? (
                          <div className="rounded-md overflow-hidden border border-gray-200 bg-white aspect-video flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedDocket.signatureImage}
                              alt="Receiver signature"
                              className="max-h-full max-w-full object-contain p-2"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2 rounded-md bg-gray-100 aspect-video">
                            <FileX className="w-5 h-5 text-[#99A1AF]" />
                            <span className="text-xs text-[#99A1AF]">
                              No signature provided
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
                      $
                      {formatNumberThousandSeparator(pricingBreakdown.subtotal)}
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
                createdBy={selectedDocket?.createdBy}
                lastModifiedBy={selectedDocket?.lastModifiedBy}
                createdAt={selectedDocket?.createdAt}
                updatedAt={selectedDocket?.updatedAt}
              />
            )}

            {docketForm.formState.isSubmitted &&
              Object.keys(docketForm.formState.errors).length > 0 && (
                <p className="text-sm text-red-600">
                  Some required fields are invalid. Please review the form and
                  try again.
                </p>
              )}

            {isDesktop && (
              <div className="flex justify-end space-x-2 col-span-2 mb-6">
                <Button variant="outline" type="button" onClick={onCancel}>
                  {isEditing ? 'Close' : 'Cancel'}
                </Button>
                <Button
                  className="cursor-pointer"
                  type="button"
                  onClick={() => docketForm.handleSubmit(onSubmit)()}
                  disabled={
                    (isReadOnly && !canActualLoadSize && !canEditDocketEmail) ||
                    isSubmitting
                  }
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
                  disabled={
                    (isReadOnly && !canActualLoadSize && !canEditDocketEmail) ||
                    isSubmitting
                  }
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
    </>
  );
}
