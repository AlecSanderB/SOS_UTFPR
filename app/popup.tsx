import { useRouter } from "expo-router";
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

export default function PopupScreen() {
  const router = useRouter();
  const [natureza, setNatureza] = useState("");
  const [infoAdicional, setInfoAdicional] = useState("");

  const handleClose = () => {
    router.back();
  };

  const handleCallSamu = () => {
    // PLACEHOLDER
    alert("Chamando SAMU...");
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
    justifyContent: "flex-start",
  },
  topButton: {
    backgroundColor: "#555",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  topButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 14,
  },
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
  bottomButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
