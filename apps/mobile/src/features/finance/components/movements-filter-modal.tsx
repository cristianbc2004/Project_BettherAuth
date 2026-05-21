import { Modal, Pressable, View } from "react-native";

import type { MovementToneFilter } from "@/features/finance/lib/movements-list";
import { AppText } from "@/shared/components/ui/app-text";
import { useAppTheme } from "@/shared/lib/theme-context";

type MovementsFilterModalProps = {
  draftTone: MovementToneFilter;
  onApply: () => void;
  onClose: () => void;
  onDraftToneChange: (value: MovementToneFilter) => void;
  visible: boolean;
};

const toneOptions: Array<{ label: string; value: MovementToneFilter }> = [
  { label: "All", value: "all" },
  { label: "Income", value: "income" },
  { label: "Expenses", value: "expense" },
];

export function MovementsFilterModal({
  draftTone,
  onApply,
  onClose,
  onDraftToneChange,
  visible,
}: MovementsFilterModalProps) {
  const { theme } = useAppTheme();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end px-5 pb-7">
        <Pressable
          accessibilityLabel="Close filters"
          className="absolute inset-0"
          onPress={onClose}
          style={{ backgroundColor: "rgba(7, 10, 18, 0.45)" }}
        />
        <View
          className="rounded-[24px] border px-5 pb-5 pt-5"
          style={{ backgroundColor: theme.backgroundElevated, borderColor: theme.border }}
        >
          <View className="flex-row items-center justify-between">
            <AppText variant="sectionTitle">
              Filters
            </AppText>
            <Pressable onPress={onClose}>
              <AppText className="text-[13px] font-semibold" tone="muted">
                Close
              </AppText>
            </Pressable>
          </View>

          <View className="mt-5">
            <AppText className="tracking-[1px]" tone="primary" variant="eyebrow">
              Type
            </AppText>
            <View className="mt-4 gap-2">
              {toneOptions.map((option) => (
                <Pressable
                  className="rounded-[16px] px-4 py-3.5"
                  key={option.value}
                  onPress={() => onDraftToneChange(option.value)}
                  style={{ backgroundColor: draftTone === option.value ? theme.primary : theme.background }}
                >
                  <AppText className="text-[14px] font-bold">
                    {option.label}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mt-6 flex-row gap-3 border-t pt-4" style={{ borderColor: theme.border }}>
            <Pressable
              className="flex-1 items-center rounded-[16px] px-4 py-4"
              onPress={onClose}
              style={{ backgroundColor: theme.background }}
            >
              <AppText className="text-[14px] font-bold">
                Cancel
              </AppText>
            </Pressable>
            <Pressable
              className="flex-1 items-center rounded-[16px] px-4 py-4"
              onPress={onApply}
              style={{ backgroundColor: theme.primary }}
            >
              <AppText className="text-[14px] font-bold">
                Apply
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
