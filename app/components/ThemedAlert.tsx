import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../ThemeContext";

interface Props {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export default function ThemedAlert({ visible, title, message, onClose }: Props) {
  const { theme } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {title && <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>}
          <Text style={[styles.message, { color: theme.colors.text }]}>{message}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={{ color: theme.colors.card, fontWeight: "bold" }}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  message: { fontSize: 16, marginBottom: 20 },
  button: { paddingVertical: 12, borderRadius: 8, alignItems: "center" },
});