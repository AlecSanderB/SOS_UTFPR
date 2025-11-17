import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "./supabase";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RegisterScreen() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBloodModal, setShowBloodModal] = useState(false);

  const validateInputs = () => {
    if (nome.trim().length < 2) {
      return "O nome precisa ter pelo menos 2 caracteres.";
    }

    const emailPattern = /^[^@]+@[^@]+\w+$/;
    if (!emailPattern.test(email)) {
      return "Digite um e-mail válido.";
    }

    if (senha.length < 6) {
      return "A senha precisa ter pelo menos 6 caracteres.";
    }

    if (phone && !/^\d+$/.test(phone)) {
      return "O telefone deve conter apenas números.";
    }

    return null;
  };

  const handleRegister = async () => {
    const validationError = validateInputs();
    if (validationError) {
      Alert.alert("Erro", validationError);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("register", {
        body: { nome, email, senha, blood_type: bloodType, phone },
      });

      if (error) {
        Alert.alert("Erro", error.message || "Falha ao registrar.");
      } else {
        Alert.alert("Sucesso", "Conta criada com sucesso!");
        router.back();
      }
    } catch {
      Alert.alert("Erro", "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#999"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#999"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowBloodModal(true)}
      >
        <Text style={{ color: bloodType ? "#000" : "#999" }}>
          {bloodType || "Tipo sanguíneo (opcional)"}
        </Text>
      </TouchableOpacity>

      <Modal visible={showBloodModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Selecione o tipo sanguíneo</Text>

            <FlatList
              data={BLOOD_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setBloodType(item);
                    setShowBloodModal(false);
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              onPress={() => setShowBloodModal(false)}
              style={styles.modalClose}
            >
              <Text style={{ color: "red" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TextInput
        style={styles.input}
        placeholder="Telefone (opcional)"
        placeholderTextColor="#999"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Já tenho uma conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 20, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { marginTop: 20, textAlign: "center", color: "blue" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
  },
  modalItem: {
    paddingVertical: 12,
  },
  modalClose: {
    paddingTop: 12,
    alignItems: "center",
  },
});
