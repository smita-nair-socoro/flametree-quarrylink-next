'use client';

import { Button } from '@/components/ui/button';
import { getRuntimeConfig } from '@/app/stores/runtimeConfigStore';
import { getDefaultMapCenter, isValidCoordinates } from '@/lib/utils/geocoding';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { Loader2, MapPin, LocateFixed } from 'lucide-react';
import { useCallback, useEffect, useState, memo } from 'react';

interface EmbeddedMapPickerProps {
  /** Current latitude from draft address */
  lat: number;
  /** Current longitude from draft address */
  lng: number;
  /** Called when user interacts with map (click, drag, geolocation) */
  onLocationChange: (lat: number, lng: number) => void;
  /** Whether the map is in a loading state */
  disabled?: boolean;
}

// Default zoom levels
const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 15;

/**
 * Inner map component that has access to the map instance
 */
function MapContent({
  lat,
  lng,
  onLocationChange,
  disabled,
}: EmbeddedMapPickerProps) {
  const map = useMap();
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const hasValidCoords = isValidCoordinates(lat, lng);

  // Pan map to new coordinates when they change externally (form → map)
  useEffect(() => {
    if (map && hasValidCoords) {
      const currentCenter = map.getCenter();
      if (currentCenter) {
        const currentLat = currentCenter.lat();
        const currentLng = currentCenter.lng();
        // Only pan if significantly different (avoid micro-adjustments)
        const latDiff = Math.abs(currentLat - lat);
        const lngDiff = Math.abs(currentLng - lng);
        if (latDiff > 0.0001 || lngDiff > 0.0001) {
          map.panTo({ lat, lng });
          // Zoom in if we're at default zoom
          const currentZoom = map.getZoom();
          if (currentZoom && currentZoom < SELECTED_ZOOM) {
            map.setZoom(SELECTED_ZOOM);
          }
        }
      }
    }
  }, [map, lat, lng, hasValidCoords]);

  // Handle map click to place/move marker
  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (disabled) return;
      if (event.detail.latLng) {
        const newLat = event.detail.latLng.lat;
        const newLng = event.detail.latLng.lng;
        onLocationChange(newLat, newLng);
        setGeoError(null);
      }
    },
    [disabled, onLocationChange],
  );

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (disabled) return;
      if (event.latLng) {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        onLocationChange(newLat, newLng);
        setGeoError(null);
      }
    },
    [disabled, onLocationChange],
  );

  // Use browser geolocation
  const handleUseMyLocation = useCallback(() => {
    if (disabled) return;
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported');
      return;
    }

    setIsGeolocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationChange(latitude, longitude);
        if (map) {
          map.panTo({ lat: latitude, lng: longitude });
          map.setZoom(SELECTED_ZOOM);
        }
        setIsGeolocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setGeoError('Could not get location');
        setIsGeolocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [disabled, onLocationChange, map]);

  const defaultCenter = hasValidCoords ? { lat, lng } : getDefaultMapCenter();

  return (
    <div className="relative">
      <div className="relative h-[400px] w-full rounded-md overflow-hidden border">
        <Map
          mapId="address-dialog-map"
          defaultCenter={defaultCenter}
          defaultZoom={hasValidCoords ? SELECTED_ZOOM : DEFAULT_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI={true}
          zoomControl={true}
          onClick={handleMapClick}
          className="w-full h-full"
        >
          {hasValidCoords && (
            <AdvancedMarker
              position={{ lat, lng }}
              draggable={!disabled}
              onDragEnd={handleMarkerDragEnd}
            >
              <MapPin className="size-7 text-destructive fill-destructive/20 drop-shadow-md" />
            </AdvancedMarker>
          )}
        </Map>

        {/* Geolocation loading overlay */}
        {isGeolocating && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-muted-foreground">
          {hasValidCoords ? (
            <span>
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
          ) : (
            <span>Click map to set location</span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUseMyLocation}
          disabled={disabled || isGeolocating}
          className="h-7 text-xs"
        >
          <LocateFixed className="size-3 mr-1" />
          My location
        </Button>
      </div>

      {/* Error message */}
      {geoError && <p className="text-xs text-destructive mt-1">{geoError}</p>}
    </div>
  );
}

/**
 * Embeddable map picker panel for use inside AddressDialog.
 * Displays a compact map with click-to-place and draggable marker.
 */
function EmbeddedMapPicker(props: EmbeddedMapPickerProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const config = getRuntimeConfig();
      setApiKey(config.GOOGLE_MAPS_API_KEY || '');
      setIsReady(true);
    } catch {
      console.error('Failed to get runtime config');
      setApiKey('');
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return (
      <div className="h-[200px] flex items-center justify-center border rounded-md bg-muted/30">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="h-[200px] flex items-center justify-center border rounded-md bg-muted/30">
        <p className="text-sm text-muted-foreground">Map not available</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <MapContent {...props} />
    </APIProvider>
  );
}

export default memo(EmbeddedMapPicker);
