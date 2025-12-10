'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type React from 'react';
import { type FormEvent, useEffect, useState } from 'react';
import { type ZodError, z } from 'zod';
import { formatAddressFromComponents } from '.';
import { FormMessages } from '../form-messages';
import { Loader2 } from 'lucide-react';
import { AddressType } from '@/lib/types/address';

interface AddressDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  address: AddressType;
  setAddress: (address: AddressType) => void;
  adrAddress: string;
  dialogTitle: string;
  isLoading: boolean;
  onChange?: (value: string) => void;
}

interface AddressFields {
  streetDetailsPrimary?: string;
  streetDetailsOptional?: string;
  city?: string;
  state?: string;
  postcode?: string;
}

/**
 * Create a Zod schema for validating address fields.
 * Note that, different address vary from place to place.
 * This Schema makes sure that the required fields are filled.
 */
export function createAddressSchema(address: AddressFields) {
  let schema = {};

  if (address.streetDetailsPrimary !== '') {
    schema = {
      ...schema,
      streetDetailsPrimary: z
        .string()
        .min(1, {
          message: 'Address line 1 is required',
        })
        .max(100, 'Address line 1 must be less than 100 characters')
        .regex(/^[a-zA-Z0-9\s,.&-]+$/, 'Address contains invalid characters'),
    };
  }

  schema = {
    ...schema,
    streetDetailsOptional: z.string().optional(),
  };

  if (address.city !== '') {
    schema = {
      ...schema,
      city: z.string().min(1, {
        message: 'City is required',
      }),
    };
  }

  if (address.state !== '') {
    schema = {
      ...schema,
      state: z.string().min(1, {
        message: 'State is required',
      }),
    };
  }

  if (address.postcode !== '') {
    schema = {
      ...schema,
      postcode: z
        .string()
        .min(1, {
          message: 'Postal code is required',
        })
        .regex(/^\d{4}$/, 'Invalid postal code'),
    };
  }

  return z.object(schema);
}

