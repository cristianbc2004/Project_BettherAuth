import { Text, Pressable } from "react-native";

import { selectionHaptic } from "@/shared/lib/haptics";
import { backOrReplace } from "@/shared/lib/navigation";

type AppBackButtonProps = {
  accessibilityLabel?: string;
  fallbackHref: Parameters<typeof backOrReplace>[0];
};

export function AppBackButton({
  accessibilityLabel = "Go back",
  fallbackHref,
}: AppBackButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5"
      hitSlop={10}
      onPress={() => {
        selectionHaptic();
        backOrReplace(fallbackHref);
      }}
    >
      <Text className="text-2xl text-white/80">{"<"}</Text>
    </Pressable>
  );
}
