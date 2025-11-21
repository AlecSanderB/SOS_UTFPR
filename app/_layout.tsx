import { Stack } from "expo-router";
import { AuthProvider } from "./AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="screens" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}