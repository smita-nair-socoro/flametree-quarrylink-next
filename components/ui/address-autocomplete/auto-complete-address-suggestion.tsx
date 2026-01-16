'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { Delete, Loader2, Pencil, Plus, Pin, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AddressDialog from './address-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { AddressType, Address } from '@/lib/types/address';
import { getRuntimeConfig } from '@/app/stores/runtimeConfigStore';
import { cn } from '@/lib/utils';

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
}

// Mock history addresses (to be replaced with backend data)
const MOCK_HISTORY_ADDRESSES: SuggestedAddress[] = [
  {
    id: 'history-1',
    formattedAddress: '456 Market St, Suite 200, Melbourne, VIC 3000, Australia',
  },
  {
    id: 'history-2',
    formattedAddress: '789 George St, Brisbane, QLD 4000, Australia',
  },
  {
    id: 'history-3',
    formattedAddress: '101 Collins St, Level 80, Perth, WA 6000, Australia',
  },
  {
    id: 'history-4',
    formattedAddress: '200 King William St, Adelaide, SA 5000, Australia',
  },
  {
    id: 'history-5',
    formattedAddress: '300 Elizabeth St, Hobart, TAS 7000, Australia',
  },
];

// Helper function to format Address (backend type) to string
const formatAddressToString = (address: Address | undefined): string => {
  if (!address) {
    return '';
  }

  // If formattedAddress exists, use it
  if (address.formattedAddress?.trim()) {
    return address.formattedAddress;
  }

  // Otherwise, construct from individual components
  const parts = [];

  // Street address
  if (address.streetDetailsPrimary?.trim()) {
    parts.push(address.streetDetailsPrimary.trim());
  }
  if (address.streetDetailsOptional?.trim()) {
    parts.push(address.streetDetailsOptional.trim());
  }

  // Location parts: suburb/city, state, postcode
  const locationParts = [];
  if (address.suburb?.trim()) {
    locationParts.push(address.suburb.trim());
  } else if (address.city?.trim()) {
    locationParts.push(address.city.trim());
  }
  if (address.state?.trim()) {
    locationParts.push(address.state.trim());
  }
  if (address.postcode?.trim()) {
    locationParts.push(address.postcode.trim());
  }

  if (locationParts.length > 0) {
    parts.push(locationParts.join(' '));
  }

  // Country
  if (address.country?.trim()) {
    parts.push(address.country.trim());
  }

  return parts.join(', ');
};

// Helper function to format address from components
export const formatAddressFromComponents = (address: AddressType): string => {
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

interface AutoCompleteAddressSuggestionProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  pinnedAddress?: Address;
  isCollection?: boolean;
  label?: string;
}

