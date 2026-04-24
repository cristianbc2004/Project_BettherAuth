import { ActivityIndicator, Pressable, Text, View } from "react-native";

type AuthSubmitButtonProps = {
  isPending: boolean;
  label: string;
  onPress: () => void;
};

export function AuthSubmitButton({ isPending, label, onPress }: AuthSubmitButtonProps) {
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
          backgroundColor: "#8d3dff",
          borderCurve: "continuous",
          borderRadius: 999,
          boxShadow: "0 10px 18px rgba(111, 47, 224, 0.34)",
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
            color: "#ffffff",
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
