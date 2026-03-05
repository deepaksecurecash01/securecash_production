"use client";
import { GoogleMap, Libraries, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useState } from "react";
import {
  AUSTRALIA_COORDINATES,
  Coordinate,
  NEW_ZEALAND_COORDINATES,
} from "./mapCoordinates";

const GOOGLE_MAPS_API_KEY: string =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const LIBRARIES: Libraries = ["marker"];

interface MapContainerProps {
  isLoaded: boolean;
  coordinates: Coordinate[];
}

const MapSection = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const allCoordinates: Coordinate[] = [
    ...AUSTRALIA_COORDINATES,
    ...NEW_ZEALAND_COORDINATES,
  ];

  return <MapContainer isLoaded={isLoaded} coordinates={allCoordinates} />;
};

const MapContainer = ({ isLoaded, coordinates }: MapContainerProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<
    google.maps.marker.AdvancedMarkerElement[]
  >([]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map);

      const newMarkers = coordinates.map((position) => {
        return new window.google.maps.marker.AdvancedMarkerElement({
          position: position,
          map: map,
          title: position.label,
        });
      });

      setMarkers(newMarkers);
    },
    [coordinates],
  );

  const onUnmount = useCallback(() => {
    markers.forEach((marker) => {
      if (marker.map) {
        marker.map = null;
      }
    });
    setMarkers([]);
    setMap(null);
  }, [markers]);

  if (!isLoaded) {
    return (
      <section id="map-section" aria-label="Service locations map">
        <div id="mapContainer">
          <div
            style={{
              height: "500px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              color: "#666",
            }}
          >
            Loading map...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="map-section" aria-label="Service locations map">
      <div id="mapContainer">
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "500px",
          }}
          options={getDefaultMapOptions()}
          onLoad={onLoad}
          onUnmount={onUnmount}
        />
      </div>
    </section>
  );
};

const getDefaultMapOptions = (): google.maps.MapOptions => {
  const detectWidth = typeof window !== "undefined" ? window.innerWidth : 1024;

  if (detectWidth <= 375) {
    return {
      zoom: 2.7,
      center: { lat: -31, lng: 146 },
      mapId: "DEMO_MAP_ID",
    };
  } else if (detectWidth <= 414) {
    return {
      zoom: 3,
      center: { lat: -31, lng: 146 },
      mapId: "DEMO_MAP_ID",
    };
  } else if (detectWidth <= 667) {
    return {
      zoom: 3,
      center: { lat: -31, lng: 146 },
      mapId: "DEMO_MAP_ID",
    };
  } else if (detectWidth <= 768) {
    return {
      zoom: 4,
      center: { lat: -31, lng: 146 },
      mapId: "DEMO_MAP_ID",
    };
  } else if (detectWidth <= 1024) {
    return {
      zoom: 4,
      center: { lat: -31, lng: 145 },
      mapId: "DEMO_MAP_ID",
    };
  } else {
    return {
      zoom: 4,
      center: { lat: -31, lng: 153 },
      mapId: "DEMO_MAP_ID",
    };
  }
};

export default MapSection;
