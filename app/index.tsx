import {
  Camera,
  CameraRef,
  LineLayer,
  MapView,
  PointAnnotation,
  ShapeSource,
} from "@maplibre/maplibre-react-native";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const cameraRef = useRef<CameraRef>(null);
  const geojson = require("../assets/map.json");

  const startingCenter: [number, number] = [-53.0964, -25.705];
  const minZoom = 15;
  const maxZoom = 18;

  const [centerCoords, setCenterCoords] = useState<[number, number]>(startingCenter);
  const [markerCoords, setMarkerCoords] = useState<[number, number] | null>(null);

  const handleMapPress = (event: any) => {
    const coords = event.geometry.coordinates as [number, number];
    setMarkerCoords(coords);
  };

  const goToPopup = () => {
    router.push("/popup");
  };

  return (
    <View style={styles.page}>
      <MapView
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
            centerCoordinate: startingCenter,
            zoomLevel: minZoom,
            animationDuration: 0,
          });
        }}
      >
        <ShapeSource id="geojson-source" shape={geojson}>
          <LineLayer id="lines" style={{ lineColor: "#007cbf", lineWidth: 2 }} />
        </ShapeSource>

        <Camera ref={cameraRef} minZoomLevel={minZoom} maxZoomLevel={maxZoom} />

        {markerCoords && (
          <PointAnnotation id="selected-marker" coordinate={markerCoords}>
            <View style={styles.marker} />
          </PointAnnotation>
        )}
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

const styles = StyleSheet.create({
  page: { flex: 1 },
  map: { flex: 1 },
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
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#000",
    borderWidth: 2,
    borderColor: "#fff",
  },
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
