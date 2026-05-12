import { type ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";

import { FLOATING_TAB_BAR_HEIGHT, useFloatingTabBarMetrics } from "@/shared/lib/floating-tab-bar";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

type ExpoTabsProps = ComponentProps<typeof Tabs>;
type AppFloatingTabBarProps = Parameters<NonNullable<ExpoTabsProps["tabBar"]>>[0];

const BAR_HORIZONTAL_OFFSET = 32;
const BAR_HORIZONTAL_PADDING = 8;
const ICON_SIZE = 22;

export function AppFloatingTabBar({ descriptors, navigation, state }: AppFloatingTabBarProps) {
  const { theme } = useAppTheme();
  const { bottomOffset } = useFloatingTabBarMetrics();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          bottom: bottomOffset,
          left: BAR_HORIZONTAL_OFFSET,
          right: BAR_HORIZONTAL_OFFSET,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const options = descriptors[route.key].options;
        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : options.title ?? route.name;
        const color = focused ? theme.text : theme.mutedText;

        const onPress = () => {
          const event = navigation.emit({
            canPreventDefault: true,
            target: route.key,
            type: "tabPress",
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            target: route.key,
            type: "tabLongPress",
          });
        };

        return (
          <Pressable
            accessibilityLabel={options.tabBarAccessibilityLabel}
            accessibilityRole="tab"
            accessibilityState={focused ? { selected: true } : {}}
            key={route.key}
            onLongPress={onLongPress}
            onPress={onPress}
            style={styles.tab}
          >
            {options.tabBarIcon?.({
              color,
              focused,
              size: ICON_SIZE,
            })}
            <AppText numberOfLines={1} style={[styles.label, { color }]}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 36,
    borderWidth: 1,
    flexDirection: "row",
    height: FLOATING_TAB_BAR_HEIGHT,
    paddingBottom: 10,
    paddingHorizontal: BAR_HORIZONTAL_PADDING,
    paddingTop: 10,
    position: "absolute",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  tab: {
    alignItems: "center",
    borderRadius: 22,
    flex: 1,
    gap: 3,
    height: "100%",
    justifyContent: "center",
    minWidth: 0,
  },
});
