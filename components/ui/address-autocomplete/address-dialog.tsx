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
import { CountrySelect } from '../country-select';
import { StateSelect } from '../state-select';
import { Country } from 'country-state-city';

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
  address1?: string;
  address2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
}

/**
 * Create a Zod schema for validating address fields.
 */
export function createAddressSchema(address: AddressFields) {
  let schema = {};

  if (address.address1 !== '') {
    schema = {
      ...schema,
      address1: z
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
    address2: z.string().optional(),
  };

  if (address.city !== '') {
    schema = {
      ...schema,
      city: z.string().min(1, {
        message: 'City is required',
      }),
    };
  }

  if (address.region !== '') {
    schema = {
      ...schema,
      region: z.string().min(1, {
        message: 'State is required',
      }),
    };
  }

  if (address.postalCode !== '') {
    schema = {
      ...schema,
      postalCode: z
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

  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostcode] = useState('');
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  const addressSchema = createAddressSchema({
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    region: address.region,
    postalCode: address.postalCode,
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
        address1: addressComponents['street-address'],
        address2: addressComponents.address2,
        city: addressComponents.locality,
        region: addressComponents.region,
        postalCode: addressComponents['postal-code'],
        country: address.country || 'Australia',
        formattedAddress: '',
        lat: address.lat || 0,
        lng: address.lng || 0,
        googlePlaceId: address.googlePlaceId || '',
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
        address1,
        address2,
        city,
        region,
        postalCode,
      });
    } catch (error) {
      const zodError = error as ZodError;
      const errorMap = zodError.flatten().fieldErrors;

      setErrorMap({
        address1: errorMap.address1?.[0] ?? '',
        address2: errorMap.address2?.[0] ?? '',
        city: errorMap.city?.[0] ?? '',
        region: errorMap.region?.[0] ?? '',
        postalCode: errorMap.postalCode?.[0] ?? '',
      });

      return;
    }

    if (
      address2 !== address.address2 ||
      postalCode !== address.postalCode ||
      address1 !== address.address1 ||
      city !== address.city ||
      region !== address.region ||
      country !== address.country
    ) {
      const newFormattedAddress = updateAndFormatAddress(adrAddress, {
        'street-address': address1,
        address2,
        locality: city,
        region,
        'postal-code': postalCode,
      });

      setAddress({
        ...address,
        city,
        region,
        address2,
        address1,
        postalCode,
        country,
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
    setAddress1(address.address1);
    setAddress2(address.address2 || '');
    setPostcode(address.postalCode);
    setCity(address.city);
    setRegion(address.region);
    setCountry(address.country || 'Australia');

    // Get country code from country name
    const countryData = Country.getAllCountries().find(
      (c) => c.name.toLowerCase() === (address.country || 'Australia').toLowerCase()
    );
    setCountryCode(countryData?.isoCode || 'AU');

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
                  value={address1}
                  onChange={(e) => setAddress1(e.currentTarget.value)}
                  disabled={isLoading}
                  id="address1"
                  name="address1"
                  placeholder="Address line 1"
                />
                {errorMap.address1 && (
                  <FormMessages
                    type="error"
                    className="pt-1 text-sm"
                    messages={[errorMap.address1]}
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
                  value={address2}
                  onChange={(e) => setAddress2(e.currentTarget.value)}
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
                  <StateSelect
                    value={region}
                    onChange={(stateName) => setRegion(stateName)}
                    countryCode={countryCode}
                    disabled={isLoading}
                    placeholder="Select state/region"
                  />
                  {errorMap.region && (
                    <FormMessages
                      type="error"
                      className="pt-1 text-sm"
                      messages={[errorMap.region]}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostcode(e.currentTarget.value)}
                    disabled={isLoading}
                    id="postalCode"
                    name="postalCode"
                    placeholder="Postal Code"
                  />
                  {errorMap.postalCode && (
                    <FormMessages
                      type="error"
                      className="pt-1 text-sm"
                      messages={[errorMap.postalCode]}
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor="country">Country</Label>
                  <CountrySelect
                    value={country}
                    onChange={(countryName, newCountryCode) => {
                      setCountry(countryName);
                      setCountryCode(newCountryCode);
                      // Clear region when country changes
                      setRegion('');
                    }}
                    disabled={isLoading}
                    placeholder="Select country"
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
