import { Redirect } from "expo-router";
import { Controller } from "react-hook-form";
import { CreditCard } from "lucide-react-native";
import { useCallback, useRef } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthInput } from "@/features/auth/components/auth-input";
import { authClient } from "@/features/auth/services/auth-client";
import { WalletCardPreview } from "@/features/finance/components/finance-card";
import { getCardPreviewWidth } from "@/features/finance/lib/card-layout";
import { useAddTargetForm } from "@/features/finance/lib/use-add-target-form";
import {
  normalizeAmountInput,
  walletCardTypes,
} from "@/features/finance/lib/wallet-card-utils";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { AppText } from "@/shared/components/ui/app-text";

type SelectorFieldProps<TValue extends string> = {
  label: string;
  onChange: (value: TValue) => void;
  options: readonly TValue[];
  selectedValue: TValue;
};

function SelectorField<TValue extends string>({
  label,
  onChange,
  options,
  selectedValue,
}: SelectorFieldProps<TValue>) {
  const { theme } = useAppTheme();

  return (
    <View className="mb-5">
      <AppText className="mb-3 text-sm font-medium" style={{ color: theme.text }}>
        {label}
      </AppText>
      <View
        className="flex-row rounded-[24px] border p-1"
        style={{ backgroundColor: theme.inputBackground, borderColor: theme.border }}
      >
        {options.map((option, index) => {
          const isSelected = option === selectedValue;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className="min-h-[56px] flex-1 items-center justify-center rounded-[20px] px-3"
              hitSlop={8}
              key={option}
              onPress={() => {
                selectionHaptic();
                onChange(option);
              }}
              pressRetentionOffset={16}
              style={{
                backgroundColor: isSelected ? theme.primary : "transparent",
                marginLeft: index === 0 ? 0 : 6,
              }}
            >
              <AppText
                className="text-center text-[14px] font-black"
                style={{ color: isSelected ? theme.textOnPrimary : theme.mutedText }}
              >
                {option}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function AddTargetScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const { form, initialBalanceLabel, isSaving, previewCard, submitAddTarget } = useAddTargetForm(session?.user.name ?? "");
  const cardWidth = getCardPreviewWidth(width);
  const scrollToFormPosition = useCallback((y: number) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ animated: true, y });
    });
  }, []);

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
      >
        <View className="px-5 pt-4">
          <AppScreenHeader
            fallbackHref={"/cards" as never}
            title="Add card"
          />
        </View>

        <ScrollView
          ref={scrollViewRef}
          bounces={false}
          contentContainerClassName="gap-5 px-5 pb-12"
          contentContainerStyle={{ paddingBottom: 220 }}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <WalletCardPreview card={previewCard} width={cardWidth} />
          </View>

          <View
            className="rounded-[28px] border p-5"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <View className="mb-5 flex-row items-center">
              <View
                className="h-11 w-11 items-center justify-center rounded-[16px]"
                style={{ backgroundColor: theme.primarySoft }}
              >
                <CreditCard color={theme.primary} size={20} strokeWidth={2.4} />
              </View>
              <View className="ml-3 flex-1">
                <AppText className="text-[17px] font-black" style={{ color: theme.text }}>
                  Card details
                </AppText>
                <AppText className="mt-1 text-[14px] leading-5" style={{ color: theme.mutedText }}>
                  The new card is saved directly in the cards table.
                </AppText>
              </View>
            </View>

            <Controller
              control={form.control}
              name="name"
              render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                <AuthInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  error={error?.message}
                  label="Name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onFocus={() => scrollToFormPosition(260)}
                  placeholder="Card name"
                  value={value}
                />
              )}
            />

            <Controller
              control={form.control}
              name="numberTarget"
              render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                <AuthInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={error?.message}
                  keyboardType="number-pad"
                  label="Card number"
                  maxLength={19}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, 19))}
                  onFocus={() => scrollToFormPosition(380)}
                  placeholder="4242424242424242"
                  value={value}
                />
              )}
            />

            <Controller
              control={form.control}
              name="initialBalance"
              render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                <AuthInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={error?.message}
                  keyboardType="decimal-pad"
                  label="Initial balance (EUR)"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(normalizeAmountInput(text))}
                  onFocus={() => scrollToFormPosition(470)}
                  placeholder="0,00"
                  value={value}
                />
              )}
            />

            <AppText className="mb-5 text-[13px] leading-5" style={{ color: theme.mutedText }}>
              Current initial balance: {initialBalanceLabel}
            </AppText>

            <Controller
              control={form.control}
              name="cvc"
              render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                <AuthInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={error?.message}
                  keyboardType="number-pad"
                  label="CVC"
                  maxLength={4}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, 4))}
                  onFocus={() => scrollToFormPosition(560)}
                  placeholder="123"
                  value={value}
                />
              )}
            />

            <Controller
              control={form.control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <SelectorField
                  label="Card type"
                  onChange={onChange}
                  options={walletCardTypes}
                  selectedValue={value}
                />
              )}
            />

            <AuthSubmitButton
              isPending={isSaving}
              label="Save card"
              onPress={() => {
                void submitAddTarget();
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
