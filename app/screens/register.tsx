import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Dropdown from "../components/Dropdown";
import LabeledInput from "../components/LabeledInput";
import LabeledPasswordInput from "../components/LabeledPasswordInput";
import PrimaryButton from "../components/PrimaryButton";
import { supabase } from "../supabase";
import { useTheme } from "../ThemeContext";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (nome.trim().length < 2) return "O nome precisa ter pelo menos 2 caracteres.";
    if (!/^[^@]+@[^@]+\w+$/.test(email)) return "Digite um e-mail válido.";
    if (senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
    if (phone && !/^\d+$/.test(phone)) return "O telefone deve conter apenas números.";
    return null;
  };

  const handleRegister = async () => {
    const validationError = validateInputs();
    if (validationError) return Alert.alert("Erro", validationError);

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Criar Conta</Text>

      <LabeledInput label="Nome" value={nome} onChangeText={setNome} />

      <LabeledInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <LabeledPasswordInput label="Senha" value={senha} onChangeText={setSenha} />

      <Dropdown
        label="Tipo sanguíneo (opcional)"
        value={bloodType}
        options={BLOOD_TYPES}
        onChange={setBloodType}
      />

      <LabeledInput
        label="Telefone (opcional)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <PrimaryButton title="Registrar" loading={loading} onPress={handleRegister} />

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={[styles.link, { color: theme.colors.primary }]}>Já tenho uma conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 20, fontWeight: "bold" },
  link: { marginTop: 20, textAlign: "center", fontWeight: "600" },
});