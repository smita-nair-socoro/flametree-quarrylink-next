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
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import React from 'react';
import { SelectCreateEdit } from '@/components/ui/select-create-edit';
import HaulierForm from '@/app/(protected)/logistics/drivers/(components)/forms/haulier-form';
import { useMediaQuery } from '@/hooks/use-media-query';
import { TruckFormSchema, TruckFormValues } from './schemas/truck-form-schema';
import { Loader2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { notifySuccess, notifyError } from '@/lib/toast';
import { TRUCK_TYPE } from '@/lib/types/truck-enums';
import { HauliersListQueryOptions } from '@/lib/api/haulier';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { useQuery } from '@tanstack/react-query';
import { useClientStore } from '@/app/stores/client-store';
import { DriversListQueryOptions } from '@/lib/api/driver';
import { TruckByIdQueryOptions } from '@/lib/api/truck';
import { AuditInformation } from '@/components/audit-information';
import { DataTableClient } from '@/components/ui/data-table-client';
import { PhoneInput } from '@/components/ui/phone-input';
import { inspectionColumns } from '@/app/(protected)/logistics/trucks/(components)/(data-tables)/inspections/columns';
import type { InspectionRecord } from '@/lib/types/truck-inspection';
import { YearPicker } from '@/components/year-picker';
import {
  FormMultiSelect,
  FormMultiSelectOption,
} from '@/components/ui/form-multi-select';
import { TableBadges } from '@/components/table-badges';
import { useTruckActions } from '@/hooks/use-truck-actions';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
  onCancel?: () => void;
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

// TODO: replace with real inspection data from API
const DUMMY_INSPECTIONS: InspectionRecord[] = [
  {
    id: 1,
    checklistId: 'TI-24-001',
    date: 'Feb 10, 2024',
    driver: { driverName: 'John Smith' } as InspectionRecord['driver'],
    status: 'PASS',
    notes: 'No defects identified during inspection.',
  },
  {
    id: 2,
    checklistId: 'TI-24-002',
    date: 'Feb 11, 2024',
    driver: { driverName: 'Armin Menhaji' } as InspectionRecord['driver'],
    status: 'FAIL',
    notes: 'Failed Engine oil level, Coolant level.',
  },
  {
    id: 3,
    checklistId: 'TI-24-003',
    date: 'Feb 12, 2024',
    driver: { driverName: 'Jaywoo Choi' } as InspectionRecord['driver'],
    status: 'PASS',
    notes: 'No defects identified during inspection.',
  },
  {
    id: 4,
    checklistId: 'TI-24-004',
    date: 'Feb 13, 2024',
    driver: { driverName: 'John Smith' } as InspectionRecord['driver'],
    status: 'CONFIRMED',
    notes: 'External haulier check confirmed by driver.',
  },
] as InspectionRecord[];

export default function TruckForm({
  id,
  onCancel,
  onSaved,
  onDirtyChange,
  className,
  onSuccess,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isEditing = Boolean(id);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [truckOwnerType, setTruckOwnerType] = React.useState<
    'INTERNAL' | 'EXTERNAL'
  >('INTERNAL');

  const { data: hauliers = [] } = useQuery(HauliersListQueryOptions());
  const tenantName = useClientStore((state) => state.getTenantName());
  const internalHaulier = hauliers.find((h) => h.haulierName === tenantName);

  const haulierItems = React.useMemo(
    () =>
      hauliers
        .filter((h) => h.haulierName !== tenantName)
        .map((h) => ({
          id: h.id,
          label: h.haulierName,
          fields: { email: h.emailAddress, phone: h.phoneNumber },
        })),
    [hauliers, tenantName],
  );

  const { data: drivers = [] } = useQuery(DriversListQueryOptions());
  const driverOptions: FormMultiSelectOption[] = React.useMemo(
    () =>
      drivers
        .filter((d) => d.id != null)
        .map((d) => ({
          label: d.driverName,
          value: String(d.id),
        })),
    [drivers],
  );

  const isInternal = truckOwnerType === 'INTERNAL';

  const truckForm = useForm<TruckFormValues>({
    resolver: zodResolver(TruckFormSchema),
    mode: 'onChange',
    defaultValues: {
      haulierId: 0,
      licensePlate: '',
      vin: '',
      model: '',
      year: '',
      truckType: undefined,
      tankVolumeM3: 0,
      tareWeight: 0,
      combinationGvm: 0,
      driverId: '',
    },
  });

  const selectedHaulierId = truckForm.watch('haulierId');
  const selectedHaulierInfo = React.useMemo(() => {
    if (isInternal) return internalHaulier;
    return hauliers.find((h) => h.id === selectedHaulierId);
  }, [isInternal, selectedHaulierId, hauliers, internalHaulier]);

  // Report dirty state to parent
  React.useEffect(() => {
    onDirtyChange?.(truckForm.formState.isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truckForm.formState.isDirty]);

  // Clear haulier field when switching to internal (create mode only)
  React.useEffect(() => {
    if (isInternal && !isEditing) {
      truckForm.setValue('haulierId', internalHaulier?.id ?? 0, {
        shouldDirty: true,
      });
    }
  }, [isInternal, isEditing, truckForm, internalHaulier?.id]);

  async function onSubmit(values: TruckFormValues) {
    try {
      setIsSubmitting(true);
      // TODO: wire up create/update truck API calls
      console.log('Truck form values:', values);
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
    } finally {
      setIsSubmitting(false);
    }
  }

  function onError(errors: unknown) {
    console.error('Form validation errors:', errors);
    notifyError(isEditing ? 'Failed to Update Truck' : 'Failed to Add Truck', {
      description: 'Check required fields',
    });
  }

  const { data: truckData } = useQuery({
    ...TruckByIdQueryOptions(id ?? 0),
    enabled: isEditing && !!id,
  });
  const inspectionRecords = isEditing ? DUMMY_INSPECTIONS : [];

  // TODO: replace with real assigned drivers from API
  const assignedDrivers: { id: number; driverName: string; status: string }[] =
    [
      { id: 1, driverName: 'John Smith', status: 'ACTIVE' },
      { id: 2, driverName: 'Armin Menhaji', status: 'ACTIVE' },
      { id: 3, driverName: 'Jayden Olivo', status: 'INACTIVE' },
    ];

  const { actions: driverActions, confirmDialogs: driverDialogs } =
    useTruckActions(truckData);

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
          {/* Basic Information */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Basic Information</h2>
            <Separator />

            {/* Truck Type (ownership) */}
            <FormItem className="mb-3">
              <FormLabel>Truck Type*</FormLabel>
              <RadioGroup
                value={truckOwnerType}
                onValueChange={(v) =>
                  setTruckOwnerType(v as 'INTERNAL' | 'EXTERNAL')
                }
                disabled={isEditing}
                className="flex gap-6"
              >
                <FormItem className="flex items-center gap-2">
                  <RadioGroupItem value="INTERNAL" />
                  <FormLabel className="font-normal">Internal</FormLabel>
                </FormItem>
                <FormItem className="flex items-center gap-2">
                  <RadioGroupItem value="EXTERNAL" />
                  <FormLabel className="font-normal">External</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>

            {/* Haulier */}
            {isEditing ? (
              <>
                <FormItem>
                  <FormLabel>Haulier</FormLabel>
                  <Input
                    value={
                      selectedHaulierInfo?.haulierName ??
                      tenantName ??
                      'My Company Haulier'
                    }
                    disabled
                  />
                </FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Haulier Email Address</FormLabel>
                    <Input
                      value={selectedHaulierInfo?.emailAddress ?? ''}
                      disabled
                      placeholder="Auto-filled from haulier"
                    />
                  </FormItem>
                  <FormItem>
                    <FormLabel>Haulier Phone Number</FormLabel>
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
                <FormLabel>Haulier</FormLabel>
                <Input
                  value={
                    internalHaulier?.haulierName ??
                    tenantName ??
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

            {/* Truck Registration */}
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

            {/* VIN */}
            <FormField
              control={truckForm.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Make & Model */}
            <FormField
              control={truckForm.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make &amp; Model*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Volvo FH16 500hp" {...field} />
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
                          ? new Date(parseInt(field.value), 0, 1)
                          : undefined
                      }
                      onChangeAction={(date) => {
                        field.onChange(
                          date ? date.getFullYear().toString() : undefined,
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
            {/* Volume & Weight */}
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
                        isNumber
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
                        isNumber
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
                        isNumber
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
          {/* Driver Assignment */}
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Driver Assignment</h2>
                <Button
                  type="button"
                  size="sm"
                  className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
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
                      className="flex items-center justify-between rounded-md px-4 py-3 bg-[#F9FAFB]"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{driver.driverName}</span>
                        <TableBadges names={[driver.status]} visibleCount={1} />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
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
                name="driverId"
                label="Drivers (Optional)"
                options={driverOptions}
                placeholder="Search or Select Drivers"
              />
            </>
          )}

          {/* Truck Inspections — edit mode only */}
          {isEditing && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <Separator />
                <h2 className="text-lg font-bold">Truck Inspections</h2>
              </div>
              <DataTableClient
                columns={inspectionColumns}
                data={inspectionRecords}
                searchPlaceHolder="Search by keyword..."
              />
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

          {/* Form Actions */}
          {isDesktop && (
            <div className="flex justify-end gap-3 pt-2 mb-6">
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
          )}

          {!isDesktop && (
            <div className="flex flex-col gap-3 my-6">
              <Button type="submit" disabled={isSubmitting}>
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
                form="truck-form"
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={isSubmitting}
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
