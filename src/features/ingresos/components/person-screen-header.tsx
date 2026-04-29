import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Home } from "lucide-react-native";

import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

type PersonScreenHeaderProps = {
  title: string;
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
        className="h-12 w-12 items-center justify-center"
        hitSlop={10}
        onPress={() => {
          selectionHaptic();
          router.navigate("/home" as never);
        }}
      >
        <Home color={theme.text} size={25} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}
