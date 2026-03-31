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
import { FormMultiSelect } from '@/components/ui/form-multi-select';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  NewDriverFormSchema,
  NewDriverFormValues,
} from './schemas/driver-form-schema';
import { Loader2, HelpCircle } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { notifySuccess, notifyError } from '@/lib/toast';
import { DRIVER_TYPE } from '@/lib/types/driver-enums';
import { useGetAllHauliers } from '@/lib/api/haulier';
import { useCreateDriver } from '@/lib/api/driver';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
  onCancel?: () => void;
}

const truckTypeOptions = [
  { label: 'Truck', value: 'Truck' },
  { label: 'Semi-Trailer', value: 'Semi-Trailer' },
  { label: 'Truck + Trailer', value: 'Truck + Trailer' },
  { label: 'Rigid truck', value: 'Rigid truck' },
  { label: 'B-Double', value: 'B-Double' },
  { label: 'Road train', value: 'Road train' },
  { label: 'Dog Truck', value: 'Dog Truck' },
  { label: 'Flatbed', value: 'Flatbed' },
  { label: 'Tipper', value: 'Tipper' },
  { label: 'Semi-Tipper', value: 'Semi-Tipper' },
  { label: 'Side-Tipper', value: 'Side-Tipper' },
  { label: 'Truck and Dog', value: 'Truck and Dog' },
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
  const haulierItems = hauliers.map((h) => ({
    id: String(h.id),
    label: h.haulierName,
    fields: { email: h.emailAddress, phone: h.phoneNumber },
  }));

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const createDriver = useCreateDriver();

  const driverForm = useForm<NewDriverFormValues>({
    resolver: zodResolver(NewDriverFormSchema),
    mode: 'onChange',
    defaultValues: {
      driverName: '',
      email: '',
      phone: '',
      type: DRIVER_TYPE.INTERNAL,
      haulier: '',
      driverLicenseNumber: '',
      assignedTrucks: [],
    },
  });

  const selectedType = driverForm.watch('type');
  const selectedHaulier = driverForm.watch('haulier');
  const isInternal = selectedType === DRIVER_TYPE.INTERNAL;
  const hasHaulier = Boolean(selectedHaulier);

  React.useEffect(() => {
    onDirtyChange?.(driverForm.formState.isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverForm.formState.isDirty]);

  // Clear haulier and assigned trucks when switching to internal
  React.useEffect(() => {
    if (isInternal) {
      driverForm.setValue('haulier', '');
      driverForm.setValue('assignedTrucks', []);
    }
  }, [isInternal, driverForm]);

  async function onSubmit(values: NewDriverFormValues) {
    try {
      setIsSubmitting(true);
      await createDriver.mutateAsync({
        driverName: values.driverName,
        driverType: values.type,
        emailAddress: values.email,
        phoneNumber: values.phone,
        licenseNumber: values.driverLicenseNumber,
        haulierName: values.haulier,
      });
      notifySuccess(
        isEditing
          ? 'Driver Updated Successfully!'
          : 'Driver Added Successfully!',
      );
      onSuccess?.();
      onSaved?.();
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} driver:`,
        error,
      );
      notifyError('Failed to save driver. Please try again.');
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
          id="add-new-driver-form"
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

          <Separator className="mt-0 pt-0" />

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
                <Input value="My Company Haulier" disabled />
              </FormItem>
            ) : (
              <SelectCreateEdit
                control={driverForm.control}
                name="haulier"
                label="Haulier*"
                entityName="Haulier"
                items={haulierItems}
                renderForm={(editingItem, isEditing, onSave, onCancel) => (
                  <HaulierForm
                    editingItem={editingItem}
                    isEditing={isEditing}
                    onSave={onSave}
                    onCancel={onCancel}
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
            </div>
          </div>

          {/* License & Assignment */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">License & Assignment</h2>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <FormField
                control={driverForm.control}
                name="driverLicenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver's License Number*</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormMultiSelect
                control={driverForm.control}
                name="assignedTrucks"
                label="Assigned Trucks (Optional)"
                options={hasHaulier || isInternal ? truckTypeOptions : []}
                placeholder={
                  !hasHaulier && !isInternal
                    ? 'Select Haulier first...'
                    : 'Select trucks...'
                }
                disabled={!hasHaulier && !isInternal}
                searchPlaceholder="Search trucks..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2 mb-6">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              form="add-new-driver-form"
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
                  ? 'Save Changes'
                  : 'Add Driver'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
