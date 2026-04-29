import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthBrandMark } from "@/features/auth/components/auth-brand-mark";
import { AppBackButton } from "@/shared/components/ui/app-back-button";
import { backOrReplace } from "@/shared/lib/navigation";
import { useAppTheme } from "@/shared/lib/theme-context";

type AuthShellProps = PropsWithChildren<{
  backAccessibilityLabel?: string;
  backHref?: Parameters<typeof backOrReplace>[0];
  eyebrow: string;
  keyboardFocusScrollY?: number;
  scrollRequestKey?: number;
  title: string;
  subtitle: string;
}>;

export function AuthShell({
  backAccessibilityLabel,
  backHref,
  children,
  keyboardFocusScrollY,
  scrollRequestKey,
  title,
}: AuthShellProps) {
  const { theme } = useAppTheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const shouldAdjustForFocusedInput = keyboardFocusScrollY !== undefined && scrollRequestKey !== undefined;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardVisible(true);
      setKeyboardBottomInset(event.endCoordinates.height);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardBottomInset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!keyboardVisible || !shouldAdjustForFocusedInput) {
      return;
    }

    const timeoutId = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        animated: true,
        y: keyboardFocusScrollY,
      });
    }, 180);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [keyboardFocusScrollY, keyboardVisible, scrollRequestKey, shouldAdjustForFocusedInput]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0">
        <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          bounces={false}
          contentContainerClassName={`${keyboardVisible ? "px-6 pb-8 pt-4" : "flex-grow px-6 pb-10 pt-8"}`}
          contentContainerStyle={
            keyboardVisible && shouldAdjustForFocusedInput
              ? {
                  paddingBottom: Math.max(keyboardBottomInset + 32, 220),
                }
              : undefined
          }
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
        >
          {backHref ? (
            <View className="mb-2 flex-row">
              <AppBackButton
                accessibilityLabel={backAccessibilityLabel}
                fallbackHref={backHref}
              />
            </View>
          ) : null}

          {!keyboardVisible ? (
            <Animated.View
              className="mt-10 items-center"
              entering={FadeInDown.duration(420).easing(Easing.out(Easing.quad))}
            >
              <AuthBrandMark />
              <Text
                className="mt-9 px-8 text-center text-[30px] font-black leading-[36px]"
                style={{ color: theme.text }}
              >
                {title}
              </Text>
            </Animated.View>
          ) : null}

          <Animated.View
            className={keyboardVisible ? "mt-6" : "mt-8"}
            entering={FadeInDown.duration(480)
              .delay(keyboardVisible ? 0 : 420)
              .easing(Easing.out(Easing.quad))}
          >
            {children}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
