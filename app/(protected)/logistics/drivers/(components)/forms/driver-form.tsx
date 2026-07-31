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
import { cn, scrollToFirstError } from '@/lib/utils';
import { addNewRecordId } from '@/lib/utils/pinned-records';
import { sortByLabel } from '@/lib/utils/sort-options';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import React from 'react';
import { SelectCreateEdit } from '@/components/ui/select-create-edit';
import HaulierForm from './haulier-form';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFormDialogFooter } from '@/components/form-dialog';
import { NewDriverFormSchema } from './schemas/driver-form-schema';
import z from 'zod';
import { DataTableClient } from '@/components/ui/data-table-client';
import { complianceColumns } from '../(data-tables)/compliance/columns';
import { Loader2, HelpCircle } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { notifySuccess, notifyError } from '@/lib/toast';
import { DRIVER_TYPE, DRIVER_STATUS } from '@/lib/types/driver-enums';
import {
  useCreateDriver,
  useUpdateDriver,
  DriverPreStartChecklistsQueryOptions,
} from '@/lib/api/driver';
import { HaulierTrucksQueryOptions } from '@/lib/api/haulier';
import { useHauliersForForm } from '@/hooks/haulier/use-hauliers-for-form';
import { useQuery } from '@tanstack/react-query';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useTenantStore } from '@/app/stores/tenant-store';
import { isInternalHaulier } from '@/lib/utils/haulier-helper';
import { TableBadges } from '@/components/table-badges';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { useDriverFormState } from '@/hooks/driver/use-driver-form-state';
import { useDriverTruckActions } from '@/hooks/driver/use-driver-truck-actions';
import { AuditInformation } from '@/components/audit-information';
import { FormMultiSelect } from '@/components/ui/form-multi-select';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
  onCancel?: () => void;
  scrollToSection?: string;
}

