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
import {
  NewDriverFormSchema,
  NewDriverFormValues,
} from './schemas/driver-form-schema';
import { Loader2, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { notifySuccess, notifyError } from '@/lib/toast';
import { DRIVER_TYPE } from '@/lib/types/driver-enums';
import { useCreateDriver, useUpdateDriver } from '@/lib/api/driver';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { BADGE_COLORS } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { DriversListQueryOptions } from '@/lib/api/driver';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
  onCancel?: () => void;
}

const haulierItems = [
  {
    id: '1',
    label: 'ABC Transport',
    fields: { email: 'abc@transport.com.au', phone: '+61400123456' },
  },
  {
    id: '2',
    label: 'XYZ Logistics',
    fields: { email: 'info@xyzlogistics.com', phone: '+61400333444' },
  },
  {
    id: '3',
    label: 'Quick Haul',
    fields: { email: 'info@quickhaul.com.au', phone: '+61400345678' },
  },
];

// Dummy data — replace with real API data when available
const DUMMY_TRUCKS = [
  { id: 1, registration: 'EXT-LMN333', status: 'ACTIVE' },
  { id: 2, registration: 'EXT-BM65KJ', status: 'ACTIVE' },
];

const DUMMY_COMPLIANCE = [
  { id: 1, checklistId: 'CL-25-001', date: 'Jan 15, 2024', status: 'PASS', notes: 'All safety checks cleared.' },
  { id: 2, checklistId: 'CL-25-002', date: 'Jan 16, 2024', status: 'FAIL', notes: 'Failed Health & Wellness.' },
  { id: 3, checklistId: 'CL-25-003', date: 'Jan 17, 2024', status: 'PASS', notes: 'All safety checks cleared.' },
  { id: 4, checklistId: 'CL-25-004', date: 'Jan 17, 2024', status: 'CONFIRMED', notes: 'External haulier check confirmed by driver.' },
  { id: 5, checklistId: 'CL-25-005', date: 'Jan 18, 2024', status: 'FAIL', notes: 'Failed Health & Wellness.' },
  { id: 6, checklistId: 'CL-25-006', date: 'Jan 19, 2024', status: 'PASS', notes: 'All safety checks cleared.' },
  { id: 7, checklistId: 'CL-25-007', date: 'Jan 20, 2024', status: 'PASS', notes: 'All safety checks cleared.' },
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

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [safetyOpen, setSafetyOpen] = React.useState(false);
  const [safetySearch, setSafetySearch] = React.useState('');

  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();

  // Find driver from the cached list query
  const { data: driversData } = useQuery(DriversListQueryOptions());
  const driverData = React.useMemo(
    () => (isEditing && id ? (driversData ?? []).find((d) => d.id === id) : undefined),
    [driversData, id, isEditing],
  );

  const driverForm = useForm<NewDriverFormValues>({
    resolver: zodResolver(NewDriverFormSchema),
    mode: 'onChange',
    defaultValues: {
      driverName: '',
      email: '',
      phone: '',
      type: DRIVER_TYPE.INTERNAL,
      haulier: '',
      haulierEmail: '',
      haulierPhone: '',
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
        haulier: driverData.haulierName || '',
        haulierEmail: driverData.haulierEmailAddress || '',
        haulierPhone: driverData.haulierPhoneNumber || '',
        driverLicenseNumber: driverData.licenseNumber || '',
        assignedTrucks: [],
      });
    }
  }, [isEditing, driverData, driverForm]);

  const selectedType = driverForm.watch('type');
  const selectedHaulier = driverForm.watch('haulier');
  const isInternal = selectedType === DRIVER_TYPE.INTERNAL;
  const hasHaulier = Boolean(selectedHaulier);

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(driverForm.formState.isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverForm.formState.isDirty]);

  // Clear haulier fields when switching to internal
  React.useEffect(() => {
    if (isInternal) {
      driverForm.setValue('haulier', '');
      driverForm.setValue('haulierEmail', '');
      driverForm.setValue('haulierPhone', '');
    }
  }, [isInternal, driverForm]);

  // Auto-fill haulier email/phone when haulier is selected
  React.useEffect(() => {
    const subscription = driverForm.watch((value, { name }) => {
      if (name === 'haulier' && value.haulier) {
        const match = haulierItems.find((h) => h.label === value.haulier);
        if (match) {
          driverForm.setValue('haulierEmail', match.fields.email);
          driverForm.setValue('haulierPhone', match.fields.phone);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [driverForm]);

  async function onSubmit(values: NewDriverFormValues) {
    try {
      setIsSubmitting(true);

      const payload = {
        driverName: values.driverName,
        driverType: values.type,
        emailAddress: values.email,
        phoneNumber: values.phone,
        licenseNumber: values.driverLicenseNumber,
        haulierName: values.haulier,
        haulierEmailAddress: values.haulierEmail,
        haulierPhoneNumber: values.haulierPhone,
      };

      if (isEditing && id) {
        await updateDriver.mutateAsync({
          id,
          data: { ...(driverData ?? {}), ...payload },
        });
        notifySuccess('Driver Updated Successfully!');
      } else {
        await createDriver.mutateAsync(payload);
        notifySuccess('Driver Added Successfully!');
      }

      onSuccess?.();
      onSaved?.();
    } catch (error) {
      notifyError(
        extractErrorMessage(error) ||
          `Failed to ${isEditing ? 'update' : 'save'} driver. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
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
  const trucks = isEditing ? DUMMY_TRUCKS : [];
  const complianceRecords = isEditing
    ? DUMMY_COMPLIANCE.filter(
        (r) =>
          !safetySearch ||
          r.checklistId.toLowerCase().includes(safetySearch.toLowerCase()) ||
          r.notes?.toLowerCase().includes(safetySearch.toLowerCase()),
      )
    : [];

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
            isSubmitting && 'pointer-events-none',
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
                <FormLabel>Haulier*</FormLabel>
                <Input value="My Company Haulier" disabled />
                {isEditing && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Internal drivers are automatically assigned to your company
                    Haulier
                  </p>
                )}
              </FormItem>
            ) : (
              <SelectCreateEdit
                control={driverForm.control}
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

              {/* Haulier contact — shown for subcontractors */}
              {!isInternal && (
                <>
                  <FormField
                    control={driverForm.control}
                    name="haulierEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Haulier Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="driver@company.com"
                            {...field}
                            value={field.value ?? ''}
                            readOnly={hasHaulier}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={driverForm.control}
                    name="haulierPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Haulier Phone Number</FormLabel>
                        <FormControl>
                          <PhoneInput
                            defaultCountry="AU"
                            placeholder="+61 400 123 456"
                            {...field}
                            value={field.value ?? ''}
                            disabled={hasHaulier}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
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
                      className="flex items-center justify-between rounded-md border px-4 py-3"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{truck.registration}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:max-w-3xl mt-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Create By:</p>
                <p className="text-sm text-muted-foreground">
                  {driverData.createdBy || 'Armin Menhaji'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Last Modified By:</p>
                <p className="text-sm text-muted-foreground">
                  {driverData.lastModifiedBy || 'Armin Menhaji'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Create Date:</p>
                <p className="text-sm text-muted-foreground">
                  {driverData.createdAt || '10/02/25'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Modified Date:</p>
                <p className="text-sm text-muted-foreground">
                  {driverData.updatedAt || '10/02/25'}
                </p>
              </div>
            </div>
          )}

          {/* Safety & Compliance — edit mode only */}
          {isEditing && (
            <div className="flex flex-col mt-2">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 border rounded-md py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setSafetyOpen((prev) => !prev)}
              >
                {safetyOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Safety &amp; Compliance
              </button>

              {safetyOpen && (
                <div className="flex flex-col gap-4 mt-4">
                  <h2 className="text-lg font-bold">Safety &amp; Compliance</h2>

                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <Input
                      className="pl-9"
                      placeholder="Search by keyword..."
                      value={safetySearch}
                      onChange={(e) => setSafetySearch(e.target.value)}
                    />
                  </div>

                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40">
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Checklist ID
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Notes
                          </th>
                          <th className="px-4 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {complianceRecords.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-6 text-center text-muted-foreground"
                            >
                              No compliance records found.
                            </td>
                          </tr>
                        ) : (
                          complianceRecords.map((record) => (
                            <tr
                              key={record.id}
                              className="border-b last:border-0 hover:bg-muted/20"
                            >
                              <td className="px-4 py-3 font-medium">
                                {record.checklistId}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {record.date}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    record.status === 'PASS' &&
                                      'bg-green-100 text-green-800 border-green-300',
                                    record.status === 'FAIL' &&
                                      'bg-red-100 text-red-800 border-red-300',
                                    record.status === 'CONFIRMED' &&
                                      'bg-blue-100 text-blue-800 border-blue-300',
                                  )}
                                >
                                  {record.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {record.notes || '—'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle cx="5" cy="12" r="1.5" />
                                    <circle cx="12" cy="12" r="1.5" />
                                    <circle cx="19" cy="12" r="1.5" />
                                  </svg>
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2 mb-6">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              form="driver-form"
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
