import React from "react";
import { StyleSheet, Text } from "react-native";
import { useTheme } from "../../util/ThemeContext";

export default function SectionTitle({ children }: { children: string }) {
  const { theme } = useTheme();

  return <Text style={[styles.title, { color: theme.colors.text }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 20,
  },
});