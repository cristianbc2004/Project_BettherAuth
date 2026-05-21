import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import type { BizumActionPayload } from "@/features/finance/components/bizum-action-form";
import {
  buildIdempotencyKey,
  bizumPostResponseSchema,
  fetchBizumRequest,
  type BizumActionMode,
  type BizumContact,
} from "@/features/finance/lib/bizum-api";
import { loadBizumActionData } from "@/features/finance/lib/bizum-data";
import { parseApiError } from "@/shared/lib/api-schemas";
import { selectionHaptic, successHaptic } from "@/shared/lib/haptics";

export type BizumFlowStep = "contact" | "details" | "review" | "success";

export function useBizumActionFlow(mode: BizumActionMode, userId?: string) {
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableBalanceCents, setAvailableBalanceCents] = useState(0);
  const [contacts, setContacts] = useState<BizumContact[]>([]);
  const [flowStep, setFlowStep] = useState<BizumFlowStep>("contact");
  const [completedPayload, setCompletedPayload] = useState<BizumActionPayload | null>(null);

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
    if (!userId) {
      return;
    }

    try {
      setIsDataLoading(true);
      setErrorMessage(null);
      const data = await loadBizumActionData();
      setAvailableBalanceCents(data.availableBalanceCents);
      setContacts(data.contacts);
    } catch {
      setErrorMessage("Could not load Bizum. Please try again.");
    } finally {
      setIsDataLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadBizumData();
  }, [loadBizumData]);

  const submitBizumAction = useCallback(
    async (payload: BizumActionPayload) => {
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
          const errorPayload = await parseApiError(response);
          setErrorMessage(errorPayload?.error ?? "Could not complete the operation.");
          return;
        }

        const result = bizumPostResponseSchema.parse(await response.json());
        setAvailableBalanceCents(result.availableBalanceCents ?? availableBalanceCents);
        setCompletedPayload(payload);
        successHaptic();
        setFlowStep("success");
      } catch {
        setErrorMessage("Could not complete the operation.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [availableBalanceCents, mode],
  );

  const viewMovements = useCallback(() => {
    router.replace("/movements" as never);
  }, []);

  return {
    availableBalanceCents,
    completedPayload,
    contacts,
    errorMessage,
    flowStep,
    handleBack,
    handleClose,
    isDataLoading,
    isSubmitting,
    setErrorMessage,
    setFlowStep,
    submitBizumAction,
    viewMovements,
  };
}