export default function AddressDialog(
  props: React.PropsWithChildren<AddressDialogProps>
) {
  const {
    children,
    dialogTitle,
    open,
    setOpen,
    address,
    setAddress,
    adrAddress,
    isLoading,
    onChange,
  } = props;

  const [streetDetailsPrimary, setStreetDetailsPrimary] = useState('');
  const [streetDetailsOptional, setStreetDetailsOptional] = useState('');
  const [city, setCity] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [postcode, setPostcode] = useState('');
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  const addressSchema = createAddressSchema({
    streetDetailsPrimary: address.streetDetailsPrimary,
    streetDetailsOptional: address.streetDetailsOptional,
    city: address.city,
    state: address.state,
    postcode: address.postcode,
  });

  /**
   * Update and format the address string with the given components
   */
  function updateAndFormatAddress(
    addressString: string,
    addressComponents: {
      'street-address': string;
      address2: string;
      locality: string;
      region: string;
      'postal-code': string;
    }
  ) {
    // If no adrAddress (manual entry), use the formatAddressFromComponents function
    if (!addressString || addressString.trim() === '') {
      return formatAddressFromComponents({
        id: address.id || 0,
        googlePlaceId: address.googlePlaceId || '',
        streetDetailsPrimary: addressComponents['street-address'],
        streetDetailsOptional: addressComponents.address2,
        city: addressComponents.locality,
        state: addressComponents.region,
        postcode: addressComponents['postal-code'],
        country: address.country || 'Australia',
        formattedAddress: '',
        latitude: address.latitude || 0,
        longitude: address.longitude || 0,
        suburb: address.suburb || '',
        version: address.version || 0,
      });
    }

    let updatedAddressString = addressString;

    // Replace each class content with its corresponding value
    Object.entries(addressComponents).forEach(([key, value]) => {
      if (key !== 'address2') {
        const regex = new RegExp(`(<span class="${key}">)[^<]*(</span>)`, 'g');
        updatedAddressString = updatedAddressString.replace(
          regex,
          `$1${value}$2`
        );
      }
    });

    // Remove all span tags
    updatedAddressString = updatedAddressString.replace(/<\/?span[^>]*>/g, '');

    // Add address2 just after address1 if provided
    if (addressComponents.address2) {
      const address1Regex = new RegExp(
        `${addressComponents['street-address']}`
      );
      updatedAddressString = updatedAddressString.replace(
        address1Regex,
        `${addressComponents['street-address']}, ${addressComponents.address2}`
      );
    }

    // Clean up any extra spaces or commas
    updatedAddressString = updatedAddressString
      .replace(/,\s*,/g, ',')
      .trim()
      .replace(/\s\s+/g, ' ')
      .replace(/,\s*$/, '');

    return updatedAddressString;
  }

  /**
   * Handle form submission and save the address
   */
  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addressSchema.parse({
        streetDetailsPrimary,
        streetDetailsOptional,
        city,
        state: stateValue,
        postcode,
      });
    } catch (error) {
      const zodError = error as ZodError;
      const errorMap = zodError.flatten().fieldErrors;

      setErrorMap({
        streetDetailsPrimary: errorMap.streetDetailsPrimary?.[0] ?? '',
        streetDetailsOptional: errorMap.streetDetailsOptional?.[0] ?? '',
        city: errorMap.city?.[0] ?? '',
        state: errorMap.state?.[0] ?? '',
        postcode: errorMap.postcode?.[0] ?? '',
      });

      return;
    }

    if (
      streetDetailsOptional !== address.streetDetailsOptional ||
      postcode !== address.postcode ||
      streetDetailsPrimary !== address.streetDetailsPrimary ||
      city !== address.city ||
      stateValue !== address.state
    ) {
      const newFormattedAddress = updateAndFormatAddress(adrAddress, {
        'street-address': streetDetailsPrimary,
        address2: streetDetailsOptional,
        locality: city,
        region: stateValue,
        'postal-code': postcode,
      });

      setAddress({
        ...address,
        city,
        state: stateValue,
        streetDetailsOptional,
        streetDetailsPrimary,
        postcode,
        formattedAddress: newFormattedAddress,
      });
      // Notify react-hook-form of the change
      if (onChange) {
        onChange(newFormattedAddress);
      }
    }
    setOpen(false);
  };

  useEffect(() => {
    setStreetDetailsPrimary(address.streetDetailsPrimary);
    setStreetDetailsOptional(address.streetDetailsOptional || '');
    setPostcode(address.postcode);
    setCity(address.city);
    setStateValue(address.state);

    if (!open) {
      setErrorMap({});
    }
  }, [address, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Review and edit the address details below. You can modify any field
            as needed.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="h-52 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="address1">Address line 1</Label>
                <Input
                  value={streetDetailsPrimary}
                  onChange={(e) =>
                    setStreetDetailsPrimary(e.currentTarget.value)
                  }
                  disabled={isLoading}
                  id="address1"
                  name="address1"
                  placeholder="Address line 1"
                />
                {errorMap.streetDetailsPrimary && (
                  <FormMessages
                    type="error"
                    className="pt-1 text-sm"
                    messages={[errorMap.streetDetailsPrimary]}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="address2">
                  Address line 2{' '}
                  <span className="text-xs text-secondary-foreground">
                    (Optional)
                  </span>
                </Label>
                <Input
                  value={streetDetailsOptional}
                  onChange={(e) => setStreetDetailsOptional(e.currentTarget.value)}
                  disabled={isLoading}
                  id="address2"
                  name="address2"
                  placeholder="Address line 2"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.currentTarget.value)}
                    disabled={isLoading}
                    id="city"
                    name="city"
                    placeholder="City"
                  />
                  {errorMap.city && (
                    <FormMessages
                      type="error"
                      className="pt-1 text-sm"
                      messages={[errorMap.city]}
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="region">State / Province / Region</Label>
                  <Input
                    value={stateValue}
                    onChange={(e) => setStateValue(e.currentTarget.value)}
                    disabled={isLoading}
                    id="region"
                    name="region"
                    placeholder="Region"
                  />
                  {errorMap.state && (
                    <FormMessages
                      type="error"
                      className="pt-1 text-sm"
                      messages={[errorMap.state]}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    value={postcode}
                    onChange={(e) => setPostcode(e.currentTarget.value)}
                    disabled={isLoading}
                    id="postalCode"
                    name="postalCode"
                    placeholder="Postal Code"
                  />
                  {errorMap.postcode && (
                    <FormMessages
                      type="error"
                      className="pt-1 text-sm"
                      messages={[errorMap.postcode]}
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    value={address?.country || 'Australia'}
                    onChange={(e) =>
                      setAddress({ ...address, country: e.currentTarget.value })
                    }
                    id="country"
                    disabled
                    name="country"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="reset"
                onClick={() => setOpen(false)}
                variant={'outline'}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
