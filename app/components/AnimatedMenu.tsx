import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../util/ThemeContext";

const routeMap = {
  map: { path: "/screens/map", icon: { lib: MaterialIcons, name: "map", label: "Mapa" } },
  profile: { path: "/screens/profile", icon: { lib: FontAwesome5, name: "user", label: "Perfil" } },
  settings: { path: "/screens/settings", icon: { lib: MaterialIcons, name: "settings", label: "Configurações" } },
  emergencies: { path: "/screens/emergencies", icon: { lib: MaterialIcons, name: "warning", label: "Emergências" } },
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
    open: () => openMenu(),
    close: () => closeMenu(),
    toggle: () => (menuOpen ? closeMenu() : openMenu()),
  }));

  const openMenu = () => {
    setMenuOpen(true);
    Animated.timing(menuAnim, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setMenuOpen(false));
  };

  const navigateTo = (screen: RouteKeys) => {
    if (routeMap[screen].path === pathname) return;
    closeMenu();
    router.push(routeMap[screen].path);
  };

  const menuScale = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const menuOpacity = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const disabledColor = theme.colors.disabled ?? "#888";

  return (
    <View style={styles.fullScreenContainer} pointerEvents="box-none">
      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeMenu}
        />
      )}

      <TouchableOpacity
        style={[styles.menuButton, { backgroundColor: theme.colors.card }]}
        onPress={() => (menuOpen ? closeMenu() : openMenu())}
      >
        <Text style={[styles.menuButtonText, { color: theme.colors.text }]}>
          {menuOpen ? "×" : "☰"}
        </Text>
      </TouchableOpacity>

      <View pointerEvents={menuOpen ? "auto" : "none"} style={styles.menuWrapper}>
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
                <Text
                  style={[
                    styles.menuText,
                    { color: isActive ? disabledColor : theme.colors.text },
                  ]}
                >
                  {route.icon.label}
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
  fullScreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 2000,
    alignItems: "flex-start",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 1999,
  },

  menuButton: {
    zIndex: 2001,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginLeft: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },

  menuButtonText: {
    fontSize: 28,
    fontWeight: "bold",
  },

  menuWrapper: {
    marginTop: 100,
    left: 20,
    position: "absolute",
    zIndex: 2002,
  },

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

  menuText: {
    fontSize: 16,
    fontWeight: "600",
  },
});