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
import HaulierForm from './haulier-form';
import { useMediaQuery } from '@/hooks/use-media-query';
import { NewDriverFormSchema } from './schemas/driver-form-schema';
import z from 'zod';
import { DataTableClient } from '@/components/ui/data-table-client';
import { complianceColumns } from '../(data-tables)/compliance/columns';
import { Loader2, HelpCircle } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { notifySuccess, notifyError } from '@/lib/toast';
import { DRIVER_TYPE } from '@/lib/types/driver-enums';
import { useCreateDriver, useUpdateDriver } from '@/lib/api/driver';
import { useGetAllHauliers } from '@/lib/api/haulier';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useClientStore } from '@/app/stores/client-store';
import { addNewRecordId } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BADGE_COLORS } from '@/lib/utils';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { useDriverFormState } from '@/hooks/driver/use-driver-form-state';
import { formatLocalDateShort } from '@/lib/utils/date';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
  onCancel?: () => void;
}

const DUMMY_COMPLIANCE = [
  {
    id: 1,
    checklistId: 'CL-25-001',
    date: 'Jan 15, 2024',
    status: 'PASS',
    notes: 'All safety checks cleared.',
  },
  {
    id: 2,
    checklistId: 'CL-25-002',
    date: 'Jan 16, 2024',
    status: 'FAIL',
    notes: 'Failed Health & Wellness.',
  },
  {
    id: 3,
    checklistId: 'CL-25-003',
    date: 'Jan 17, 2024',
    status: 'PASS',
    notes: 'All safety checks cleared.',
  },
  {
    id: 4,
    checklistId: 'CL-25-004',
    date: 'Jan 17, 2024',
    status: 'CONFIRMED',
    notes: 'External haulier check confirmed by driver.',
  },
  {
    id: 5,
    checklistId: 'CL-25-005',
    date: 'Jan 18, 2024',
    status: 'FAIL',
    notes: 'Failed Health & Wellness.',
  },
  {
    id: 6,
    checklistId: 'CL-25-006',
    date: 'Jan 19, 2024',
    status: 'PASS',
    notes: 'All safety checks cleared.',
  },
  {
    id: 7,
    checklistId: 'CL-25-007',
    date: 'Jan 20, 2024',
    status: 'PASS',
    notes: 'All safety checks cleared.',
  },
];

