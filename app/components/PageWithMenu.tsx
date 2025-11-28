import React, { ReactNode } from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "../../util/ThemeContext";
import AnimatedMenu from "./AnimatedMenu";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: ViewStyle;
};

export default function PageWithMenu({ children, scroll = true, contentContainerStyle }: Props) {
  const { theme } = useTheme();

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        contentContainerStyle,
        { flexGrow: 1 },
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, contentContainerStyle]}>{children}</View>
  );

  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
      {content}
      <AnimatedMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    paddingTop: 120,
    paddingHorizontal: 20,
  },
});