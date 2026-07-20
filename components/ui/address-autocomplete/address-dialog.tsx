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
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type ZodError, z } from 'zod';
import { formatAddressFromComponents } from '.';
import { FormMessages } from '../form-messages';
import { Loader2 } from 'lucide-react';
import { AddressType } from '@/lib/types/address';
import { CountrySelect } from '../country-select';
import { StateSelect } from '../state-select';
import { Country } from 'country-state-city';
import EmbeddedMapPicker from './embedded-map-picker';
import {
  reverseGeocode,
  forwardGeocode,
  normalizeAddressFromMapSelection,
} from '@/lib/utils/geocoding';

interface AddressDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  address: AddressType;
  setAddress: (address: AddressType) => void;
  adrAddress: string;
  dialogTitle: string;
  isLoading: boolean;
  onChange?: (value: string) => void;
  /** Whether this is a collection address (green marker) vs delivery/billing (red marker) */
  isCollection?: boolean;
}

/**
 * Address Line 1 is optional — if blank it will be filled with the lat/lng
 * coordinate string before saving. Suburb (city), postal code, and country
 * are always required so that incomplete reverse-geocode results are caught.
 */
export function createAddressSchema() {
  return z.object({
    address1: z
      .string()
      .max(100, 'Address line 1 must be less than 100 characters')
      .regex(/^[a-zA-Z0-9\s,.&/()-]*$/, 'Address contains invalid characters')
      .optional(),
    address2: z.string().optional(),
    city: z.string().min(1, { message: 'Suburb is required' }),
    region: z.string().optional(),
    postalCode: z
      .string()
      .min(1, { message: 'Postal code is required' })
      .regex(/^[a-zA-Z0-9\s-]{1,12}$/, 'Invalid postal code format'),
    country: z.string().min(1, { message: 'Country is required' }),
  });
}

// Debounce delay for form → map geocoding
const FORWARD_GEOCODE_DEBOUNCE_MS = 700;
// Window to ignore form changes after map update
const MAP_UPDATE_IGNORE_WINDOW_MS = 800;

