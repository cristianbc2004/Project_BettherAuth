import { ChevronLeft } from "lucide-react-native";
import { Pressable } from "react-native";

import { selectionHaptic } from "@/shared/lib/haptics";
import { backOrReplace } from "@/shared/lib/navigation";
import { useAppTheme } from "@/shared/lib/theme-context";

type AppBackButtonProps = {
  accessibilityLabel?: string;
  fallbackHref: Parameters<typeof backOrReplace>[0];
};

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
      <ChevronLeft color={theme.text} size={24} strokeWidth={2.4} />
    </Pressable>
  );
}
