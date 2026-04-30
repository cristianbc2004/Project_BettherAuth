import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ArrowLeft, Home } from "lucide-react-native";

import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

type PersonScreenHeaderProps = {
  backHref?: string;
  title: string;
};

export function PersonScreenHeader({ backHref, title }: PersonScreenHeaderProps) {
  const { theme } = useAppTheme();
  const isHomeTarget = backHref === "/home";

  return (
    <View>
      <Pressable
        accessibilityLabel={isHomeTarget ? "Volver a home" : "Volver a general"}
        accessibilityRole="button"
        className="h-12 w-12 items-center justify-center"
        hitSlop={10}
        onPress={() => {
          selectionHaptic();
          router.navigate((backHref ?? "/home") as never);
        }}
      >
        {isHomeTarget ? (
          <Home color={theme.text} size={25} strokeWidth={2.4} />
        ) : (
          <ArrowLeft color={theme.text} size={25} strokeWidth={2.4} />
        )}
      </Pressable>

      <Text className="mt-3 text-[28px] font-bold" style={{ color: theme.text }}>
        {title}
      </Text>
    </View>
  );
}
