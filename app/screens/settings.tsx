import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { useTheme } from "../../util/ThemeContext";
import PageWithMenu from "../components/PageWithMenu";
import SectionTitle from "../components/SectionTitle";

const LANGUAGES = ["English", "Português", "Español", "Français"];
const STORAGE_KEY_THEME = "@app_theme";

export default function SettingsScreen() {
  const [language, setLanguage] = useState("English");
  const { theme, toggleTheme, isDark } = useTheme();
  const [darkMode, setDarkMode] = useState(isDark);

  useEffect(() => {
    setDarkMode(isDark);
  }, [isDark]);

  const handleToggleTheme = async (value: boolean) => {
    setDarkMode(value);
    toggleTheme();
    try {
      await AsyncStorage.setItem(STORAGE_KEY_THEME, value ? "dark" : "light");
    } catch (err) {
      console.error("Failed to save theme to storage", err);
    }
  };

  return (
    <PageWithMenu>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SectionTitle>Tema</SectionTitle>
        <View
          style={[
            styles.toggleRow,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>Modo escuro</Text>
          <Switch value={darkMode} onValueChange={handleToggleTheme} />
        </View>
      </View>
    </PageWithMenu>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  toggleLabel: {
    fontWeight: "600",
  },
});