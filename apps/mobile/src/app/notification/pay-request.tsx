import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { CheckCircle2, X } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";

import { authClient } from "@/features/auth/services/auth-client";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { appConfig } from "@repo/config";
import { selectionHaptic, successHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { AppText } from "@/shared/components/ui/app-text";

type RequestDetailResponse = {
  amountCents: number;
  concept?: string | null;
  id: string;
  isPayable: boolean;
  requester: {
    id: string;
    initials: string;
    name: string;
  };
};

function getAuthCookie() {
  return (authClient as typeof authClient & { getCookie?: () => string }).getCookie?.() ?? "";
}

function buildIdempotencyKey(scope: "bizum-request-payment", requestId: string) {
  const random = Math.random().toString(36).slice(2, 12);
  return `${scope}-${requestId}-${Date.now()}-${random}`;
}

function formatMoneyLabel(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} EUR`;
}

export default function NotificationPayRequestScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const params = useLocalSearchParams<{ requestId?: string }>();
  const requestId = typeof params.requestId === "string" ? params.requestId : "";
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<RequestDetailResponse | null>(null);
  const paymentIdempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    paymentIdempotencyKeyRef.current = null;
  }, [requestId]);

  useEffect(() => {
    if (!session?.user.id || !requestId) {
      return;
    }

    const loadRequest = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch(`${appConfig.authApiUrl}/api/bizum/request/${requestId}`, {
          headers: {
            "Content-Type": "application/json",
            cookie: getAuthCookie(),
          },
        });

        if (!response.ok) {
          const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
          setErrorMessage(errorPayload?.error ?? "No se pudo cargar la solicitud.");
          return;
        }

        const payload = (await response.json()) as RequestDetailResponse;
        setRequestData(payload);
      } catch {
        setErrorMessage("No se pudo cargar la solicitud.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadRequest();
  }, [requestId, session?.user.id]);

  const amountLabel = useMemo(() => formatMoneyLabel(requestData?.amountCents ?? 0), [requestData?.amountCents]);

  const handlePay = async () => {
    if (!requestData?.isPayable || isPaying) {
      return;
    }

    try {
      setIsPaying(true);
      setErrorMessage(null);
      if (!paymentIdempotencyKeyRef.current) {
        paymentIdempotencyKeyRef.current = buildIdempotencyKey("bizum-request-payment", requestId);
      }

      const response = await fetch(`${appConfig.authApiUrl}/api/bizum/request/${requestId}`, {
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": paymentIdempotencyKeyRef.current,
          cookie: getAuthCookie(),
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
        setErrorMessage(errorPayload?.error ?? "No se pudo pagar la solicitud.");
        return;
      }

      successHaptic();
      router.back();
    } catch {
      setErrorMessage("No se pudo pagar la solicitud.");
    } finally {
      setIsPaying(false);
    }
  };

  if (showSessionLoading) {
    return null;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(5, 12, 22, 0.38)" }}>
      <Pressable
        className="absolute inset-0"
        onPress={() => {
          selectionHaptic();
          router.back();
        }}
      />

      <Animated.View
        entering={FadeInDown.duration(240)}
        exiting={FadeOut.duration(180)}
        className="rounded-t-[34px] border px-5 pb-8 pt-5"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <AppScreenHeader
          rightSlot={
            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full"
              onPress={() => {
                selectionHaptic();
                router.back();
              }}
              style={{ backgroundColor: theme.backgroundMuted }}
            >
              <X color={theme.text} size={20} strokeWidth={2.4} />
            </Pressable>
          }
          title="Pagar solicitud"
        />

        {isLoading ? (
          <Animated.View entering={FadeIn.duration(180)} className="items-center py-12">
            <ActivityIndicator color={theme.primary} size="large" />
            <AppText className="mt-4 text-[14px]" style={{ color: theme.mutedText }}>
              Cargando solicitud...
            </AppText>
          </Animated.View>
        ) : requestData ? (
          <View className="gap-4">
            <View className="rounded-[24px] border p-4" style={{ backgroundColor: theme.backgroundElevated, borderColor: theme.border }}>
              <AppText className="text-[12px] font-black uppercase tracking-[1.8px]" style={{ color: theme.mutedText }}>
                Solicitado por
              </AppText>
              <AppText className="mt-2 text-[19px] font-black" style={{ color: theme.text }}>
                {requestData.requester.name}
              </AppText>
              <AppText className="mt-1 text-[13px]" style={{ color: theme.mutedText }}>
                Importe: {amountLabel}
              </AppText>
              {requestData.concept ? (
                <AppText className="mt-1 text-[13px]" style={{ color: theme.mutedText }}>
                  Concepto: {requestData.concept}
                </AppText>
              ) : null}
            </View>

            {!requestData.isPayable ? (
              <View className="rounded-[18px] border px-3 py-2.5" style={{ backgroundColor: theme.primarySoft, borderColor: theme.border }}>
                <AppText className="text-[13px] font-black" style={{ color: theme.text }}>
                  Esta solicitud ya no esta disponible para pago.
                </AppText>
              </View>
            ) : null}

            {errorMessage ? (
              <View className="rounded-[18px] border px-3 py-2.5" style={{ backgroundColor: theme.primarySoft, borderColor: theme.border }}>
                <AppText className="text-[13px] font-black" style={{ color: theme.text }}>
                  {errorMessage}
                </AppText>
              </View>
            ) : null}

            <View className="mt-1 flex-row gap-3">
              <Pressable
                className="flex-1 items-center justify-center rounded-[22px] py-3.5"
                onPress={() => {
                  selectionHaptic();
                  router.back();
                }}
                style={{ backgroundColor: theme.backgroundMuted }}
              >
                <AppText className="text-[15px] font-black" style={{ color: theme.text }}>
                  Cancelar
                </AppText>
              </Pressable>

              <Pressable
                className="flex-1 flex-row items-center justify-center rounded-[22px] py-3.5"
                disabled={!requestData.isPayable || isPaying}
                onPress={handlePay}
                style={{
                  backgroundColor: requestData.isPayable ? theme.primary : theme.backgroundMuted,
                  opacity: requestData.isPayable ? 1 : 0.65,
                }}
              >
                {isPaying ? (
                  <ActivityIndicator color={theme.textOnPrimary} />
                ) : (
                  <>
                    <CheckCircle2 color={theme.textOnPrimary} size={18} strokeWidth={2.5} />
                    <AppText className="ml-2 text-[15px] font-black" style={{ color: theme.textOnPrimary }}>
                      Pagar
                    </AppText>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="rounded-[18px] border px-3 py-2.5" style={{ backgroundColor: theme.primarySoft, borderColor: theme.border }}>
            <AppText className="text-[13px] font-black" style={{ color: theme.text }}>
              No se encontro la solicitud.
            </AppText>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
