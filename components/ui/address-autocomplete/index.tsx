'use client';
import { FormMessages } from '../form-messages';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { Delete, Loader2, Pencil, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AddressDialog from './address-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { AddressType } from '@/lib/types/address';
import { getRuntimeConfig } from '@/app/stores/runtimeConfigStore';

interface AddressAutoCompleteProps {
  address: AddressType;
  setAddress: (address: AddressType) => void;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
  dialogTitle: string;
  showInlineError?: boolean;
  placeholder?: string;
  // React Hook Form props
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  readOnly?: boolean;
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

export default function AddressAutoComplete(props: AddressAutoCompleteProps) {
  const {
    address,
    setAddress,
    dialogTitle,
    showInlineError = true,
    searchInput,
    setSearchInput,
    placeholder,
    onChange,
    onBlur,
    readOnly,
  } = props;

  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [adrAddress, setAdrAddress] = useState('');
  const [detailsLoading, setDetailsLoading] = useState(false);

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
        // Notify react-hook-form of the change
        if (onChange && formatted) {
          onChange(formatted);
        }
      }
    }
  }, [
    address.address1,
    address.address2,
    address.city,
    address.region,
    address.postalCode,
    address.country,
    address,
    setAddress,
    onChange,
  ]);

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
        };

        setAddress(formattedData);
        setAdrAddress(data.adrFormatAddress || '');
        // Notify react-hook-form of the change
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
  }, [selectedPlaceId, setAddress, onChange]);

  const handleManualEntry = () => {
    // Pre-populate with search input if available
    if (searchInput.trim()) {
      const updatedAddress = {
        ...address,
        address1: searchInput.trim(),
        formattedAddress: searchInput.trim(),
      };
      setAddress(updatedAddress);
      // Notify react-hook-form of the change
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
    };
    setAddress(resetAddress);
    // Notify react-hook-form of the change
    if (onChange) {
      onChange('');
    }
  };

  return (
    <>
      {selectedPlaceId !== '' || address.formattedAddress ? (
        <div className="flex items-center gap-2">
          <Input value={address?.formattedAddress} disabled={readOnly} />
          <AddressDialog
            isLoading={detailsLoading}
            dialogTitle={dialogTitle}
            adrAddress={adrAddress}
            address={address}
            setAddress={setAddress}
            open={isOpen}
            setOpen={setIsOpen}
            onChange={onChange}
          >
            <Button
              disabled={detailsLoading}
              size="icon"
              variant="outline"
              className="shrink-0"
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
          >
            <Delete className="size-4" />
          </Button>
        </div>
      ) : (
        <AddressAutoCompleteInput
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          selectedPlaceId={selectedPlaceId}
          setSelectedPlaceId={setSelectedPlaceId}
          setIsOpenDialog={setIsOpen}
          showInlineError={showInlineError}
          placeholder={placeholder}
          onManualEntry={handleManualEntry}
          onBlur={onBlur}
          readOnly={readOnly}
        />
      )}
    </>
  );
}

interface CommonProps {
  selectedPlaceId: string;
  setSelectedPlaceId: (placeId: string) => void;
  setIsOpenDialog: (isOpen: boolean) => void;
  showInlineError?: boolean;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
  placeholder?: string;
  onManualEntry: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
}

function AddressAutoCompleteInput(props: CommonProps) {
  const {
    setSelectedPlaceId,
    selectedPlaceId,
    setIsOpenDialog,
    showInlineError,
    searchInput,
    setSearchInput,
    placeholder,
    onManualEntry,
    onBlur,
    readOnly,
  } = props;

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

  // Fetch autocomplete suggestions
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
          const errorText = await response.text();
          console.error('Error response:', errorText);
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

  const hasSearched = debouncedSearchInput.trim().length > 0;
  const hasNoResults =
    hasSearched && !autocompleteLoading && suggestions.length === 0;

  return (
    <Command
      shouldFilter={false}
      onKeyDown={handleKeyDown}
      className="overflow-visible"
    >
      <div className="flex h-9 w-full items-center rounded-md border border-input px-3 py-1 text-base shadow-xs ring-offset-background focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring md:text-sm">
        <CommandPrimitive.Input
          value={searchInput}
          onValueChange={setSearchInput}
          onBlur={() => {
            close();
            if (onBlur) {
              onBlur();
            }
          }}
          onFocus={readOnly ? undefined : open}
          placeholder={placeholder || 'Enter address'}
          className="w-full outline-none"
          disabled={readOnly}
        />
      </div>
      {searchInput !== '' && !isOpen && !selectedPlaceId && showInlineError && (
        <FormMessages
          type="error"
          className="pt-1 text-sm"
          messages={['Select a valid address from the list']}
        />
      )}
      {isOpen && (
        <div className="relative animate-in fade-in-0 zoom-in-95 h-auto">
          <CommandList>
            <div className="absolute top-1.5 z-50 w-full">
              <CommandGroup className="relative h-auto z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md bg-background">
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
                          setIsOpenDialog(true);
                        }}
                        className="flex select-text flex-col cursor-pointer gap-0.5 h-max p-2 px-3 rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground items-start"
                        key={prediction.placePrediction.placeId}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {prediction.placePrediction.text.text}
                      </CommandPrimitive.Item>
                    ))}

                    {/* Manual entry option when no results found */}
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
                <CommandEmpty>
                  {!autocompleteLoading && (
                    <div className="py-4 flex items-center justify-center">
                      {searchInput === ''
                        ? 'Please enter an address'
                        : hasNoResults
                        ? null
                        : 'No address found'}
                    </div>
                  )}
                </CommandEmpty>
              </CommandGroup>
            </div>
          </CommandList>
        </div>
      )}
    </Command>
  );
}
