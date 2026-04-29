import { Image, Pressable } from "react-native";

import { selectionHaptic } from "@/shared/lib/haptics";
import { backOrReplace } from "@/shared/lib/navigation";
import { useAppTheme } from "@/shared/lib/theme-context";

type AppBackButtonProps = {
  accessibilityLabel?: string;
  fallbackHref: Parameters<typeof backOrReplace>[0];
};

const backIcon = require("../../../../assets/back.png");

export function AppBackButton({
  accessibilityLabel = "Go back",
  fallbackHref,
}: AppBackButtonProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="h-11 w-11 items-center justify-center"
      hitSlop={10}
      onPress={() => {
        selectionHaptic();
        backOrReplace(fallbackHref);
      }}
    >
      <Image
        className="h-6 w-6"
        resizeMode="contain"
        source={backIcon}
        style={{ tintColor: theme.text }}
      />
    </Pressable>
  );
}
