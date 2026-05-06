import { Stack } from "expo-router";

export default function NotificationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="pay-request"
        options={{
          animation: "fade",
          presentation: "transparentModal",
        }}
      />
    </Stack>
  );
}
