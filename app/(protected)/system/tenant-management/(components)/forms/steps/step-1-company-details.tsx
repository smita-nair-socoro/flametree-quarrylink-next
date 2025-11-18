'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ABNInput } from '@/components/ui/input-mask';
import { PhoneInput } from '@/components/ui/phone-input';
import AddressAutoComplete from '@/components/ui/address-autocomplete';
import { AddressType } from '@/lib/types/address';
import { ClientFormSchema } from '../schemas/client-form-schema';
import z from 'zod';

interface Step1CompanyDetailsProps {
  form: UseFormReturn<z.infer<typeof ClientFormSchema>>;
  address: AddressType;
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleAddressChange: (newAddress: AddressType) => void;
  onCancel?: () => void;
  onNext: () => void;
}

export default function Step1CompanyDetails({
  form,
  address,
  searchInput,
  setSearchInput,
  handleAddressChange,
  onCancel,
  onNext,
}: Step1CompanyDetailsProps) {
  const handleNextClick = async () => {
    // Validate step 1 fields
    const isValid = await form.trigger([
      'name',
      'abn',
      'contact_name',
      'email',
      'phone',
    ]);
    if (isValid) {
      onNext();
    }
  };

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name*</FormLabel>
            <FormControl>
              <Input
                className="w-full"
                placeholder="Enter Company Name"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="abn"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ABN*</FormLabel>
            <FormControl>
              <ABNInput className="w-full" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contact_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Contact Name*</FormLabel>
            <FormControl>
              <Input
                className="w-full"
                placeholder="Enter full name of main contact person"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Email*</FormLabel>
            <FormControl>
              <Input
                className="w-full"
                placeholder="contact@company.com.au"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Phone*</FormLabel>
            <FormControl>
              <PhoneInput className="w-full" defaultCountry="AU" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="billing_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Billing Address*</FormLabel>
            <FormControl>
              <AddressAutoComplete
                address={address}
                setAddress={handleAddressChange}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                dialogTitle="Search for Billing Address"
                placeholder="Search for Billing Address..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end space-x-2 mb-6">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="cursor-pointer"
          type="button"
          onClick={handleNextClick}
        >
          Next
        </Button>
      </div>
    </>
  );
}
