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
import { useFormDialogFooter } from '@/components/form-dialog';
import { getDocketFormSchema } from './schemas/docket-form-schema';
import { useDocketFormState } from '@/hooks/docket/use-docket-form-state';
import { Spinner } from '@/components/ui/spinner';
import { cn, splitReasonNote, scrollToFirstError } from '@/lib/utils';
import { addNewRecord } from '@/lib/utils/pinned-records';
import { mapDocketDtoToTableRow } from '@/lib/utils/docket-table-helpers';
import { sortByLabel } from '@/lib/utils/sort-options';
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
  Infinity,
} from 'lucide-react';
import { DatePicker } from '@/components/date-picker';
import { toLocalDateTime, formatLocalDateTime } from '@/lib/utils/date';
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
import { useCreateInternalTransferJobItem } from '@/lib/api/job';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { formatNumberThousandSeparator } from '@/lib/utils/number';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { notifyError, notifySuccess } from '@/lib/toast';
import {
  getDeliveryDistanceQuantity,
  convertTruckVolumeToProductUom,
  calculateGrossWeight,
  shouldUseActualLoadSizeForGvm,
} from '@/lib/utils/docket-helper';
import { format } from 'date-fns';
import { ActionDialog } from '@/components/action-dialog';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';
import {
  ChecklistReportModal,
  CHECKLIST_TYPE,
} from '@/components/checklist-report-modal';
import { TableBadges } from '@/components/table-badges';
import { VOID_REASON_LABELS } from '@/hooks/docket/void-docket-content';
import { CANCEL_REASON_LABELS } from '@/hooks/docket/cancel-docket-content';
import { STOP_REASON_LABELS } from '@/hooks/docket/stop-transit-content';

import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { TRUCK_TYPE } from '@/lib/types/truck-enums';
import { TimeWindowPicker } from '@/components/ui/time-window-picker';
import { getDocketSignOffCopy } from '@/lib/utils/docket-sign-off';
import { DocketOperationalUpdateRequest, DocketDTO } from '@/lib/types/docket';