export default function AutoCompleteAddressSuggestion({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  pinnedAddress,
  isCollection = false,
}: AutoCompleteAddressSuggestionProps) {
  const [address, setAddress] = useState<AddressType>({
    address1: '',
    address2: '',
    formattedAddress: value || '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    lat: 0,
    lng: 0,
    googlePlaceId: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adrAddress, setAdrAddress] = useState('');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [historyAddresses, setHistoryAddresses] = useState<SuggestedAddress[]>(
    MOCK_HISTORY_ADDRESSES
  );

  // Sync value prop to internal state
  useEffect(() => {
    if (value && value !== address.formattedAddress) {
      setAddress((prev) => ({ ...prev, formattedAddress: value }));
    }
  }, [value, address.formattedAddress]);

  // Handle address component changes
  useEffect(() => {
    if (
      address.address1 ||
      address.city ||
      address.region ||
      address.postalCode ||
      address.country
    ) {
      const formatted = formatAddressFromComponents(address);
      if (formatted !== address.formattedAddress) {
        const updatedAddress = {
          ...address,
          formattedAddress: formatted,
        };
        setAddress(updatedAddress);
        if (onChange && formatted) {
          onChange(formatted);
        }
      }
    }
  }, [
    address,
    address.address1,
    address.address2,
    address.city,
    address.region,
    address.postalCode,
    address.country,
    onChange,
  ]);

  // Fetch place details when a place is selected
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

        const url = `https://places.googleapis.com/v1/${selectedPlaceId}`;
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
            response.statusText
          );
          return;
        }

        const data = await response.json();

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
          googlePlaceId: selectedPlaceId,
        };

        setAddress(formattedData);
        setAdrAddress(data.adrFormatAddress || '');
        if (onChange && formattedAddress) {
          onChange(formattedAddress);
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [selectedPlaceId, onChange]);

  const handleManualEntry = () => {
    if (searchInput.trim()) {
      const updatedAddress: AddressType = {
        ...address,
        address1: searchInput.trim(),
        formattedAddress: searchInput.trim(),
      };
      setAddress(updatedAddress);
      if (onChange) {
        onChange(searchInput.trim());
      }
    }
    setSearchInput('');
    setIsDialogOpen(true);
  };

  const handleReset = () => {
    setSelectedPlaceId('');
    setAdrAddress('');
    setSearchInput('');
    const resetAddress = {
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
    setAddress(resetAddress);
    if (onChange) {
      onChange('');
    }
  };

  const handleSelectSuggestion = (suggestedAddress: string) => {
    setAddress((prev) => ({ ...prev, formattedAddress: suggestedAddress }));
    if (onChange) {
      onChange(suggestedAddress);
    }
    setSearchInput('');
  };

  const handleDeleteHistoryAddress = (id: string) => {
    setHistoryAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const hasSelectedAddress =
    selectedPlaceId !== '' || address.formattedAddress;

  return (
    <>
      {hasSelectedAddress ? (
        <div className="flex items-center gap-2">
          <Input value={address?.formattedAddress} readOnly disabled={disabled} />
          <AddressDialog
            isLoading={detailsLoading}
            dialogTitle={isCollection ? 'Collection Address' : 'Delivery Address'}
            adrAddress={adrAddress}
            address={address}
            setAddress={setAddress}
            open={isDialogOpen}
            setOpen={setIsDialogOpen}
            onChange={onChange}
          >
            <Button
              disabled={detailsLoading || disabled}
              size="icon"
              variant="outline"
              className="shrink-0"
              type="button"
            >
              <Pencil className="size-4" />
            </Button>
          </AddressDialog>
          <Button
            type="button"
            onClick={handleReset}
            size="icon"
            variant="outline"
            className="shrink-0"
            disabled={disabled}
          >
            <Delete className="size-4" />
          </Button>
        </div>
      ) : (
        <AddressInputWithSuggestions
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          setSelectedPlaceId={setSelectedPlaceId}
          setIsDialogOpen={setIsDialogOpen}
          placeholder={placeholder}
          onManualEntry={handleManualEntry}
          onBlur={onBlur}
          disabled={disabled}
          pinnedAddress={pinnedAddress}
          historyAddresses={historyAddresses}
          isCollection={isCollection}
          onSelectSuggestion={handleSelectSuggestion}
          onDeleteHistoryAddress={handleDeleteHistoryAddress}
        />
      )}
    </>
  );
}

interface AddressInputWithSuggestionsProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  setSelectedPlaceId: (placeId: string) => void;
  setIsDialogOpen: (isOpen: boolean) => void;
  placeholder?: string;
  onManualEntry: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  pinnedAddress?: Address;
  historyAddresses: SuggestedAddress[];
  isCollection: boolean;
  onSelectSuggestion: (address: string) => void;
  onDeleteHistoryAddress: (id: string) => void;
}

