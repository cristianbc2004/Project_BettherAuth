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

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  keyboardFocusScrollY?: number;
  scrollRequestKey?: number;
  title: string;
  subtitle: string;
}>;

export function AuthShell({
  children,
  eyebrow,
  keyboardFocusScrollY,
  scrollRequestKey,
  title,
  subtitle,
}: AuthShellProps) {
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
    <SafeAreaView className="flex-1 bg-midnight-950">
      <View className="absolute inset-0">
        <View className="absolute inset-0 bg-[#080c18]" />
        <View className="absolute top-0 h-[240px] w-full bg-[#2a1a52]/4" />
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
          {!keyboardVisible ? (
            <Animated.View
              className="mt-10 items-center"
              entering={FadeInDown.duration(420).easing(Easing.out(Easing.quad))}
            >
              <AuthBrandMark />
              <Text className="mt-9 px-8 text-center text-[30px] font-black leading-[36px] text-white">
                {title}
              </Text>
              <Text className="mt-4 max-w-[320px] text-center text-[15px] leading-6 text-white/65">
                {subtitle || eyebrow}
              </Text>
            </Animated.View>
          ) : null}

          <Animated.View
            className={`${keyboardVisible ? "mt-6" : "mt-10"} rounded-[36px] border border-white/6 bg-[#0b1220]/78 px-0 py-0`}
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