export default function AddressDialog(
  props: React.PropsWithChildren<AddressDialogProps>,
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
    isCollection = false,
  } = props;

  // Single draft state for all address fields
  const [draftAddress, setDraftAddress] = useState<AddressType>(() => ({
    ...address,
  }));

  // adrAddressDraft: tracks the HTML template from Places API
  // Cleared when user edits form or picks on map (so formattedAddress uses components)
  const [adrAddressDraft, setAdrAddressDraft] = useState(adrAddress);

  // Country code for state selector
  const [countryCode, setCountryCode] = useState('AU');

  // Validation errors
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  // Map sync state
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isForwardGeocoding, setIsForwardGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  // Refs for preventing sync loops
  const lastUpdateSourceRef = useRef<{ source: 'map' | 'form'; time: number }>({
    source: 'form',
    time: 0,
  });
  const forwardGeocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const forwardGeocodeRequestIdRef = useRef(0);

  // Initialize draft state when dialog opens
  useEffect(() => {
    if (open) {
      setDraftAddress({ ...address });
      setAdrAddressDraft(adrAddress);
      setErrorMap({});
      setHasAttemptedSave(false);
      setGeocodeError(null);

      // Get country code from country name
      const countryData = Country.getAllCountries().find(
        (c) =>
          c.name.toLowerCase() ===
          (address.country || 'Australia').toLowerCase(),
      );
      setCountryCode(countryData?.isoCode || 'AU');
    }
  }, [open, address, adrAddress]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (forwardGeocodeTimeoutRef.current) {
        clearTimeout(forwardGeocodeTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Update and format the address string with the given components
   */
  const updateAndFormatAddress = useCallback(
    (addressString: string, draft: AddressType): string => {
      const addressComponents = {
        'street-address': draft.address1,
        address2: draft.address2,
        locality: draft.city,
        region: draft.region,
        'postal-code': draft.postalCode,
      };

      // If no adrAddress (manual entry or map pick), use formatAddressFromComponents
      if (!addressString || addressString.trim() === '') {
        return formatAddressFromComponents({
          address1: draft.address1,
          address2: draft.address2,
          city: draft.city,
          region: draft.region,
          postalCode: draft.postalCode,
          country: draft.country || 'Australia',
          formattedAddress: '',
          lat: draft.lat || 0,
          lng: draft.lng || 0,
          googlePlaceId: draft.googlePlaceId || '',
        });
      }

      let updatedAddressString = addressString;

      // Replace each class content with its corresponding value
      Object.entries(addressComponents).forEach(([key, value]) => {
        if (key !== 'address2') {
          const regex = new RegExp(
            `(<span class="${key}">)[^<]*(</span>)`,
            'g',
          );
          updatedAddressString = updatedAddressString.replace(
            regex,
            `$1${value}$2`,
          );
        }
      });

      // Remove all span tags
      updatedAddressString = updatedAddressString.replace(
        /<\/?span[^>]*>/g,
        '',
      );

      // Add address2 just after address1 if provided
      if (addressComponents.address2) {
        const address1Regex = new RegExp(
          `${addressComponents['street-address']}`,
        );
        updatedAddressString = updatedAddressString.replace(
          address1Regex,
          `${addressComponents['street-address']}, ${addressComponents.address2}`,
        );
      }

      // Clean up any extra spaces or commas
      updatedAddressString = updatedAddressString
        .replace(/,\s*,/g, ',')
        .trim()
        .replace(/\s\s+/g, ' ')
        .replace(/,\s*$/, '');

      return updatedAddressString;
    },
    [],
  );

  /**
   * Update a single draft field
   */
  const updateDraftField = useCallback(
    (field: keyof AddressType, value: string | number) => {
      setDraftAddress((prev) => ({ ...prev, [field]: value }));
      // Clear adrAddressDraft since user is manually editing
      setAdrAddressDraft('');
      // Mark update source as form
      lastUpdateSourceRef.current = { source: 'form', time: Date.now() };
      setGeocodeError(null);
    },
    [],
  );

  /**
   * Handle country change (also updates countryCode and clears region)
   */
  const handleCountryChange = useCallback(
    (countryName: string, newCountryCode: string) => {
      setDraftAddress((prev) => ({
        ...prev,
        country: countryName,
        region: '', // Clear region when country changes
      }));
      setCountryCode(newCountryCode);
      setAdrAddressDraft('');
      lastUpdateSourceRef.current = { source: 'form', time: Date.now() };
      setGeocodeError(null);
    },
    [],
  );

  /**
   * Handle manual lat/lng input changes.
   * Updates draft and triggers reverse geocode to sync address fields + map marker.
   */
  const handleLatLngChange = useCallback(
    (field: 'lat' | 'lng', value: string) => {
      const num = Number.parseFloat(value);
      if (value === '' || value === '-') {
        // Allow typing negative numbers or clearing
        setDraftAddress((prev) => ({
          ...prev,
          [field]: value as unknown as number,
        }));
        return;
      }
      if (Number.isNaN(num)) return;
      setDraftAddress((prev) => ({ ...prev, [field]: num }));
    },
    [],
  );

  /**
   * Handle map location change (map → form sync)
   *
   * IMPORTANT: Map selection is AUTHORITATIVE. When user pins a location,
   * ALL address fields are replaced with geocode results. Fields not returned
   * by geocode are explicitly cleared (not merged with previous values).
   * This prevents stale data from showing when pinning remote locations.
   */
  const handleMapLocationChange = useCallback(
    async (lat: number, lng: number) => {
      // Update lat/lng immediately (user feedback)
      setDraftAddress((prev) => ({ ...prev, lat, lng }));
      // Clear adrAddressDraft since map selection invalidates Places HTML template
      setAdrAddressDraft('');
      // Mark update source as map (prevents form→map loop)
      lastUpdateSourceRef.current = { source: 'map', time: Date.now() };
      setGeocodeError(null);

      // Reverse geocode to get address components
      setIsReverseGeocoding(true);
      try {
        const result = await reverseGeocode(lat, lng);

        // Use the normalizer to create a complete address
        // This REPLACES all fields, clearing those not in the geocode result
        const normalizedAddress = normalizeAddressFromMapSelection(
          result,
          lat,
          lng,
          {
            // Optionally preserve country if geocode returns none
            // (useful for pins in remote areas where only coords are known)
            preserveCountryIfMissing: false,
          },
        );

        setDraftAddress(normalizedAddress);

        // Update country code for state selector
        if (normalizedAddress.country) {
          const countryData = Country.getAllCountries().find(
            (c) =>
              c.name.toLowerCase() === normalizedAddress.country.toLowerCase(),
          );
          if (countryData) {
            setCountryCode(countryData.isoCode);
          }
        } else {
          // Clear country code if no country was found
          setCountryCode('');
        }

        // Show warning if geocode returned minimal info
        if (!result.success && result.error) {
          setGeocodeError(result.error);
        } else if (!normalizedAddress.address1 && !normalizedAddress.city) {
          setGeocodeError('Limited address info available for this location');
        }
      } catch (err) {
        console.error('Reverse geocode error:', err);
        // On error, still update lat/lng but clear all other fields
        setDraftAddress({
          address1: '',
          address2: '',
          city: '',
          region: '',
          postalCode: '',
          country: '',
          formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          googlePlaceId: '',
          lat,
          lng,
          locationSource: 'MAP_PIN',
        });
        setGeocodeError("Couldn't find address for this location");
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [],
  );

  /**
   * Trigger forward geocode (form → map) with debounce
   */
  useEffect(() => {
    // Skip if not open or loading
    if (!open || isLoading || isReverseGeocoding) return;

    // Skip if last update was from map within ignore window
    const timeSinceMapUpdate = Date.now() - lastUpdateSourceRef.current.time;
    if (
      lastUpdateSourceRef.current.source === 'map' &&
      timeSinceMapUpdate < MAP_UPDATE_IGNORE_WINDOW_MS
    ) {
      return;
    }

    // Clear previous timeout
    if (forwardGeocodeTimeoutRef.current) {
      clearTimeout(forwardGeocodeTimeoutRef.current);
    }

    // Check if we have enough data to geocode
    const hasCountry = !!draftAddress.country?.trim();
    const hasLocation = !!(
      draftAddress.city?.trim() || draftAddress.address1?.trim()
    );
    const hasAddress1 = !!draftAddress.address1?.trim();
    const hasPostalCode = !!draftAddress.postalCode?.trim();

    if (!hasCountry || !hasLocation || !hasAddress1 || !hasPostalCode) {
      return;
    }

    // Debounced forward geocode
    forwardGeocodeTimeoutRef.current = setTimeout(async () => {
      const requestId = ++forwardGeocodeRequestIdRef.current;
      setIsForwardGeocoding(true);

      try {
        const result = await forwardGeocode({
          address1: draftAddress.address1,
          city: draftAddress.city,
          region: draftAddress.region,
          postalCode: draftAddress.postalCode,
          country: draftAddress.country,
        });

        // Ignore stale responses
        if (requestId !== forwardGeocodeRequestIdRef.current) return;

        if (result.success) {
          setDraftAddress((prev) => ({
            ...prev,
            lat: result.lat,
            lng: result.lng,
          }));
          setGeocodeError(null);
        }
        // Don't show error for forward geocode - it's best-effort
      } catch (err) {
        console.error('Forward geocode error:', err);
      } finally {
        if (requestId === forwardGeocodeRequestIdRef.current) {
          setIsForwardGeocoding(false);
        }
      }
    }, FORWARD_GEOCODE_DEBOUNCE_MS);

    return () => {
      if (forwardGeocodeTimeoutRef.current) {
        clearTimeout(forwardGeocodeTimeoutRef.current);
      }
    };
  }, [
    open,
    isLoading,
    isReverseGeocoding,
    draftAddress.address1,
    draftAddress.city,
    draftAddress.region,
    draftAddress.postalCode,
    draftAddress.country,
  ]);

  /**
   * Handle form submission and save the address
   */
  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHasAttemptedSave(true);
    setErrorMap({});

    // If address1 is blank, fall back to the coordinate string
    const lat =
      typeof draftAddress.lat === 'number'
        ? draftAddress.lat
        : Number.parseFloat(String(draftAddress.lat));
    const lng =
      typeof draftAddress.lng === 'number'
        ? draftAddress.lng
        : Number.parseFloat(String(draftAddress.lng));
    const coordFallback =
      !Number.isNaN(lat) && !Number.isNaN(lng)
        ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        : '';
    const finalDraft = {
      ...draftAddress,
      address1: draftAddress.address1?.trim() || coordFallback,
    };

    try {
      createAddressSchema().parse({
        address1: finalDraft.address1,
        address2: finalDraft.address2,
        city: finalDraft.city,
        region: finalDraft.region,
        postalCode: finalDraft.postalCode,
        country: finalDraft.country,
      });
    } catch (error) {
      const zodError = error as ZodError;
      const errors = zodError.flatten().fieldErrors;

      setErrorMap({
        address1: errors.address1?.[0] ?? '',
        address2: errors.address2?.[0] ?? '',
        city: errors.city?.[0] ?? '',
        region: errors.region?.[0] ?? '',
        postalCode: errors.postalCode?.[0] ?? '',
        country: errors.country?.[0] ?? '',
      });

      return;
    }

    if (
      finalDraft.address1 !== address.address1 ||
      finalDraft.address2 !== address.address2 ||
      finalDraft.city !== address.city ||
      finalDraft.region !== address.region ||
      finalDraft.postalCode !== address.postalCode ||
      finalDraft.country !== address.country
    ) {
      const newFormattedAddress = updateAndFormatAddress(
        adrAddressDraft,
        finalDraft,
      );

      const saved = { ...finalDraft, formattedAddress: newFormattedAddress };
      setAddress({
        ...saved,
        city: saved.city?.trim() ?? '',
        region: saved.region?.trim() ?? '',
        postalCode: saved.postalCode?.trim() ?? '',
        country: saved.country?.trim() ?? '',
      });
      if (onChange) {
        onChange(newFormattedAddress);
      }
    }
    setOpen(false);
  };

  const isMapDisabled = isLoading || isReverseGeocoding;
  const validationResult = createAddressSchema().safeParse({
    address1: draftAddress.address1,
    address2: draftAddress.address2,
    city: draftAddress.city,
    region: draftAddress.region,
    postalCode: draftAddress.postalCode,
    country: draftAddress.country,
  });
  const isFormValid = validationResult.success;
  const validationSummaryMessage = validationResult.success
    ? ''
    : 'Some required fields are invalid or missing.';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Review and edit the address details below. Click on the map to set
            or adjust the location.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            className="flex-1 min-h-0 flex flex-col"
          >
            {/* -mx-6 puts the scrollbar on the dialog border; px-6 keeps
                the fields aligned with the header. */}
            <div className="flex-1 min-h-0 overflow-y-auto -mx-6 px-6">
              {/* Form Fields */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="address1">Address line 1</Label>
                  <Input
                    value={draftAddress.address1}
                    onChange={(e) =>
                      updateDraftField('address1', e.currentTarget.value)
                    }
                    disabled={isLoading}
                    id="address1"
                    name="address1"
                    placeholder="Address line 1"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="address2">Address line 2</Label>
                  <Input
                    value={draftAddress.address2}
                    onChange={(e) =>
                      updateDraftField('address2', e.currentTarget.value)
                    }
                    disabled={isLoading}
                    id="address2"
                    name="address2"
                    placeholder="Address line 2"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <Label htmlFor="city">City*</Label>
                    <Input
                      value={draftAddress.city}
                      onChange={(e) =>
                        updateDraftField('city', e.currentTarget.value)
                      }
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
                    <Label htmlFor="region">State / Province / Region*</Label>
                    <StateSelect
                      value={draftAddress.region}
                      onChange={(stateName) =>
                        updateDraftField('region', stateName)
                      }
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
                    <Label htmlFor="postalCode">Postal Code*</Label>
                    <Input
                      value={draftAddress.postalCode}
                      onChange={(e) =>
                        updateDraftField('postalCode', e.currentTarget.value)
                      }
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
                    <Label htmlFor="country">Country*</Label>
                    <CountrySelect
                      value={draftAddress.country}
                      onChange={handleCountryChange}
                      disabled={isLoading}
                      placeholder="Select country"
                    />
                    {errorMap.country && (
                      <FormMessages
                        type="error"
                        className="pt-1 text-sm"
                        messages={[errorMap.country]}
                      />
                    )}
                  </div>
                </div>

                {/* Lat / Lng fields */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <Label
                      htmlFor="lat"
                      className="text-xs text-muted-foreground"
                    >
                      Lat
                    </Label>
                    <Input
                      value={draftAddress.lat}
                      onChange={(e) =>
                        handleLatLngChange('lat', e.currentTarget.value)
                      }
                      onBlur={() => {
                        // On blur, trigger reverse geocode if coordinates are valid
                        const lat =
                          typeof draftAddress.lat === 'number'
                            ? draftAddress.lat
                            : Number.parseFloat(String(draftAddress.lat));
                        const lng =
                          typeof draftAddress.lng === 'number'
                            ? draftAddress.lng
                            : Number.parseFloat(String(draftAddress.lng));
                        if (
                          !Number.isNaN(lat) &&
                          !Number.isNaN(lng) &&
                          lat !== 0 &&
                          lng !== 0
                        ) {
                          handleMapLocationChange(lat, lng);
                        }
                      }}
                      disabled={isLoading}
                      id="lat"
                      name="lat"
                      placeholder="Latitude"
                      type="text"
                      inputMode="decimal"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <Label
                      htmlFor="lng"
                      className="text-xs text-muted-foreground"
                    >
                      Long
                    </Label>
                    <Input
                      value={draftAddress.lng}
                      onChange={(e) =>
                        handleLatLngChange('lng', e.currentTarget.value)
                      }
                      onBlur={() => {
                        const lat =
                          typeof draftAddress.lat === 'number'
                            ? draftAddress.lat
                            : Number.parseFloat(String(draftAddress.lat));
                        const lng =
                          typeof draftAddress.lng === 'number'
                            ? draftAddress.lng
                            : Number.parseFloat(String(draftAddress.lng));
                        if (
                          !Number.isNaN(lat) &&
                          !Number.isNaN(lng) &&
                          lat !== 0 &&
                          lng !== 0
                        ) {
                          handleMapLocationChange(lat, lng);
                        }
                      }}
                      disabled={isLoading}
                      id="lng"
                      name="lng"
                      placeholder="Longitude"
                      type="text"
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </div>

              {/* Embedded Map Panel — at the bottom */}
              <div className="mt-4">
                <Label className="mb-2 block">Location on Map</Label>
                <EmbeddedMapPicker
                  lat={
                    typeof draftAddress.lat === 'number'
                      ? draftAddress.lat
                      : Number.parseFloat(String(draftAddress.lat)) || 0
                  }
                  lng={
                    typeof draftAddress.lng === 'number'
                      ? draftAddress.lng
                      : Number.parseFloat(String(draftAddress.lng)) || 0
                  }
                  onLocationChange={handleMapLocationChange}
                  disabled={isMapDisabled}
                  markerColor={isCollection ? 'green' : 'red'}
                />
                {isReverseGeocoding && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Loader2 className="size-3 animate-spin" />
                    Getting address...
                  </p>
                )}
                {isForwardGeocoding && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Loader2 className="size-3 animate-spin" />
                    Updating map...
                  </p>
                )}
                {geocodeError && (
                  <p className="text-xs text-amber-600 mt-1">{geocodeError}</p>
                )}
              </div>
            </div>
            <DialogFooter className="pt-4">
              {hasAttemptedSave && !isFormValid && (
                <div className="mr-auto text-sm text-destructive">
                  {validationSummaryMessage}
                </div>
              )}
              <Button
                type="reset"
                onClick={() => setOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isReverseGeocoding}>
                Save
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
