import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../util/AuthContext";

export default function IndexRedirect() {
  const { loaded, token } = useAuth();

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (token) {
    return <Redirect href="/screens/map" />;
  } else {
    return <Redirect href="/screens/login" />;
  }
}