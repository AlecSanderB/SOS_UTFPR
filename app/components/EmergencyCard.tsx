import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../ThemeContext";

type Emergency = {
  id: string;
  latitude: number;
  longitude: number;
  nature_of_emergency: string;
  additional_info: string | null;
  status: "pending" | "resolved" | "rejected" | string;
  created_at: string;
};

export default function EmergencyCard({ item }: { item: Emergency }) {
  const { theme } = useTheme();

  let statusColor = "#f0ad4e"; // pending
  if (item.status === "resolved") statusColor = "#4CAF50";
  else if (item.status === "rejected") statusColor = "#f44336";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{item.nature_of_emergency}</Text>
      {item.additional_info && <Text style={[styles.info, { color: theme.colors.text }]}>{item.additional_info}</Text>}
      <Text style={[styles.status, { color: statusColor }]}>Status: {item.status}</Text>
      <Text style={[styles.date, { color: theme.colors.text }]}>{new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 5 },
  info: { fontSize: 14, marginBottom: 5 },
  status: { fontSize: 14, fontWeight: "600", marginBottom: 5 },
  date: { fontSize: 12 },
});