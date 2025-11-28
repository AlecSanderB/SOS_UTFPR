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
import { useAuth } from "../../util/AuthContext";
import { supabase } from "../../util/supabase";
import { useTheme } from "../../util/ThemeContext";
import ThemedAlert from "../components/ThemedAlert";

export default function PopupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ latitude: string; longitude: string }>();

  const latitude = parseFloat(params.latitude);
  const longitude = parseFloat(params.longitude);

  const { token } = useAuth();
  const { theme, isDark } = useTheme();

  const [natureza, setNatureza] = useState("");
  const [infoAdicional, setInfoAdicional] = useState("");

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
      return showAlert(
        "Você precisa estar logado para registrar uma emergência.",
        "Erro"
      );
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

      if (error) return showAlert(error.message, "Erro");

      showAlert("Emergência registrada!", "Sucesso");
      router.back();
    } catch (err: any) {
      showAlert(err?.message || "Ocorreu um erro inesperado.", "Erro");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {/* Top Button */}
        <TouchableOpacity
          style={[
            styles.topButton,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: isDark ? "#000000AA" : "#555",
            },
          ]}
          onPress={handleClose}
        >
          <Text
            style={[
              styles.topButtonText,
              { color: theme.colors.text },
            ]}
          >
            Mudar Localização
          </Text>
        </TouchableOpacity>

        {/* Natureza */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Natureza da Emergência
          </Text>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            multiline
            value={natureza}
            onChangeText={setNatureza}
            placeholder="Descreva a emergência"
            placeholderTextColor={theme.colors.disabled}
            textAlignVertical="top"
          />
        </View>

        {/* Informações Adicionais */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Informações Adicionais
          </Text>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            multiline
            value={infoAdicional}
            onChangeText={setInfoAdicional}
            placeholder="Nome, Tipo Sanguíneo, Alergias, etc."
            placeholderTextColor={theme.colors.disabled}
            textAlignVertical="top"
          />
        </View>

        {/* Bottom Button */}
        <TouchableOpacity
          style={[
            styles.bottomButton,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: isDark ? "#000000AA" : "#555",
            },
          ]}
          onPress={handleCallSamu}
        >
          <Text
            style={[
              styles.bottomButtonText,
              { color: theme.colors.text },
            ]}
          >
            Chamar SAMU
          </Text>
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

  scroll: {
    padding: 20,
    paddingBottom: 50,
  },

  topButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 25,
    alignItems: "center",
    elevation: 3,
  },

  topButtonText: {
    fontWeight: "700",
    fontSize: 16,
  },

  section: {
    marginBottom: 22,
  },

  label: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 15,
  },

  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
  },

  bottomButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },

  bottomButtonText: {
    fontWeight: "bold",
    fontSize: 17,
  },
});