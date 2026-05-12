import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect, router } from "expo-router";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { BizumActionForm, type BizumActionPayload } from "@/features/finance/components/bizum-action-form";
import {
  buildIdempotencyKey,
  fetchBizumRequest,
  type BizumActionMode,
  type BizumContact,
  type BizumGetResponse,
  type BizumPostResponse,
} from "@/features/finance/lib/bizum-api";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { successHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { AppText } from "@/shared/components/ui/app-text";

type BizumActionScreenProps = {
  mode: BizumActionMode;
};

export function BizumActionScreen({ mode }: BizumActionScreenProps) {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableBalanceCents, setAvailableBalanceCents] = useState(0);
  const [contacts, setContacts] = useState<BizumContact[]>([]);

  const copy = useMemo(
    () =>
      mode === "send"
        ? {
            title: "Enviar Bizum",
          }
        : {
            title: "Pedir Bizum",
          },
    [mode],
  );

  const loadBizumData = useCallback(async () => {
    if (!session?.user.id) {
      return;
    }

    try {
      setIsDataLoading(true);
      setErrorMessage(null);

      const response = await fetchBizumRequest();
      if (!response.ok) {
        setErrorMessage("No se pudo cargar Bizum. Intentalo de nuevo.");
        return;
      }

      const payload = (await response.json()) as BizumGetResponse;
      setAvailableBalanceCents(payload.availableBalanceCents ?? 0);
      setContacts(payload.contacts ?? []);
    } catch {
      setErrorMessage("No se pudo cargar Bizum. Intentalo de nuevo.");
    } finally {
      setIsDataLoading(false);
    }
  }, [session?.user.id]);

  useEffect(() => {
    void loadBizumData();
  }, [loadBizumData]);

  const handleSubmit = async (payload: BizumActionPayload) => {
    const amountCents = Math.round(payload.amount * 100);
    if (mode === "send" && amountCents > availableBalanceCents) {
      setErrorMessage("No tienes saldo suficiente para enviar ese Bizum.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const idempotencyKey = mode === "send" ? buildIdempotencyKey("bizum-send") : null;
      const response = await fetchBizumRequest("/api/bizum", {
        body: JSON.stringify({
          action: mode,
          amount: payload.amount,
          concept: payload.concept,
          contactUserId: payload.contact.id,
        }),
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
        method: "POST",
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
        setErrorMessage(errorPayload?.error ?? "No se pudo completar la operacion.");
        return;
      }

      const result = (await response.json()) as BizumPostResponse;
      setAvailableBalanceCents(result.availableBalanceCents ?? availableBalanceCents);
      successHaptic();
      router.back();
    } catch {
      setErrorMessage("No se pudo completar la operacion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <KeyboardAwareScrollView
        bottomOffset={132}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, paddingTop: 20 }}
        contentInsetAdjustmentBehavior="automatic"
        extraKeyboardSpace={16}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppScreenHeader fallbackHref={"/assets" as never} title={copy.title} />
        <View className="mb-4 border-b pb-3" style={{ borderColor: theme.border }}>
          <View className="flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: theme.primarySoft }}>
              {mode === "send" ? (
                <ArrowUpRight color={theme.primary} size={20} strokeWidth={2.7} />
              ) : (
                <ArrowDownLeft color={theme.primary} size={20} strokeWidth={2.7} />
              )}
            </View>
            <View className="ml-3 flex-1">
              <AppText className="text-[13px] font-black" style={{ color: theme.text }}>
                {(availableBalanceCents / 100).toFixed(2).replace(".", ",")} EUR disponibles
              </AppText>
            </View>
          </View>
        </View>

        {isDataLoading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator color={theme.primary} size="large" />
            <AppText className="mt-3 text-[13px]" style={{ color: theme.mutedText }}>
              Cargando datos de Bizum...
            </AppText>
          </View>
        ) : (
          <BizumActionForm
            contacts={contacts}
            errorMessage={errorMessage}
            isSubmitting={isSubmitting}
            mode={mode}
            onCancel={() => router.back()}
            onDismissError={() => setErrorMessage(null)}
            onSubmit={handleSubmit}
          />
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
