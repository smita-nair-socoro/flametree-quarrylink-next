'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { QuarrySupplierFormSchema } from './schemas/quarry-supplier-form-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { Address, AddressType } from '@/lib/types/address';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import { QuarrySubscriptionActions } from '@/app/(protected)/inventory/quarries-suppliers/(components)/quarry-subscription-actions';
import { useCreateQuarry, useUpdateQuarry } from '@/lib/api/quarries';
import { notifySuccess, notifyError } from '@/lib/toast';
import {
  useSelectedQuarrySupplier,
  useQuarrySupplierStore,
} from '@/app/stores/quarry-supplier-store';
import { Quarry } from '@/lib/types/quarry';
import { QuarryType } from '@/lib/types/quarry-enums';
import { formatPhoneNumber } from '@/lib/utils/phone-helper';
import {
  extractErrorMessage,
  extractErrorResponse,
} from '@/lib/utils/error-message-helper';
import { addNewRecordId } from '@/lib/utils';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
  onTypeChange?: (type: QuarryType) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function QuarrySupplierForm({
  id,
  onCancel,
  className,
  onTypeChange,
  onDirtyChange,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));

  // Initialize mutation hooks for creating and updating quarry/supplier
  const createQuarryMutation = useCreateQuarry();
  const updateQuarryMutation = useUpdateQuarry();

  // Get selected quarry/supplier from Zustand store
  const selectedQuarrySupplier = useSelectedQuarrySupplier();
  const setSelectedQuarrySupplier = useQuarrySupplierStore(
    (state) => state.setSelectedQuarrySupplier
  );

  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] =
    React.useState(false);
  const [pendingSubmission, setPendingSubmission] = React.useState<z.infer<
    typeof QuarrySupplierFormSchema
  > | null>(null);
  const [mockBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');
  const subscriptionMock = React.useMemo(
    () => ({
      billingCycle: mockBillingCycle,
      monthlyFee: 99,
      yearlyFee: 999,
      planLimit: 1,
      currentOwnedQuarries: 1,
    }),
    [mockBillingCycle]
  );

  // Initialize states with selected quarry/supplier data
  // Only use selectedQuarrySupplier data when editing
  const [selectedType, setSelectedType] = React.useState<QuarryType>(
    isEditing && selectedQuarrySupplier?.quarrySupplierType
      ? selectedQuarrySupplier.quarrySupplierType
      : QuarryType.QUARRY
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Capture the original type when editing so we can detect supplier -> quarry conversions.
  // This matters for subscription logic: converting a supplier to a quarry increases owned quarry count.
  const originalTypeRef = React.useRef<QuarryType | null>(null);
  React.useEffect(() => {
    if (!isEditing) {
      originalTypeRef.current = null;
      return;
    }

    if (
      originalTypeRef.current === null &&
      selectedQuarrySupplier?.quarrySupplierType
    ) {
      originalTypeRef.current = selectedQuarrySupplier.quarrySupplierType;
    }
  }, [isEditing, selectedQuarrySupplier?.quarrySupplierType]);

  // Address state for AddressAutoComplete (uses AddressType)
  // Initialize with backend data when editing
  const [address, setAddress] = React.useState<AddressType>(() => {
    if (isEditing && selectedQuarrySupplier?.address) {
      const backendAddress = selectedQuarrySupplier.address;
      return {
        address1: backendAddress.streetDetailsPrimary || '',
        address2: backendAddress.streetDetailsOptional || '',
        formattedAddress: backendAddress.formattedAddress || '',
        city: backendAddress.city || '',
        region: backendAddress.state || '',
        postalCode: backendAddress.postcode || '',
        country: backendAddress.country || '',
        lat: backendAddress.latitude || 0,
        lng: backendAddress.longitude || 0,
        googlePlaceId: backendAddress.googlePlaceId || '',
      };
    }
    return {
      address1: '',
      address2: '',
      formattedAddress: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
      lat: 0,
      lng: 0,
      googlePlaceId: '',
    };
  });
  const [searchInput, setSearchInput] = React.useState('');

  const quarrySupplierForm = useForm<z.infer<typeof QuarrySupplierFormSchema>>({
    resolver: zodResolver(QuarrySupplierFormSchema),
    mode: 'onChange',
    defaultValues: {
      quarry_supplier_type:
        isEditing && selectedQuarrySupplier?.quarrySupplierType
          ? selectedQuarrySupplier.quarrySupplierType
          : 'QUARRY',
      name:
        isEditing && selectedQuarrySupplier?.name
          ? selectedQuarrySupplier.name
          : '',
      website:
        isEditing && selectedQuarrySupplier?.website === 'N/A'
          ? ''
          : isEditing && selectedQuarrySupplier?.website
          ? selectedQuarrySupplier.website
          : '',
      email:
        isEditing && selectedQuarrySupplier?.email
          ? selectedQuarrySupplier.email
          : '',
      phone:
        isEditing && selectedQuarrySupplier?.phone
          ? selectedQuarrySupplier.phone
          : '',
      address:
        isEditing && selectedQuarrySupplier?.address?.formattedAddress
          ? selectedQuarrySupplier.address.formattedAddress
          : '',
      contact_person_name:
        isEditing && selectedQuarrySupplier?.contactPersonName === 'N/A'
          ? ''
          : isEditing && selectedQuarrySupplier?.contactPersonName
          ? selectedQuarrySupplier.contactPersonName
          : '',
      contact_person_phone:
        isEditing && selectedQuarrySupplier?.contactPersonPhone === 'N/A'
          ? ''
          : isEditing && selectedQuarrySupplier?.contactPersonPhone
          ? selectedQuarrySupplier.contactPersonPhone
          : '',
      contact_person_email:
        isEditing && selectedQuarrySupplier?.contactPersonEmail === 'N/A'
          ? ''
          : isEditing && selectedQuarrySupplier?.contactPersonEmail
          ? selectedQuarrySupplier.contactPersonEmail
          : '',
      opening_closing_info:
        isEditing && selectedQuarrySupplier?.openingClosingInfo === 'N/A'
          ? ''
          : isEditing && selectedQuarrySupplier?.openingClosingInfo
          ? selectedQuarrySupplier.openingClosingInfo
          : '',
      weighbridge_info:
        isEditing && selectedQuarrySupplier?.weighbridgeInfo === 'N/A'
          ? ''
          : isEditing && selectedQuarrySupplier?.weighbridgeInfo
          ? selectedQuarrySupplier.weighbridgeInfo
          : '',
      notes:
        isEditing && selectedQuarrySupplier?.notes === 'N/A'
          ? ''
          : isEditing && selectedQuarrySupplier?.notes
          ? selectedQuarrySupplier.notes
          : '',
      created_at:
        isEditing && selectedQuarrySupplier?.createdAt
          ? new Date(selectedQuarrySupplier.createdAt)
          : undefined,
      updated_at:
        isEditing && selectedQuarrySupplier?.updatedAt
          ? new Date(selectedQuarrySupplier.updatedAt)
          : undefined,
      created_by:
        isEditing && selectedQuarrySupplier?.createdBy
          ? selectedQuarrySupplier.createdBy
          : 'current_user',
      last_modified_by:
        isEditing && selectedQuarrySupplier?.lastModifiedBy
          ? selectedQuarrySupplier.lastModifiedBy
          : 'current_user',
    },
  });

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(quarrySupplierForm.formState.isDirty);
  }, [quarrySupplierForm.formState.isDirty, onDirtyChange]);

  // Clear selected quarry/supplier and reset form when creating new (not editing)
  React.useEffect(() => {
    if (!isEditing) {
      setSelectedQuarrySupplier(null);
      // Reset form to empty values
      quarrySupplierForm.reset({
        quarry_supplier_type: QuarryType.QUARRY,
        name: '',
        website: '',
        email: '',
        phone: '',
        address: '',
        contact_person_name: '',
        contact_person_phone: '',
        contact_person_email: '',
        opening_closing_info: '',
        weighbridge_info: '',
        notes: '',
        created_by: 'current_user',
        last_modified_by: 'current_user',
      });
      // Reset address state
      setAddress({
        address1: '',
        address2: '',
        formattedAddress: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        lat: 0,
        lng: 0,
        googlePlaceId: '',
      });
      // Reset search input
      setSearchInput('');
      // Reset selected type
      setSelectedType(QuarryType.QUARRY);
    }
  }, [isEditing, setSelectedQuarrySupplier, quarrySupplierForm]);

  const handleTypeChange = (value: string) => {
    const quarryType = value as QuarryType;
    setSelectedType(quarryType);
    quarrySupplierForm.setValue('quarry_supplier_type', quarryType);
    // Clear all form errors when switching types
    quarrySupplierForm.clearErrors();
    // Notify parent component of type change
    onTypeChange?.(quarryType);
  };

  // Effect to handle address changes
  React.useEffect(() => {
    if (address.formattedAddress) {
      quarrySupplierForm.setValue('address', address.formattedAddress);
      // Trigger validation when address is set
      quarrySupplierForm.trigger('address');
    }
  }, [address.formattedAddress, quarrySupplierForm]);

  const handleAddressChange = React.useCallback(
    (newAddress: AddressType) => {
      setAddress(newAddress);
      if (newAddress.formattedAddress) {
        setSearchInput('');
        // Trigger validation for the address field
        quarrySupplierForm.trigger('address');
      }
    },
    [quarrySupplierForm]
  );

  const submitQuarrySupplier = React.useCallback(
    async (values: z.infer<typeof QuarrySupplierFormSchema>) => {
      setIsSubmitting(true);

      try {
        // Check if address has changed
        const originalAddress = selectedQuarrySupplier?.address;
        const addressChanged =
          isEditing &&
          originalAddress &&
          (address.address1 !== (originalAddress.streetDetailsPrimary || '') ||
            address.address2 !==
              (originalAddress.streetDetailsOptional || '') ||
            address.city !== (originalAddress.city || '') ||
            address.region !== (originalAddress.state || '') ||
            address.postalCode !== (originalAddress.postcode || '') ||
            address.country !== (originalAddress.country || '') ||
            address.formattedAddress !==
              (originalAddress.formattedAddress || ''));

        // Build address data from current address state
        // Note: Backend does not accept address.id for updates when address is modified
        const addressData: Address = {
          // Only include id if address hasn't changed
          ...(!addressChanged &&
          isEditing &&
          selectedQuarrySupplier?.address?.id
            ? { id: selectedQuarrySupplier.address.id }
            : {}),
          ...(isEditing &&
          selectedQuarrySupplier?.address?.version !== undefined
            ? { version: selectedQuarrySupplier.address.version }
            : {}),
          googlePlaceId: address.googlePlaceId || '',
          formattedAddress: address.formattedAddress || '',
          streetDetailsPrimary: address.address1 || '',
          streetDetailsOptional: address.address2 || '',
          city: address.city || '',
          suburb: address.city || '',
          state: address.region || '',
          postcode: address.postalCode || '',
          country: address.country || '',
          latitude: address.lat || 0,
          longitude: address.lng || 0,
          version: selectedQuarrySupplier?.address?.version || 0,
        } as Address;

        const quarrySupplierData = {
          name: values.name,
          quarrySupplierType: values.quarry_supplier_type,
          email: values.email,
          phone: formatPhoneNumber(values.phone),
          isActive: true,
          openingClosingInfo: values.opening_closing_info || '',
          notes: values.notes || '',
          weighbridgeInfo: values.weighbridge_info || '',
          contactPersonName: values.contact_person_name || '',
          contactPersonPhone: formatPhoneNumber(values.contact_person_phone),
          contactPersonEmail: values.contact_person_email || '',
          ...(values.website && values.website.trim() !== ''
            ? {
                website: values.website.trim().startsWith('http')
                  ? values.website.trim()
                  : `https://${values.website.trim()}`,
              }
            : {}),
          address: addressData,
          // Only include version when editing (for optimistic locking)
          ...(isEditing && selectedQuarrySupplier?.version !== undefined
            ? { version: selectedQuarrySupplier.version }
            : {}),
          version: selectedQuarrySupplier?.version || 0,
        } as unknown as Quarry;

        if (isEditing && id) {
          // Update existing quarry/supplier

          await updateQuarryMutation.mutateAsync({
            id,
            data: quarrySupplierData,
          });

          notifySuccess(
            `${
              values.quarry_supplier_type === 'QUARRY' ? 'Quarry' : 'Supplier'
            } updated successfully!`
          );
        } else {
          // Create new quarry/supplier
          const newQuarrySupplier = await createQuarryMutation.mutateAsync(
            quarrySupplierData
          );

          // Add the new record ID to sessionStorage for highlighting
          if (newQuarrySupplier && typeof newQuarrySupplier.id === 'number') {
            addNewRecordId('quarry_suppliers_table', newQuarrySupplier.id);
          }

          notifySuccess(
            `${
              values.quarry_supplier_type === 'QUARRY' ? 'Quarry' : 'Supplier'
            } created successfully!`
          );
        }

        // Close the form dialog on success
        if (onCancel) {
          onCancel();
        }
      } catch (error) {
        console.error(
          `Error ${isEditing ? 'updating' : 'creating'} ${
            values.quarry_supplier_type === 'QUARRY' ? 'quarry' : 'supplier'
          }:`,
          error
        );
        // Extract normalized error response and message
        const err = extractErrorResponse(error);
        const extractedMessage = extractErrorMessage(error);
        const codeStr = err?.code ? String(err.code) : undefined;
        const messageFromErr = err?.message || extractedMessage;

        // Duplicate quarry/supplier name (HTTP 409)
        const duplicateNamePhrase = `Key (name)=(${values.name}) already exists`;
        const duplicateEmailPhrase = `Key (email)`;

        if (
          codeStr === '409' &&
          typeof messageFromErr === 'string' &&
          messageFromErr.includes(duplicateNamePhrase)
        ) {
          const msg = `${
            values.quarry_supplier_type === 'QUARRY' ? 'Quarry' : 'Supplier'
          } with name "${values.name}" already exists.`;
          notifyError(msg);
          quarrySupplierForm.setError('name', { type: 'manual', message: msg });
          return;
        } else if (
          codeStr == '409' &&
          typeof messageFromErr === 'string' &&
          messageFromErr.includes(duplicateEmailPhrase)
        ) {
          const msg = 'Email already exists.';
          notifyError(msg);
          quarrySupplierForm.setError('email', {
            type: 'manual',
            message: msg,
          });
          return;
        }

        // Fallback error using extracted message
        notifyError(
          messageFromErr ||
            `Failed to ${isEditing ? 'update' : 'create'} ${
              values.quarry_supplier_type === 'QUARRY' ? 'quarry' : 'supplier'
            }. Please try again.`
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      createQuarryMutation,
      updateQuarryMutation,
      quarrySupplierForm,
      onCancel,
      isEditing,
      id,
      selectedQuarrySupplier?.version,
      selectedQuarrySupplier?.address,
      address,
    ]
  );

  const willExceedQuarryLimit = React.useCallback(
    (targetType: QuarryType) => {
      if (targetType !== QuarryType.QUARRY) return false;

      const isCreatingNewQuarry = !isEditing;
      const isConvertingSupplierToQuarry =
        isEditing &&
        originalTypeRef.current === QuarryType.SUPPLIER &&
        targetType === QuarryType.QUARRY;

      if (!isCreatingNewQuarry && !isConvertingSupplierToQuarry) return false;

      return (
        subscriptionMock.currentOwnedQuarries + 1 > subscriptionMock.planLimit
      );
    },
    [isEditing, subscriptionMock]
  );

  const handleFormSubmit = React.useCallback(
    async (values: z.infer<typeof QuarrySupplierFormSchema>) => {
      if (willExceedQuarryLimit(values.quarry_supplier_type as QuarryType)) {
        setPendingSubmission(values);
        setIsSubscriptionDialogOpen(true);
        return;
      }

      await submitQuarrySupplier(values);
    },
    [willExceedQuarryLimit, submitQuarrySupplier]
  );

  const handleSubscriptionConfirm = React.useCallback(() => {
    if (!pendingSubmission) return;

    submitQuarrySupplier(pendingSubmission).finally(() => {
      setPendingSubmission(null);
    });
  }, [pendingSubmission, submitQuarrySupplier]);

  const handleSubscriptionDialogToggle = React.useCallback((open: boolean) => {
    setIsSubscriptionDialogOpen(open);
    if (!open) {
      setPendingSubmission(null);
    }
  }, []);

  const watchedQuarryName = quarrySupplierForm.watch('name');
  const locationDescriptor =
    selectedType === QuarryType.QUARRY ? 'Owned Location' : 'Supplier';

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10'
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              Adding{' '}
              {selectedType === QuarryType.QUARRY ? 'Quarry' : 'Supplier'}...
            </p>
          </div>
        </div>
      )}

      <QuarrySubscriptionActions
        open={isSubscriptionDialogOpen}
        onOpenChange={handleSubscriptionDialogToggle}
        onConfirm={handleSubscriptionConfirm}
        quarryName={watchedQuarryName || 'Mountain View Quarry'}
        locationType={locationDescriptor}
        subscriptionDetails={subscriptionMock}
      />

      <Form {...quarrySupplierForm}>
        <form
          id="add-quarry-supplier-form"
          className={cn(
            'p-1 gap-1 w-full',
            isDesktop ? 'grid grid-cols-2 gap-x-8' : 'grid grid-cols-1',
            className,
            isSubmitting && 'pointer-events-none'
          )}
          onSubmit={quarrySupplierForm.handleSubmit(handleFormSubmit)}
        >
          {/* Type Selection */}
          <FormField
            control={quarrySupplierForm.control}
            name="quarry_supplier_type"
            render={({ field }) => (
              <FormItem className="col-span-1 col-start-1">
                <FormLabel className="mb-3">Type*</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleTypeChange(value);
                    }}
                    defaultValue={field.value}
                    className="grid grid-flow-col auto-cols-max gap-4"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="QUARRY" />
                      </FormControl>
                      <FormLabel className="font-normal">Quarry</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="SUPPLIER" />
                      </FormControl>
                      <FormLabel className="font-normal">Supplier</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="col-span-full my-2 mb-5" />

          {/* Section: Basic Information */}
          <div className="col-span-full">
            <h2 className="text-lg font-semibold mb-3">Basic Information</h2>
          </div>

          {/* Basic Information Fields with reduced spacing */}
          <div
            className={
              isDesktop
                ? 'col-span-full grid grid-cols-2 gap-x-5'
                : 'col-span-full'
            }
          >
            {/* Name */}
            <FormField
              control={quarrySupplierForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedType === QuarryType.QUARRY
                      ? 'Quarry Name*'
                      : 'Supplier Name*'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder={
                        selectedType === QuarryType.QUARRY
                          ? 'Enter quarry name'
                          : 'Enter supplier name'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={quarrySupplierForm.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter website URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={quarrySupplierForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={quarrySupplierForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone*</FormLabel>
                  <FormControl>
                    <PhoneInput
                      className="w-full"
                      defaultCountry="AU"
                      placeholder="(61) 456 789"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator className="col-span-full my-2 mb-5" />
          {/* Section: Location Information */}
          <div className="col-span-full">
            <h2 className="text-lg font-semibold mb-3">Location Information</h2>
          </div>

          {/* Address */}
          <FormField
            control={quarrySupplierForm.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Address*</FormLabel>
                <FormControl>
                  <AddressAutoComplete
                    address={address}
                    setAddress={handleAddressChange}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    dialogTitle="Search for Delivery Address"
                    placeholder="Search for Delivery Address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className="col-span-full my-2 mb-5" />
          {/* Section: Contact Person */}
          <div className="col-span-full">
            <h2 className="text-lg font-semibold mb-3">Contact Person</h2>
          </div>

          {/* Contact Person Fields */}
          <div
            className={
              isDesktop
                ? 'col-span-full grid grid-cols-3 gap-4'
                : 'col-span-full'
            }
          >
            {/* Contact Person Name */}
            <FormField
              control={quarrySupplierForm.control}
              name="contact_person_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter contact person name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Person Phone */}
            <FormField
              control={quarrySupplierForm.control}
              name="contact_person_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <PhoneInput
                      className="w-full"
                      defaultCountry="AU"
                      placeholder="Enter contact phone"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Person Email */}
            <FormField
              control={quarrySupplierForm.control}
              name="contact_person_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter contact email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator className="col-span-full my-2 mb-5" />

          {/* Section: Operational Information */}
          <div className="col-span-full">
            <h2 className="text-lg font-semibold mb-3">
              Operational Information
            </h2>
          </div>

          {/* Opening & Closing Times */}
          <FormField
            control={quarrySupplierForm.control}
            name="opening_closing_info"
            render={({ field }) => (
              <FormItem
                className={isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'}
              >
                <FormLabel>Opening & Closing Times</FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full min-h-[80px]"
                    placeholder="Enter opening and closing information"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Weighbridge Info */}
          <FormField
            control={quarrySupplierForm.control}
            name="weighbridge_info"
            render={({ field }) => (
              <FormItem
                className={isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'}
              >
                <FormLabel>Weighbridge Info</FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full min-h-[80px]"
                    placeholder="Enter weighbridge details"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={quarrySupplierForm.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full min-h-[80px]"
                    placeholder="Enter important FYI notes"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className="col-span-full my-2 mb-5" />
          {/* Audit Information */}
          {isEditing && (
            <div className="col-span-full space-y-6 mt-10 mb-4">
              <h2 className="text-2xl font-bold">Audit Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 md:pl-2 gap-6 md:max-w-3xl">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Created By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedQuarrySupplier?.createdBy || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Last Modified By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedQuarrySupplier?.lastModifiedBy || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Created Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedQuarrySupplier?.createdAt
                      ? new Date(
                          selectedQuarrySupplier.createdAt
                        ).toLocaleDateString('en-AU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Modified Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedQuarrySupplier?.updatedAt
                      ? new Date(
                          selectedQuarrySupplier.updatedAt
                        ).toLocaleDateString('en-AU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          {isDesktop && (
            <div className="flex justify-end space-x-2 col-span-2 my-6">
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
              <Button
                form="add-quarry-supplier-form"
                className="cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                {isEditing
                  ? 'Save Changes'
                  : `Add ${
                      selectedType === QuarryType.QUARRY ? 'Quarry' : 'Supplier'
                    }`}
              </Button>
            </div>
          )}

          {!isDesktop && (
            <div className="flex flex-col col-span-2 gap-3 my-6">
              <Button type="submit" className="cursor-pointer">
                {isEditing
                  ? 'Save Changes'
                  : `Add ${
                      selectedType === QuarryType.QUARRY ? 'Quarry' : 'Supplier'
                    }`}
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
