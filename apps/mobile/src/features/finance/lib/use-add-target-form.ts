import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import { useWalletCards } from "@/features/finance/lib/wallet-cards-context";
import {
  addTargetSchema,
  buildWalletCardPayload,
  buildWalletCardPreview,
  formatEurosFromCents,
  parseAmountInputToCents,
  type AddTargetFormValues,
} from "@/features/finance/lib/wallet-card-utils";
import { successHaptic, warningHaptic } from "@/shared/lib/haptics";

export function useAddTargetForm(defaultName = "") {
  const { addCard } = useWalletCards();
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<AddTargetFormValues>({
    resolver: zodResolver(addTargetSchema),
    defaultValues: {
      cvc: "",
      initialBalance: "0",
      name: defaultName,
      numberTarget: "",
      type: "VISA",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const previewValues = form.watch();
  const parsedInitialBalanceCents = parseAmountInputToCents(previewValues.initialBalance ?? "");
  const previewCard = useMemo(
    () => buildWalletCardPreview({
      cvc: previewValues.cvc,
      initialBalanceCents: parsedInitialBalanceCents ?? 0,
      name: previewValues.name,
      numberTarget: previewValues.numberTarget,
      type: previewValues.type,
    }),
    [
      parsedInitialBalanceCents,
      previewValues.cvc,
      previewValues.name,
      previewValues.numberTarget,
      previewValues.type,
    ],
  );
  const initialBalanceLabel = formatEurosFromCents(parsedInitialBalanceCents ?? 0);

  const submitAddTarget = form.handleSubmit(async (values) => {
    try {
      setIsSaving(true);
      const payload = buildWalletCardPayload(values);

      if (!payload) {
        form.setError("initialBalance", { message: "Enter a valid amount." });
        return;
      }

      const createdCard = await addCard(payload);

      successHaptic();
      Alert.alert("Card created", "Your new card is now available in the wallet.");
      router.replace({
        params: { cardId: createdCard.id },
        pathname: "/targets/details",
      } as never);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create the card.";
      warningHaptic();
      Alert.alert("Error", message);
    } finally {
      setIsSaving(false);
    }
  });

  return {
    form,
    initialBalanceLabel,
    isSaving,
    previewCard,
    submitAddTarget,
  };
}
