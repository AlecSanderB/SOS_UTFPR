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
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "../../util/ThemeContext";
import AnimatedMenu from "../components/AnimatedMenu";

async function getLocationWithTimeout(options: any, timeoutMs: number) {
  return Promise.race([
    Location.getCurrentPositionAsync(options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("LOCATION_TIMEOUT")), timeoutMs)
    ),
  ]);
}

export default function MapScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const cameraRef = useRef<CameraRef>(null);
  const mapRef = useRef<any>(null);

  const geojson = require("../assets/map.json");

  const markerImage = isDark
    ? require("../assets/map-marker-2-svgrepo-com-white.png")
    : require("../assets/map-marker-2-svgrepo-com.png");

  const fallbackCenter: [number, number] = [-53.0964, -25.705];
  const defaultZoom = 15;
  const minZoom = 12;
  const maxZoom = 18;

  const [centerCoords, setCenterCoords] = useState<[number, number] | null>(null);
  const [markerCoords, setMarkerCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const zoomRef = useRef<number>(defaultZoom);
  const initializedCamera = useRef(false);

  async function loadUserLocation() {
    setLoading(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
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
    } catch (err: any) {
      setLocationError(
        err?.message === "LOCATION_TIMEOUT"
          ? "Tempo esgotado ao obter GPS. Usando localização padrão."
          : "Não foi possível obter sua localização. Usando localização padrão."
      );
      setCenterCoords(fallbackCenter);
      setMarkerCoords(fallbackCenter);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUserLocation();
  }, []);

  const handleMapPress = (event: any) => {
    const coords = event.geometry.coordinates as [number, number];
    setMarkerCoords(coords);

    cameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: zoomRef.current,
      animationDuration: 300,
    });
  };

  const handleRegionDidChange = () => {
    try {
      const zoom = mapRef.current?.getZoom();
      if (typeof zoom === "number") zoomRef.current = zoom;
    } catch (_) {}
  };

  const goToPopup = () => {
    if (!markerCoords) return;
    router.push({
      pathname: "/screens/popup",
      params: {
        longitude: markerCoords[0].toString(),
        latitude: markerCoords[1].toString(),
      },
    });
  };

  const handleResetCamera = () => {
    const targetCoords = centerCoords ?? fallbackCenter;
    zoomRef.current = defaultZoom;

    cameraRef.current?.setCamera({
      centerCoordinate: targetCoords,
      zoomLevel: defaultZoom,
      animationDuration: 500,
    });

    setMarkerCoords(targetCoords);
  };

  const mapStyle = useMemo(
    () => ({
      version: 8,
      sources: {},
      layers: [
        {
          id: "background",
          type: "background",
          paint: { "background-color": isDark ? "#121212" : "#90ca6d" },
        },
      ],
    }),
    [isDark]
  );

  if (loading || !centerCoords || !markerCoords) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Carregando mapa...</Text>

        {locationError && (
          <View style={[styles.errorBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.errorText, { color: theme.colors.text }]}>{locationError}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={loadUserLocation}
            >
              <Text style={[styles.retryButtonText, { color: theme.colors.text }]}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapStyle={mapStyle}
        onPress={handleMapPress}
        onRegionDidChange={handleRegionDidChange}
        onDidFinishLoadingMap={() => {
          if (!initializedCamera.current && centerCoords) {
            cameraRef.current?.setCamera({
              centerCoordinate: centerCoords,
              zoomLevel: zoomRef.current,
              animationDuration: 250,
            });
            initializedCamera.current = true;
          }
        }}
      >
        <Images images={{ marker: markerImage }} />

        <ShapeSource id="geojson-source" shape={geojson}>
          <FillLayer
            id="buildings"
            filter={["==", ["geometry-type"], "Polygon"]}
            style={{
              fillColor: isDark ? "#444" : "#9b9b9b",
              fillOutlineColor: isDark ? "#222" : "#333",
              fillOpacity: 0.6,
            }}
          />
          <LineLayer
            id="roads"
            filter={["==", ["geometry-type"], "LineString"]}
            style={{ lineColor: isDark ? "#ffb74d" : "#e99a3a", lineWidth: 3 }}
          />
        </ShapeSource>

        {markerCoords && (
          <ShapeSource
            id="marker-source"
            shape={{
              type: "FeatureCollection",
              features: [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: markerCoords } }],
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
        <>
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={[styles.bottomButton, { backgroundColor: "#ff5b5b" }]}
              onPress={goToPopup}
            >
              <Text style={[styles.bottomButtonText, { color: "#fff" }]}>Sinalizar Emergência</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.resetButton,
              {
                backgroundColor: theme.colors.card, 
                elevation: 0,
                shadowColor: "transparent",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0,
                shadowRadius: 0,
              },
            ]}
            onPress={handleResetCamera}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: "bold",
                fontSize: 40,
                textAlign: "center",
                textAlignVertical: "center",
                lineHeight: 32,
              }}
            >
              ⊚
            </Text>
          </TouchableOpacity>

        </>
      )}

      <AnimatedMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, gap: 20 },
  loadingText: { fontSize: 16, marginTop: 10 },
  errorBox: { marginTop: 20, padding: 15, borderRadius: 10, width: "100%", alignItems: "center", borderWidth: 1 },
  errorText: { textAlign: "center", marginBottom: 10 },
  retryButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  retryButtonText: { fontWeight: "bold" },
  bottomButtonContainer: { position: "absolute", bottom: 40, left: 0, right: 0, alignItems: "center" },
  bottomButton: { paddingVertical: 20, paddingHorizontal: 60, borderRadius: 12 },
  bottomButtonText: { fontWeight: "bold", textAlign: "center", fontSize: 25 },
  resetButton: {
    position: "absolute",
    bottom: 150,
    right: 25,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});