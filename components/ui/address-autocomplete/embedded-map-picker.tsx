'use client';

import { Button } from '@/components/ui/button';
import { getRuntimeConfig } from '@/app/stores/runtimeConfigStore';
import { getDefaultMapCenter, isValidCoordinates } from '@/lib/utils/geocoding';
import { cn } from '@/lib/utils';
import {
  APIProvider,
  Map,
  Marker,
  useMap,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { Expand, Loader2, LocateFixed, Shrink } from 'lucide-react';
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
  /** Marker color: 'red' for delivery/billing, 'green' for collection */
  markerColor?: 'red' | 'green';
  /** Whether the surrounding dialog is expanded to give the map more room */
  isExpanded?: boolean;
  /** Toggles the expanded state (grows/shrinks the surrounding dialog) */
  onToggleExpand?: () => void;
}

// Map styles to hide extra labels (POI, business, road icons, transit)
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: 'poi',
    elementType: 'labels.text',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
];

// Pre-built SVG pin marker icon URLs (no google.maps dependency).
// The SVG is sized at 28x42 so no scaledSize is needed.
const MARKER_ICONS = {
  red: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#ef4444"/><circle cx="12" cy="12" r="5" fill="white"/></svg>',
  )}`,
  green: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#16a34a"/><circle cx="12" cy="12" r="5" fill="white"/></svg>',
  )}`,
};

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
  markerColor = 'red',
  isExpanded = false,
  onToggleExpand,
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
      <div
        className={cn(
          'relative w-full rounded-md overflow-hidden border transition-[height] duration-200',
          isExpanded ? 'h-[70vh]' : 'h-[400px]',
        )}
      >
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={hasValidCoords ? SELECTED_ZOOM : DEFAULT_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI={true}
          zoomControl={true}
          onClick={handleMapClick}
          className="w-full h-full"
          styles={MAP_STYLES}
        >
          {hasValidCoords && (
            <Marker
              position={{ lat, lng }}
              draggable={!disabled}
              onDragEnd={handleMarkerDragEnd}
              icon={MARKER_ICONS[markerColor]}
            />
          )}
        </Map>

        {/* Expand/collapse toggle */}
        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            className="absolute top-2 right-2 z-10 flex items-center justify-center rounded-md border bg-background/90 p-1.5 text-foreground shadow-sm hover:bg-background"
            title={isExpanded ? 'Collapse map' : 'Expand map'}
            aria-label={isExpanded ? 'Collapse map' : 'Expand map'}
          >
            {isExpanded ? (
              <Shrink className="size-4" />
            ) : (
              <Expand className="size-4" />
            )}
          </button>
        )}

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
