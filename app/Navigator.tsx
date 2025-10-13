import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import Index from "./index";
import PopupScreen from "./popup";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Map">
        <Stack.Screen
          name="Map"
          component={Index}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PopupScreen"
          component={PopupScreen}
          options={{ title: "Location Details" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
