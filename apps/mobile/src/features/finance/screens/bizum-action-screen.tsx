import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable } from "react-native";
import { Redirect, router } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { BizumActionForm, type BizumActionPayload } from "@/features/finance/components/bizum-action-form";
import { BizumActionSkeleton } from "@/features/finance/components/bizum-skeletons";
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
import { selectionHaptic } from "@/shared/lib/haptics";

type BizumActionScreenProps = {
  mode: BizumActionMode;
};

type BizumFlowStep = "contact" | "details" | "review" | "success";

export function BizumActionScreen({ mode }: BizumActionScreenProps) {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableBalanceCents, setAvailableBalanceCents] = useState(0);
  const [contacts, setContacts] = useState<BizumContact[]>([]);
  const [flowStep, setFlowStep] = useState<BizumFlowStep>("contact");
  const [completedPayload, setCompletedPayload] = useState<BizumActionPayload | null>(null);

  const copy = useMemo(
    () =>
      mode === "send"
        ? {
            title: "Send Bizum",
          }
        : {
            title: "Request Bizum",
          },
    [mode],
  );

  const handleClose = useCallback(() => {
    selectionHaptic();
    router.replace("/assets" as never);
  }, []);

  const handleBack = useCallback(() => {
    selectionHaptic();

    if (isSubmitting) {
      return;
    }

    if (flowStep === "success") {
      router.replace("/assets" as never);
      return;
    }

    if (flowStep === "review") {
      setFlowStep("details");
      return;
    }

    if (flowStep === "details") {
      setFlowStep("contact");
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/assets" as never);
  }, [flowStep, isSubmitting]);

  const loadBizumData = useCallback(async () => {
    if (!session?.user.id) {
      return;
    }

    try {
      setIsDataLoading(true);
      setErrorMessage(null);

      const response = await fetchBizumRequest();
      if (!response.ok) {
        setErrorMessage("Could not load Bizum. Please try again.");
        return;
      }

      const payload = (await response.json()) as BizumGetResponse;
      setAvailableBalanceCents(payload.availableBalanceCents ?? 0);
      setContacts(payload.contacts ?? []);
    } catch {
      setErrorMessage("Could not load Bizum. Please try again.");
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
      setErrorMessage("You do not have enough balance to send that Bizum.");
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
        setErrorMessage(errorPayload?.error ?? "Could not complete the operation.");
        return;
      }

      const result = (await response.json()) as BizumPostResponse;
      setAvailableBalanceCents(result.availableBalanceCents ?? availableBalanceCents);
      setCompletedPayload(payload);
      successHaptic();
      setFlowStep("success");
    } catch {
      setErrorMessage("Could not complete the operation.");
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
        <AppScreenHeader
          leftSlot={
            <Pressable
              accessibilityLabel="Go back to the previous step"
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center"
              hitSlop={10}
              onPress={handleBack}
            >
              <ChevronLeft color={theme.text} size={24} strokeWidth={2.4} />
            </Pressable>
          }
          rightSlot={
            <Pressable
              accessibilityLabel="Close Bizum operation"
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center"
              hitSlop={10}
              onPress={handleClose}
            >
              <X color={theme.text} size={22} strokeWidth={2.4} />
            </Pressable>
          }
          title={copy.title}
        />
        {isDataLoading ? (
          <BizumActionSkeleton />
        ) : (
          <BizumActionForm
            availableBalanceCents={availableBalanceCents}
            completedPayload={completedPayload}
            contacts={contacts}
            errorMessage={errorMessage}
            flowStep={flowStep}
            isSubmitting={isSubmitting}
            mode={mode}
            onClose={handleClose}
            onDismissError={() => setErrorMessage(null)}
            onStepChange={setFlowStep}
            onSubmit={handleSubmit}
            onViewMovements={() => router.replace("/movements" as never)}
          />
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