const truckTypeOptions: FormSelectOption[] = sortByLabel(
  [
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
  ],
  (option) => option.label,
);

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
}: Readonly<FormProps>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { currencySymbol, taxPercentage, exTaxLabel, taxRateLabel } =
    useTenantCurrencyTax();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<{
    src: string;
    title: string;
  } | null>(null);
  const [timeConflictOpen, setTimeConflictOpen] = React.useState(false);
  const [conflictingDocketIds, setConflictingDocketIds] = React.useState<
    number[]
  >([]);
  const [checklistModalOpen, setChecklistModalOpen] = React.useState(false);
  const [checklistModalType, setChecklistModalType] =
    React.useState<CHECKLIST_TYPE>(CHECKLIST_TYPE.DRIVER);
  const [adjustedAlert, setAdjustedAlert] = React.useState<{
    amount: number;
    uom: string;
    productMax?: number;
    truckCapacity?: number;
    overProductMax?: boolean;
    isGenericTruck?: boolean;
  } | null>(null);
  const createDocket = useCreateDocket();
  const createInternalTransferJobItem = useCreateInternalTransferJobItem();
  const updateDocket = useUpdateDocket();
  const operationalUpdateDocket = useOperationalUpdateDocket();
  const [pendingRetry, setPendingRetry] = React.useState<
    (() => Promise<void>) | null
  >(null);
  const [tareWeightInput, setTareWeightInput] = React.useState<string>('');
  const {
    docketForm,
    isEditing,
    isJobLocked,
    jobSelectProps,
    jobLineItemOptions,
    jobLineItemSelectProps,
    selectedJobId,
    selectedJobDetails,
    jobLineItems,
    selectedJobLineItemDetails,
    isInternalTransfer: isInternalTransferFromState,
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
    selectedDocket,
  } = useDocketFormState({
    id,
    initialDocket,
    isQuickDocket,
    jobId,
    onDirtyChange,
    taxPercentage,
  });

  React.useEffect(() => {
    // Prefer the tare weight saved on the docket; fall back to the truck's default.
    setTareWeightInput(
      selectedDocket?.tareTruckWeight
        ? selectedDocket.tareTruckWeight.toString()
        : (selectedDocket?.truck?.tareWeight?.toString() ?? ''),
    );
  }, [
    selectedDocket?.id,
    selectedDocket?.tareTruckWeight,
    selectedDocket?.truck?.tareWeight,
  ]);

  const combineDateAndTime = (
    date: Date | undefined,
    timeString: string,
  ): string | null => {
    if (!date || !timeString) return null;

    const [hours, minutes] = timeString.split(':');
    const combined = new Date(date);
    combined.setHours(
      Number.parseInt(hours, 10),
      Number.parseInt(minutes, 10),
      0,
      0,
    );

    return toLocalDateTime(combined);
  };

  const currentStatus = selectedDocket?.docketStatus;
  const isInternalTransfer =
    isInternalTransferFromState ||
    selectedJobDetails?.jobType === 'INTERNAL_TRANSFER';
  const isDelivery = selectedJobLineItemDetails().type === 'DELIVERY';
  const isReadOnly =
    Boolean(id) && !canEdit && currentStatus !== DOCKET_STATUS.PENDING;

  const isAssigned = currentStatus === DOCKET_STATUS.ASSIGNED;
  const canEditTruckType =
    !isEditing || currentStatus === DOCKET_STATUS.UNASSIGNED;
  const canEditPlannedLoadSize =
    !isEditing ||
    currentStatus === DOCKET_STATUS.UNASSIGNED ||
    currentStatus === DOCKET_STATUS.PENDING ||
    currentStatus === DOCKET_STATUS.ASSIGNED;

  const canEditCollectionDate =
    !isEditing ||
    (!isDelivery &&
      (currentStatus === DOCKET_STATUS.PREPARING ||
        currentStatus === DOCKET_STATUS.READY));

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

  const hasDeliveryProof = !!(
    selectedDocket?.signatureImage ||
    selectedDocket?.unloadedPhotos?.length ||
    selectedDocket?.receivedPhotos?.length ||
    selectedDocket?.receiverName
  );
  const showDeliverySignOff =
    isEditing &&
    isDelivery &&
    (currentStatus === DOCKET_STATUS.DELIVERED ||
      currentStatus === DOCKET_STATUS.INVOICED) &&
    hasDeliveryProof;
  const showCollectionSignOff =
    isEditing &&
    !isDelivery &&
    !!selectedDocket?.deliveredAt &&
    (currentStatus === DOCKET_STATUS.COLLECTED ||
      currentStatus === DOCKET_STATUS.INVOICED ||
      currentStatus === DOCKET_STATUS.CASH_SALE);
  const showSignOff = showDeliverySignOff || showCollectionSignOff;
  const signOffCopy = getDocketSignOffCopy(!isDelivery);

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

    const { note } = splitReasonNote(rawReason);
    const rawReasonKey = rawReason?.split('-')[0]?.trim() ?? '';
    const labelMap =
      actionLabel === 'stopped'
        ? STOP_REASON_LABELS
        : actionLabel === 'cancelled'
          ? CANCEL_REASON_LABELS
          : VOID_REASON_LABELS;
    const reason =
      labelMap[rawReasonKey] ||
      rawReasonKey
        .replaceAll('_', ' ')
        .replace(/^\w/, (c) => c.toUpperCase()) ||
      'N/A';
    return (
      <div className="border border-[#DC2626] bg-[#FEF2F2] p-4 rounded-md mb-4 flex flex-col">
        <div className="flex items-start gap-2 font-medium text-sm">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-[#EF4444]" />
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

  const invoiceSyncFailedBanner = React.useMemo(() => {
    if (!isEditing || !selectedDocket) return null;
    if (
      selectedDocket.docketStatus !== DOCKET_STATUS.INVOICED ||
      selectedDocket.invoiceStatus !== 'FAILED'
    ) {
      return null;
    }

    return (
      <div className="border border-red-300 bg-red-50 p-4 rounded-md flex flex-col">
        <div className="flex items-start gap-2 font-medium text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
          <span className="text-red-900">
            Invoice created, but third-party sync failed. The docket remains
            invoiced. Select Resync Invoice to try again.
          </span>
        </div>
      </div>
    );
  }, [isEditing, selectedDocket]);

  const arrivalDeliveryBanner = React.useMemo(() => {
    if (!isEditing || !selectedDocket) return null;
    const status = selectedDocket.docketStatus;

    const formatEventTime = (isoString: string) => {
      try {
        const date = new Date(isoString);
        const isToday =
          format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        return isToday
          ? `${format(date, 'hh:mm a')} Today`
          : format(date, 'hh:mm a, d MMM');
      } catch {
        return '—';
      }
    };

    if (status === DOCKET_STATUS.ARRIVED && selectedDocket.arrivedAt) {
      return (
        <div className="flex flex-col gap-2 mb-2">
          <span className="text-sm text-[#713F12] underline">
            Arrived at: {formatEventTime(selectedDocket.arrivedAt)}
          </span>
          {selectedDocket.arrivalLatitude != null &&
            selectedDocket.arrivalLongitude != null && (
              <a
                href={`https://www.google.com/maps?q=${selectedDocket.arrivalLatitude},${selectedDocket.arrivalLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#3B82F6] underline bg-[#F5F5F5] px-2.5 py-1 rounded-full w-fit hover:opacity-80 transition-opacity"
              >
                Lat {selectedDocket.arrivalLatitude} | Long{' '}
                {selectedDocket.arrivalLongitude}
              </a>
            )}
        </div>
      );
    }

    if (
      (status === DOCKET_STATUS.DELIVERED ||
        status === DOCKET_STATUS.INVOICED) &&
      selectedDocket.deliveredAt
    ) {
      let timeOnSite: string | null = null;
      if (selectedDocket.arrivedAt) {
        const diff = Math.floor(
          (new Date(selectedDocket.deliveredAt).getTime() -
            new Date(selectedDocket.arrivedAt).getTime()) /
          1000,
        );
        if (diff >= 0) {
          const h = Math.floor(diff / 3600);
          const m = Math.floor((diff % 3600) / 60);
          const s = diff % 60;
          timeOnSite = [h, m, s]
            .map((v) => String(v).padStart(2, '0'))
            .join(':');
        }
      }

      return (
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#14532D] underline">
              Delivered at: {formatEventTime(selectedDocket.deliveredAt)}
            </span>
            {selectedDocket.arrivalLatitude != null &&
              selectedDocket.arrivalLongitude != null && (
                <a
                  href={`https://www.google.com/maps?q=${selectedDocket.arrivalLatitude},${selectedDocket.arrivalLongitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#3B82F6] underline bg-[#F5F5F5] px-2.5 py-1 rounded-full w-fit hover:opacity-80 transition-opacity"
                >
                  Lat {selectedDocket.arrivalLatitude} | Long{' '}
                  {selectedDocket.arrivalLongitude}
                </a>
              )}
          </div>
          {timeOnSite && (
            <div className="flex flex-col items-center justify-center border-2 border-[#65A30D] bg-[#F9FFEB] rounded-lg px-3.5 py-0.75 min-w-32.5 shrink-0 self-stretch">
              <span className="text-[10px] font-bold text-[#65A30D] tracking-wider uppercase">
                Time on Site
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[20px] font-bold text-[#365314] tabular-nums">
                  {timeOnSite}
                </span>
                <div className="bg-[#65A30D]/50 p-0.5 rounded-full flex items-center justify-center">
                  <span className="w-2.25 h-2.25 rounded-full bg-[#365314] inline-block" />
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  }, [isEditing, selectedDocket]);

  async function handleReadOnlyUpdate(
    values: z.infer<ReturnType<typeof getDocketFormSchema>>,
  ) {
    if (
      !isEditing ||
      (!canActualLoadSize && !canEditDocketEmail && !canEditCollectionDate)
    )
      return;

    const actualLoadSize = values.actualLoadSize;
    const docketEmails = values.docketEmail
      ? values.docketEmail.split(',').map((e) => e.trim())
      : [];
    const payload: DocketOperationalUpdateRequest = {
      checkWindowTimeConflict: false,
    };

    if (canEditCollectionDate) {
      if (values.deliveryCollectionDate) {
        payload.deliveryCollectionDate = format(
          values.deliveryCollectionDate,
          "yyyy-MM-dd'T'00:00:00.000",
        );
      }
      let startDateTime = values.deliveryCollectionStartTime;
      let endDateTime = values.deliveryCollectionEndTime;
      if (values.deliveryCollectionDate) {
        if (startDateTime && !startDateTime.includes('T')) {
          startDateTime =
            combineDateAndTime(values.deliveryCollectionDate, startDateTime) ??
            startDateTime;
        }
        if (endDateTime && !endDateTime.includes('T')) {
          endDateTime =
            combineDateAndTime(values.deliveryCollectionDate, endDateTime) ??
            endDateTime;
        }
      }
      if (startDateTime) payload.deliveryStartWindow = startDateTime;
      if (endDateTime) payload.deliveryEndWindow = endDateTime;
    }
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
      const { quantity } = getDeliveryDistanceQuantity({
        isCollection,
        needTruckQty: lineItemDetails.needTruckQty,
        truckQty: values.truckQty,
        loadSize: actualLoadSize,
        productUom: lineItemDetails.productUom,
        truckUom: lineItemDetails.truckUom,
        density: lineItemDetails.densityTonnagePerM3 || 1,
      });
      if (!isCollection) payload.deliveryDistanceQuantity = quantity;
    }

    try {
      setIsSubmitting(true);
      await operationalUpdateDocket.mutateAsync({
        id: selectedDocket?.id ?? 0,
        data: payload,
      });
      notifySuccess('Docket updated successfully');
      onSaved?.();
    } catch (error) {
      notifyError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAssignedUpdate(
    values: z.infer<ReturnType<typeof getDocketFormSchema>>,
  ) {
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

    const docketEmails = values.docketEmail
      ? values.docketEmail
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : [];
    const docketEmailRecipients = Array.from(new Set(docketEmails));

    const lineItemDetails = selectedJobLineItemDetails();
    const isCollection = lineItemDetails.type === 'COLLECTION';
    const { quantity: deliveryDistanceQuantity } = getDeliveryDistanceQuantity({
      isCollection,
      needTruckQty: lineItemDetails.needTruckQty,
      truckQty: values.truckQty,
      loadSize: values.plannedLoadSize || 0,
      productUom: lineItemDetails.productUom,
      truckUom: lineItemDetails.truckUom,
      density: lineItemDetails.densityTonnagePerM3 || 1,
    });

    const { dirtyFields } = docketForm.formState;
    const windowFieldsChanged =
      !!dirtyFields.deliveryCollectionStartTime ||
      !!dirtyFields.deliveryCollectionEndTime ||
      !!dirtyFields.deliveryCollectionDate;

    const parsedTareTruckWeight = Number.parseFloat(tareWeightInput);
    const assignedPayload = {
      deliveryCollectionDate: values.deliveryCollectionDate
        ? format(values.deliveryCollectionDate, "yyyy-MM-dd'T'00:00:00.000")
        : undefined,
      deliveryStartWindow: startDateTime || undefined,
      deliveryEndWindow: endDateTime || undefined,
      plannedLoadSize: values.plannedLoadSize,
      actualLoadSize: values.plannedLoadSize,
      docketEmailRecipients,
      truckId: selectedDocket!.truckId,
      driverId: selectedDocket!.driverId,
      deliveryDistanceQuantity,
      tareTruckWeight: Number.isNaN(parsedTareTruckWeight)
        ? undefined
        : parsedTareTruckWeight,
    };

    try {
      setIsSubmitting(true);
      const result = await operationalUpdateDocket.mutateAsync({
        id: selectedDocket!.id,
        data: {
          ...assignedPayload,
          checkWindowTimeConflict: windowFieldsChanged,
        },
      });
      if (
        result.conflictingDocketIds &&
        result.conflictingDocketIds.length > 0
      ) {
        setPendingRetry(() => async () => {
          await operationalUpdateDocket.mutateAsync({
            id: selectedDocket!.id,
            data: { ...assignedPayload, checkWindowTimeConflict: false },
          });
          notifySuccess('Docket updated successfully');
          onSaved?.();
        });
        setConflictingDocketIds(result.conflictingDocketIds);
        setTimeConflictOpen(true);
      } else {
        notifySuccess('Docket updated successfully');
        onSaved?.();
      }
    } catch (error) {
      notifyError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmit(
    values: z.infer<ReturnType<typeof getDocketFormSchema>>,
  ) {
    if (isReadOnly) {
      await handleReadOnlyUpdate(values);
      return;
    }
    if (isEditing && selectedDocket?.docketStatus === DOCKET_STATUS.ASSIGNED) {
      await handleAssignedUpdate(values);
      return;
    }
    await doSave(values);
  }

  async function doSave(
    values: z.infer<ReturnType<typeof getDocketFormSchema>>,
  ) {
    try {
      const lineItemDetails = selectedJobLineItemDetails();
      const isCollection = lineItemDetails.type === 'COLLECTION';

      if (isInternalTransfer && pricingBreakdown.missingCostPrice) {
        notifyError(
          `Cost price is missing for ${lineItemDetails.productName || 'this product'} at ${selectedJobDetails?.fromSiteName || 'the source site'}. Set a cost price before creating the transfer.`,
        );
        return;
      }

      setIsSubmitting(true);

      const density = lineItemDetails.densityTonnagePerM3 || 1;

      const effectiveLoadSize =
        isEditing &&
          currentStatus !== DOCKET_STATUS.UNASSIGNED &&
          currentStatus !== DOCKET_STATUS.ASSIGNED &&
          currentStatus !== DOCKET_STATUS.PENDING
          ? values.actualLoadSize || values.plannedLoadSize || 0
          : values.plannedLoadSize || 0;

      let estimatedVolumeM3 = 0;
      const docketEmails = values.docketEmail
        ? values.docketEmail
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean)
        : [];
      const docketEmailRecipients = Array.from(new Set(docketEmails));

      if (
        lineItemDetails.productUom === 'M3' ||
        lineItemDetails.productUom === 'm3' ||
        lineItemDetails.productUom === 'BULKA' ||
        lineItemDetails.productUom === 'Bulka'
      ) {
        estimatedVolumeM3 = effectiveLoadSize;
      } else if (lineItemDetails.productUom === 'TN') {
        estimatedVolumeM3 = effectiveLoadSize / density;
      } else if (
        lineItemDetails.productUom === 'KG_20' ||
        lineItemDetails.productUom === '20kg'
      ) {
        estimatedVolumeM3 = effectiveLoadSize / 50 / density;
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

      const { quantity: deliveryDistanceQuantity, uom: deliveryDistanceUom } =
        getDeliveryDistanceQuantity({
          isCollection,
          needTruckQty: lineItemDetails.needTruckQty,
          truckQty: values.truckQty,
          loadSize: effectiveLoadSize,
          productUom: lineItemDetails.productUom,
          truckUom: lineItemDetails.truckUom,
          density,
        });

      let resolvedJobItemId = values.jobLineItemId;
      if (!isEditing && isInternalTransfer) {
        const transferItem = await createInternalTransferJobItem.mutateAsync({
          jobId: values.jobId,
          productId: values.jobLineItemId,
          quantity: values.plannedLoadSize || effectiveLoadSize || 1,
        });
        resolvedJobItemId = transferItem.id;
      }

      const payload = {
        jobId: values.jobId,
        jobItemId: resolvedJobItemId,
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
          : {
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
          },
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
        actualLoadSize: effectiveLoadSize,
        // grossTruckWeight: 100,
        // tareTruckWeight: 0,
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
        onSaved?.();
      } else {
        const newDocket = await createDocket.mutateAsync(payload);
        if (newDocket && typeof newDocket.id === 'number') {
          // The create response doesn't reliably embed the job/job-item, so
          // fall back to what the form already knows.
          const selectedLineItem = jobLineItems.find(
            (lineItem) => lineItem.id === values.jobLineItemId,
          );
          addNewRecord(
            'docket_main_data_table',
            mapDocketDtoToTableRow({
              ...newDocket,
              job: selectedJobDetails ?? newDocket.job,
              jobItem: selectedLineItem ?? newDocket.jobItem,
            } as DocketDTO),
          );
        }
        notifySuccess('Docket created successfully');
        onSaved?.();
        onSuccess?.();
      }
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

  useFormDialogFooter(
    isDesktop ? (
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          {isEditing ? 'Close' : 'Cancel'}
        </Button>
        <Button
          className="cursor-pointer"
          type="button"
          onClick={() =>
            docketForm.handleSubmit(onSubmit, scrollToFirstError)()
          }
          disabled={
            (isReadOnly &&
              !canActualLoadSize &&
              !canEditDocketEmail &&
              !canEditCollectionDate) ||
            isSubmitting ||
            (isInternalTransfer &&
              !isEditing &&
              pricingBreakdown.missingCostPrice)
          }
        >
          {isEditing
            ? 'Save Changes'
            : isInternalTransfer
              ? 'Create Internal Transfer'
              : 'Create Docket'}
        </Button>
      </div>
    ) : null,
  );

  // Gross Vehicle Mass (GVM) check — Calculated Gross Weight is the truck's tare
  // weight plus the load (converted to tonnes). Once the docket moves past
  // ASSIGNED (In Transit, Stopped, Arrived, Delivered, Voided, Cancelled, …)
  // the actual load size drives the calc, falling back to planned when no
  // actual load size has been recorded. When the result exceeds the truck's
  // GVM limit we surface a warning and flag the gross weight field.
  const weightDetails = selectedJobLineItemDetails();
  const parsedTareWeight = Number.parseFloat(tareWeightInput);
  const tareWeightForCalc = Number.isNaN(parsedTareWeight)
    ? null
    : parsedTareWeight;
  const truckGvm = selectedDocket?.truck?.combinationGvm ?? null;
  const useActualLoadSizeForGvm = shouldUseActualLoadSizeForGvm(
    currentStatus,
    isDelivery,
  );
  const loadSizeForGvm =
    (useActualLoadSizeForGvm ? docketForm.watch('actualLoadSize') : 0) ||
    docketForm.watch('plannedLoadSize') ||
    0;
  const calculatedGrossWeight = calculateGrossWeight({
    tareWeight: tareWeightForCalc,
    loadSize: loadSizeForGvm,
    productUom: weightDetails.productUom || 'TN',
    density: weightDetails.densityTonnagePerM3 || 1,
  });
  const showWeightFields = selectedDocket?.truck != null;
  const gvmExceeded =
    truckGvm != null &&
    calculatedGrossWeight != null &&
    calculatedGrossWeight > truckGvm;
  const gvmOverBy =
    gvmExceeded && truckGvm != null ? calculatedGrossWeight! - truckGvm : 0;

  return (
    <>
      <ImagePreviewDialog
        open={previewImage !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null);
        }}
        src={previewImage?.src ?? ''}
        alt={previewImage?.title ?? 'Photo preview'}
        title={previewImage?.title ?? 'Photo Preview'}
      />
      <ChecklistReportModal
        open={
          checklistModalOpen && checklistModalType === CHECKLIST_TYPE.DRIVER
        }
        onOpenChange={setChecklistModalOpen}
        type={CHECKLIST_TYPE.DRIVER}
        submissionId={selectedDocket?.driverChecklistSubmission?.id ?? 0}
      />
      <ChecklistReportModal
        open={checklistModalOpen && checklistModalType === CHECKLIST_TYPE.TRUCK}
        onOpenChange={setChecklistModalOpen}
        type={CHECKLIST_TYPE.TRUCK}
        submissionId={selectedDocket?.truckChecklistSubmission?.id ?? 0}
        truckLicensePlate={selectedDocket?.truck?.licensePlate}
      />

      <ActionDialog
        open={timeConflictOpen}
        onOpenChangeAction={setTimeConflictOpen}
        title="Confirm Delivery Time Change"
        description={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
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
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
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
                  window.open(
                    `/customer-operations/dockets/?docketId=${conflictingDocketIds.join(',')}`,
                    '_blank',
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
          if (!pendingRetry) return;
          try {
            setIsSubmitting(true);
            await pendingRetry();
            setPendingRetry(null);
          } catch (error) {
            notifyError(extractErrorMessage(error));
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      <div className="w-full relative">
        {isSubmitting && (
          <div
            className={cn(
              'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-9999 flex items-center justify-center',
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
            onSubmit={docketForm.handleSubmit(onSubmit, scrollToFirstError)}
          >
            {statusBanner}
            {invoiceSyncFailedBanner}
            {arrivalDeliveryBanner}
            <div className={cn('p-1 flex flex-col gap-4 w-full', className)}>
              {isInternalTransfer ? (
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[#5B21B6]">
                  ⇄ INTERNAL TRANSFER
                </div>
              ) : null}
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
                  placeholder="Select Job"
                  disabled={isJobLocked || isReadOnly || isEditing}
                  {...jobSelectProps}
                  autoSelectForOnlyOneOption={!isEditing}
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
                  <div className="grid grid-cols-3 gap-4">
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
                      {...jobLineItemSelectProps}
                      autoSelectForOnlyOneOption={!isEditing}
                    />

                    {!isInternalTransfer && (
                      <FormItem>
                        <FormLabel>Quarry / Supplier*</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full mb-7"
                            disabled
                            value={selectedJobLineItemDetails().quarryName ?? ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}

                    <FormItem>
                      <FormLabel>
                        {isInternalTransfer
                          ? 'Product Density (TN/m³)'
                          : 'Product Density (TN/m³)*'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          disabled
                          isNumber
                          allowDecimal
                          minDecimals={2}
                          maxDecimals={2}
                          value={
                            selectedJobLineItemDetails().densityTonnagePerM3 > 0
                              ? selectedJobLineItemDetails().densityTonnagePerM3
                              : ''
                          }
                          suffix="TN/m³"
                          suffixPositionClassName="mb-7"
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                  {isInternalTransfer ? (
                    <div className="grid grid-cols-2 gap-4 rounded-md border bg-slate-50 p-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">From Site</div>
                        <div className="font-medium">
                          {selectedJobDetails?.fromSiteName || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">To Site</div>
                        <div className="font-medium">
                          {selectedJobDetails?.toSiteName || '—'}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {(() => {
                    const jobLineItemId = docketForm.watch('jobLineItemId');
                    const details = selectedJobLineItemDetails();
                    const needTruckQty = details.needTruckQty;
                    // const truckQtyOverflows =
                    //   isDelivery && needTruckQty && canActualLoadSize;

                    const truckVolumeM3 =
                      selectedDocket?.truck?.tankVolumeM3 ?? null;
                    const truckCapacityInProductUom =
                      truckVolumeM3 != null
                        ? convertTruckVolumeToProductUom(
                          truckVolumeM3,
                          details.productUom,
                          details.densityTonnagePerM3 || 1,
                        )
                        : null;
                    const isGenericTruck =
                      selectedDocket?.truck?.licensePlate
                        ?.toUpperCase()
                        .startsWith('GENERIC') ?? false;

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
                              {details.truckUom === 'HOURLY'
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
                                  details.truckUom === 'HOURLY'
                                    ? 'hrs'
                                    : details.truckUomLabel
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
                                    disabled
                                    value={
                                      field.value ??
                                      details.productUomLabel ??
                                      ''
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
                                        const productMax = details.remainingQty;
                                        const maxLimit = isGenericTruck
                                          ? productMax
                                          : truckCapacityInProductUom != null
                                            ? Math.min(
                                              productMax,
                                              truckCapacityInProductUom,
                                            )
                                            : productMax;
                                        const val = Number.parseFloat(
                                          e.target.value,
                                        );
                                        const uomText = details.productUomLabel;

                                        if (
                                          !Number.isNaN(val) &&
                                          val > maxLimit
                                        ) {
                                          field.onChange(maxLimit);
                                          setAdjustedAlert({
                                            amount: maxLimit,
                                            uom: uomText,
                                            productMax,
                                            truckCapacity:
                                              truckCapacityInProductUom ??
                                              undefined,
                                            overProductMax: val > productMax,
                                            isGenericTruck,
                                          });
                                        } else {
                                          field.onChange(e);
                                          setAdjustedAlert(null);
                                        }
                                      }}
                                      value={field.value ?? ''}
                                      isNumber
                                      allowDecimal
                                      maxDecimals={2}
                                      minDecimals={1}
                                      disabled={
                                        isReadOnly ||
                                        !jobLineItemId ||
                                        !canEditPlannedLoadSize ||
                                        (!isEditing &&
                                          !!docketForm.watch('jobLineItemId') &&
                                          selectedJobLineItemDetails()
                                            .remainingQty <= 0)
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
                                      onChange={(e) => {
                                        const productMax = details.remainingQty;
                                        const maxLimit = isGenericTruck
                                          ? productMax
                                          : truckCapacityInProductUom != null
                                            ? Math.min(
                                              productMax,
                                              truckCapacityInProductUom,
                                            )
                                            : productMax;
                                        const val = Number.parseFloat(
                                          e.target.value,
                                        );
                                        const uomText = details.productUomLabel;

                                        if (
                                          !Number.isNaN(val) &&
                                          val > maxLimit
                                        ) {
                                          field.onChange(maxLimit);
                                          setAdjustedAlert({
                                            amount: maxLimit,
                                            uom: uomText,
                                            productMax,
                                            truckCapacity:
                                              truckCapacityInProductUom ??
                                              undefined,
                                            overProductMax: val > productMax,
                                            isGenericTruck,
                                          });
                                        } else {
                                          field.onChange(e);
                                          setAdjustedAlert(null);
                                        }
                                      }}
                                      value={field.value ?? ''}
                                      isNumber
                                      allowDecimal
                                      maxDecimals={2}
                                      minDecimals={1}
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

                        {showWeightFields && (
                          <div className={cn('grid gap-4', gridCols)}>
                            <FormItem>
                              <FormLabel>Truck Tare Weight (TN)*</FormLabel>
                              <FormControl>
                                <Input
                                  isNumber
                                  allowDecimal
                                  minDecimals={2}
                                  maxDecimals={2}
                                  value={tareWeightInput}
                                  onChange={(e) =>
                                    setTareWeightInput(e.target.value)
                                  }
                                  disabled={isReadOnly}
                                />
                              </FormControl>
                            </FormItem>
                            <FormItem>
                              <FormLabel
                                className={cn(gvmExceeded && 'text-[#DC2626]')}
                              >
                                Calculated Gross Weight (TN)*
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className={cn(
                                    'w-full',
                                    gvmExceeded &&
                                    'border-[#DC2626] text-[#DC2626] focus-visible:ring-[#DC2626]',
                                  )}
                                  disabled
                                  isNumber
                                  allowDecimal
                                  minDecimals={2}
                                  maxDecimals={2}
                                  value={calculatedGrossWeight ?? ''}
                                />
                              </FormControl>
                            </FormItem>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {!isEditing &&
                    !!docketForm.watch('jobLineItemId') &&
                    selectedJobLineItemDetails().remainingQty <= 0 && (
                      <div className="border border-[#FCA5A5] bg-[#FEF2F2] p-3 rounded-md flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-medium text-sm text-[#991B1B]">
                          <Info className="h-4 w-4 text-[#DC2626]" />
                          <span>No product quantity available</span>
                        </div>
                        <div className="text-sm text-[#991B1B] pl-6">
                          The planned load size has been set to 0 because there
                          is no remaining product available in this job.
                        </div>
                      </div>
                    )}

                  {adjustedAlert && (
                    <div className="border border-[#FDE68A] bg-[#FEFCE8] p-3 rounded-md flex flex-col gap-1">
                      <div className="flex items-center gap-2 font-medium text-sm text-[#92400E]">
                        <Info className="h-4 w-4 text-[#D97706]" />
                        <span>Quantity Adjusted</span>
                      </div>
                      <div className="text-sm text-[#92400E] pl-6">
                        {adjustedAlert.isGenericTruck &&
                          adjustedAlert.productMax != null &&
                          adjustedAlert.overProductMax
                          ? `Only ${formatNumberThousandSeparator(adjustedAlert.productMax)} ${adjustedAlert.uom} of product remains, but the truck can carry up to ${formatNumberThousandSeparator(adjustedAlert.productMax)} ${adjustedAlert.uom}. Quantity adjusted to ${formatNumberThousandSeparator(adjustedAlert.amount)} ${adjustedAlert.uom}.`
                          : adjustedAlert.truckCapacity != null &&
                            adjustedAlert.productMax != null &&
                            adjustedAlert.truckCapacity <
                            adjustedAlert.productMax
                            ? adjustedAlert.overProductMax
                              ? `Only ${formatNumberThousandSeparator(adjustedAlert.productMax)} ${adjustedAlert.uom} of product remains, but the truck can carry ${formatNumberThousandSeparator(adjustedAlert.truckCapacity)} ${adjustedAlert.uom}. Quantity adjusted to ${formatNumberThousandSeparator(adjustedAlert.amount)} ${adjustedAlert.uom}.`
                              : `Truck max capacity can carry ${formatNumberThousandSeparator(adjustedAlert.truckCapacity)} ${adjustedAlert.uom}. Quantity adjusted to ${formatNumberThousandSeparator(adjustedAlert.amount)} ${adjustedAlert.uom}.`
                            : `Only ${formatNumberThousandSeparator(adjustedAlert.amount)} ${adjustedAlert.uom} available. Quantity has been adjusted to ${formatNumberThousandSeparator(adjustedAlert.amount)} ${adjustedAlert.uom}.`}
                      </div>
                    </div>
                  )}

                  {gvmExceeded && (
                    <div className="border border-[#FCA5A5] bg-[#FEF2F2] p-4 rounded-md flex flex-col gap-1">
                      <div className="flex items-center gap-2 font-medium text-sm text-[#991B1B]">
                        <Info className="h-4 w-4 text-[#DC2626]" />
                        <span>GVM Limit Exceeded</span>
                      </div>
                      <div className="text-sm text-[#991B1B] pl-6">
                        The current load puts Truck{' '}
                        {selectedDocket?.truck?.licensePlate ?? ''}{' '}
                        {gvmOverBy.toFixed(2)} TN over its maximum allowed Gross
                        Vehicle Mass (Max GVM: {truckGvm?.toFixed(2)} TN).
                        <br />
                        Please reduce Planned Load Size before dispatching.
                      </div>
                    </div>
                  )}

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
                          {selectedJobLineItemDetails().productUomLabel}{' '}
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
                          {selectedJobLineItemDetails().productUomLabel} total
                        </span>
                      </div>
                      {(() => {
                        const vol = selectedDocket?.truck?.tankVolumeM3 ?? null;
                        if (vol == null) return null;
                        const d = selectedJobLineItemDetails();
                        const density = d.densityTonnagePerM3 || 1;
                        const cap = convertTruckVolumeToProductUom(
                          vol,
                          d.productUom,
                          density,
                        );
                        const isGenericTruck =
                          selectedDocket?.truck?.licensePlate
                            ?.toUpperCase()
                            .startsWith('GENERIC') ?? false;
                        const uomNorm = d.productUom?.toLowerCase();
                        const uomText = d.productUomLabel;
                        const isM3 = uomNorm === 'm3' || uomNorm === 'bulka';
                        const calcLabel = isM3
                          ? `${formatNumberThousandSeparator(vol)} m³`
                          : uomNorm === 'tn'
                            ? `${formatNumberThousandSeparator(vol)} m³ x ${density} density`
                            : `${formatNumberThousandSeparator(vol)} m³ x ${density} density x 50`;
                        return (
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm text-muted-foreground">
                                Truck Capacity
                              </span>
                              {!isM3 && !isGenericTruck && (
                                <span className="text-xs text-muted-foreground/70">
                                  {calcLabel} ={' '}
                                  {formatNumberThousandSeparator(cap)} {uomText}
                                </span>
                              )}
                              {isGenericTruck && (
                                <span className="text-xs text-muted-foreground/70">
                                  GENERIC Truck
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-medium">
                              {isGenericTruck ? (
                                <Infinity className="w-5 h-5" />
                              ) : (
                                `${formatNumberThousandSeparator(cap)} ${uomText} total`
                              )}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="items-center flex gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-[17px] font-medium">
                      {isInternalTransfer
                        ? 'Transfer Information'
                        : selectedJobLineItemDetails().type === 'COLLECTION'
                          ? 'Collection Information'
                          : 'Delivery Information'}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {isInternalTransfer
                      ? 'Transfer date, addresses from the job sites, and optional contact details'
                      : selectedJobLineItemDetails().type === 'COLLECTION'
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
                          <FormLabel>
                            {isInternalTransfer
                              ? 'Transfer Date*'
                              : selectedJobLineItemDetails().type !==
                                  'COLLECTION'
                                ? 'Delivery Date*'
                                : 'Collection Date*'}
                          </FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChangeAction={field.onChange}
                              placeholder="Pick a date"
                              disabledDates={{ before: today }}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {!isInternalTransfer && (
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
                    )}
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
                              readOnly={
                                isReadOnly || isAssigned || isInternalTransfer
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {(isInternalTransfer ||
                      selectedJobLineItemDetails().type !== 'COLLECTION') && (
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
                                readOnly={
                                  isReadOnly ||
                                  isAssigned ||
                                  isInternalTransfer
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  {<Map markers={mapMarkers} className="h-100 w-full mt-5" />}
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
                    {isInternalTransfer
                      ? 'Transfer timing and optional contact information'
                      : selectedJobLineItemDetails().type === 'COLLECTION'
                        ? 'Collection timing and contact information'
                        : 'Delivery timing and contact information'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={docketForm.control}
                      name="deliveryCollectionStartTime"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Start Time Window*</FormLabel>
                          <FormControl>
                            <TimeWindowPicker
                              value={field.value}
                              onChange={field.onChange}
                              relation="start"
                              siblingValue={newEnd}
                              disabled={isReadOnly && !canEditCollectionDate}
                              aria-invalid={!!fieldState.error}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={docketForm.control}
                      name="deliveryCollectionEndTime"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>End Time Window*</FormLabel>
                          <FormControl>
                            <TimeWindowPicker
                              value={field.value}
                              onChange={field.onChange}
                              relation="end"
                              siblingValue={newStart}
                              disabled={isReadOnly && !canEditCollectionDate}
                              aria-invalid={!!fieldState.error}
                            />
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
                          <FormLabel>
                            Contact Name{isInternalTransfer ? '' : '*'}
                          </FormLabel>
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
                          <FormLabel>
                            Contact Phone{isInternalTransfer ? '' : '*'}
                          </FormLabel>
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
                      return (
                        <FormItem className={'col-span-2 col-start-1'}>
                          <FormLabel>
                            Docket Email{isInternalTransfer ? '' : '*'}
                          </FormLabel>
                          <FormControl>
                            <MultipleInput
                              className="w-full"
                              placeholder={
                                docketForm.watch('jobId') === 0
                                  ? 'Select Job First'
                                  : 'Enter Docket Emails'
                              }
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
                            className="w-full min-h-20"
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
              {(() => {
                const driverChecklist =
                  selectedDocket?.hasTodayDriverPreStart &&
                    selectedDocket?.driverChecklistSubmissionId
                    ? selectedDocket?.driverChecklistSubmission
                    : null;
                const truckChecklist =
                  selectedDocket?.hasTodayTruckInspectionByCurrentDriver &&
                    selectedDocket?.truckChecklistSubmissionId
                    ? selectedDocket?.truckChecklistSubmission
                    : null;

                if (!isEditing || (!driverChecklist && !truckChecklist))
                  return null;

                return (
                  <div
                    className={cn(
                      'grid gap-4',
                      driverChecklist && truckChecklist
                        ? 'grid-cols-2'
                        : 'grid-cols-1',
                    )}
                  >
                    {driverChecklist && (
                      <div className="border-t-2 border-t-primary p-4 flex flex-col gap-3 bg-[#F9FAFB]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#6A7282]" />
                            <span className="text-base font-bold">
                              Pre-Start Checklist
                            </span>
                          </div>
                          {driverChecklist.checklistStatus !== 'CONFIRMED' && (
                            <Button
                              type="button"
                              variant="link"
                              className="text-sm font-medium text-[#8E51FF] underline p-0 h-auto cursor-pointer"
                              onClick={() => {
                                setChecklistModalType(CHECKLIST_TYPE.DRIVER);
                                setChecklistModalOpen(true);
                              }}
                            >
                              View Full Report
                            </Button>
                          )}
                        </div>
                        {driverChecklist.checklistStatus && (
                          <TableBadges
                            names={driverChecklist.checklistStatus}
                          />
                        )}
                      </div>
                    )}
                    {truckChecklist && (
                      <div className="border-t-2 border-t-primary p-4 flex flex-col gap-3 bg-[#F9FAFB]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#6A7282]" />
                            <span className="text-base font-bold">
                              Truck Inspection
                            </span>
                          </div>
                          {truckChecklist.checklistStatus !== 'CONFIRMED' && (
                            <Button
                              type="button"
                              variant="link"
                              className="text-sm font-medium text-[#8E51FF] underline p-0 h-auto cursor-pointer"
                              onClick={() => {
                                setChecklistModalType(CHECKLIST_TYPE.TRUCK);
                                setChecklistModalOpen(true);
                              }}
                            >
                              View Full Report
                            </Button>
                          )}
                        </div>
                        {truckChecklist.checklistStatus && (
                          <TableBadges names={truckChecklist.checklistStatus} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Sign Off Section */}
              {showSignOff && (
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
                          {signOffCopy.atPrefix}{' '}
                          {format(
                            new Date(selectedDocket.deliveredAt),
                            'hh:mm a',
                          )}
                        </span>
                      )}
                    </div>

                    {signOffCopy.showReceiverOnSite ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                          {signOffCopy.nameLabel}
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
                    ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        {signOffCopy.nameLabel}
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
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">
                          {signOffCopy.photo1Label}
                        </span>
                        {selectedDocket?.unloadedPhotos?.[0] ? (
                          <div className="relative rounded-md overflow-hidden aspect-video bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedDocket.unloadedPhotos[0]}
                              alt={signOffCopy.photo1Label}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  src: selectedDocket.unloadedPhotos![0],
                                  title: signOffCopy.photo1Label,
                                })
                              }
                              className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-1.5 hover:bg-black/40 transition-colors"
                            >
                              <Eye className="w-7 h-7 text-white" />
                              <div className="flex items-center gap-1 text-white text-xs font-medium">
                                <CircleCheckBig className="w-3.5 h-3.5 text-green-400" />
                                Photo Captured
                              </div>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2 rounded-md bg-gray-100 aspect-video">
                            <ImageOff className="w-5 h-5 text-[#99A1AF]" />
                            <span className="text-xs text-[#99A1AF]">
                              {signOffCopy.emptyPhotoPlaceholder}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">
                          {signOffCopy.photo2Label}
                        </span>
                        {selectedDocket?.receivedPhotos?.[0] ? (
                          <div className="relative rounded-md overflow-hidden aspect-video bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedDocket.receivedPhotos[0]}
                              alt={signOffCopy.photo2Label}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  src: selectedDocket.receivedPhotos![0],
                                  title: signOffCopy.photo2Label,
                                })
                              }
                              className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-1.5 hover:bg-black/40 transition-colors"
                            >
                              <Eye className="w-7 h-7 text-white" />
                              <div className="flex items-center gap-1 text-white text-xs font-medium">
                                <CircleCheckBig className="w-3.5 h-3.5 text-green-400" />
                                Photo Captured
                              </div>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2 rounded-md bg-gray-100 aspect-video">
                            <ImageOff className="w-5 h-5 text-[#99A1AF]" />
                            <span className="text-xs text-[#99A1AF]">
                              {signOffCopy.emptyPhotoPlaceholder}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">
                          {signOffCopy.signatureLabel}
                        </span>
                        {selectedDocket?.signatureImage ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({
                                src: selectedDocket.signatureImage!,
                                title: signOffCopy.signatureLabel,
                              })
                            }
                            className="rounded-md overflow-hidden border border-gray-200 bg-white aspect-video flex items-center justify-center w-full hover:opacity-80 transition-opacity"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedDocket.signatureImage}
                              alt={signOffCopy.signatureLabel}
                              className="max-h-full max-w-full object-contain p-2"
                            />
                          </button>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2 rounded-md bg-gray-100 aspect-video">
                            <FileX className="w-5 h-5 text-[#99A1AF]" />
                            <span className="text-xs text-[#99A1AF]">
                              {signOffCopy.emptySignaturePlaceholder}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              <div className="bg-purple-50 rounded-lg border shadow-md px-4 py-3">
                {isInternalTransfer ? (
                  <>
                    <h3 className="text-lg font-bold mb-3">Transfer Summary</h3>
                    <div className="flex flex-col gap-3 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-normal">
                      <div>
                        <span>Quantity</span>
                        <span>
                          {formatNumberThousandSeparator(
                            docketForm.watch('actualLoadSize') ||
                              docketForm.watch('plannedLoadSize') ||
                              0,
                          )}{' '}
                          {selectedJobLineItemDetails().productUomLabel}
                        </span>
                      </div>
                      <div>
                        <span>Cost price</span>
                        <span>
                          {currencySymbol}
                          {formatNumberThousandSeparator(
                            pricingBreakdown.productCostUnit,
                          )}{' '}
                          / {selectedJobLineItemDetails().productUomLabel}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-dashed border-purple-300">
                        <span className="font-bold text-lg">Product cost</span>
                        <span className="font-bold text-lg">
                          {currencySymbol}
                          {formatNumberThousandSeparator(
                            pricingBreakdown.productCost,
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold mb-3">Sale Summary</h3>
                    <div className="flex flex-col gap-3 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-normal">
                      <div>
                        <span>Product Sell</span>
                        <span>
                          {currencySymbol}
                          {formatNumberThousandSeparator(
                            pricingBreakdown.productSell,
                          )}
                        </span>
                      </div>
                      {selectedJobLineItemDetails().type !== 'COLLECTION' && (
                        <div>
                          <span>Truck Sell</span>
                          <span>
                            {currencySymbol}
                            {formatNumberThousandSeparator(
                              pricingBreakdown.truckSell,
                            )}
                          </span>
                        </div>
                      )}
                      {pricingBreakdown.showDigitalPlatformFee && (
                        <div className="pt-2 border-t border-dashed border-purple-300">
                          <span>{pricingBreakdown.digitalPlatformFeeLabel}</span>
                          <span>
                            {currencySymbol}
                            {formatNumberThousandSeparator(
                              pricingBreakdown.digitalPlatformFee,
                            )}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-dashed border-purple-300">
                        <span>Subtotal {exTaxLabel}</span>
                        <span>
                          {currencySymbol}
                          {formatNumberThousandSeparator(pricingBreakdown.subtotal)}
                        </span>
                      </div>
                      <div>
                        <span>{taxRateLabel}</span>
                        <span>
                          {currencySymbol}
                          {formatNumberThousandSeparator(pricingBreakdown.gst)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-dashed border-purple-300">
                        <span className="font-bold text-lg">Total Invoice</span>
                        <span className="font-bold text-lg">
                          {currencySymbol}
                          {formatNumberThousandSeparator(pricingBreakdown.total)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
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

            {!isDesktop && (
              <div className="flex flex-col col-span-2 gap-3 my-6">
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={() =>
                    docketForm.handleSubmit(onSubmit, scrollToFirstError)()
                  }
                  disabled={
                    (isReadOnly &&
                      !canActualLoadSize &&
                      !canEditDocketEmail &&
                      !canEditCollectionDate) ||
                    isSubmitting
                  }
                >
                  {isEditing
                    ? 'Save Changes'
                    : isInternalTransfer
                      ? 'Create Internal Transfer'
                      : 'Create Docket'}
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
