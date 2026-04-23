import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

function runHaptic(feedback: () => Promise<void>) {
  if (Platform.OS === "web") {
    return;
  }

  void feedback().catch(() => {
    // Haptics can be unavailable on some devices or simulator settings.
  });
}

export function selectionHaptic() {
  runHaptic(() => Haptics.selectionAsync());
}

export function successHaptic() {
  runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function warningHaptic() {
  runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
