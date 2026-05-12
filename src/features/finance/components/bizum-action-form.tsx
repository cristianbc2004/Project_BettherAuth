import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Check, ChevronDown, SendHorizontal } from "lucide-react-native";

import type { BizumActionMode, BizumContact } from "@/features/finance/lib/bizum-api";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { AppText } from "@/shared/components/ui/app-text";

export type BizumActionPayload = {
  amount: number;
  concept: string;
  contact: BizumContact;
};

type BizumActionFormProps = {
  contacts: BizumContact[];
  errorMessage?: string | null;
  isSubmitting: boolean;
  mode: BizumActionMode;
  onCancel: () => void;
  onDismissError?: () => void;
  onSubmit: (payload: BizumActionPayload) => void;
};

function formatAmountPreview(value: string) {
  if (!value) {
    return "0,00 EUR";
  }

  const normalized = Number(value.replace(",", "."));

  if (Number.isNaN(normalized)) {
    return "0,00 EUR";
  }

  return `${normalized.toFixed(2).replace(".", ",")} EUR`;
}

export function BizumActionForm({
  contacts,
  errorMessage,
  isSubmitting,
  mode,
  onCancel,
  onDismissError,
  onSubmit,
}: BizumActionFormProps) {
  const { theme } = useAppTheme();
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isConceptFocused, setIsConceptFocused] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const conceptInputRef = useRef<TextInput>(null);

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId) ?? null,
    [contacts, selectedContactId],
  );
  const parsedAmount = Number(amount.replace(",", "."));
  const isFormValid = Boolean(selectedContact) && Number.isFinite(parsedAmount) && parsedAmount > 0;
  const copy =
    mode === "send"
      ? {
          actionAccessibilityLabel: "Enviar Bizum",
          buttonLabel: "Enviar Bizum",
          contactLabel: "Destinatario",
          loadingDescription: "Estamos preparando el movimiento para que aparezca en tus ultimos pagos.",
          loadingTitle: "Enviando Bizum...",
          title: "Enviar Bizum",
        }
      : {
          actionAccessibilityLabel: "Pedir Bizum",
          buttonLabel: "Pedir Bizum",
          contactLabel: "Persona",
          loadingDescription: "Estamos preparando la solicitud y avisaremos cuando se reciba el Bizum.",
          loadingTitle: "Pidiendo Bizum...",
          title: "Pedir Bizum",
        };

  const handleSubmit = () => {
    if (!selectedContact || !isFormValid) {
      return;
    }

    selectionHaptic();
    onSubmit({
      amount: parsedAmount,
      concept: concept.trim(),
      contact: selectedContact,
    });
  };

  return (
    <View>
      <View
        className="overflow-hidden rounded-[28px] border p-5"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderCurve: "continuous",
          boxShadow: "0 18px 40px rgba(7, 17, 31, 0.08)",
        }}
      >
        <AppText className="text-[22px] font-black" style={{ color: theme.text }}>
          {copy.title}
        </AppText>

        {isSubmitting ? (
          <View className="items-center justify-center px-3 py-12">
            <View
              className="mb-5 h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.primarySoft }}
            >
              <ActivityIndicator color={theme.primary} size="large" />
            </View>
            <AppText className="text-[18px] font-black" style={{ color: theme.text }}>
              {copy.loadingTitle}
            </AppText>
            <AppText className="mt-3 text-center text-[14px] leading-6" style={{ color: theme.mutedText }}>
              {copy.loadingDescription}
            </AppText>
          </View>
        ) : (
          <View className="gap-3.5 pt-[18px]">
            <View className="gap-3">
              <AppText className="text-[13px] font-black uppercase tracking-[2px]" style={{ color: theme.mutedText }}>
                {copy.contactLabel}
              </AppText>
              <Pressable
                accessibilityLabel="Seleccionar destinatario"
                accessibilityRole="button"
                className="rounded-[20px] border px-4 py-3"
                onPress={() => {
                  selectionHaptic();
                  setIsComboboxOpen((current) => !current);
                }}
                style={{
                  backgroundColor: theme.backgroundElevated,
                  borderColor: isComboboxOpen ? theme.primary : theme.border,
                }}
              >
                <View className="flex-row items-center">
                  {selectedContact ? (
                    <>
                      <View
                        className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: theme.primarySoft }}
                      >
                        <AppText className="text-[14px] font-black tracking-[1px]" style={{ color: theme.primary }}>
                          {selectedContact.initials}
                        </AppText>
                      </View>
                      <View className="flex-1">
                        <AppText className="text-[15px] font-black" style={{ color: theme.text }}>
                          {selectedContact.name}
                        </AppText>
                        <AppText className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>
                          {selectedContact.detail}
                        </AppText>
                      </View>
                    </>
                  ) : (
                    <View className="flex-1">
                      <AppText className="text-[15px] font-black" style={{ color: theme.text }}>
                        Elige un contacto
                      </AppText>
                      <AppText className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>
                        Lista real de usuarios registrados
                      </AppText>
                    </View>
                  )}
                  <ChevronDown
                    color={theme.mutedText}
                    size={20}
                    strokeWidth={2.4}
                    style={{ transform: [{ rotate: isComboboxOpen ? "180deg" : "0deg" }] }}
                  />
                </View>
              </Pressable>

              {isComboboxOpen ? (
                <View
                  className="overflow-hidden rounded-[28px] border"
                  style={{
                    backgroundColor: theme.backgroundElevated,
                    borderColor: theme.border,
                  }}
                >
                  {contacts.map((contact, index) => {
                    const isSelected = selectedContactId === contact.id;

                    return (
                      <Pressable
                        key={contact.id}
                        accessibilityLabel={`Seleccionar a ${contact.name}`}
                        accessibilityRole="button"
                        className="flex-row items-center px-4 py-3.5"
                        onPress={() => {
                          selectionHaptic();
                          onDismissError?.();
                          setSelectedContactId(contact.id);
                          setIsComboboxOpen(false);
                        }}
                        style={{
                          backgroundColor: isSelected ? theme.primarySoft : "transparent",
                          borderBottomColor: theme.border,
                          borderBottomWidth: index < contacts.length - 1 ? StyleSheet.hairlineWidth : 0,
                        }}
                      >
                        <View
                          className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: isSelected ? theme.primary : theme.backgroundMuted }}
                        >
                          <AppText
                            className="text-[13px] font-black tracking-[1px]"
                            style={{ color: isSelected ? theme.textOnPrimary : theme.text }}
                          >
                            {contact.initials}
                          </AppText>
                        </View>
                        <View className="flex-1">
                          <AppText className="text-[14px] font-black" style={{ color: theme.text }}>
                            {contact.name}
                          </AppText>
                          <AppText className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>
                            {contact.detail}
                          </AppText>
                        </View>
                        {isSelected ? <Check color={theme.primary} size={18} strokeWidth={2.8} /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              ) : contacts.length === 0 ? (
                <View
                  className="rounded-[20px] border px-4 py-3"
                  style={{ backgroundColor: theme.backgroundElevated, borderColor: theme.border }}
                >
                  <AppText className="text-[13px] font-black" style={{ color: theme.text }}>
                    No hay usuarios disponibles
                  </AppText>
                  <AppText className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>
                    Crea otro usuario para probar envios o solicitudes de Bizum.
                  </AppText>
                </View>
              ) : null}
            </View>

            <View className="gap-3">
              <AppText className="text-[13px] font-black uppercase tracking-[2px]" style={{ color: theme.mutedText }}>
                Importe
              </AppText>
              <View
                className="rounded-[22px] border px-4 py-3.5"
                style={{
                  backgroundColor: isAmountFocused ? theme.card : theme.backgroundElevated,
                  borderColor: isAmountFocused ? theme.primary : theme.border,
                }}
              >
                <TextInput
                  keyboardType="decimal-pad"
                  maxLength={7}
                  onBlur={() => setIsAmountFocused(false)}
                  onChangeText={(value) => {
                    const sanitizedValue = value.replace(/[^0-9,.-]/g, "").replace(".", ",");
                    onDismissError?.();
                    setAmount(sanitizedValue);
                  }}
                  onFocus={() => {
                    setIsAmountFocused(true);
                  }}
                  onSubmitEditing={() => {
                    conceptInputRef.current?.focus();
                  }}
                  placeholder="0,00"
                  placeholderTextColor={theme.mutedText}
                  returnKeyType="next"
                  selectionColor={theme.primary}
                  style={{
                    color: theme.text,
                    fontSize: 19,
                    fontWeight: "900",
                    lineHeight: 26,
                    minHeight: 28,
                    paddingVertical: 0,
                  }}
                  value={amount}
                />
                <AppText className="mt-1.5 text-[12px]" style={{ color: theme.mutedText }}>
                  Vista previa: {formatAmountPreview(amount)}
                </AppText>
              </View>
            </View>

            <View className="gap-3">
              <AppText className="text-[13px] font-black uppercase tracking-[2px]" style={{ color: theme.mutedText }}>
                Concepto
              </AppText>
              <View
                className="rounded-[20px] border px-4 py-3"
                style={{
                  backgroundColor: isConceptFocused ? theme.card : theme.backgroundElevated,
                  borderColor: isConceptFocused ? theme.primary : theme.border,
                }}
              >
                <TextInput
                  ref={conceptInputRef}
                  maxLength={42}
                  multiline
                  onBlur={() => setIsConceptFocused(false)}
                  onChangeText={setConcept}
                  onFocus={() => {
                    setIsConceptFocused(true);
                  }}
                  placeholder="Cena, regalo, entradas..."
                  placeholderTextColor={theme.mutedText}
                  selectionColor={theme.primary}
                  style={{
                    color: theme.text,
                    fontSize: 14,
                    lineHeight: 18,
                    minHeight: 42,
                    paddingVertical: 0,
                    textAlignVertical: "top",
                  }}
                  value={concept}
                />
              </View>
            </View>

            {errorMessage ? (
              <View
                className="rounded-[18px] border px-3 py-2.5"
                style={{ backgroundColor: theme.primarySoft, borderColor: theme.border }}
              >
                <AppText className="text-[13px] font-black" style={{ color: theme.text }}>
                  {errorMessage}
                </AppText>
              </View>
            ) : null}

            <View className="border-t pt-3" style={{ borderColor: theme.border }}>
              <View className="flex-row gap-3">
                <Pressable
                  accessibilityLabel="Cancelar operacion de Bizum"
                  accessibilityRole="button"
                  className="flex-1 items-center justify-center rounded-[22px] py-3.5"
                  onPress={() => {
                    selectionHaptic();
                    onCancel();
                  }}
                  style={{ backgroundColor: theme.backgroundMuted }}
                >
                  <AppText className="text-[15px] font-black" style={{ color: theme.text }}>
                    Cancelar
                  </AppText>
                </Pressable>

                <Pressable
                  accessibilityLabel={copy.actionAccessibilityLabel}
                  accessibilityRole="button"
                  className="flex-1 flex-row items-center justify-center rounded-[22px] py-3.5"
                  disabled={!isFormValid}
                  onPress={handleSubmit}
                  style={{
                    backgroundColor: isFormValid ? theme.primary : theme.backgroundMuted,
                    opacity: isFormValid ? 1 : 0.6,
                  }}
                >
                  <SendHorizontal
                    color={isFormValid ? theme.textOnPrimary : theme.mutedText}
                    size={18}
                    strokeWidth={2.4}
                  />
                  <AppText
                    className="ml-2 text-[15px] font-black"
                    style={{ color: isFormValid ? theme.textOnPrimary : theme.mutedText }}
                  >
                    {copy.buttonLabel}
                  </AppText>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
