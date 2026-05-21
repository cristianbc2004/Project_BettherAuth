import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { CheckCircle2, X } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { z } from "zod";

import { authClient } from "@/features/auth/services/auth-client";
import { buildIdempotencyKey } from "@/features/finance/lib/bizum-api";
import { getAuthCookie } from "@/shared/lib/auth-api";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { appConfig } from "@repo/config";
import { selectionHaptic, successHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { AppText } from "@/shared/components/ui/app-text";
import { parseApiError } from "@/shared/lib/api-schemas";

const requestDetailResponseSchema = z.object({
  amountCents: z.number(),
  concept: z.string().nullable().optional(),
  id: z.string(),
  isPayable: z.boolean(),
  requester: z.object({
    id: z.string(),
    initials: z.string(),
    name: z.string(),
  }),
});

type RequestDetailResponse = z.infer<typeof requestDetailResponseSchema>;

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
          const errorPayload = await parseApiError(response);
          setErrorMessage(errorPayload?.error ?? "Could not load the request.");
          return;
        }

        const payload = requestDetailResponseSchema.parse(await response.json());
        setRequestData(payload);
      } catch {
        setErrorMessage("Could not load the request.");
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
        const errorPayload = await parseApiError(response);
        setErrorMessage(errorPayload?.error ?? "Could not pay the request.");
        return;
      }

      successHaptic();
      router.back();
    } catch {
      setErrorMessage("Could not pay the request.");
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
          title="Pay request"
        />

        {isLoading ? (
          <Animated.View entering={FadeIn.duration(180)} className="items-center py-12">
            <ActivityIndicator color={theme.primary} size="large" />
            <AppText className="mt-4 text-[14px]" style={{ color: theme.mutedText }}>
              Loading request...
            </AppText>
          </Animated.View>
        ) : requestData ? (
          <View className="gap-4">
            <View className="rounded-[24px] border p-4" style={{ backgroundColor: theme.backgroundElevated, borderColor: theme.border }}>
              <AppText className="text-[12px] font-black uppercase tracking-[1.8px]" style={{ color: theme.mutedText }}>
                Requested by
              </AppText>
              <AppText className="mt-2 text-[19px] font-black" style={{ color: theme.text }}>
                {requestData.requester.name}
              </AppText>
              <AppText className="mt-1 text-[13px]" style={{ color: theme.mutedText }}>
                Amount: {amountLabel}
              </AppText>
              {requestData.concept ? (
                <AppText className="mt-1 text-[13px]" style={{ color: theme.mutedText }}>
                  Concept: {requestData.concept}
                </AppText>
              ) : null}
            </View>

            {!requestData.isPayable ? (
              <View className="rounded-[18px] border px-3 py-2.5" style={{ backgroundColor: theme.primarySoft, borderColor: theme.border }}>
                <AppText className="text-[13px] font-black" style={{ color: theme.text }}>
                  This request is no longer available for payment.
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
                  Cancel
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
                      Pay
                    </AppText>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="rounded-[18px] border px-3 py-2.5" style={{ backgroundColor: theme.primarySoft, borderColor: theme.border }}>
            <AppText className="text-[13px] font-black" style={{ color: theme.text }}>
              Request not found.
            </AppText>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
