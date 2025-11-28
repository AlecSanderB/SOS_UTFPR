import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../util/ThemeContext";

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function LabeledPasswordInput({
  label,
  value,
  onChangeText,
  placeholder = "",
}: Props) {
  const { theme } = useTheme();
  const [secure, setSecure] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.disabled}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Text style={[styles.toggle, { color: theme.colors.primary }]}>
            {secure ? "Mostrar" : "Ocultar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontWeight: "600", marginBottom: 5 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: { flex: 1, paddingVertical: 12 },
  toggle: { marginLeft: 10, fontWeight: "600" },
});