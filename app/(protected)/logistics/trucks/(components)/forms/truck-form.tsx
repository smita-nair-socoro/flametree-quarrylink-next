'use client';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cn, addNewRecordId, scrollToFirstError } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import React from 'react';
import { SelectCreateEdit } from '@/components/ui/select-create-edit';
import HaulierForm from '@/app/(protected)/logistics/drivers/(components)/forms/haulier-form';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFormDialogFooter } from '@/components/form-dialog';
import { TruckFormSchema, TruckFormValues } from './schemas/truck-form-schema';
import { Loader2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { notifySuccess, notifyError } from '@/lib/toast';
import { TRUCK_TYPE, TRUCK_BUSINESS_TYPE } from '@/lib/types/truck-enums';
import {
  useCreateTruck,
  useUpdateTruck,
  TruckInspectionsQueryOptions,
} from '@/lib/api/truck';
import {
  HauliersListQueryOptions,
  HaulierDriversQueryOptions,
} from '@/lib/api/haulier';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { useQuery } from '@tanstack/react-query';
import { useTenantStore } from '@/app/stores/tenant-store';
import { isInternalHaulier } from '@/lib/utils/haulier-helper';
import { AuditInformation } from '@/components/audit-information';
import { DataTableClient } from '@/components/ui/data-table-client';
import { PhoneInput } from '@/components/ui/phone-input';
import { inspectionColumns } from '@/app/(protected)/logistics/trucks/(components)/(data-tables)/inspections/columns';
import { YearPicker } from '@/components/year-picker';
import {
  FormMultiSelect,
  FormMultiSelectOption,
} from '@/components/ui/form-multi-select';
import { TableBadges } from '@/components/table-badges';
import { useTruckActions } from '@/hooks/use-truck-actions';
import { useTruckFormState } from '@/hooks/truck/use-truck-form-state';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
  onCancel?: () => void;
  scrollToSection?: string;
}

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

