import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Check, CircleCheck, Search, SendHorizontal } from "lucide-react-native";
import { z } from "zod";

import type { BizumActionMode, BizumContact } from "@/features/finance/lib/bizum-api";
import { AppText } from "@/shared/components/ui/app-text";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

export type BizumActionPayload = {
  amount: number;
  concept: string;
  contact: BizumContact;
};

type BizumFlowStep = "contact" | "details" | "review" | "success";

type BizumActionFormProps = {
  availableBalanceCents: number;
  completedPayload?: BizumActionPayload | null;
  contacts: BizumContact[];
  errorMessage?: string | null;
  flowStep: BizumFlowStep;
  isSubmitting: boolean;
  mode: BizumActionMode;
  onClose: () => void;
  onDismissError?: () => void;
  onStepChange: (step: BizumFlowStep) => void;
  onSubmit: (payload: BizumActionPayload) => void;
  onViewMovements: () => void;
};

function formatCents(value: number) {
  return `${(value / 100).toFixed(2).replace(".", ",")} EUR`;
}

function formatAmount(value: number) {
  return `${value.toFixed(2).replace(".", ",")} EUR`;
}

function normalizeAmount(value: string) {
  return Number(value.replace(",", "."));
}

function buildBizumSchema(mode: BizumActionMode, availableBalanceCents: number) {
  return z
    .object({
      amount: z.string().trim().min(1, "Enter an amount."),
      concept: z.string().trim().max(42, "The concept cannot exceed 42 characters."),
      contactId: z.string().trim().min(1, "Choose a contact."),
    })
    .superRefine((values, context) => {
      const parsedAmount = normalizeAmount(values.amount);
      const amountCents = Math.round(parsedAmount * 100);

      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        context.addIssue({
          code: "custom",
          message: "Enter a valid amount.",
          path: ["amount"],
        });
        return;
      }

      if (amountCents < 50) {
        context.addIssue({
          code: "custom",
          message: "The minimum amount is 0.50 EUR.",
          path: ["amount"],
        });
      }

      if (amountCents > 100000) {
        context.addIssue({
          code: "custom",
          message: "The maximum amount per Bizum is 1,000.00 EUR.",
          path: ["amount"],
        });
      }

      if (mode === "send" && amountCents > availableBalanceCents) {
        context.addIssue({
          code: "custom",
          message: "You do not have enough balance to send that Bizum.",
          path: ["amount"],
        });
      }
    });
}

type BizumFormValues = z.infer<ReturnType<typeof buildBizumSchema>>;

