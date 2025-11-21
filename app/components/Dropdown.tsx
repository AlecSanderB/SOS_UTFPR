import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../ThemeContext";

type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export default function Dropdown({ label, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>

      <TouchableOpacity
        style={[styles.dropdown, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.valueText, { color: value ? theme.colors.text : "#999" }]}>
          {value || "Selecione"}
        </Text>
        <Text style={[styles.arrow, { color: "#999" }]}>▼</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Selecione</Text>

            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  <Text style={{ color: theme.colors.text }}>{item}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.close} onPress={() => setOpen(false)}>
              <Text style={{ color: "red" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  label: { fontWeight: "600", marginBottom: 5 },
  dropdown: {
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    elevation: 0,
    shadowColor: "transparent",
  },
  valueText: {
    fontSize: 16,
    flex: 1,
  },
  arrow: { fontSize: 16, marginLeft: 10 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  item: {
    paddingVertical: 12,
  },
  close: {
    paddingTop: 12,
    alignItems: "center",
  },
});