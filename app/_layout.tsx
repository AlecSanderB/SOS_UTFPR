import { Stack } from "expo-router";
import { AuthProvider } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="screens" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
