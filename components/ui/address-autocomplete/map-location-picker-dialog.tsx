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
import { getRuntimeConfig } from '@/app/stores/runtimeConfigStore';
import { AddressType } from '@/lib/types/address';
import {
  reverseGeocode,
  getDefaultMapCenter,
  isValidCoordinates,
} from '@/lib/utils/geocoding';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { Loader2, MapPin, LocateFixed } from 'lucide-react';
import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';

interface MapLocationPickerDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  address: AddressType;
  setAddress: (address: AddressType) => void;
  dialogTitle?: string;
  onChange?: (value: string) => void;
}

// Default zoom levels
const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 15;

export default function MapLocationPickerDialog(
  props: PropsWithChildren<MapLocationPickerDialogProps>
) {
  const {
    children,
    open,
    setOpen,
    address,
    setAddress,
    dialogTitle = 'Pick Location on Map',
    onChange,
  } = props;

  // Temporary marker position (not committed until confirm)
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    getDefaultMapCenter()
  );
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [mapId, setMapId] = useState<string>('');

  // Initialize map state when dialog opens
  useEffect(() => {
    if (open) {
      try {
        const config = getRuntimeConfig();
        setApiKey(config.GOOGLE_MAPS_API_KEY || '');
        // Use a default map ID for AdvancedMarker support
        // If you have a specific Map ID from Google Cloud Console, use that instead
        setMapId('DEMO_MAP_ID');
      } catch {
        console.error('Failed to get runtime config');
        setApiKey('');
      }

      // Reset error state
      setError(null);

      // Set initial position based on existing address coordinates
      if (isValidCoordinates(address.lat, address.lng)) {
        setMarkerPosition({ lat: address.lat, lng: address.lng });
        setMapCenter({ lat: address.lat, lng: address.lng });
        setZoom(SELECTED_ZOOM);
      } else {
        // No valid coordinates, use default center without marker
        setMarkerPosition(null);
        setMapCenter(getDefaultMapCenter());
        setZoom(DEFAULT_ZOOM);
      }
    }
  }, [open, address.lat, address.lng]);

  // Handle map click to place/move marker
  const handleMapClick = useCallback((event: MapMouseEvent) => {
    if (event.detail.latLng) {
      const lat = event.detail.latLng.lat;
      const lng = event.detail.latLng.lng;
      setMarkerPosition({ lat, lng });
      setError(null);
    }
  }, []);

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      setError(null);
    }
  }, []);

  // Use browser geolocation to center map
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPosition({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });
        setZoom(SELECTED_ZOOM);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Could not get your location. Please enable location access.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Confirm location and reverse geocode
  const handleConfirm = useCallback(async () => {
    if (!markerPosition) {
      setError('Please select a location on the map');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await reverseGeocode(markerPosition.lat, markerPosition.lng);

      if (!result.success && result.error) {
        console.warn('Reverse geocoding warning:', result.error);
        // Continue with fallback address even on error
      }

      // Merge geocoded address with existing address, preserving lat/lng
      const updatedAddress: AddressType = {
        ...address,
        ...result.address,
        lat: markerPosition.lat,
        lng: markerPosition.lng,
        locationSource: 'MAP_PIN',
      };

      setAddress(updatedAddress);

      // Notify react-hook-form if callback provided
      if (onChange && updatedAddress.formattedAddress) {
        onChange(updatedAddress.formattedAddress);
      }

      setOpen(false);
    } catch (err) {
      console.error('Error confirming location:', err);
      setError('Failed to get address for this location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [markerPosition, address, setAddress, onChange, setOpen]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setMarkerPosition(null);
    setError(null);
    setOpen(false);
  }, [setOpen]);

  if (!apiKey) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Google Maps API key not configured
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Click on the map to place a marker, or drag the marker to adjust the
            location. You can edit address details after confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          {/* Map Container */}
          <div className="relative h-[400px] w-full rounded-md overflow-hidden border">
            <APIProvider apiKey={apiKey}>
              <Map
                mapId={mapId}
                defaultCenter={mapCenter}
                defaultZoom={zoom}
                gestureHandling="greedy"
                disableDefaultUI={false}
                zoomControl={true}
                mapTypeControl={false}
                streetViewControl={false}
                fullscreenControl={false}
                onClick={handleMapClick}
                className="w-full h-full"
              >
                {markerPosition && (
                  <AdvancedMarker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                  >
                    <div className="flex flex-col items-center">
                      <MapPin className="size-8 text-destructive fill-destructive/20 drop-shadow-md" />
                    </div>
                  </AdvancedMarker>
                )}
              </Map>
            </APIProvider>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Getting location...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Location info bar */}
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="text-sm text-muted-foreground">
              {markerPosition ? (
                <span>
                  Selected: {markerPosition.lat.toFixed(6)},{' '}
                  {markerPosition.lng.toFixed(6)}
                </span>
              ) : (
                <span>Click on the map to select a location</span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseMyLocation}
              disabled={isLoading}
            >
              <LocateFixed className="size-4 mr-2" />
              Use my location
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-2 p-2 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !markerPosition}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm location'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
