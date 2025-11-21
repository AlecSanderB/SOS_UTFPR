import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../AuthContext";
import { supabase } from "../supabase";

export default function PopupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ latitude: string; longitude: string }>();

  // Parse your coordinates from params
  const latitude = parseFloat(params.latitude);
  const longitude = parseFloat(params.longitude);

  const { token } = useAuth();
  const [natureza, setNatureza] = useState("");
  const [infoAdicional, setInfoAdicional] = useState("");

  const handleClose = () => router.back();

  const handleCallSamu = async () => {
    if (!token) {
      Alert.alert("Erro", "Você precisa estar logado para registrar uma emergência.");
      return;
    }
    if (!natureza.trim()) {
      Alert.alert("Erro", "Descreva a natureza da emergência.");
      return;
    }

    try {
      const { error } = await supabase.functions.invoke("create-emergency", {
        headers: { Authorization: `Bearer ${token}` },
        body: {
          latitude,
          longitude,
          nature_of_emergency: natureza,
          additional_info: infoAdicional || null,
        },
      });

      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }

      Alert.alert("Sucesso", "Emergência registrada!");
      router.back();
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Ocorreu um erro inesperado.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.topButton} onPress={handleClose}>
          <Text style={styles.topButtonText}>Mudar Localização</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.label}>Natureza da Emergência</Text>
          <TextInput
            style={styles.textInput}
            multiline
            value={natureza}
            onChangeText={setNatureza}
            placeholder="Descreva a emergência"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Informações Adicionais</Text>
          <TextInput
            style={styles.textInput}
            multiline
            value={infoAdicional}
            onChangeText={setInfoAdicional}
            placeholder="Nome, Tipo Sanguíneo, Alergias, etc."
          />
        </View>
        <TouchableOpacity style={styles.bottomButton} onPress={handleCallSamu}>
          <Text style={styles.bottomButtonText}>Chamar SAMU</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 20, justifyContent: "flex-start" },
  topButton: {
    backgroundColor: "#555",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  topButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  section: { marginBottom: 20 },
  label: { fontWeight: "bold", marginBottom: 6, fontSize: 14 },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    minHeight: 150,
    textAlignVertical: "top",
  },
  bottomButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  bottomButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  coordinatesText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
});