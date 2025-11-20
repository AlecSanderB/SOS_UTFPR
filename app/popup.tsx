import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "./supabase";

export default function Popup() {
  const router = useRouter();
  const { latitude, longitude } = useLocalSearchParams();

  const lat = latitude ? parseFloat(latitude as string) : null;
  const lng = longitude ? parseFloat(longitude as string) : null;

  const [natureza, setNatureza] = useState("");
  const [infoAdicional, setInfoAdicional] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCallSamu = async () => {
    if (!lat || !lng) {
      Alert.alert("Erro", "Coordenadas inválidas.");
      return;
    }

    if (!natureza.trim()) {
      Alert.alert("Erro", "Descreva a natureza da emergência.");
      return;
    }

    setLoading(true);

    try {
      // invoke automatically includes the user's auth token from supabase.auth
      const { data, error } = await supabase.functions.invoke("create-emergency", {
        body: {
          latitude: lat,
          longitude: lng,
          nature_of_emergency: natureza,
          additional_info: infoAdicional,
        },
      });

      if (error) {
        console.error("Invoke error:", error);
        Alert.alert("Erro", error.message || "Não foi possível registrar a ocorrência.");
        setLoading(false);
        return;
      }

      Alert.alert("Sucesso", "Emergência registrada com sucesso!");
      router.back();
    } catch (err) {
      console.error("Unexpected invoke error:", err);
      Alert.alert("Erro", "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Emergência</Text>

      <Text style={styles.label}>Natureza da emergência</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Acidente, incêndio, mal súbito..."
        value={natureza}
        onChangeText={setNatureza}
      />

      <Text style={styles.label}>Informações adicionais</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        placeholder="Opcional"
        value={infoAdicional}
        onChangeText={setInfoAdicional}
      />

      <TouchableOpacity style={styles.button} onPress={handleCallSamu} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Enviando..." : "Confirmar Emergência"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#d93025",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancel: {
    marginTop: 15,
    alignItems: "center",
  },
  cancelText: {
    color: "#333",
    fontSize: 15,
  },
});
[]