import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../util/AuthContext";
import { supabase } from "../../util/supabase";
import { useTheme } from "../../util/ThemeContext";
import LabeledInput from "../components/LabeledInput";
import PasswordInput from "../components/LabeledPasswordInput";
import PrimaryButton from "../components/PrimaryButton";
import ThemedAlert from "../components/ThemedAlert";

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string | undefined>();
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (message: string, title?: string) => {
    setAlertMessage(message);
    setAlertTitle(title);
    setAlertVisible(true);
  };

  const validateInputs = () => {
    if (!/^[^@]+@[^@]+\w+$/.test(email)) return "Digite um e-mail válido.";
    if (senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
    return null;
  };

  const handleLogin = async () => {
    const errorMsg = validateInputs();
    if (errorMsg) return showAlert(errorMsg, "Erro");

    setLoading(true);
    try {
      const response = await supabase.functions.invoke("login", { body: { email, senha } });
      const result = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

      if (result?.error || response.error) {
        return showAlert(result?.error || response.error?.message || "Falha ao fazer login.", "Erro");
      }

      if (!result?.session || !result?.user) {
        console.error("Unexpected login response:", result);
        return showAlert("Falha ao fazer login. Resposta inesperada do servidor.", "Erro");
      }

      const { access_token, refresh_token, expires_in } = result.session;

      if (!access_token || !refresh_token) {
        console.error("Missing tokens in session:", result.session);
        return showAlert("Falha ao fazer login. Tokens ausentes.", "Erro");
      }

      await setAuth(access_token, refresh_token, result.user.id, expires_in);

      router.replace("/screens/map");
    } catch (err: any) {
      showAlert(err?.message || "Ocorreu um erro inesperado.", "Erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Entrar</Text>

      <LabeledInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <PasswordInput
        label="Senha"
        value={senha}
        onChangeText={setSenha}
      />

      <PrimaryButton
        title={loading ? "Entrando..." : "Entrar"}
        loading={loading}
        onPress={handleLogin}
      />

      <TouchableOpacity onPress={() => router.push("/screens/register")}>
        <Text style={[styles.link, { color: theme.colors.primary }]}>Criar uma conta</Text>
      </TouchableOpacity>

      <ThemedAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 20, fontWeight: "bold" },
  link: { marginTop: 20, textAlign: "center" },
});