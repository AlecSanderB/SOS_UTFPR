import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../ThemeContext";

const routeMap = {
  map: { path: "/screens/map", icon: { lib: MaterialIcons, name: "map" } },
  profile: { path: "/screens/profile", icon: { lib: FontAwesome5, name: "user" } },
  settings: { path: "/screens/settings", icon: { lib: MaterialIcons, name: "settings" } },
  emergencies: { path: "/screens/emergencies", icon: { lib: MaterialIcons, name: "warning" } },
} as const;

type RouteKeys = keyof typeof routeMap;

const SCREEN_WIDTH = Dimensions.get("window").width;

const AnimatedMenu = forwardRef((_, ref) => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();

  useImperativeHandle(ref, () => ({
    open: () => setMenuOpen(true),
    close: () => setMenuOpen(false),
    toggle: () => setMenuOpen((v) => !v),
  }));

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
    if (routeMap[screen].path === pathname) return;
    setMenuOpen(false);
    Animated.timing(menuAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    router.push(routeMap[screen].path);
  };

  const menuScale = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const menuOpacity = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const disabledColor = theme.colors.disabled ?? "#888";

  return (
    <View style={styles.absoluteContainer}>
      <TouchableOpacity
        style={[styles.menuButton, { backgroundColor: theme.colors.card }]}
        onPress={toggleMenu}
      >
        <Text style={[styles.menuButtonText, { color: theme.colors.text }]}>
          {menuOpen ? "×" : "☰"}
        </Text>
      </TouchableOpacity>

      <View
        pointerEvents={menuOpen ? "auto" : "none"}
        style={styles.menuWrapper}
      >
        <Animated.View
          style={[
            styles.menuOptions,
            {
              width: SCREEN_WIDTH * 0.4,
              transform: [{ scale: menuScale }],
              opacity: menuOpacity,
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {Object.entries(routeMap).map(([key, route]) => {
            const isActive = route.path === pathname;
            const IconComponent = route.icon.lib;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.menuOption,
                  { borderBottomColor: theme.colors.border },
                  isActive && { backgroundColor: theme.colors.border },
                ]}
                onPress={() => navigateTo(key as RouteKeys)}
                disabled={isActive}
              >
                <IconComponent
                  name={route.icon.name}
                  size={20}
                  color={isActive ? disabledColor : theme.colors.text}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.menuText, { color: isActive ? disabledColor : theme.colors.text }]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>
    </View>
  );
});

export default AnimatedMenu;

const styles = StyleSheet.create({
  absoluteContainer: { 
    position: "absolute", 
    top: 30, 
    left: 0, 
    width: "100%",
    zIndex: 1000,
    alignItems: "flex-start"
  },
  menuButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  menuButtonText: { fontSize: 28, fontWeight: "bold" },
  menuWrapper: { marginTop: 70, left: 20, position: "absolute" }, 
  menuOptions: {
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
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  menuText: { fontSize: 16, fontWeight: "600" },
});