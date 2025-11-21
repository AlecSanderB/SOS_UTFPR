import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import ThemedAlert from "../components/ThemedAlert";
import { supabase } from "../supabase";
import { useTheme } from "../ThemeContext";

export default function PopupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ latitude: string; longitude: string }>();

  const latitude = parseFloat(params.latitude);
  const longitude = parseFloat(params.longitude);

  const { token } = useAuth();
  const { theme } = useTheme();

  const [natureza, setNatureza] = useState("");
  const [infoAdicional, setInfoAdicional] = useState("");

  // Themed Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string | undefined>();
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (message: string, title?: string) => {
    setAlertMessage(message);
    setAlertTitle(title);
    setAlertVisible(true);
  };

  const handleClose = () => router.back();

  const handleCallSamu = async () => {
    if (!token) {
      return showAlert("Você precisa estar logado para registrar uma emergência.", "Erro");
    }
    if (!natureza.trim()) {
      return showAlert("Descreva a natureza da emergência.", "Erro");
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
        return showAlert(error.message, "Erro");
      }

      showAlert("Emergência registrada!", "Sucesso");
      router.back();
    } catch (err: any) {
      showAlert(err?.message || "Ocorreu um erro inesperado.", "Erro");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={[styles.topButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleClose}
        >
          <Text style={[styles.topButtonText, { color: theme.colors.card }]}>Mudar Localização</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Natureza da Emergência</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
            multiline
            value={natureza}
            onChangeText={setNatureza}
            placeholder="Descreva a emergência"
            placeholderTextColor={theme.colors.text + "88"}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Informações Adicionais</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
            multiline
            value={infoAdicional}
            onChangeText={setInfoAdicional}
            placeholder="Nome, Tipo Sanguíneo, Alergias, etc."
            placeholderTextColor={theme.colors.text + "88"}
          />
        </View>

        <TouchableOpacity
          style={[styles.bottomButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleCallSamu}
        >
          <Text style={[styles.bottomButtonText, { color: theme.colors.card }]}>Chamar SAMU</Text>
        </TouchableOpacity>
      </ScrollView>

      <ThemedAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, justifyContent: "flex-start" },
  topButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 20, alignItems: "center" },
  topButtonText: { fontWeight: "bold", fontSize: 16 },
  section: { marginBottom: 20 },
  label: { fontWeight: "bold", marginBottom: 6, fontSize: 14 },
  textInput: { borderWidth: 1, borderRadius: 6, padding: 10, minHeight: 150, textAlignVertical: "top" },
  bottomButton: { paddingVertical: 16, borderRadius: 8, alignItems: "center", marginTop: 10 },
  bottomButtonText: { fontWeight: "bold", fontSize: 16 },
});