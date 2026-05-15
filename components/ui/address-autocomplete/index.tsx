'use client';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { Delete, Loader2, Pencil, Pin, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AddressDialog from './address-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { AddressType } from '@/lib/types/address';
import { getRuntimeConfig } from '@/app/stores/runtimeConfigStore';
import { geocodePostalAddress, type GeocodedSuggestion } from '@/lib/utils/geocoding';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

type RHFAriaProps = {
  id?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
};

interface AddressAutoCompleteProps {
  address: AddressType;
  setAddress: (address: AddressType) => void;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
  dialogTitle: string;
  placeholder?: string;
  // React Hook Form props
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  readOnly?: boolean;
  useSuggestions?: boolean;
  pinnedAddress?: AddressType;
  isCollection?: boolean;
  // Forwarded from `FormControl` (react-hook-form + shadcn)
  rhfAriaProps?: RHFAriaProps;
  // Customer delivery address history
  historyAddresses?: SuggestedAddress[];
  // Handler to delete a delivery address from suggestions
  onDeleteHistoryAddress?: (id: string) => void;
}

interface AutocompleteSuggestion {
  placePrediction: {
    place: string;
    placeId: string;
    text: {
      text: string;
    };
  };
}

interface SuggestedAddress {
  id: string;
  formattedAddress: string;
  isPinned?: boolean;
  addressType?: AddressType;
}

const formatAddressToString = (address: AddressType | undefined): string => {
  if (!address) {
    return '';
  }

  if (address.formattedAddress?.trim()) {
    return address.formattedAddress;
  }

  const parts = [];

  if (address.address1?.trim()) {
    parts.push(address.address1.trim());
  }
  if (address.address2?.trim()) {
    parts.push(address.address2.trim());
  }

  const locationParts = [];
  if (address.city?.trim()) {
    locationParts.push(address.city.trim());
  }
  if (address.region?.trim()) {
    locationParts.push(address.region.trim());
  }
  if (address.postalCode?.trim()) {
    locationParts.push(address.postalCode.trim());
  }

  if (locationParts.length > 0) {
    parts.push(locationParts.join(' '));
  }

  if (address.country?.trim()) {
    parts.push(address.country.trim());
  }

  return parts.join(', ');
};

// Helper function to format address from components
export const formatAddressFromComponents = (address: AddressType): string => {
  const parts = [];

  // Add address1 (street address)
  if (address.address1?.trim()) {
    parts.push(address.address1.trim());
  }

  // Add address2 if present
  if (address.address2?.trim()) {
    parts.push(address.address2.trim());
  }

  // Add city, region, postal code
  const locationParts = [];
  if (address.city?.trim()) {
    locationParts.push(address.city.trim());
  }
  if (address.region?.trim()) {
    locationParts.push(address.region.trim());
  }
  if (address.postalCode?.trim()) {
    locationParts.push(address.postalCode.trim());
  }

  if (locationParts.length > 0) {
    parts.push(locationParts.join(' '));
  }

  // Add country
  if (address.country?.trim()) {
    parts.push(address.country.trim());
  }

  return parts.join(', ');
};

const trimAddressFields = (address: AddressType): AddressType => ({
  ...address,
  city: address.city?.trim() ?? '',
  region: address.region?.trim() ?? '',
  postalCode: address.postalCode?.trim() ?? '',
  country: address.country?.trim() ?? '',
});

const PO_BOX_PATTERN = /^P\.?O\.?\s*Box\b/i;

export default function AddressAutoComplete(props: AddressAutoCompleteProps) {
  const {
    address,
    setAddress,
    dialogTitle,
    searchInput,
    setSearchInput,
    placeholder,
    value,
    onChange,
    onBlur,
    readOnly,
    useSuggestions = false,
    pinnedAddress,
    isCollection = false,
    rhfAriaProps,
    historyAddresses: historyAddressesProp,
    onDeleteHistoryAddress: onDeleteHistoryAddressProp,
  } = props;

  // Also support `FormControl` passing aria props directly (via Radix Slot)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const directAria = props as any;
  const ariaInvalid: boolean | undefined =
    rhfAriaProps?.['aria-invalid'] ?? directAria['aria-invalid'];
  const ariaDescribedBy: string | undefined =
    rhfAriaProps?.['aria-describedby'] ?? directAria['aria-describedby'];
  const inputId: string | undefined = rhfAriaProps?.id ?? directAria.id;

  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [adrAddress, setAdrAddress] = useState('');
  const [detailsLoading, setDetailsLoading] = useState(false);
  // Session token for Google Places API - reuse within a session, regenerate after selection
  const sessionTokenRef = useRef<string>(uuidv4());
  // Ref to track current address to avoid stale closures
  const addressRef = useRef(address);

  // Keep addressRef in sync with address prop
  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  const historyAddresses = historyAddressesProp ?? [];

  // Sync value prop to address (only when value changes externally)
  // Note: Empty values are ignored - clearing is handled explicitly via handleReset
  useEffect(() => {
    if (!value) return;

    const currentAddress = addressRef.current;
    // Early return if already in sync to prevent unnecessary updates
    if (currentAddress.formattedAddress === value) return;

    // Update only formattedAddress, preserving other address fields
    setAddress({ ...currentAddress, formattedAddress: value });
  }, [value, setAddress]);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!selectedPlaceId) return;

      setDetailsLoading(true);

      try {
        const apiKey = getRuntimeConfig().GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error('Missing API Key');
          return;
        }

        // Include sessionToken in Place Details request for proper session billing
        const url = `https://places.googleapis.com/v1/${selectedPlaceId}?sessionToken=${sessionTokenRef.current}`;
        const response = await fetch(url, {
          headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask':
              'adrFormatAddress,shortFormattedAddress,formattedAddress,location,addressComponents',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(
            'Place details fetch failed:',
            response.status,
            response.statusText,
          );
          return;
        }

        const data = await response.json();

        // Helper function to extract data from adrFormatAddress HTML
        const dataFinderRegx = (className: string): string => {
          if (!data.adrFormatAddress) return '';
          const regx = new RegExp(`<span class="${className}">([^<]+)<\/span>`);
          const match = data.adrFormatAddress.match(regx);
          return match ? match[1] : '';
        };

        const address1 = dataFinderRegx('street-address');
        const address2 = '';
        const city = dataFinderRegx('locality');
        const region = dataFinderRegx('region');
        const postalCode = dataFinderRegx('postal-code');
        const country = dataFinderRegx('country-name');
        const lat = data.location?.latitude || 0;
        const lng = data.location?.longitude || 0;
        const formattedAddress = data.formattedAddress || '';

        const formattedData: AddressType = {
          address1,
          address2,
          formattedAddress,
          city,
          region,
          postalCode,
          country,
          lat,
          lng,
          googlePlaceId: selectedPlaceId, // Store the Google Place ID
          locationSource: 'AUTOCOMPLETE_PLACE',
        };

        // Only update if the address actually changed
        const currentAddress = addressRef.current;
        const same =
          currentAddress.googlePlaceId === formattedData.googlePlaceId &&
          currentAddress.formattedAddress === formattedData.formattedAddress &&
          currentAddress.lat === formattedData.lat &&
          currentAddress.lng === formattedData.lng;

        if (!same) {
          setAddress(trimAddressFields(formattedData));
        }
        setAdrAddress(data.adrFormatAddress || '');
        // Notify react-hook-form of the change
        if (onChange && formattedAddress) {
          onChange(formattedAddress);
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
      } finally {
        setDetailsLoading(false);
        // Generate new session token after place details are fetched (session complete)
        sessionTokenRef.current = uuidv4();
      }
    };

    fetchPlaceDetails();
  }, [selectedPlaceId, setAddress, onChange]);

  const handleManualEntry = () => {
    // Pre-populate with search input if available
    if (searchInput.trim()) {
      const updatedAddress = trimAddressFields({
        ...address,
        address1: searchInput.trim(),
        formattedAddress: searchInput.trim(),
        locationSource: 'MANUAL',
      });
      setAddress(updatedAddress);
      // Notify react-hook-form of the change when user manually enters
      if (onChange) {
        onChange(searchInput.trim());
      }
    }
    setSearchInput('');
    setIsOpen(true);
  };

  const handleReset = () => {
    setSelectedPlaceId('');
    setAdrAddress('');
    setSearchInput('');
    const resetAddress: AddressType = {
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
      locationSource: undefined,
    };
    setAddress(resetAddress);
    // Notify react-hook-form of the change
    if (onChange) {
      onChange('');
    }
  };

  const handleSelectSuggestion = (
    suggestedAddress: string,
    addressOverride?: AddressType,
  ) => {
    const baseAddress = addressOverride ?? {
      ...address,
      formattedAddress: suggestedAddress,
    };
    const nextAddress = trimAddressFields(baseAddress);
    setAddress(nextAddress);
    if (onChange) {
      onChange(suggestedAddress);
    }
    setSearchInput('');
  };

  return (
    <>
      {selectedPlaceId !== '' || address.formattedAddress ? (
        <div className="flex items-center gap-2">
          <Input
            value={address?.formattedAddress}
            readOnly
            disabled={readOnly}
            id={inputId}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
          />
          <AddressDialog
            isLoading={detailsLoading}
            dialogTitle={dialogTitle}
            adrAddress={adrAddress}
            address={address}
            setAddress={setAddress}
            open={isOpen}
            setOpen={setIsOpen}
            onChange={onChange}
            isCollection={isCollection}
          >
            <Button
              disabled={detailsLoading || readOnly}
              size="icon"
              variant="outline"
              className="shrink-0"
              title="Edit address and location"
            >
              <Pencil className="size-4" />
            </Button>
          </AddressDialog>
          <Button
            type="reset"
            onClick={handleReset}
            size="icon"
            variant="outline"
            className="shrink-0"
            disabled={readOnly}
            title="Clear address"
          >
            <Delete className="size-4" />
          </Button>
        </div>
      ) : (
        <AddressAutoCompleteInput
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          setSelectedPlaceId={setSelectedPlaceId}
          setIsOpenDialog={setIsOpen}
          placeholder={placeholder}
          onManualEntry={handleManualEntry}
          onBlur={onBlur}
          readOnly={readOnly}
          useSuggestions={useSuggestions}
          pinnedAddress={pinnedAddress}
          historyAddresses={historyAddresses}
          isCollection={isCollection}
          onSelectSuggestion={handleSelectSuggestion}
          onDeleteHistoryAddress={onDeleteHistoryAddressProp}
          ariaInvalid={ariaInvalid}
          ariaDescribedBy={ariaDescribedBy}
          inputId={inputId}
          sessionTokenRef={sessionTokenRef}
        />
      )}
    </>
  );
}

