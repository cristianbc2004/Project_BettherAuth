import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

type AuthSubmitButtonProps = {
  isPending: boolean;
  label: string;
  onPress: () => void;
};

export function AuthSubmitButton({ isPending, label, onPress }: AuthSubmitButtonProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: isPending, disabled: isPending }}
      disabled={isPending}
      onPress={onPress}
      style={{ marginTop: 16, width: "100%" }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: theme.primary,
          borderCurve: "continuous",
          borderRadius: 999,
          boxShadow: `0 10px 18px ${theme.primarySoft}`,
          flexDirection: "row",
          justifyContent: "center",
          minHeight: 56,
          paddingHorizontal: 20,
        }}
      >
        {isPending ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : null}
        <Text
          style={{
            color: theme.textOnPrimary,
            fontSize: 16,
            fontWeight: "600",
            marginLeft: isPending ? 12 : 0,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
