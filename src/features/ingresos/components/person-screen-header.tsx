import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

type PersonScreenHeaderProps = {
  title: string;
};

const headerIcons = {
  home: require("../../../../assets/home.png"),
};

export function PersonScreenHeader({ title }: PersonScreenHeaderProps) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-row items-center justify-between">
      <Text className="flex-1 pr-4 text-[28px] font-bold" style={{ color: theme.text }}>
        {title}
      </Text>
      <Pressable
        accessibilityLabel="Volver a home"
        accessibilityRole="button"
        className="h-12 w-12 items-center justify-center rounded-[18px] border"
        hitSlop={10}
        onPress={() => {
          selectionHaptic();
          router.navigate("/home" as never);
        }}
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <Image
          className="h-6 w-6"
          resizeMode="contain"
          source={headerIcons.home}
          style={{ tintColor: theme.text }}
        />
      </Pressable>
    </View>
  );
}