export function BizumActionForm({
  availableBalanceCents,
  completedPayload,
  contacts,
  errorMessage,
  flowStep,
  isSubmitting,
  mode,
  onClose,
  onDismissError,
  onStepChange,
  onSubmit,
  onViewMovements,
}: BizumActionFormProps) {
  const { theme } = useAppTheme();
  const [query, setQuery] = useState("");
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isConceptFocused, setIsConceptFocused] = useState(false);

  const schema = useMemo(() => buildBizumSchema(mode, availableBalanceCents), [availableBalanceCents, mode]);
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    setValue,
    trigger,
    watch,
  } = useForm<BizumFormValues>({
    defaultValues: {
      amount: "",
      concept: "",
      contactId: "",
    },
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const amount = watch("amount");
  const contactId = watch("contactId");
  const selectedContact = useMemo(() => contacts.find((contact) => contact.id === contactId) ?? null, [contactId, contacts]);
  const filteredContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return contacts;
    }

    return contacts.filter((contact) => `${contact.name} ${contact.detail}`.toLowerCase().includes(normalizedQuery));
  }, [contacts, query]);

  const parsedAmount = normalizeAmount(amount);
  const amountCents = Number.isFinite(parsedAmount) ? Math.round(parsedAmount * 100) : 0;
  const amountPreview = amountCents > 0 ? formatAmount(parsedAmount) : "0,00 EUR";
  const contactError = errors.contactId?.message;
  const amountError = errors.amount?.message;
  const conceptError = errors.concept?.message;

  const copy =
    mode === "send"
      ? {
          actionLabel: "Confirm send",
          contactLabel: "Recipient",
          loadingDescription: "We are preparing the movement so it appears in your latest payments.",
          loadingTitle: "Sending Bizum...",
          reviewTitle: "Confirm send",
          successDescription: "The Bizum was sent successfully. You can check it in latest movements.",
          successTitle: "Payment confirmed",
        }
      : {
          actionLabel: "Confirm request",
          contactLabel: "Person",
          loadingDescription: "We are preparing the request and will notify you when the Bizum is received.",
          loadingTitle: "Requesting Bizum...",
          reviewTitle: "Confirm request",
          successDescription: "The request was sent successfully. You can track it from your latest movements.",
          successTitle: "Request sent",
        };

  const selectContact = (contact: BizumContact) => {
    selectionHaptic();
    onDismissError?.();
    setValue("contactId", contact.id, { shouldDirty: true, shouldValidate: true });
    onStepChange("details");
  };

  const continueFromDetails = async () => {
    onDismissError?.();
    const isValid = await trigger(["amount", "concept", "contactId"]);

    if (isValid) {
      selectionHaptic();
      onStepChange("review");
    }
  };

  const submitReviewed = handleSubmit((values) => {
    if (!selectedContact) {
      return;
    }

    selectionHaptic();
    onSubmit({
      amount: normalizeAmount(values.amount),
      concept: values.concept.trim(),
      contact: selectedContact,
    });
  });

  if (isSubmitting) {
    return (
      <View className="items-center justify-center px-3 py-16">
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: theme.primarySoft }}>
          <ActivityIndicator color={theme.primary} size="large" />
        </View>
        <AppText className="text-[18px] font-black" style={{ color: theme.text }}>
          {copy.loadingTitle}
        </AppText>
        <AppText className="mt-3 text-center text-[14px] leading-6" style={{ color: theme.mutedText }}>
          {copy.loadingDescription}
        </AppText>
      </View>
    );
  }

  return (
    <View className="gap-5">
      {flowStep === "success" ? null : <StepIndicator currentStep={flowStep === "contact" ? 1 : flowStep === "details" ? 2 : 3} />}

      {flowStep === "contact" ? (
        <View className="gap-4">
          <SearchField query={query} onChangeQuery={setQuery} />

          <View>
            {contacts.length === 0 ? (
              <EmptyState description="Create another user to test Bizum sends or requests." title="No users available" />
            ) : filteredContacts.length === 0 ? (
              <EmptyState description="Try another name or clear the search." title="No results" />
            ) : (
              filteredContacts.map((contact, index) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  isSelected={contact.id === contactId}
                  onPress={() => selectContact(contact)}
                  showTopBorder={index === 0}
                />
              ))
            )}
          </View>

          {contactError ? <InlineError message={contactError} /> : null}
        </View>
      ) : null}

      {flowStep === "details" ? (
        <View className="gap-5">
          {selectedContact ? <ContactSummary contact={selectedContact} isFramed={mode !== "send"} label={copy.contactLabel} /> : null}

          <View className="gap-3">
            <FieldLabel label="Amount" />
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <View
                  className="rounded-[18px] border px-3.5 py-2.5"
                  style={{
                    backgroundColor: theme.backgroundElevated,
                    borderColor: amountError ? theme.danger : isAmountFocused ? theme.primary : theme.border,
                  }}
                >
                  <TextInput
                    keyboardType="decimal-pad"
                    maxLength={7}
                    onBlur={() => setIsAmountFocused(false)}
                    onChangeText={(nextValue) => {
                      onDismissError?.();
                      onChange(nextValue.replace(/[^0-9,.-]/g, "").replace(".", ","));
                    }}
                    onFocus={() => setIsAmountFocused(true)}
                    placeholder="0,00"
                    placeholderTextColor={theme.mutedText}
                    selectionColor={theme.primary}
                    style={{ color: theme.text, fontSize: 18, fontWeight: "800", lineHeight: 24, minHeight: 26, paddingVertical: 0 }}
                    value={value}
                  />
                  <View className="mt-2 flex-row items-center justify-between">
                    <AppText className="text-[12px]" style={{ color: theme.mutedText }}>
                      Preview: {amountPreview}
                    </AppText>
                    <AppText className="text-[12px]" style={{ color: theme.mutedText }}>
                      {formatCents(availableBalanceCents)}
                    </AppText>
                  </View>
                </View>
              )}
            />
            {amountError ? <InlineError message={amountError} /> : null}
          </View>

          <View className="gap-3">
            <FieldLabel label="Concept" optional />
            <Controller
              control={control}
              name="concept"
              render={({ field: { onChange, value } }) => (
                <View
                  className="rounded-[18px] border px-4 py-3"
                  style={{
                    backgroundColor: theme.backgroundElevated,
                    borderColor: conceptError ? theme.danger : isConceptFocused ? theme.primary : theme.border,
                  }}
                >
                  <TextInput
                    maxLength={42}
                    multiline
                    onBlur={() => setIsConceptFocused(false)}
                    onChangeText={(nextValue) => {
                      onDismissError?.();
                      onChange(nextValue);
                    }}
                    onFocus={() => setIsConceptFocused(true)}
                    placeholder="Dinner, gift, tickets..."
                    placeholderTextColor={theme.mutedText}
                    selectionColor={theme.primary}
                    style={{ color: theme.text, fontSize: 14, lineHeight: 18, minHeight: 42, paddingVertical: 0, textAlignVertical: "top" }}
                    value={value}
                  />
                </View>
              )}
            />
            {conceptError ? <InlineError message={conceptError} /> : null}
          </View>

          {errorMessage ? <InlineError message={errorMessage} /> : null}

          <PrimaryButton label="Continue" onPress={continueFromDetails} />
        </View>
      ) : null}

      {flowStep === "review" ? (
        <View className="gap-5">
          <View className="items-center rounded-[22px] px-4 py-4" style={{ backgroundColor: theme.backgroundElevated }}>
            <AppText className="text-[13px] font-semibold" style={{ color: theme.mutedText }}>
              Amount
            </AppText>
            <AppText
              adjustsFontSizeToFit
              className="mt-1 w-full text-center font-extrabold"
              minimumFontScale={0.68}
              numberOfLines={1}
              style={{
                color: theme.text,
                fontSize: 24,
                fontVariant: ["tabular-nums"],
                lineHeight: 32,
              }}
            >
              {amountPreview}
            </AppText>
          </View>

          {selectedContact ? <ContactSummary contact={selectedContact} isFramed={mode !== "send"} label={copy.contactLabel} /> : null}

          <View>
            <SummaryLine label="Concept" showTopBorder value={getValues("concept").trim() || "No concept"} />
            <SummaryLine
              label={mode === "send" ? "Balance after" : "Current balance"}
              value={formatCents(mode === "send" ? Math.max(availableBalanceCents - amountCents, 0) : availableBalanceCents)}
            />
          </View>

          {errorMessage ? <InlineError message={errorMessage} /> : null}

          <PrimaryButton icon={<SendHorizontal color={theme.textOnPrimary} size={18} strokeWidth={2.4} />} label={copy.actionLabel} onPress={submitReviewed} />
        </View>
      ) : null}

      {flowStep === "success" ? (
        <View className="items-center gap-5 py-8">
          <View className="h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: theme.primarySoft }}>
            <CircleCheck color={theme.primary} size={42} strokeWidth={2.4} />
          </View>
          <View className="items-center">
            <AppText className="text-center text-[22px] font-black" style={{ color: theme.text }}>
              {copy.successTitle}
            </AppText>
            <AppText className="mt-2 text-center text-[14px] leading-6" style={{ color: theme.mutedText }}>
              {copy.successDescription}
            </AppText>
          </View>
          {completedPayload ? (
            <View className="w-full">
              <SummaryLine label={copy.contactLabel} showTopBorder value={completedPayload.contact.name} />
              <SummaryLine label="Amount" value={formatAmount(completedPayload.amount)} />
              <SummaryLine label="Concept" value={completedPayload.concept || "No concept"} />
            </View>
          ) : null}
          <View className="w-full flex-row gap-3">
            <SecondaryButton label="Close" onPress={onClose} />
            <PrimaryButton label="View movements" onPress={onViewMovements} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  const { theme } = useAppTheme();

  return (
    <View className="pb-1">
      <View className="flex-row items-center justify-between">
        {[1, 2, 3].map((step) => {
          const isActive = step === currentStep;
          return (
            <View
              key={step}
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: isActive ? theme.primarySoft : theme.backgroundElevated }}
            >
              <AppText
                className="text-[13px] font-black"
                style={{
                  color: isActive ? theme.primary : theme.mutedText,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {step}/3
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SearchField({ onChangeQuery, query }: { onChangeQuery: (value: string) => void; query: string }) {
  const { theme } = useAppTheme();

  return (
    <View className="rounded-[20px] border px-4 py-3" style={{ backgroundColor: theme.backgroundElevated, borderColor: theme.border }}>
      <View className="flex-row items-center">
        <Search color={theme.mutedText} size={18} strokeWidth={2.4} />
        <TextInput
          className="ml-3 flex-1"
          onChangeText={onChangeQuery}
          placeholder="Search contact"
          placeholderTextColor={theme.mutedText}
          selectionColor={theme.primary}
          style={{ color: theme.text, fontSize: 15, fontWeight: "600", paddingVertical: 0 }}
          value={query}
        />
      </View>
    </View>
  );
}

function FieldLabel({ label, optional = false }: { label: string; optional?: boolean }) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-row items-center justify-between">
      <AppText className="text-[13px] font-semibold" style={{ color: theme.text }}>
        {label}
      </AppText>
      {optional ? (
        <AppText className="text-[12px]" style={{ color: theme.mutedText }}>
          Optional
        </AppText>
      ) : null}
    </View>
  );
}

function EmptyState({ description, title }: { description: string; title: string }) {
  const { theme } = useAppTheme();

  return (
    <View className="border-y py-4" style={{ borderColor: theme.border }}>
      <AppText className="text-[14px] font-black" style={{ color: theme.text }}>
        {title}
      </AppText>
      <AppText className="mt-1 text-[13px] leading-5" style={{ color: theme.mutedText }}>
        {description}
      </AppText>
    </View>
  );
}

function ContactRow({
  contact,
  isSelected,
  onPress,
  showTopBorder,
}: {
  contact: BizumContact;
  isSelected: boolean;
  onPress: () => void;
  showTopBorder: boolean;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={`Select ${contact.name}`}
      accessibilityRole="button"
      className="flex-row items-center py-3.5"
      onPress={onPress}
      style={{
        borderBottomColor: theme.border,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.border,
        borderTopWidth: showTopBorder ? StyleSheet.hairlineWidth : 0,
      }}
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: isSelected ? theme.primary : theme.backgroundMuted }}>
        <AppText className="text-[13px] font-black tracking-[1px]" style={{ color: isSelected ? theme.textOnPrimary : theme.text }}>
          {contact.initials}
        </AppText>
      </View>
      <View className="flex-1">
        <AppText className="text-[15px] font-semibold" style={{ color: theme.text }}>
          {contact.name}
        </AppText>
        <AppText className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>
          {contact.detail}
        </AppText>
      </View>
      {isSelected ? <Check color={theme.primary} size={18} strokeWidth={2.8} /> : null}
    </Pressable>
  );
}

function ContactSummary({ contact, isFramed = true, label }: { contact: BizumContact; isFramed?: boolean; label: string }) {
  const { theme } = useAppTheme();

  return (
    <View className={isFramed ? "rounded-[24px] px-4 py-4" : "px-1 py-1"} style={isFramed ? { backgroundColor: theme.backgroundElevated } : undefined}>
      <AppText className="mb-3 text-[12px] font-semibold uppercase" style={{ color: theme.mutedText }}>
        {label}
      </AppText>
      <View className="flex-row items-center">
        <View className="mr-4 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: theme.primarySoft }}>
          <AppText className="text-[20px] font-black tracking-[1px]" style={{ color: theme.primary }}>
            {contact.initials}
          </AppText>
        </View>
        <View className="flex-1">
          <AppText className="text-[22px] font-black leading-7" style={{ color: theme.text }}>
            {contact.name}
          </AppText>
          <AppText className="mt-1 text-[14px] font-semibold" style={{ color: theme.mutedText }}>
            {contact.detail}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function InlineError({ message }: { message: string }) {
  const { theme } = useAppTheme();

  return (
    <View className="border-l-4 px-3 py-2.5" style={{ backgroundColor: theme.primarySoft, borderLeftColor: theme.danger }}>
      <AppText className="text-[13px] font-semibold" style={{ color: theme.text }}>
        {message}
      </AppText>
    </View>
  );
}

function SummaryLine({ label, showTopBorder = false, value }: { label: string; showTopBorder?: boolean; value: string }) {
  const { theme } = useAppTheme();

  return (
    <View
      className={showTopBorder ? "mt-0 flex-row items-center justify-between rounded-[18px] px-4 py-3" : "mt-2 flex-row items-center justify-between rounded-[18px] px-4 py-3"}
      style={{ backgroundColor: theme.backgroundElevated }}
    >
      <AppText className="mr-4 text-[13px] font-semibold" style={{ color: theme.mutedText }}>
        {label}
      </AppText>
      <AppText className="flex-1 text-right text-[14px] font-semibold" style={{ color: theme.text }}>
        {value}
      </AppText>
    </View>
  );
}

function PrimaryButton({ icon, label, onPress }: { icon?: ReactNode; label: string; onPress: () => void }) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="flex-1 flex-row items-center justify-center rounded-full py-4"
      onPress={onPress}
      style={{ backgroundColor: theme.primary }}
    >
      {icon}
      <AppText className={icon ? "ml-2 text-[15px] font-black" : "text-[15px] font-black"} style={{ color: theme.textOnPrimary }}>
        {label}
      </AppText>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="flex-1 items-center justify-center rounded-full py-4"
      onPress={onPress}
      style={{ backgroundColor: theme.backgroundMuted }}
    >
      <AppText className="text-[15px] font-black" style={{ color: theme.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}