export default function TruckForm({
  id,
  onCancel,
  onSaved,
  onDirtyChange,
  className,
  onSuccess,
  scrollToSection,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isEditing = Boolean(id);
  const [truckOwnerType, setTruckOwnerType] =
    React.useState<TRUCK_BUSINESS_TYPE>(TRUCK_BUSINESS_TYPE.INTERNAL);

  const createTruck = useCreateTruck();
  const updateTruck = useUpdateTruck();

  const { data: hauliersData } = useQuery(HauliersListQueryOptions());
  const hauliers = React.useMemo(
    () => hauliersData?.content ?? [],
    [hauliersData],
  );
  const tenantEmail = useTenantStore((state) => state.tenantEmail);
  const internalHaulier = hauliers.find((h) => isInternalHaulier(h.emailAddress, tenantEmail));

  const haulierItems = React.useMemo(
    () =>
      hauliers
        .filter((h) => !isInternalHaulier(h.emailAddress, tenantEmail))
        .map((h) => ({
          id: h.id,
          label: h.haulierName,
          fields: { email: h.emailAddress, phone: h.phoneNumber },
        })),
    [hauliers, tenantEmail],
  );

  const isInternal = truckOwnerType === TRUCK_BUSINESS_TYPE.INTERNAL;

  const truckForm = useForm<TruckFormValues>({
    resolver: zodResolver(TruckFormSchema),
    mode: 'onChange',
    defaultValues: {
      haulierId: 0,
      licensePlate: '',
      vin: '',
      model: '',
      year: 0,
      truckType: undefined,
      tankVolumeM3: 0,
      tareWeight: 0,
      combinationGvm: 0,
      driverIds: [],
    },
  });

  const selectedHaulierId = truckForm.watch('haulierId');
  const effectiveHaulierId = isInternal
    ? (internalHaulier?.id ?? 0)
    : (selectedHaulierId ?? 0);

  React.useEffect(() => {
    truckForm.setValue('driverIds', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveHaulierId]);

  const { data: haulierDriversData } = useQuery(
    HaulierDriversQueryOptions(effectiveHaulierId),
  );
  const haulierDrivers = React.useMemo(
    () => haulierDriversData?.drivers ?? [],
    [haulierDriversData],
  );
  const driverOptions: FormMultiSelectOption[] = React.useMemo(
    () =>
      haulierDrivers
        .filter((d) => d.id != null)
        .map((d) => ({
          label: d.driverName,
          value: String(d.id),
        })),
    [haulierDrivers],
  );

  const selectedHaulierInfo = React.useMemo(() => {
    if (isInternal) return internalHaulier;
    return hauliers.find((h) => h.id === selectedHaulierId);
  }, [isInternal, selectedHaulierId, hauliers, internalHaulier]);

  const { truckData } = useTruckFormState(id, isEditing);

  const isGenericTruck =
    isEditing &&
    truckData?.model === 'GENERIC' &&
    (truckData?.licensePlate?.startsWith('GENERIC') ?? false);

  React.useEffect(() => {
    onDirtyChange?.(truckForm.formState.isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truckForm.formState.isDirty]);

  React.useEffect(() => {
    if (isInternal && !isEditing) {
      truckForm.setValue('haulierId', internalHaulier?.id ?? 0, {
        shouldDirty: true,
      });
    }
  }, [isInternal, isEditing, truckForm, internalHaulier?.id]);

  React.useEffect(() => {
    if (isEditing && truckData) {
      const isInternalTruck = isInternalHaulier(truckData.haulier?.emailAddress, tenantEmail);
      setTruckOwnerType(
        isInternalTruck
          ? TRUCK_BUSINESS_TYPE.INTERNAL
          : TRUCK_BUSINESS_TYPE.EXTERNAL,
      );
      truckForm.reset({
        haulierId: truckData.haulier?.id ?? truckData.haulierId ?? 0,
        licensePlate: truckData.licensePlate ?? '',
        vin: truckData.vin ?? '',
        model: truckData.model ?? '',
        year: truckData.year ?? 0,
        truckType: truckData.truckType,
        tankVolumeM3: truckData.tankVolumeM3 ?? 0,
        tareWeight: truckData.tareWeight ?? 0,
        combinationGvm: truckData.combinationGvm ?? 0,
        driverIds: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, truckData, tenantEmail]);

  const isSubmitting = createTruck.isPending || updateTruck.isPending;

  async function onSubmit(values: TruckFormValues) {
    if (!isInternal && !effectiveHaulierId) {
      notifyError('Haulier is required. Please select a haulier.');
      return;
    }

    try {
      if (isEditing && id && truckData) {
        await updateTruck.mutateAsync({
          id,
          data: {
            version: truckData.version ?? 0,
            licensePlate: values.licensePlate,
            vin: values.vin || undefined,
            model: values.model,
            year: values.year || 0,
            truckType: values.truckType,
            tankVolumeM3: values.tankVolumeM3,
            tareWeight: values.tareWeight,
            combinationGvm: values.combinationGvm,
          },
        });
      } else {
        const resolvedHaulierId = isInternal
          ? internalHaulier?.id
          : values.haulierId;

        const newTruck = await createTruck.mutateAsync({
          haulierId: resolvedHaulierId || undefined,
          truckBusinessType: truckOwnerType,
          truckBodyType: 'ALUMINIUM',
          pbsApproved: false,
          licensePlate: values.licensePlate,
          vin: values.vin || undefined,
          model: values.model,
          year: values.year || 0,
          truckType: values.truckType,
          tankVolumeM3: values.tankVolumeM3,
          tareWeight: values.tareWeight,
          combinationGvm: values.combinationGvm,
          driverIds: values.driverIds?.map(Number) ?? [],
        });
        if (newTruck && typeof newTruck.id === 'number') {
          addNewRecordId('truck_main_data_table', newTruck.id);
        }
      }

      notifySuccess(
        isEditing ? 'Truck Updated Successfully!' : 'Truck Added Successfully!',
      );
      onSuccess?.();
      onSaved?.();
    } catch (error) {
      notifyError(
        extractErrorMessage(error) ||
          `Failed to ${isEditing ? 'update' : 'save'} truck. Please try again.`,
      );
    }
  }

  function onError(errors: unknown) {
    console.error('Form validation errors:', errors);
    notifyError(isEditing ? 'Failed to Update Truck' : 'Failed to Add Truck', {
      description: 'Check required fields',
    });
    scrollToFirstError();
  }

  const inspectionSectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollToSection !== 'inspection' || !isEditing || !truckData?.id) return;

    const element = inspectionSectionRef.current;
    if (!element) return;

    const timer = window.setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [scrollToSection, isEditing, truckData?.id]);

  const { data: inspectionsData } = useQuery({
    ...TruckInspectionsQueryOptions(id ?? 0),
    enabled: isEditing && !!id,
  });
  const inspectionRecords = inspectionsData?.content ?? [];

  const assignedDrivers = (truckData?.drivers ?? []).map((driver) => ({
    id: driver.id!,
    driverName: driver.driverName,
    status: driver.driverStatus ?? 'ACTIVE',
    driverType: driver.driverType,
    licenseNumber: driver.licenseNumber,
  }));

  const { actions: driverActions, confirmDialogs: driverDialogs } =
    useTruckActions(truckData);

  useFormDialogFooter(
    isDesktop ? (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          type="button"
          className="cursor-pointer"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          form="truck-form"
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isSubmitting
            ? isEditing
              ? 'Saving Changes...'
              : 'Adding Truck...'
            : isEditing
              ? 'Update Truck'
              : 'Add Truck'}
        </Button>
      </div>
    ) : null,
  );

  return (
    <div className="w-full relative">
      {driverDialogs}
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
              {isEditing ? 'Updating Truck...' : 'Adding Truck...'}
            </p>
          </div>
        </div>
      )}

      <Form {...truckForm}>
        <form
          id="truck-form"
          className={cn(
            'w-full flex flex-col gap-6',
            className,
            isSubmitting && 'pointer-events-none',
          )}
          onSubmit={truckForm.handleSubmit(onSubmit, onError)}
        >
          {!isGenericTruck && (
            <>
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-bold">Basic Information</h2>
                <Separator />

                <FormItem className="mb-3">
                  <FormLabel>Truck Type*</FormLabel>
                  <RadioGroup
                    value={truckOwnerType}
                    onValueChange={(v) =>
                      setTruckOwnerType(v as TRUCK_BUSINESS_TYPE)
                    }
                    disabled={isEditing}
                    className="flex gap-6"
                  >
                    <FormItem className="flex items-center gap-2">
                      <RadioGroupItem value={TRUCK_BUSINESS_TYPE.INTERNAL} />
                      <FormLabel className="font-normal">Internal</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-2">
                      <RadioGroupItem value={TRUCK_BUSINESS_TYPE.EXTERNAL} />
                      <FormLabel className="font-normal">External</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormItem>

                {isEditing ? (
                  <>
                    <FormItem>
                      <FormLabel>Haulier*</FormLabel>
                      <Input
                        value={
                          selectedHaulierInfo?.haulierName ??
                          'My Company Haulier'
                        }
                        disabled
                      />
                    </FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel>Haulier Email Address*</FormLabel>
                        <Input
                          value={selectedHaulierInfo?.emailAddress ?? ''}
                          disabled
                          placeholder="Auto-filled from haulier"
                        />
                      </FormItem>
                      <FormItem>
                        <FormLabel>Haulier Phone Number*</FormLabel>
                        <PhoneInput
                          defaultCountry="AU"
                          value={selectedHaulierInfo?.phoneNumber ?? ''}
                          disabled
                          placeholder="Auto-filled from haulier"
                        />
                      </FormItem>
                    </div>
                  </>
                ) : isInternal ? (
                  <FormItem className="mb-5">
                    <FormLabel>Haulier*</FormLabel>
                    <Input
                      value={
                        internalHaulier?.haulierName ??
                        'My Company Haulier'
                      }
                      disabled
                    />
                  </FormItem>
                ) : (
                  <SelectCreateEdit
                    control={truckForm.control}
                    name="haulierId"
                    label="Haulier*"
                    entityName="Haulier"
                    items={haulierItems}
                    renderForm={(
                      editingItem,
                      isEditingItem,
                      onSave,
                      onCancelItem,
                    ) => (
                      <HaulierForm
                        editingItem={editingItem}
                        isEditing={isEditingItem}
                        onSave={onSave}
                        onCancel={onCancelItem}
                      />
                    )}
                  />
                )}

                <FormField
                  control={truckForm.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Truck Registration*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ABC123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={truckForm.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={truckForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make &amp; Model*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Volvo FH16 500hp"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={truckForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year*</FormLabel>
                      <FormControl>
                        <YearPicker
                          value={
                            field.value
                              ? new Date(field.value, 0, 1)
                              : undefined
                          }
                          onChangeAction={(date) => {
                            field.onChange(
                              date ? date.getFullYear() : undefined,
                            );
                          }}
                          placeholder="Select Year"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Truck Type (vehicle category) */}
                <FormSelect
                  control={truckForm.control}
                  name="truckType"
                  label="Truck Type*"
                  searchLabel="Truck Type"
                  options={truckTypeOptions}
                  placeholder="Select Truck Type"
                />
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-bold">Volume &amp; Weight</h2>
                <Separator />
                <div
                  className={cn(
                    'grid grid-cols-3 gap-4',
                    isDesktop ? 'grid-cols-3' : 'grid-cols-1',
                  )}
                >
                  <FormField
                    control={truckForm.control}
                    name="tankVolumeM3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            suffix="m³"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={truckForm.control}
                    name="tareWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tare Weight*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            suffix="TN"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={truckForm.control}
                    name="combinationGvm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GVM Weight*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            suffix="TN"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </>
          )}
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between w-full gap-2">
                <h2 className="text-lg font-bold">Driver Assignment</h2>
                <Button
                  type="button"
                  size="sm"
                  className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                  onClick={() => driverActions.assignDriver()}
                >
                  Assign Drivers
                </Button>
              </div>
              <Separator />
              {assignedDrivers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No drivers assigned.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {assignedDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between gap-3 rounded-md px-4 py-3 bg-[#F9FAFB]"
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-muted-foreground truncate">
                            {driver.licenseNumber}
                          </span>
                          <span className="font-medium truncate">
                            {driver.driverName}
                          </span>
                        </div>
                        <TableBadges
                          names={[driver.status, driver.driverType]}
                          visibleCount={2}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer shrink-0"
                        onClick={() =>
                          driverActions.unassignDriver({
                            id: driver.id,
                            driverName: driver.driverName,
                            status: driver.status,
                          })
                        }
                      >
                        Unassign
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold">Driver Assignment</h2>
              <Separator />
              <FormMultiSelect
                control={truckForm.control}
                name="driverIds"
                label="Drivers"
                options={selectedHaulierId || isInternal ? driverOptions : []}
                placeholder={
                  !selectedHaulierId && !isInternal
                    ? 'Select Haulier first...'
                    : 'Select drivers...'
                }
                disabled={!selectedHaulierId && !isInternal}
                searchPlaceholder="Search drivers..."
              />
            </>
          )}

          {isEditing && (
            <div ref={inspectionSectionRef} className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <Separator />
                <h2 className="text-lg font-bold">Truck Inspections</h2>
              </div>
              <div className="w-full overflow-x-auto">
                <DataTableClient
                  columns={inspectionColumns}
                  data={inspectionRecords}
                  searchPlaceHolder="Search by keyword..."
                />
              </div>
            </div>
          )}

          {isEditing && (
            <AuditInformation
              createdBy={truckData?.createdBy}
              lastModifiedBy={truckData?.lastModifiedBy}
              createdAt={truckData?.createdAt}
              updatedAt={truckData?.updatedAt}
            />
          )}

          {!isDesktop && (
            <div className="flex flex-col gap-3 mb-6">
              <Button
                form="truck-form"
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? isEditing
                    ? 'Saving Changes...'
                    : 'Adding Truck...'
                  : isEditing
                    ? 'Update Truck'
                    : 'Add Truck'}
              </Button>
              <Button
                variant="outline"
                type="button"
                className="cursor-pointer"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          )}

        </form>
      </Form>
    </div>
  );
}
