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
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { notifySuccess, notifyError } from '@/lib/toast';
import { TRUCK_TYPE } from '@/lib/types/truck-enums';
import { useGetAllHauliers } from '@/lib/api/haulier';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { DataTableClient } from '@/components/ui/data-table-client';
import { formatLocalDateShort } from '@/lib/utils/date';

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

// TODO: replace with real inspection columns when backend is ready
const DUMMY_INSPECTIONS = [
  { id: 1, checklistId: 'TI-24-001', date: 'Feb 10, 2024', driver: 'John Smith', status: 'PASS', notes: 'No defects identified during inspection.' },
  { id: 2, checklistId: 'TI-24-002', date: 'Feb 11, 2024', driver: 'Armin Menhaji', status: 'FAIL', notes: 'Failed Engine oil level, Coolant level.' },
  { id: 3, checklistId: 'TI-24-003', date: 'Feb 12, 2024', driver: 'Jaywoo Choi', status: 'PASS', notes: 'No defects identified during inspection.' },
];

const inspectionColumns = [
  { accessorKey: 'checklistId', header: 'Inspection ID' },
  { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'driver', header: 'Driver' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'notes', header: 'Notes' },
];

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

  const { data: hauliers = [] } = useGetAllHauliers();
  const haulierItems = React.useMemo(
    () =>
      hauliers.map((h) => ({
        id: String(h.id),
        label: h.haulierName,
        fields: { email: h.emailAddress, phone: h.phoneNumber },
      })),
    [hauliers],
  );

  const truckForm = useForm<TruckFormValues>({
    resolver: zodResolver(TruckFormSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'INTERNAL',
      haulier: '',
      licensePlate: '',
      vin: '',
      model: '',
      year: undefined,
      truckType: TRUCK_TYPE.TIPPER,
      tankVolumeM3: undefined,
      tareWeight: undefined,
      combinationGvm: undefined,
    },
  });

  const selectedType = truckForm.watch('type');
  const selectedHaulier = truckForm.watch('haulier');
  const isInternal = selectedType === 'INTERNAL';

  const selectedHaulierInfo = React.useMemo(
    () => hauliers.find((h) => String(h.id) === selectedHaulier),
    [selectedHaulier, hauliers],
  );

  // Report dirty state to parent
  React.useEffect(() => {
    onDirtyChange?.(truckForm.formState.isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truckForm.formState.isDirty]);

  // Clear haulier selection when switching to internal (create mode only)
  React.useEffect(() => {
    if (isInternal && !isEditing) {
      truckForm.setValue('haulier', '');
    }
  }, [isInternal, isEditing, truckForm]);

  async function onSubmit(values: TruckFormValues) {
    try {
      setIsSubmitting(true);
      // TODO: wire up create/update truck API calls
      console.log('Truck form values:', values);
      notifySuccess(isEditing ? 'Truck Updated Successfully!' : 'Truck Added Successfully!');
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

  // TODO: replace with real truck data when editing
  const truckData = isEditing ? null : null;
  const inspectionRecords = isEditing ? DUMMY_INSPECTIONS : [];

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
              {isEditing ? 'Updating Truck...' : 'Adding Truck...'}
            </p>
          </div>
        </div>
      )}

      <Form {...truckForm}>
        <form
          id="truck-form"
          className={cn(
            'w-full flex flex-col gap-4',
            className,
            isSubmitting && 'pointer-events-none',
          )}
          onSubmit={truckForm.handleSubmit(onSubmit, onError)}
        >
          {/* Truck Type (ownership) */}
          <FormField
            control={truckForm.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Truck Type*</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-6"
                  >
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="INTERNAL" />
                      </FormControl>
                      <FormLabel className="font-normal">Internal</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="EXTERNAL" />
                      </FormControl>
                      <FormLabel className="font-normal">External</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <Separator />

          {/* Haulier */}
          {!isInternal && (
            <SelectCreateEdit
              control={truckForm.control}
              name="haulier"
              label="Haulier*"
              entityName="Haulier"
              items={haulierItems}
              renderForm={(editingItem, isEditingItem, onSave, onCancelItem) => (
                <HaulierForm
                  editingItem={editingItem}
                  isEditing={isEditingItem}
                  onSave={onSave}
                  onCancel={onCancelItem}
                />
              )}
            />
          )}

          {/* Haulier Email + Phone — display only, derived from selected haulier */}
          {!isInternal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Haulier Email Address</FormLabel>
                <Input
                  value={selectedHaulierInfo?.emailAddress ?? ''}
                  disabled
                  placeholder="Auto-filled from selected haulier"
                />
              </FormItem>

              <FormItem>
                <FormLabel>Haulier Phone Number</FormLabel>
                <PhoneInput
                  defaultCountry="AU"
                  value={selectedHaulierInfo?.phoneNumber ?? ''}
                  disabled
                  placeholder="Auto-filled from selected haulier"
                />
              </FormItem>
            </div>
          )}

          <Separator />

          {/* Truck Registration + VIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={truckForm.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Truck Registration*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ABC123" {...field} />
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
                  <FormLabel>VIN (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Vehicle Identification Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Make & Model + Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={truckForm.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make &amp; Model*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Volvo FH16 500hp" {...field} />
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
                    <Input
                      isNumber
                      placeholder="e.g. 2022"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Truck Type (vehicle category) */}
          <FormSelect
            control={truckForm.control}
            name="truckType"
            label="Truck Type*"
            searchLabel="Truck Type"
            options={truckTypeOptions}
            placeholder="Select Truck Type"
          />

          {/* Volume & Weight */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Volume &amp; Weight</h2>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={truckForm.control}
                name="tankVolumeM3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume m³*</FormLabel>
                    <FormControl>
                      <Input isNumber placeholder="0" {...field} value={field.value ?? ''} />
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
                    <FormLabel>Tare Weight t™</FormLabel>
                    <FormControl>
                      <Input isNumber placeholder="0" {...field} value={field.value ?? ''} />
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
                    <FormLabel>GVM Weight t™</FormLabel>
                    <FormControl>
                      <Input isNumber placeholder="0" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Driver Assignment — edit mode only */}
          {isEditing && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Driver Assignment</h2>
                <Button type="button" size="sm" className="cursor-pointer">
                  Assign Drivers
                </Button>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground py-2">No drivers assigned.</p>
            </div>
          )}

          {/* Audit Information — edit mode only */}
          {isEditing && truckData && (
            <div className="space-y-6 mt-10 mb-4">
              <h2 className="text-2xl font-bold">Audit Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 md:pl-2 gap-6 md:max-w-3xl">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Created By:</p>
                  <p className="text-sm text-muted-foreground">
                    {(truckData as Record<string, string>).createdBy || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Last Modified By:</p>
                  <p className="text-sm text-muted-foreground">
                    {(truckData as Record<string, string>).lastModifiedBy || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Created Date:</p>
                  <p className="text-sm text-muted-foreground">
                    {formatLocalDateShort((truckData as Record<string, string>).createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Modified Date:</p>
                  <p className="text-sm text-muted-foreground">
                    {formatLocalDateShort((truckData as Record<string, string>).updatedAt)}
                  </p>
                </div>
              </div>
            </div>
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

          {/* Form Actions */}
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
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting
                ? isEditing
                  ? 'Saving Changes...'
                  : 'Adding Truck...'
                : isEditing
                  ? 'Update Truck'
                  : 'Add Truck'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
