import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="login">
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: "Registrar" }} />
      <Stack.Screen name="map" options={{ headerShown: false }} />
      <Stack.Screen name="popup" options={{ title: "Emergência" }} />
    </Stack>
  );
}