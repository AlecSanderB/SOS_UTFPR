import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Define routes with path and icon
const routeMap = {
  map: { path: "/screens/map", icon: { lib: MaterialIcons, name: "map" } },
  profile: { path: "/screens/profile", icon: { lib: FontAwesome5, name: "user" } },
  settings: { path: "/screens/settings", icon: { lib: MaterialIcons, name: "settings" } },
  emergencies: { path: "/screens/emergencies", icon: { lib: MaterialIcons, name: "warning" } },
} as const;

type RouteKeys = keyof typeof routeMap;

export default function AnimatedMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;
    Animated.timing(menuAnim, {
      toValue,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const navigateTo = (screen: RouteKeys) => {
    if (routeMap[screen].path === pathname) return; // Already on this screen
    setMenuOpen(false);
    Animated.timing(menuAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    router.push({ pathname: routeMap[screen].path });
  };

  const menuScale = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const menuOpacity = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Text style={styles.menuButtonText}>{menuOpen ? "×" : "☰"}</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.menuOptions, { transform: [{ scale: menuScale }], opacity: menuOpacity }]}>
        {Object.entries(routeMap).map(([key, route]) => {
          const isActive = route.path === pathname;
          const IconComponent = route.icon.lib;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.menuOption, isActive && styles.activeOption]}
              onPress={() => navigateTo(key as RouteKeys)}
              disabled={isActive}
            >
              <IconComponent
                name={route.icon.name}
                size={20}
                color={isActive ? "#999" : "#333"}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.menuText, isActive && styles.activeText]}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: { position: "absolute", top: 50, left: 20, alignItems: "flex-start", zIndex: 1000 },
  menuButton: {
    backgroundColor: "#fff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  menuButtonText: { color: "#000", fontSize: 28, fontWeight: "bold" },
  menuOptions: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  menuOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: { fontSize: 16, fontWeight: "600", color: "#333" },
  activeOption: { backgroundColor: "#e0e0e0" },
  activeText: { color: "#999" },
});