import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Check, CreditCard } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { AuthInput } from "@/features/auth/components/auth-input";
import { authClient } from "@/features/auth/services/auth-client";
import { WalletCardPreview } from "@/features/finance/components/finance-card";
import { useWalletCards } from "@/features/finance/lib/wallet-cards-context";
import {
  buildWalletCardPreview,
  formatEurosFromCents,
  normalizeAmountInput,
  parseAmountInputToCents,
  walletCardTypes,
  type WalletCardFormValues,
} from "@/features/finance/lib/wallet-card-utils";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { AuthSubmitButton } from "@/shared/components/ui/auth-submit-button";
import { selectionHaptic, successHaptic, warningHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

type SelectorFieldProps<TValue extends string> = {
  label: string;
  onChange: (value: TValue) => void;
  options: readonly TValue[];
  selectedValue: TValue;
};

const addTargetSchema = z.object({
  cvc: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "El CVC debe tener 3 o 4 numeros."),
  initialBalance: z
    .string()
    .trim()
    .min(1, "Introduce el saldo inicial.")
    .refine((value) => parseAmountInputToCents(value) !== null, "Introduce un importe valido."),
  name: z.string().trim().min(2, "Introduce el nombre de la tarjeta."),
  numberTarget: z
    .string()
    .trim()
    .regex(/^\d{12,19}$/, "El numero debe tener entre 12 y 19 digitos."),
  type: z.enum(walletCardTypes),
});

function SelectorField<TValue extends string>({
  label,
  onChange,
  options,
  selectedValue,
}: SelectorFieldProps<TValue>) {
  const { theme } = useAppTheme();

  return (
    <View className="mb-5">
      <Text className="mb-3 text-sm font-medium" style={{ color: theme.text }}>
        {label}
      </Text>
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
              <Text
                className="text-center text-[14px] font-black"
                style={{ color: isSelected ? theme.textOnPrimary : theme.mutedText }}
              >
                {option}
              </Text>
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
  const { addCard } = useWalletCards();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const [isSaving, setIsSaving] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const form = useForm<z.infer<typeof addTargetSchema>>({
    resolver: zodResolver(addTargetSchema),
    defaultValues: {
      cvc: "",
      initialBalance: "0",
      name: session?.user.name ?? "",
      numberTarget: "",
      type: "VISA",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const previewValues = form.watch();
  const previewCard = useMemo(
    () => {
      const parsedBalance = parseAmountInputToCents(previewValues.initialBalance ?? "");

      return buildWalletCardPreview({
        cvc: previewValues.cvc,
        initialBalanceCents: parsedBalance ?? 0,
        name: previewValues.name,
        numberTarget: previewValues.numberTarget,
        type: previewValues.type,
      });
    },
    [previewValues],
  );
  const cardWidth = Math.min(width - 40, 360);
  const scrollToFormPosition = useCallback((y: number) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ animated: true, y });
    });
  }, []);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSaving(true);
      const initialBalanceCents = parseAmountInputToCents(values.initialBalance);

      if (initialBalanceCents === null) {
        form.setError("initialBalance", { message: "Introduce un importe valido." });
        return;
      }

      const payload: WalletCardFormValues = {
        cvc: values.cvc,
        initialBalanceCents,
        name: values.name,
        numberTarget: values.numberTarget,
        type: values.type,
      };
      const createdCard = await addCard(payload);

      successHaptic();
      Alert.alert("Tarjeta creada", "Tu nueva tarjeta ya esta disponible en la cartera.");
      router.replace({
        params: { cardId: createdCard.id },
        pathname: "/targets/details",
      } as never);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear la tarjeta.";
      warningHaptic();
      Alert.alert("Error", message);
    } finally {
      setIsSaving(false);
    }
  });

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
        <View className="px-5 pt-5">
          <AppScreenHeader
            fallbackHref={"/cards" as never}
            title="Anadir tarjeta"
          />
        </View>

        <ScrollView
          ref={scrollViewRef}
          bounces={false}
          contentContainerClassName="gap-6 px-5 pb-12"
          contentContainerStyle={{ paddingBottom: 220 }}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text className="text-[12px] font-black uppercase tracking-[2px]" style={{ color: theme.primary }}>
              Tarjetas
            </Text>
            <Text className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>
              Completa el formulario con los datos reales de la tarjeta guardados en la base de datos.
            </Text>
          </View>

          <View>
            <WalletCardPreview card={previewCard} width={cardWidth} />
          </View>

          <View
            className="rounded-[30px] border p-5"
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
                <Text className="text-[18px] font-black" style={{ color: theme.text }}>
                  Datos de la tarjeta
                </Text>
                <Text className="mt-1 text-[14px] leading-5" style={{ color: theme.mutedText }}>
                  El alta se guarda directamente en la tabla de tarjetas.
                </Text>
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
                  label="Nombre"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onFocus={() => scrollToFormPosition(260)}
                  placeholder="Nombre de la tarjeta"
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
                  label="Numero de tarjeta"
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
                  label="Saldo inicial (EUR)"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(normalizeAmountInput(text))}
                  onFocus={() => scrollToFormPosition(470)}
                  placeholder="0,00"
                  value={value}
                />
              )}
            />

            <Text className="mb-5 text-[13px] leading-5" style={{ color: theme.mutedText }}>
              Saldo inicial actual: {formatEurosFromCents(parseAmountInputToCents(previewValues.initialBalance ?? "") ?? 0)}
            </Text>

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
                  label="Tipo de tarjeta"
                  onChange={onChange}
                  options={walletCardTypes}
                  selectedValue={value}
                />
              )}
            />

            <Pressable
              accessibilityRole="button"
              className="mt-1 flex-row items-center rounded-[22px] px-4 py-4"
              onPress={() => {
                selectionHaptic();
                void handleSubmit();
              }}
              style={{ backgroundColor: theme.primarySoft }}
            >
              <Check color={theme.primary} size={18} strokeWidth={2.5} />
              <Text className="ml-3 text-[14px] font-black" style={{ color: theme.primary }}>
                Revisar y guardar en tu cartera
              </Text>
            </Pressable>

            <AuthSubmitButton
              isPending={isSaving}
              label="Guardar tarjeta"
              onPress={() => {
                void handleSubmit();
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