export default function DriverForm({
  id,
  onCancel,
  onSaved,
  onDirtyChange,
  className,
  onSuccess,
  scrollToSection,
}: Readonly<FormProps>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isEditing = Boolean(id);

  const { hauliers, hasMoreHauliers } = useHauliersForForm({
    enabled: true,
  });

  const tenantEmail = useTenantStore((state) => state.tenantEmail);
  const internalHaulier = hauliers.find((h) =>
    isInternalHaulier(h.emailAddress, tenantEmail),
  );

  const haulierItems = React.useMemo(
    () =>
      sortByLabel(
        hauliers
          .filter((h) => !isInternalHaulier(h.emailAddress, tenantEmail))
          .map((h) => ({
            id: h.id,
            label: h.haulierName,
            fields: { email: h.emailAddress, phone: h.phoneNumber },
          })),
        (item) => item.label,
      ),
    [hauliers, tenantEmail],
  );

  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();

  const { driverData } = useDriverFormState(id, isEditing);
  const { actions: truckActions, truckDialogs } =
    useDriverTruckActions(driverData);

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

  React.useEffect(() => {
    onDirtyChange?.(driverForm.formState.isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverForm.formState.isDirty]);

  const isPending = createDriver.isPending || updateDriver.isPending;

  async function onSubmit(values: z.infer<typeof NewDriverFormSchema>) {
    try {
      if (isEditing && id && driverData) {
        await updateDriver.mutateAsync({
          id,
          data: {
            version: driverData.version ?? 0,
            driverName: values.driverName,
            licenseNumber: values.driverLicenseNumber,
            emailAddress: values.email,
            phoneNumber: values.phone,
            driverType: driverData.driverType,
            driverStatus: driverData.driverStatus ?? DRIVER_STATUS.ACTIVE,
            truckIds: driverData.truckIds ?? [],
          },
        });
      } else {
        const selectedHaulierData = isInternal
          ? internalHaulier
          : hauliers.find((h) => h.id === values.haulierId);

        const newDriver = await createDriver.mutateAsync({
          driverName: values.driverName,
          driverType: values.type,
          emailAddress: values.email,
          phoneNumber: values.phone,
          licenseNumber: values.driverLicenseNumber,
          haulierId: selectedHaulierData?.id,
          truckIds: values.assignedTrucks?.map(Number) ?? [],
        });

        if (newDriver && typeof newDriver.id === 'number') {
          addNewRecordId('driver_main_data_table', newDriver.id);
        }
        onSuccess?.();
      }

      notifySuccess(
        isEditing
          ? 'Driver Updated Successfully!'
          : 'Driver Added Successfully!',
      );
      if (isEditing) {
        driverForm.reset(values);
      }
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
    scrollToFirstError();
  }

  const effectiveHaulierId = isInternal
    ? (internalHaulier?.id ?? 0)
    : (selectedHaulierId ?? 0);

  React.useEffect(() => {
    driverForm.setValue('assignedTrucks', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveHaulierId]);

  const { data: haulierTrucksData } = useQuery(
    HaulierTrucksQueryOptions(effectiveHaulierId),
  );
  const haulierTrucks = React.useMemo(
    () => haulierTrucksData?.trucks ?? [],
    [haulierTrucksData],
  );
  const truckOptions = React.useMemo(
    () =>
      sortByLabel(
        haulierTrucks.map((t) => ({
          label:
            t.model === 'GENERIC' && t.licensePlate.startsWith('GENERIC')
              ? t.licensePlate.replace(/-\d+$/, '')
              : t.licensePlate,
          value: String(t.id),
        })),
        (option) => option.label,
      ),
    [haulierTrucks],
  );

  const trucks = (driverData?.trucks ?? []).map((t) => ({
    id: t.id,
    licensePlate: t.licensePlate,
    status: t.truckStatus === 'AVAILABLE' ? 'ACTIVE' : t.truckStatus,
  }));
  const pendingLabel = isEditing ? 'Saving Changes...' : 'Adding Driver...';
  const idleLabel = isEditing ? 'Update Driver' : 'Add Driver';
  const buttonLabel = isPending ? pendingLabel : idleLabel;

  const complianceSectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollToSection !== 'compliance' || !isEditing || !driverData?.id)
      return;

    const element = complianceSectionRef.current;
    if (!element) return;

    const timer = globalThis.setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 400);

    return () => globalThis.clearTimeout(timer);
  }, [scrollToSection, isEditing, driverData?.id]);

  const { data: checklistsData } = useQuery({
    ...DriverPreStartChecklistsQueryOptions(id ?? 0),
    enabled: isEditing && !!id,
  });
  const complianceRecords = checklistsData?.content ?? [];

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
          form="driver-form"
          type="submit"
          disabled={isPending}
          className="cursor-pointer"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {buttonLabel}
        </Button>
      </div>
    ) : null,
  );

  return (
    <div className="w-full relative">
      {truckDialogs}
      {isPending && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-9999 flex items-center justify-center',
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
            'w-full flex flex-col gap-6',
            className,
            isPending && 'pointer-events-none',
          )}
          onSubmit={driverForm.handleSubmit(onSubmit, onError)}
        >
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
                    className="flex gap-6 mt-2"
                    disabled={isEditing}
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

          <Separator className="my-3" />

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
                <FormLabel>Haulier*</FormLabel>
                <Input
                  value={internalHaulier?.haulierName ?? 'My Company Haulier'}
                  disabled
                />
              </FormItem>
            ) : (
              <SelectCreateEdit
                control={driverForm.control}
                name="haulierId"
                label="Haulier*"
                entityName="Haulier"
                disabled={isEditing}
                items={haulierItems}
                autoSelectForOnlyOneOption={!isEditing && !hasMoreHauliers}
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

              {isEditing && (
                <>
                  <FormItem>
                    <FormLabel>Haulier Email Address*</FormLabel>
                    <Input
                      value={selectedHaulierInfo?.emailAddress ?? ''}
                      disabled
                      placeholder="Auto-filled from selected haulier"
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Haulier Phone Number*</FormLabel>
                    <PhoneInput
                      defaultCountry="AU"
                      value={selectedHaulierInfo?.phoneNumber ?? ''}
                      disabled
                      placeholder="Auto-filled from selected haulier"
                    />
                  </FormItem>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">License &amp; Assignment</h2>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
              {!isEditing && (
                <FormMultiSelect
                  control={driverForm.control}
                  name="assignedTrucks"
                  label="Assign Trucks"
                  options={selectedHaulierId || isInternal ? truckOptions : []}
                  placeholder={
                    !selectedHaulierId && !isInternal
                      ? 'Select Haulier first...'
                      : 'Select trucks...'
                  }
                  disabled={!selectedHaulierId && !isInternal}
                  searchPlaceholder="Search trucks..."
                />
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between w-full gap-2">
                <h2 className="text-lg font-bold">Truck Assignments</h2>
                <Button
                  type="button"
                  size="sm"
                  className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                  onClick={() => truckActions.assign()}
                >
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
                      className="flex items-center justify-between gap-3 rounded-md px-4 py-3 bg-[#F9FAFB]"
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="font-medium truncate">
                          {truck.licensePlate}
                        </span>
                        <TableBadges names={[truck.status]} visibleCount={1} />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer shrink-0"
                        onClick={() =>
                          truckActions.unassign({
                            id: truck.id,
                            licensePlate: truck.licensePlate,
                            status: truck.status,
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
          )}

          {isEditing && (
            <div ref={complianceSectionRef} className="flex flex-col gap-4">
              <Separator />
              <h2 className="text-lg font-bold">Safety &amp; Compliance</h2>
              <div className="w-full overflow-x-auto">
                <DataTableClient
                  columns={complianceColumns}
                  data={complianceRecords}
                  searchPlaceHolder="Search by keyword..."
                />
              </div>
            </div>
          )}

          {isEditing && (
            <AuditInformation
              createdBy={driverData?.createdBy}
              lastModifiedBy={driverData?.lastModifiedBy}
              createdAt={driverData?.createdAt}
              updatedAt={driverData?.updatedAt}
            />
          )}

          {!isDesktop && (
            <div className="flex flex-col gap-3 mb-6">
              <Button
                form="driver-form"
                type="submit"
                disabled={isPending}
                className="cursor-pointer"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {buttonLabel}
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