export default function DriverForm({
  id,
  onCancel,
  onSaved,
  onDirtyChange,
  className,
  onSuccess,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isEditing = Boolean(id);

  const { data: hauliers = [] } = useGetAllHauliers();
  const haulierItems = React.useMemo(
    () =>
      hauliers.map((h) => ({
        id: h.id,
        label: h.haulierName,
        fields: { email: h.emailAddress, phone: h.phoneNumber },
      })),
    [hauliers],
  );

  const tenantName = useClientStore((state) => state.getTenantName());
  const internalHaulier = hauliers.find((h) => h.haulierName === tenantName);

  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();

  const { driverData } = useDriverFormState(id, isEditing);

  const driverForm = useForm<z.infer<typeof NewDriverFormSchema>>({
    resolver: zodResolver(NewDriverFormSchema),
    mode: 'onChange',
    defaultValues: {
      driverName: '',
      email: '',
      phone: '',
      type: DRIVER_TYPE.INTERNAL,
      haulierId: 0,
      driverLicenseNumber: '',
      assignedTrucks: [],
    },
  });

  // Populate form when editing
  React.useEffect(() => {
    if (isEditing && driverData) {
      driverForm.reset({
        driverName: driverData.driverName || '',
        email: driverData.emailAddress || '',
        phone: driverData.phoneNumber || '',
        type: driverData.driverType || DRIVER_TYPE.INTERNAL,
        haulierId: driverData.haulier?.id || 0,
        driverLicenseNumber: driverData.licenseNumber || '',
        assignedTrucks: [],
      });
    }
  }, [isEditing, driverData, driverForm]);

  const selectedType = driverForm.watch('type');
  const selectedHaulierId = driverForm.watch('haulierId');
  const isInternal = selectedType === DRIVER_TYPE.INTERNAL;

  const selectedHaulierInfo = React.useMemo(() => {
    if (isInternal) return internalHaulier;
    return hauliers.find((h) => h.id === selectedHaulierId);
  }, [isInternal, selectedHaulierId, hauliers, internalHaulier]);

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(driverForm.formState.isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverForm.formState.isDirty]);

  // Clear haulier selection when switching to internal (create mode only)
  React.useEffect(() => {
    if (isInternal && !isEditing) {
      driverForm.setValue('haulierId', 0);
    }
  }, [isInternal, isEditing, driverForm]);

  const isPending = createDriver.isPending || updateDriver.isPending;

  async function onSubmit(values: z.infer<typeof NewDriverFormSchema>) {
    try {
      const selectedHaulierData = isInternal
        ? internalHaulier
        : hauliers.find((h) => h.id === values.haulierId);

      if (isEditing && id && driverData) {
        await updateDriver.mutateAsync({
          id,
          data: {
            version: driverData.version,
            driverName: values.driverName,
            licenseNumber: values.driverLicenseNumber,
            emailAddress: values.email,
            phoneNumber: values.phone,
            driverType: values.type,
            driverStatus: driverData.driverStatus,
            truckIds: driverData.truckIds ?? [],
            haulierId: selectedHaulierData?.id,
          },
        });
      } else {
        const newDriver = await createDriver.mutateAsync({
          driverName: values.driverName,
          driverType: values.type,
          emailAddress: values.email,
          phoneNumber: values.phone,
          licenseNumber: values.driverLicenseNumber,
          haulierId: selectedHaulierData?.id,
        });

        if (newDriver && typeof newDriver.id === 'number') {
          addNewRecordId('driver_main_data_table', newDriver.id);
        }
      }

      notifySuccess(
        isEditing
          ? 'Driver Updated Successfully!'
          : 'Driver Added Successfully!',
      );
      onSuccess?.();
      onSaved?.();
    } catch (error) {
      notifyError(
        extractErrorMessage(error) ||
        `Failed to ${isEditing ? 'update' : 'save'} driver. Please try again.`,
      );
    }
  }

  function onError(errors: unknown) {
    console.error('Form validation errors:', errors);
    notifyError(
      isEditing ? 'Failed to Update Driver' : 'Failed to Add Driver',
      { description: 'Check required fields' },
    );
  }

  // Dummy trucks and compliance — replace with real API data when backend is available
  const trucks: { id: number; registration: string; status: string }[] = [];
  const complianceRecords = isEditing ? DUMMY_COMPLIANCE : [];

  return (
    <div className="w-full relative">
      {isPending && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10',
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              {isEditing ? 'Updating Driver...' : 'Adding Driver...'}
            </p>
          </div>
        </div>
      )}

      <Form {...driverForm}>
        <form
          id="driver-form"
          className={cn(
            'w-full flex flex-col gap-4',
            className,
            isPending && 'pointer-events-none',
          )}
          onSubmit={driverForm.handleSubmit(onSubmit, onError)}
        >
          {/* Driver Type */}
          <FormField
            control={driverForm.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver Type*</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-6"
                  >
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value={DRIVER_TYPE.INTERNAL} />
                      </FormControl>
                      <FormLabel className="font-normal">Internal</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value={DRIVER_TYPE.SUBCONTRACTOR} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Subcontractor
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <Separator />

          {/* Driver Name + Haulier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormField
              control={driverForm.control}
              name="driverName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Driver Name*
                    {!isEditing && !isInternal && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Enter the driver&apos;s name. If unknown, use a
                            generic name (e.g., &apos;Driver 1&apos;).
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter generic name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isInternal ? (
              <FormItem>
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
                control={driverForm.control}
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
          </div>

          {/* Contact Information */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Contact Information</h2>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={driverForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="driver@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={driverForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number*</FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="AU"
                        placeholder="+61 400 123 456"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
          </div>

          {/* License & Assignment */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">License &amp; Assignment</h2>
            <Separator />
            <FormField
              control={driverForm.control}
              name="driverLicenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number*</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Truck Assignments — edit mode only */}
          {isEditing && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Truck Assignments</h2>
                <Button type="button" size="sm" className="cursor-pointer">
                  Assign Trucks
                </Button>
              </div>
              <Separator />
              {trucks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No trucks assigned.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {trucks.map((truck) => (
                    <div
                      key={truck.id}
                      className="flex items-center justify-between rounded-md px-4 py-3 bg-[#F9FAFB]"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">
                          {truck.registration}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            BADGE_COLORS[truck.status] ||
                            'bg-green-100 text-green-800 border-green-300'
                          }
                        >
                          {truck.status}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
                      >
                        Unassign
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Audit Information — edit mode only */}
          {isEditing && driverData && (
            <div className="space-y-6 mt-10 mb-4">
              <h2 className="text-2xl font-bold">Audit Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 md:pl-2 gap-6 md:max-w-3xl">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Created By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {driverData.createdBy || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Last Modified By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {driverData.lastModifiedBy || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Created Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatLocalDateShort(driverData.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Modified Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatLocalDateShort(driverData.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Safety & Compliance — edit mode only */}
          {isEditing && (
            <div className="flex flex-col gap-4">
              <Separator />
              <h2 className="text-lg font-bold">Safety &amp; Compliance</h2>
              <DataTableClient
                columns={complianceColumns}
                data={complianceRecords}
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
              form="driver-form"
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending
                ? isEditing
                  ? 'Saving Changes...'
                  : 'Adding Driver...'
                : isEditing
                  ? 'Update Driver'
                  : 'Add Driver'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
