import {
  Camera,
  CameraRef,
  FillLayer,
  Images,
  LineLayer,
  MapView,
  ShapeSource,
  SymbolLayer,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Manual timeout wrapper for Expo Location
async function getLocationWithTimeout(options: any, timeoutMs: number) {
  return Promise.race([
    Location.getCurrentPositionAsync(options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("LOCATION_TIMEOUT")), timeoutMs)
    ),
  ]);
}

export default function Index() {
  const router = useRouter();
  const cameraRef = useRef<CameraRef>(null);
  const mapRef = useRef<any>(null);

  const geojson = require("./assets/map.json");

  const fallbackCenter: [number, number] = [-53.0964, -25.705];
  const minZoom = 15;
  const maxZoom = 18;

  const [centerCoords, setCenterCoords] = useState<[number, number] | null>(null);
  const [markerCoords, setMarkerCoords] = useState<[number, number] | null>(null);

  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  
  async function loadUserLocation() {
    setLoading(true);
    setLocationError(null);

    try {
      const loc = await Location.getCurrentPositionAsync({});

      if (status !== "granted") {
        setLocationError("Permissão negada. Usando localização padrão.");
        setCenterCoords(fallbackCenter);
        setMarkerCoords(fallbackCenter);
        setLoading(false);
        return;
      }

      const userLocation: any = await getLocationWithTimeout(
        { accuracy: Location.Accuracy.Low },
        5000
      );

      const coords: [number, number] = [
        userLocation.coords.longitude,
        userLocation.coords.latitude,
      ];

      setCenterCoords(coords);
      setMarkerCoords(coords);
      setLoading(false);
    } catch (err: any) {
      console.log("GPS error:", err);

      if (err?.message === "LOCATION_TIMEOUT") {
        setLocationError("Tempo esgotado ao obter GPS. Usando localização padrão.");
      } else {
        setLocationError("Não foi possível obter sua localização. Usando localização padrão.");
      }

      setCenterCoords(fallbackCenter);
      setMarkerCoords(fallbackCenter);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUserLocation();
  }, []);

  const handleMapPress = async (event: any) => {
    const coords = event.geometry.coordinates as [number, number];
    setMarkerCoords(coords);

    let currentZoom = minZoom;

    try {
      const z = await mapRef.current?.getZoom();
      if (typeof z === "number") currentZoom = z;
    } catch (_) {
    }

    cameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: currentZoom,
      animationDuration: 300,
    });
  };


  const goToPopup = () => {
    router.push("/popup");
  };

  if (loading || !centerCoords || !markerCoords) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Obtendo localização...</Text>

        {locationError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{locationError}</Text>

            <TouchableOpacity style={styles.retryButton} onPress={loadUserLocation}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapStyle="https://demotiles.maplibre.org/style.json"
        onPress={handleMapPress}
        onRegionDidChange={(region) => {
          if (region?.geometry?.coordinates) {
            setCenterCoords(region.geometry.coordinates as [number, number]);
          }
        }}
        onDidFinishLoadingMap={() => {
          cameraRef.current?.setCamera({
            centerCoordinate: centerCoords,
            zoomLevel: minZoom,
            animationDuration: 250,
          });
        }}
      >
        <Images images={{ marker: require("./assets/map-marker-2-svgrepo-com.png") }} />

        <ShapeSource id="geojson-source" shape={geojson}>
          <FillLayer
            id="buildings"
            filter={["==", ["geometry-type"], "Polygon"]}
            style={{
              fillColor: "#9b9b9b",
              fillOutlineColor: "#333",
              fillOpacity: 0.6,
            }}
          />

          <LineLayer
            id="tertiary-roads"
            filter={[
              "all",
              ["==", ["geometry-type"], "LineString"],
              ["==", ["get", "highway"], "tertiary"],
            ]}
            style={{
              lineColor: "#ff8c00",
              lineWidth: 3,
            }}
          />

          <LineLayer
            id="unclassified-roads"
            filter={[
              "all",
              ["==", ["geometry-type"], "LineString"],
              ["==", ["get", "highway"], "unclassified"],
            ]}
            style={{
              lineColor: "#f1c40f",
              lineWidth: 2,
              lineDasharray: [2, 2],
            }}
          />
        </ShapeSource>

        {markerCoords && (
          <ShapeSource
            id="marker-source"
            shape={{
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "Point",
                    coordinates: markerCoords,
                  },
                },
              ],
            }}
          >
            <SymbolLayer
              id="marker-layer"
              style={{
                iconImage: "marker",
                iconSize: 0.2,
                iconAllowOverlap: true,
                iconAnchor: "bottom",
                iconOffset: [10, 50],
              }}
            />
          </ShapeSource>
        )}

        <Camera ref={cameraRef} minZoomLevel={minZoom} maxZoomLevel={maxZoom} />
      </MapView>

      {markerCoords && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.bottomButton} onPress={goToPopup}>
            <Text style={styles.bottomButtonText}>Sinalizar Emergência</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.coordinates}>
        <Text style={styles.text}>
          Coordenadas: {centerCoords[0].toFixed(6)}, {centerCoords[1].toFixed(6)}
        </Text>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  page: { flex: 1 },
  map: { flex: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  errorBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#ffe6e6",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    color: "#a00",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  coordinates: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 6,
  },
  text: { color: "#fff", fontWeight: "bold" },

  bottomButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bottomButton: {
    backgroundColor: "#000",
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 10,
  },
  bottomButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 25,
  },
});