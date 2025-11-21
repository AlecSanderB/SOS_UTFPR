import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Screen name="login" />
      <Stack.Screen name="register" options={{ title: "Registrar" }} />

      <Stack.Screen name="map" />
      <Stack.Screen name="popup" options={{ title: "Emergência" }} />

      <Stack.Screen name="profile" options={{ title: "Perfil" }} />
      <Stack.Screen name="settings" options={{ title: "Configurações" }} />
      <Stack.Screen name="emergencies" options={{ title: "Emergências" }} />
    </Stack>
  );
}
