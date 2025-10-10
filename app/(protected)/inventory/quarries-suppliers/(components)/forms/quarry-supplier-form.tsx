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
import { AddressType } from '@/lib/types/address';
import { PhoneInput } from '@/components/ui/phone-input';
import { Spinner } from '@/components/ui/spinner';
import { useSelectedQuarrySupplier } from '@/app/stores/quarry-supplier-store';
import { normalizePhoneE164 } from '@/lib/utils/phone-format-helper';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  className?: string;
  onCancel?: () => void;
}

export default function QuarrySupplierForm({
  id,
  onCancel,
  className,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const selectedQuarrySupplier = useSelectedQuarrySupplier();

  // Initialize states with selected quarry/supplier data only when editing, defaults otherwise
  const [selectedType, setSelectedType] = React.useState<string>(
    isEditing && selectedQuarrySupplier?.type
      ? selectedQuarrySupplier.type
      : 'QUARRY'
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [address, setAddress] = React.useState<AddressType>({
    address1: '',
    address2: '',
    formattedAddress: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    lat: 0,
    lng: 0,
  });
  const [searchInput, setSearchInput] = React.useState('');

  // Helper function to convert "N/A" to empty string
  const convertNAtoEmpty = (value: string | undefined | null): string => {
    if (!value || value === 'N/A') return '';
    return value;
  };

  const quarrySupplierForm = useForm<
    z.infer<typeof QuarrySupplierFormSchema>
  >({
    resolver: zodResolver(QuarrySupplierFormSchema),
    mode: 'onChange',
    defaultValues: {
      type: isEditing && selectedQuarrySupplier?.type
        ? selectedQuarrySupplier.type
        : 'QUARRY',
      quarry_name: isEditing && selectedQuarrySupplier?.type === 'QUARRY'
        ? convertNAtoEmpty(selectedQuarrySupplier.name)
        : '',
      supplier_name: isEditing && selectedQuarrySupplier?.type === 'SUPPLIER'
        ? convertNAtoEmpty(selectedQuarrySupplier.name)
        : '',
      website: isEditing ? convertNAtoEmpty(selectedQuarrySupplier?.website) : '',
      email: isEditing ? convertNAtoEmpty(selectedQuarrySupplier?.email) : '',
      phone: isEditing ? normalizePhoneE164(selectedQuarrySupplier?.phone) : '',
      address: '', // Will be handled separately for address autocomplete
      contact_person_name: isEditing
        ? convertNAtoEmpty(selectedQuarrySupplier?.contact_person_name)
        : '',
      contact_person_phone: isEditing
        ? normalizePhoneE164(selectedQuarrySupplier?.contact_person_phone)
        : '',
      contact_person_email: isEditing
        ? convertNAtoEmpty(selectedQuarrySupplier?.contact_person_email)
        : '',
      opening_closing_times: isEditing
        ? convertNAtoEmpty(selectedQuarrySupplier?.opening_closing_times)
        : '',
      weighbridge_info: '', // Not in current Quarry type, will be added
      notes: isEditing ? convertNAtoEmpty(selectedQuarrySupplier?.notes) : '',
      created_at: undefined,
      updated_at: undefined,
      created_by: 'current_user',
      last_modified_by: 'current_user',
    },
  });

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    quarrySupplierForm.setValue('type', value as 'QUARRY' | 'SUPPLIER');
    // Clear the name fields when switching types
    if (value === 'QUARRY') {
      quarrySupplierForm.setValue('supplier_name', '');
    } else {
      quarrySupplierForm.setValue('quarry_name', '');
    }
  };

  // Effect to reset form when selected quarry/supplier changes
  React.useEffect(() => {
    if (selectedQuarrySupplier && isEditing) {
      setSelectedType(selectedQuarrySupplier.type);

      quarrySupplierForm.reset({
        type: selectedQuarrySupplier.type,
        quarry_name:
          selectedQuarrySupplier.type === 'QUARRY'
            ? convertNAtoEmpty(selectedQuarrySupplier.name)
            : '',
        supplier_name:
          selectedQuarrySupplier.type === 'SUPPLIER'
            ? convertNAtoEmpty(selectedQuarrySupplier.name)
            : '',
        website: convertNAtoEmpty(selectedQuarrySupplier.website),
        email: convertNAtoEmpty(selectedQuarrySupplier.email),
        phone: normalizePhoneE164(selectedQuarrySupplier.phone),
        address: '', // Will be handled separately
        contact_person_name: convertNAtoEmpty(selectedQuarrySupplier.contact_person_name),
        contact_person_phone: normalizePhoneE164(selectedQuarrySupplier.contact_person_phone),
        contact_person_email: convertNAtoEmpty(selectedQuarrySupplier.contact_person_email),
        opening_closing_times: convertNAtoEmpty(selectedQuarrySupplier.opening_closing_times),
        weighbridge_info: '', // Not in current type
        notes: convertNAtoEmpty(selectedQuarrySupplier.notes),
        created_at: selectedQuarrySupplier.created_at
          ? new Date(selectedQuarrySupplier.created_at)
          : undefined,
        updated_at: selectedQuarrySupplier.updated_at
          ? new Date(selectedQuarrySupplier.updated_at)
          : undefined,
        created_by: selectedQuarrySupplier.created_by,
        last_modified_by: selectedQuarrySupplier.last_modified_by,
      });
    }
  }, [selectedQuarrySupplier, isEditing, quarrySupplierForm]);

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

  async function onSubmit(
    values: z.infer<typeof QuarrySupplierFormSchema>
  ) {
    console.log('onSubmit function called!');
    console.log('Quarry/Supplier Form Values:', values);

    setIsSubmitting(true);

    const currentTimestamp = new Date().toISOString();
    const quarrySupplierData = {
      id: 0, // Will be generated by backend
      type: values.type,
      name: values.type === 'QUARRY' ? values.quarry_name : values.supplier_name,
      website: values.website || '',
      email: values.email || '',
      phone: values.phone || '',
      address: values.address,
      contactPersonName: values.contact_person_name || '',
      contactPersonPhone: values.contact_person_phone || '',
      contactPersonEmail: values.contact_person_email || '',
      openingClosingTimes: values.opening_closing_times || '',
      weighbridgeInfo: values.weighbridge_info || '',
      notes: values.notes || '',
      status: 'ACTIVE',
      version: 0,
      isDeleted: false,
      createdBy: 'current_user',
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      lastModifiedBy: 'current_user',
    };

    console.log('Quarry/Supplier Data:', quarrySupplierData);

    // Simulate API call delay (remove this in production)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
  }

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
              Adding {selectedType === 'QUARRY' ? 'Quarry' : 'Supplier'}...
            </p>
          </div>
        </div>
      )}

      <Form {...quarrySupplierForm}>
        <form
          id="add-quarry-supplier-form"
          className={cn(
            'gap-6 p-1 w-full',
            isEditing && isDesktop
              ? 'grid grid-cols-2 gap-x-8'
              : 'grid grid-cols-1',
            className,
            isSubmitting && 'pointer-events-none'
          )}
          onSubmit={quarrySupplierForm.handleSubmit(onSubmit)}
        >
          {/* Type Selection */}
          <FormField
            control={quarrySupplierForm.control}
            name="type"
            render={({ field }) => (
              <FormItem className="col-span-1 col-start-1">
                <FormLabel>Type*</FormLabel>
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

          {/* Section: Basic Information */}
          <div className="col-span-full mt-4">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          </div>

          {/* Quarry/Supplier Name */}
          {selectedType === 'QUARRY' ? (
            <FormField
              control={quarrySupplierForm.control}
              name="quarry_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                  }
                >
                  <FormLabel>Quarry Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter quarry name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={quarrySupplierForm.control}
              name="supplier_name"
              render={({ field }) => (
                <FormItem
                  className={
                    isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                  }
                >
                  <FormLabel>Supplier Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter supplier name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Website */}
          <FormField
            control={quarrySupplierForm.control}
            name="website"
            render={({ field }) => (
              <FormItem
                className={
                  isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
                }
              >
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
              <FormItem
                className={
                  isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                }
              >
                <FormLabel>Email</FormLabel>
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
              <FormItem
                className={
                  isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
                }
              >
                <FormLabel>Phone</FormLabel>
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

          {/* Section: Location Information */}
          <div className="col-span-full mt-4">
            <h2 className="text-lg font-semibold mb-4">Location Information</h2>
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

          {/* Section: Contact Person */}
          <div className="col-span-full mt-4">
            <h2 className="text-lg font-semibold mb-4">Contact Person</h2>
          </div>

          {/* Contact Person Name */}
          <FormField
            control={quarrySupplierForm.control}
            name="contact_person_name"
            render={({ field }) => (
              <FormItem
                className={
                  isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                }
              >
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
              <FormItem
                className={
                  isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
                }
              >
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
              <FormItem
                className={
                  isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                }
              >
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

          {/* Section: Operational Information */}
          <div className="col-span-full mt-4">
            <h2 className="text-lg font-semibold mb-4">
              Operational Information
            </h2>
          </div>

          {/* Opening & Closing Times */}
          <FormField
            control={quarrySupplierForm.control}
            name="opening_closing_times"
            render={({ field }) => (
              <FormItem
                className={
                  isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                }
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

          {/* Weightbridge Info */}
          <FormField
            control={quarrySupplierForm.control}
            name="weighbridge_info"
            render={({ field }) => (
              <FormItem
                className={
                  isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
                }
              >
                <FormLabel>Weightbridge Info</FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full min-h-[80px]"
                    placeholder="Enter weightbridge details"
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

          {/* Audit Information - Only shown when editing */}
          {isEditing && (
            <div className="col-span-full space-y-6 mt-16">
              <h2 className="text-2xl font-bold">Audit Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 gap-6 md:max-w-3xl">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Create By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedQuarrySupplier?.created_by || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Last Modified By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedQuarrySupplier?.last_modified_by || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Create Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedQuarrySupplier?.created_at
                      ? new Date(
                          selectedQuarrySupplier.created_at
                        ).toLocaleDateString('en-AU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Modified Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedQuarrySupplier?.updated_at
                      ? new Date(
                          selectedQuarrySupplier.updated_at
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
            <div className="flex justify-end space-x-2 col-span-2 mb-6 mt-6">
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                form="add-quarry-supplier-form"
                className="cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                {isEditing
                  ? 'Save Changes'
                  : `Add ${selectedType === 'QUARRY' ? 'Quarry' : 'Supplier'}`}
              </Button>
            </div>
          )}

          {!isDesktop && (
            <div className="flex flex-col col-span-2 gap-3 mb-6 mt-6">
              <Button type="submit" className="cursor-pointer">
                {isEditing
                  ? 'Save Changes'
                  : `Add ${selectedType === 'QUARRY' ? 'Quarry' : 'Supplier'}`}
              </Button>
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