function AddressInputWithSuggestions({
  searchInput,
  setSearchInput,
  setSelectedPlaceId,
  setIsDialogOpen,
  placeholder,
  onManualEntry,
  onBlur,
  disabled,
  pinnedAddress,
  historyAddresses,
  isCollection,
  onSelectSuggestion,
  onDeleteHistoryAddress,
}: AddressInputWithSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      close();
    }
  };

  const debouncedSearchInput = useDebounce(searchInput, 500);

  // Fetch autocomplete suggestions when user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchInput.trim()) {
        setSuggestions([]);
        return;
      }

      setAutocompleteLoading(true);

      try {
        const apiKey = getRuntimeConfig().GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error('Missing API Key');
          setSuggestions([]);
          return;
        }

        const url = 'https://places.googleapis.com/v1/places:autocomplete';
        const primaryTypes = [
          'street_address',
          'subpremise',
          'route',
          'street_number',
          'landmark',
        ];

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
          },
          body: JSON.stringify({
            input: debouncedSearchInput,
            includedPrimaryTypes: primaryTypes,
            includedRegionCodes: ['AU'],
          }),
        });

        if (!response.ok) {
          console.error(
            'Autocomplete fetch failed:',
            response.status,
            response.statusText
          );
          setSuggestions([]);
          return;
        }

        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        setSuggestions([]);
      } finally {
        setAutocompleteLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchInput]);

  const hasSearchInput = searchInput.trim().length > 0;
  const hasNoResults =
    hasSearchInput && !autocompleteLoading && suggestions.length === 0;
  const showInitialSuggestions = !hasSearchInput && isOpen;
  const showAutocompleteSuggestions = hasSearchInput && isOpen;

  const pinnedAddressFormatted = formatAddressToString(pinnedAddress);

  return (
    <Command
      shouldFilter={false}
      onKeyDown={handleKeyDown}
      className="overflow-visible"
    >
      <div
        className={cn(
          'flex h-9 w-full items-center rounded-md border border-input px-3 py-1 text-base shadow-xs ring-offset-background focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring md:text-sm'
        )}
      >
        <CommandPrimitive.Input
          value={searchInput}
          onValueChange={setSearchInput}
          onBlur={() => {
            // Delay close to allow click events on suggestions
            setTimeout(() => {
              close();
              if (onBlur) {
                onBlur();
              }
            }, 200);
          }}
          onFocus={disabled ? undefined : open}
          placeholder={placeholder || 'Enter site address...'}
          className="w-full outline-none"
          disabled={disabled}
        />
      </div>

      {isOpen && (
        <div className="relative animate-in fade-in-0 zoom-in-95 h-auto">
          <CommandList>
            <div className="absolute top-1.5 z-50 w-full">
              <CommandGroup className="relative h-auto z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md bg-background">
                {/* Show initial suggestions (pinned + history) when no search input */}
                {showInitialSuggestions && (
                  <>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                      Suggested{' '}
                      {isCollection ? 'Collection' : 'Delivery'} Addresses
                    </div>

                    {/* Pinned Billing Address */}
                    {pinnedAddressFormatted && (
                      <CommandPrimitive.Item
                        value={pinnedAddressFormatted}
                        onSelect={() => onSelectSuggestion(pinnedAddressFormatted)}
                        className="flex select-text cursor-pointer gap-2 h-max p-2 px-3 rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground items-center"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <Pin className="size-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate">
                          {pinnedAddressFormatted}
                        </span>
                      </CommandPrimitive.Item>
                    )}

                    {/* History Addresses (only for delivery) */}
                    {!isCollection &&
                      historyAddresses.map((addr) => (
                        <CommandPrimitive.Item
                          key={addr.id}
                          value={addr.formattedAddress}
                          onSelect={() => onSelectSuggestion(addr.formattedAddress)}
                          className="flex select-text cursor-pointer gap-2 h-max p-2 px-3 rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground items-center group"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <span className="flex-1 truncate">
                            {addr.formattedAddress}
                          </span>
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
                        </CommandPrimitive.Item>
                      ))}

                    {!pinnedAddressFormatted &&
                      (isCollection || historyAddresses.length === 0) && (
                        <div className="py-4 flex items-center justify-center text-sm text-muted-foreground">
                          No suggested addresses available
                        </div>
                      )}
                  </>
                )}

                {/* Show Google Places autocomplete when user types */}
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
                              setSelectedPlaceId(prediction.placePrediction.place);
                              setIsDialogOpen(true);
                            }}
                            className="flex select-text flex-col cursor-pointer gap-0.5 h-max p-2 px-3 rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground items-start"
                            key={prediction.placePrediction.placeId}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {prediction.placePrediction.text.text}
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

                <CommandEmpty>
                  {showAutocompleteSuggestions &&
                    !autocompleteLoading &&
                    hasNoResults && null}
                </CommandEmpty>
              </CommandGroup>
            </div>
          </CommandList>
        </div>
      )}
    </Command>
  );
}
