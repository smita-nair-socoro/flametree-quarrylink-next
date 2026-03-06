'use client';

import { getRuntimeConfig } from '@/app/stores/runtimeConfigStore';
import { getDefaultMapCenter, isValidCoordinates } from '@/lib/utils/geocoding';
import { cn } from '@/lib/utils';
import {
  APIProvider,
  Map as GoogleMap,
  Marker,
  useMap,
} from '@vis.gl/react-google-maps';
import { memo, useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

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
const MARKER_ICONS = {
  red: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#ef4444"/><circle cx="12" cy="12" r="5" fill="white"/></svg>',
  )}`,
  green: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#16a34a"/><circle cx="12" cy="12" r="5" fill="white"/></svg>',
  )}`,
  blue: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#3b82f6"/><circle cx="12" cy="12" r="5" fill="white"/></svg>',
  )}`,
};

export interface MapMarker {
  lat: number;
  lng: number;
  color?: 'red' | 'green';
  title?: string;
}

interface MapProps {
  markers: MapMarker[];
  className?: string;
  defaultZoom?: number;
}

const CURRENT_LOCATION_ZOOM = 14;

function MapContent({
  markers,
  defaultZoom = 10,
  initialCenter,
}: {
  markers: MapMarker[];
  defaultZoom?: number;
  initialCenter?: { lat: number; lng: number };
}) {
  const map = useMap();

  const validMarkers = markers.filter((m) => isValidCoordinates(m.lat, m.lng));
  const hasAddressMarkers = validMarkers.length > 0;

  // Fit bounds to markers or center on initial center (current location)
  useEffect(() => {
    if (!map) return;

    if (hasAddressMarkers) {
      if (validMarkers.length === 1) {
        map.panTo({ lat: validMarkers[0].lat, lng: validMarkers[0].lng });
        map.setZoom(15);
      } else {
        const bounds = new google.maps.LatLngBounds();
        validMarkers.forEach((marker) => {
          bounds.extend({ lat: marker.lat, lng: marker.lng });
        });
        map.fitBounds(bounds);
      }
    } else if (initialCenter) {
      map.panTo({ lat: initialCenter.lat, lng: initialCenter.lng });
      map.setZoom(CURRENT_LOCATION_ZOOM);
    }
  }, [map, markers, validMarkers, hasAddressMarkers, initialCenter]);

  const defaultCenter = initialCenter ?? getDefaultMapCenter();

  return (
    <GoogleMap
      defaultCenter={defaultCenter}
      defaultZoom={defaultZoom}
      gestureHandling="cooperative"
      disableDefaultUI={false}
      zoomControl={true}
      className="w-full h-full"
      styles={MAP_STYLES}
    >
      {hasAddressMarkers &&
        markers.map(
          (marker, index) =>
            isValidCoordinates(marker.lat, marker.lng) && (
              <Marker
                key={index}
                position={{ lat: marker.lat, lng: marker.lng }}
                icon={MARKER_ICONS[marker.color || 'red']}
                title={marker.title}
              />
            ),
        )}
    </GoogleMap>
  );
}

export function Map({ markers, className, defaultZoom }: MapProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false);

  const validMarkers = markers.filter((m) => isValidCoordinates(m.lat, m.lng));
  const hasAddressMarkers = validMarkers.length > 0;

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

  // Fetch current location when no address markers (before showing map)
  useEffect(() => {
    if (hasAddressMarkers || !navigator.geolocation) {
      setIsGeolocationLoading(false);
      return;
    }

    setIsGeolocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGeolocationLoading(false);
      },
      () => {
        setCurrentLocation(null);
        setIsGeolocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [hasAddressMarkers]);

  const mapContainerClass = cn(
    'relative rounded-md overflow-hidden border flex items-center justify-center',
    className,
  );

  if (!isReady) {
    return (
      <div className={mapContainerClass}>
        <Spinner size="medium" />
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className={mapContainerClass}>
        <p className="text-sm text-muted-foreground">Map not available</p>
      </div>
    );
  }

  // Show spinner while fetching geolocation (no address markers)
  if (!hasAddressMarkers && isGeolocationLoading) {
    return (
      <div className={mapContainerClass}>
        <Spinner size="medium" />
      </div>
    );
  }

  const initialCenter =
    !hasAddressMarkers && currentLocation ? currentLocation : undefined;

  return (
    <div className={mapContainerClass}>
      <div className="w-full h-full min-h-[200px]">
        <APIProvider apiKey={apiKey}>
          <MapContent
            markers={markers}
            defaultZoom={defaultZoom}
            initialCenter={initialCenter}
          />
        </APIProvider>
      </div>
    </div>
  );
}

export default memo(Map);
