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

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  subtitle: string;
}>;

export function AuthShell({ children, eyebrow, title, subtitle }: AuthShellProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(18)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslate, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(120),
        Animated.parallel([
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 380,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(cardTranslate, {
            toValue: 0,
            duration: 380,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
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
    <SafeAreaView className="flex-1 bg-sand">
      <View className="absolute inset-0">
        <View className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-coral-300/45" />
        <View className="absolute right-[-20] top-36 h-56 w-56 rounded-full bg-ink-200/60" />
        <View className="absolute bottom-0 left-0 right-0 h-72 rounded-t-[48px] bg-ink-900" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          bounces={false}
          contentContainerClassName={`${keyboardVisible ? "px-6 pb-6 pt-4" : "flex-grow px-6 pb-10 pt-6"}`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!keyboardVisible ? (
            <Animated.View
              className="mt-8"
              style={{
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslate }],
              }}
            >
              <Text className="text-sm font-semibold uppercase tracking-[3px] text-ink-700">
                {eyebrow}
              </Text>
              <Text className="mt-4 text-5xl font-black leading-[56px] text-ink-900">{title}</Text>
              <Text className="mt-4 max-w-[320px] text-base leading-6 text-ink-700">{subtitle}</Text>
            </Animated.View>
          ) : null}

          <Animated.View
            className={`${keyboardVisible ? "mt-4" : "mt-10"} rounded-[36px] border border-white/70 bg-white/90 p-6 shadow-panel`}
            style={{
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
