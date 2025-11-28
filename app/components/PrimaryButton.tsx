import React from "react";
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "../../util/ThemeContext";

interface Props {
  title: string;
  loading?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function PrimaryButton({ title, loading = false, onPress, style }: Props) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.colors.primary }, style]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.text} />
      ) : (
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 16,
  },
});