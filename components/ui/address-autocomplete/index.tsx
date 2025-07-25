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
import { Delete, Loader2, Pencil } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AddressDialog from './address-dialog';
import { Command as CommandPrimitive } from 'cmdk';

export interface AddressType {
  address1: string;
  address2: string;
  formattedAddress: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
}

interface AddressAutoCompleteProps {
  address: AddressType;
  setAddress: (address: AddressType) => void;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
  dialogTitle: string;
  showInlineError?: boolean;
  placeholder?: string;
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

export default function AddressAutoComplete(props: AddressAutoCompleteProps) {
  const {
    address,
    setAddress,
    dialogTitle,
    showInlineError = true,
    searchInput,
    setSearchInput,
    placeholder,
  } = props;

  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [adrAddress, setAdrAddress] = useState('');
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!selectedPlaceId) return;

      setDetailsLoading(true);

      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
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
        };

        console.log('Formatted address data:', formattedData);

        setAddress(formattedData);
        setAdrAddress(data.adrFormatAddress || '');
      } catch (error) {
        console.error('Error fetching place details:', error);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [selectedPlaceId, setAddress]);

  return (
    <>
      {selectedPlaceId !== '' || address.formattedAddress ? (
        <div className="flex items-center gap-2">
          <Input value={address?.formattedAddress} readOnly />
          <AddressDialog
            isLoading={detailsLoading}
            dialogTitle={dialogTitle}
            adrAddress={adrAddress}
            address={address}
            setAddress={setAddress}
            open={isOpen}
            setOpen={setIsOpen}
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
            onClick={() => {
              setSelectedPlaceId('');
              setAdrAddress('');
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
              });
            }}
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
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error('Missing API Key');
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
            response.statusText,
          );
          const errorText = await response.text();
          console.error('Error response:', errorText);
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

  return (
    <Command
      shouldFilter={false}
      onKeyDown={handleKeyDown}
      className="overflow-visible"
    >
      <div className="flex w-full items-center justify-between rounded-lg border bg-background ring-offset-background text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <CommandPrimitive.Input
          value={searchInput}
          onValueChange={setSearchInput}
          onBlur={close}
          onFocus={open}
          placeholder={placeholder || 'Enter address'}
          className="w-full p-3 rounded-lg outline-none"
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
                  </>
                )}
                <CommandEmpty>
                  {!autocompleteLoading && suggestions.length === 0 && (
                    <div className="py-4 flex items-center justify-center">
                      {searchInput === ''
                        ? 'Please enter an address'
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
