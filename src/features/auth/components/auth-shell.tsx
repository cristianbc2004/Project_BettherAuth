import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthBrandMark } from "@/features/auth/components/auth-brand-mark";
import { useAppTheme } from "@/shared/lib/theme";

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  subtitle: string;
}>;

export function AuthShell({ children, eyebrow, title, subtitle }: AuthShellProps) {
  const { colorScheme, theme } = useAppTheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(12)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslate, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslate, {
          toValue: 0,
          duration: 480,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [cardOpacity, cardTranslate, headerOpacity, headerTranslate]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0">
        <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
        <View
          className="absolute top-0 h-[240px] w-full"
          style={{
            backgroundColor:
              colorScheme === "light" ? "rgba(141, 61, 255, 0.08)" : "rgba(42, 26, 82, 0.04)",
          }}
        />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          bounces={false}
          contentContainerClassName={`${keyboardVisible ? "px-6 pb-8 pt-4" : "flex-grow px-6 pb-10 pt-8"}`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!keyboardVisible ? (
            <Animated.View
              className="mt-10 items-center"
              style={{
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslate }],
              }}
            >
              <AuthBrandMark />
              <Text
                className="mt-9 px-8 text-center text-[30px] font-black leading-[36px]"
                style={{ color: theme.text }}
              >
                {title}
              </Text>
              <Text
                className="mt-4 max-w-[320px] text-center text-[15px] leading-6"
                style={{ color: theme.mutedText }}
              >
                {subtitle || eyebrow}
              </Text>
            </Animated.View>
          ) : null}

          <Animated.View
            className={`${keyboardVisible ? "mt-6" : "mt-10"} rounded-[36px] px-0 py-0`}
            style={{
              backgroundColor: colorScheme === "light" ? "rgba(255, 255, 255, 0.84)" : "rgba(11, 18, 32, 0.78)",
              borderColor: theme.border,
              borderWidth: 1,
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslate }],
            }}
          >
            {children}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
