import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { Check, ChevronDown, SendHorizontal, X } from "lucide-react-native";
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

export type BizumContact = {
  alias: string;
  id: string;
  initials: string;
  phone: string;
};

export type BizumSendPayload = {
  amount: number;
  concept: string;
  contact: BizumContact;
};

type BizumSendSheetProps = {
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: BizumSendPayload) => void;
  visible: boolean;
};

const bizumContacts: BizumContact[] = [
  { alias: "Marta Lozano", id: "marta-lozano", initials: "ML", phone: "+34 611 203 144" },
  { alias: "Paco Alvarez", id: "paco-alvarez", initials: "PA", phone: "+34 644 501 926" },
  { alias: "Luis Romero", id: "luis-romero", initials: "LR", phone: "+34 688 114 320" },
  { alias: "Paula Zamora", id: "paula-zamora", initials: "PZ", phone: "+34 622 775 418" },
];

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

export function BizumSendSheet({ isSubmitting, onClose, onSubmit, visible }: BizumSendSheetProps) {
  const { resolvedThemeName, theme } = useAppTheme();
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isConceptFocused, setIsConceptFocused] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible && !isSubmitting) {
      setAmount("");
      setConcept("");
      setIsComboboxOpen(false);
      setIsAmountFocused(false);
      setIsConceptFocused(false);
      setSelectedContactId(null);
    }
  }, [isSubmitting, visible]);

  const selectedContact = useMemo(
    () => bizumContacts.find((contact) => contact.id === selectedContactId) ?? null,
    [selectedContactId],
  );

  const isFormValid = Boolean(selectedContact) && Number(amount.replace(",", ".")) > 0;

  return (
    <Modal animationType="none" onRequestClose={onClose} transparent visible={visible}>
      <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(160)} style={styles.overlay}>
        <BlurView
          intensity={22}
          style={StyleSheet.absoluteFill}
          tint={resolvedThemeName === "dark" ? "dark" : "light"}
        />
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: resolvedThemeName === "dark" ? "rgba(4, 10, 18, 0.48)" : "rgba(15, 23, 42, 0.18)" }]}
        />

        <Pressable
          accessibilityLabel="Cerrar modal de Bizum"
          accessibilityRole="button"
          disabled={isSubmitting}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <Animated.View
          entering={SlideInDown.duration(320).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(220).easing(Easing.in(Easing.cubic))}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={{
              alignSelf: "center",
              backgroundColor: theme.border,
              borderRadius: 999,
              height: 5,
              marginBottom: 18,
              width: 52,
            }}
          />

          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-[28px] font-black" style={{ color: theme.text }}>
                Enviar Bizum
              </Text>
              <Text className="mt-2 text-[14px] leading-6" style={{ color: theme.mutedText }}>
                Selecciona el contacto, define el importe y anade un concepto si quieres dejar contexto.
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Cerrar formulario"
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center rounded-full"
              disabled={isSubmitting}
              onPress={() => {
                selectionHaptic();
                onClose();
              }}
              style={{ backgroundColor: theme.backgroundMuted }}
            >
              <X color={theme.text} size={20} strokeWidth={2.4} />
            </Pressable>
          </View>

          {isSubmitting ? (
            <View className="items-center justify-center px-3 py-12">
              <View
                className="mb-5 h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.primarySoft }}
              >
                <ActivityIndicator color={theme.primary} size="large" />
              </View>
              <Text className="text-[22px] font-black" style={{ color: theme.text }}>
                Enviando Bizum...
              </Text>
              <Text className="mt-3 text-center text-[14px] leading-6" style={{ color: theme.mutedText }}>
                Estamos preparando el movimiento para que aparezca en tus ultimos pagos.
              </Text>
            </View>
          ) : (
            <ScrollView
              bounces={false}
              contentContainerStyle={{ gap: 16, paddingTop: 24, paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="gap-3">
                <Text className="text-[13px] font-black uppercase tracking-[2px]" style={{ color: theme.mutedText }}>
                  Destinatario
                </Text>
                <Pressable
                  accessibilityLabel="Seleccionar destinatario"
                  accessibilityRole="button"
                  className="rounded-[24px] border px-4 py-4"
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
                          className="mr-3 h-12 w-12 items-center justify-center rounded-full"
                          style={{ backgroundColor: theme.primarySoft }}
                        >
                          <Text className="text-[14px] font-black tracking-[1px]" style={{ color: theme.primary }}>
                            {selectedContact.initials}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-[16px] font-black" style={{ color: theme.text }}>
                            {selectedContact.alias}
                          </Text>
                          <Text className="mt-1 text-[13px]" style={{ color: theme.mutedText }}>
                            {selectedContact.phone}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View className="flex-1">
                        <Text className="text-[16px] font-black" style={{ color: theme.text }}>
                          Elige un contacto
                        </Text>
                        <Text className="mt-1 text-[13px]" style={{ color: theme.mutedText }}>
                          Recientes y favoritos disponibles
                        </Text>
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
                    {bizumContacts.map((contact, index) => {
                      const isSelected = selectedContactId === contact.id;

                      return (
                        <Pressable
                          key={contact.id}
                          accessibilityLabel={`Seleccionar a ${contact.alias}`}
                          accessibilityRole="button"
                          className="flex-row items-center px-4 py-4"
                          onPress={() => {
                            selectionHaptic();
                            setSelectedContactId(contact.id);
                            setIsComboboxOpen(false);
                          }}
                          style={{
                            backgroundColor: isSelected ? theme.primarySoft : "transparent",
                            borderBottomColor: theme.border,
                            borderBottomWidth: index < bizumContacts.length - 1 ? StyleSheet.hairlineWidth : 0,
                          }}
                        >
                          <View
                            className="mr-3 h-11 w-11 items-center justify-center rounded-full"
                            style={{ backgroundColor: isSelected ? theme.primary : theme.backgroundMuted }}
                          >
                            <Text
                              className="text-[13px] font-black tracking-[1px]"
                              style={{ color: isSelected ? theme.textOnPrimary : theme.text }}
                            >
                              {contact.initials}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-[15px] font-black" style={{ color: theme.text }}>
                              {contact.alias}
                            </Text>
                            <Text className="mt-1 text-[13px]" style={{ color: theme.mutedText }}>
                              {contact.phone}
                            </Text>
                          </View>
                          {isSelected ? <Check color={theme.primary} size={18} strokeWidth={2.8} /> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>

              <View className="gap-3">
                <Text className="text-[13px] font-black uppercase tracking-[2px]" style={{ color: theme.mutedText }}>
                  Importe
                </Text>
                <View
                  className="rounded-[24px] border px-4 py-4"
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
                      setAmount(sanitizedValue);
                    }}
                    onFocus={() => setIsAmountFocused(true)}
                    placeholder="0,00"
                    placeholderTextColor={theme.mutedText}
                    selectionColor={theme.primary}
                    style={{
                      color: theme.text,
                      fontSize: 30,
                      fontWeight: "900",
                      lineHeight: 38,
                      minHeight: 40,
                      paddingVertical: 0,
                    }}
                    value={amount}
                  />
                  <Text className="mt-2 text-[13px]" style={{ color: theme.mutedText }}>
                    Vista previa: {formatAmountPreview(amount)}
                  </Text>
                </View>
              </View>

              <View className="gap-3">
                <Text className="text-[13px] font-black uppercase tracking-[2px]" style={{ color: theme.mutedText }}>
                  Concepto
                </Text>
                <View
                  className="rounded-[24px] border px-4 py-4"
                  style={{
                    backgroundColor: isConceptFocused ? theme.card : theme.backgroundElevated,
                    borderColor: isConceptFocused ? theme.primary : theme.border,
                  }}
                >
                  <TextInput
                    maxLength={42}
                    multiline
                    onBlur={() => setIsConceptFocused(false)}
                    onChangeText={setConcept}
                    onFocus={() => setIsConceptFocused(true)}
                    placeholder="Cena, regalo, entradas..."
                    placeholderTextColor={theme.mutedText}
                    selectionColor={theme.primary}
                    style={{
                      color: theme.text,
                      fontSize: 16,
                      lineHeight: 22,
                      minHeight: 68,
                      paddingVertical: 0,
                      textAlignVertical: "top",
                    }}
                    value={concept}
                  />
                </View>
              </View>

              <View className="mt-2 flex-row gap-3">
                <Pressable
                  accessibilityLabel="Cancelar envio de Bizum"
                  accessibilityRole="button"
                  className="flex-1 items-center justify-center rounded-[24px] py-4"
                  onPress={() => {
                    selectionHaptic();
                    onClose();
                  }}
                  style={{ backgroundColor: theme.backgroundMuted }}
                >
                  <Text className="text-[15px] font-black" style={{ color: theme.text }}>
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Enviar Bizum"
                  accessibilityRole="button"
                  className="flex-1 flex-row items-center justify-center rounded-[24px] py-4"
                  disabled={!isFormValid}
                  onPress={() => {
                    if (!selectedContact || !isFormValid) {
                      return;
                    }

                    selectionHaptic();
                    onSubmit({
                      amount: Number(amount.replace(",", ".")),
                      concept: concept.trim(),
                      contact: selectedContact,
                    });
                  }}
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
                  <Text
                    className="ml-2 text-[15px] font-black"
                    style={{ color: isFormValid ? theme.textOnPrimary : theme.mutedText }}
                  >
                    Enviar Bizum
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    maxHeight: "88%",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
  },
});
