import { Pressable, TextInput, View } from "react-native";
import { Filter, Search } from "lucide-react-native";

import { AppText } from "@/shared/components/ui/app-text";
import { useAppTheme } from "@/shared/lib/theme-context";

type MovementsToolbarProps = {
  hasActiveFilters: boolean;
  onOpenFilters: () => void;
  onSearchQueryChange: (value: string) => void;
  searchQuery: string;
};

export function MovementsToolbar({
  hasActiveFilters,
  onOpenFilters,
  onSearchQueryChange,
  searchQuery,
}: MovementsToolbarProps) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-row gap-3">
      <View className="flex-1 flex-row items-center rounded-[22px] px-4 py-4" style={{ backgroundColor: theme.card }}>
        <Search color={theme.mutedText} size={20} strokeWidth={2.3} />
        <TextInput
          className="ml-3 flex-1 text-[14px] font-semibold"
          onChangeText={onSearchQueryChange}
          placeholder="Search movement"
          placeholderTextColor={theme.mutedText}
          selectionColor={theme.primary}
          style={{ color: theme.text }}
          value={searchQuery}
        />
      </View>
      <Pressable
        accessibilityLabel="Open movement filters"
        className="h-[54px] w-[54px] items-center justify-center rounded-[22px]"
        onPress={onOpenFilters}
        style={{ backgroundColor: hasActiveFilters ? theme.primary : theme.card }}
      >
        <Filter color={theme.text} size={21} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}