interface CommonProps {
  setSelectedPlaceId: (placeId: string) => void;
  setIsOpenDialog: (isOpen: boolean) => void;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
  placeholder?: string;
  onManualEntry: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
  useSuggestions?: boolean;
  pinnedAddress?: AddressType;
  historyAddresses?: SuggestedAddress[];
  isCollection?: boolean;
  onSelectSuggestion?: (address: string, addressOverride?: AddressType) => void;
  onDeleteHistoryAddress?: (id: string) => void;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  inputId?: string;
  sessionTokenRef: React.RefObject<string>;
}

function AddressAutoCompleteInput(props: CommonProps) {
  const {
    setSelectedPlaceId,
    setIsOpenDialog,
    searchInput,
    setSearchInput,
    placeholder,
    onManualEntry,
    onBlur,
    readOnly,
    useSuggestions = false,
    pinnedAddress,
    historyAddresses,
    isCollection = false,
    onSelectSuggestion,
    onDeleteHistoryAddress,
    ariaInvalid,
    ariaDescribedBy,
    inputId,
    sessionTokenRef,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [geocodedSuggestions, setGeocodedSuggestions] = useState<GeocodedSuggestion[]>([]);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      close();
    }
  };

  const debouncedSearchInput = useDebounce(searchInput, 500);

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmedInput = debouncedSearchInput.trim();
      if (!trimmedInput) {
        setSuggestions([]);
        setGeocodedSuggestions([]);
        return;
      }

      setAutocompleteLoading(true);

      try {
        const apiKey = getRuntimeConfig().GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error('Missing API Key');
          setSuggestions([]);
          setGeocodedSuggestions([]);
          return;
        }

        const isPOBox = PO_BOX_PATTERN.test(trimmedInput);

        // If input looks like a PO Box, skip Places API and go straight to Geocoding
        if (isPOBox) {
          setSuggestions([]);
          const geocoded = await geocodePostalAddress(trimmedInput);
          setGeocodedSuggestions(geocoded);
          return;
        }

        const url = 'https://places.googleapis.com/v1/places:autocomplete';
        // Use valid primary types from Places API (New) Table A/B
        // 'geocode' returns addresses and geographic locations
        // 'street_address' is a valid primary type for precise street addresses
        // Note: street_number, route are address component types, NOT valid for includedPrimaryTypes
        const primaryTypes = ['street_address', 'subpremise', 'premise'];

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
          },
          body: JSON.stringify({
            input: debouncedSearchInput,
            includedPrimaryTypes: primaryTypes,
            // Session token for proper billing - same token used in Place Details
            sessionToken: sessionTokenRef.current,
            // No includedRegionCodes = global search
          }),
        });

        if (!response.ok) {
          console.error(
            'Autocomplete fetch failed:',
            response.status,
            response.statusText,
          );
          const errorText = await response.text();
          console.error('Error response:', errorText);
          setSuggestions([]);
          setGeocodedSuggestions([]);
          return;
        }

        const data = await response.json();
        const placeSuggestions: AutocompleteSuggestion[] = data.suggestions || [];
        setSuggestions(placeSuggestions);

        // Fallback: if Places returned no results and input is long enough, try Geocoding API
        if (placeSuggestions.length === 0 && trimmedInput.length >= 3) {
          const geocoded = await geocodePostalAddress(trimmedInput);
          setGeocodedSuggestions(geocoded);
        } else {
          setGeocodedSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        setSuggestions([]);
        setGeocodedSuggestions([]);
      } finally {
        setAutocompleteLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchInput, sessionTokenRef]);

  const hasSearched = debouncedSearchInput.trim().length > 0;
  const hasNoResults =
    hasSearched && !autocompleteLoading && suggestions.length === 0 && geocodedSuggestions.length === 0;
  const showInitialSuggestions = useSuggestions && !hasSearched && isOpen;
  const showAutocompleteSuggestions = hasSearched && isOpen;
  const pinnedAddressFormatted = useSuggestions
    ? formatAddressToString(pinnedAddress)
    : '';

  return (
    <Command
      shouldFilter={false}
      onKeyDown={handleKeyDown}
      className="overflow-visible"
    >
      <div
        aria-invalid={ariaInvalid}
        className={cn(
          'flex h-11 md:h-9 w-full items-center rounded-md border border-input px-3 py-1 text-base shadow-xs ring-offset-background focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring md:text-sm',
          ariaInvalid
            ? 'border-destructive focus-within:border-destructive focus-within:ring-destructive/20'
            : null,
        )}
      >
        <CommandPrimitive.Input
          value={searchInput}
          onValueChange={setSearchInput}
          id={inputId}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          onBlur={() => {
            if (useSuggestions) {
              setTimeout(() => {
                close();
                if (onBlur) {
                  onBlur();
                }
              }, 200);
            } else {
              close();
              if (onBlur) {
                onBlur();
              }
            }
          }}
          onFocus={readOnly ? undefined : open}
          placeholder={placeholder || 'Enter address'}
          className="w-full outline-none"
          disabled={readOnly}
        />
      </div>
      {isOpen && (showInitialSuggestions || showAutocompleteSuggestions) && (
        <div className="relative animate-in fade-in-0 zoom-in-95 h-auto">
          <CommandList>
            <div className="absolute top-1.5 z-50 w-full">
              <CommandGroup className="relative h-auto z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md bg-background">
                {showInitialSuggestions && (
                  <>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                      Suggested {isCollection ? 'Collection' : 'Delivery'}{' '}
                      Addresses
                    </div>

                    {pinnedAddressFormatted && onSelectSuggestion && (
                      <CommandPrimitive.Item
                        value={pinnedAddressFormatted}
                        onSelect={() =>
                          onSelectSuggestion(
                            pinnedAddressFormatted,
                            pinnedAddress,
                          )
                        }
                        className="flex select-text cursor-pointer gap-2 h-max p-2 px-3 rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground items-center"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <Pin className="size-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate">
                          {pinnedAddressFormatted}
                        </span>
                      </CommandPrimitive.Item>
                    )}

                    {!isCollection &&
                      historyAddresses?.map((addr) => (
                        <CommandPrimitive.Item
                          key={addr.id}
                          value={addr.formattedAddress}
                          onSelect={() =>
                            onSelectSuggestion?.(
                              addr.formattedAddress,
                              addr.addressType,
                            )
                          }
                          className="flex select-text cursor-pointer gap-2 h-max p-2 px-3 rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground items-center group"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <span className="flex-1 truncate">
                            {addr.formattedAddress}
                          </span>
                          {onDeleteHistoryAddress && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteHistoryAddress(addr.id);
                              }}
                              className="shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                              onMouseDown={(e) => e.preventDefault()}
                            >
                              <X className="size-4" />
                            </button>
                          )}
                        </CommandPrimitive.Item>
                      ))}

                    {!pinnedAddressFormatted &&
                      (isCollection || !historyAddresses?.length) && (
                        <div className="py-4 flex items-center justify-center text-sm text-muted-foreground">
                          No suggested addresses available
                        </div>
                      )}
                  </>
                )}

                {showAutocompleteSuggestions && (
                  <>
                    {autocompleteLoading ? (
                      <div className="h-28 flex items-center justify-center">
                        <Loader2 className="size-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        {suggestions.map((prediction) => (
                          <CommandPrimitive.Item
                            value={prediction.placePrediction.text.text}
                            onSelect={() => {
                              setSearchInput('');
                              setSelectedPlaceId(
                                prediction.placePrediction.place,
                              );
                              setIsOpenDialog(true);
                            }}
                            className="flex select-text flex-col cursor-pointer gap-0.5 h-max p-2 px-3 rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground items-start"
                            key={prediction.placePrediction.placeId}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {prediction.placePrediction.text.text}
                          </CommandPrimitive.Item>
                        ))}

                        {geocodedSuggestions.map((geocoded, index) => (
                          <CommandPrimitive.Item
                            value={geocoded.formattedAddress}
                            onSelect={() => {
                              setSearchInput('');
                              const geocodedAddress: AddressType = {
                                address1: geocoded.address1,
                                address2: '',
                                city: geocoded.city,
                                region: geocoded.region,
                                postalCode: geocoded.postalCode,
                                country: geocoded.country,
                                formattedAddress: geocoded.formattedAddress,
                                lat: geocoded.lat,
                                lng: geocoded.lng,
                                googlePlaceId: geocoded.placeId,
                                locationSource: 'AUTOCOMPLETE_PLACE',
                              };
                              onSelectSuggestion?.(
                                geocoded.formattedAddress,
                                trimAddressFields(geocodedAddress),
                              );
                              setIsOpenDialog(true);
                            }}
                            className="flex select-text flex-col cursor-pointer gap-0.5 h-max p-2 px-3 rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground items-start"
                            key={`geocoded-${geocoded.placeId || index}`}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {geocoded.formattedAddress}
                          </CommandPrimitive.Item>
                        ))}

                        {hasNoResults && (
                          <CommandPrimitive.Item
                            value="manual-entry"
                            onSelect={onManualEntry}
                            className="flex select-text flex-col cursor-pointer gap-0.5 h-max p-2 px-3 rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground items-start border-t"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Plus className="size-4" />
                              <span>Enter address manually</span>
                            </div>
                          </CommandPrimitive.Item>
                        )}
                      </>
                    )}
                  </>
                )}

              </CommandGroup>
            </div>
          </CommandList>
        </div>
      )}
    </Command>
  );
}
