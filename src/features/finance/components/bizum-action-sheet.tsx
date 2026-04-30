import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Check, ChevronDown, SendHorizontal, X } from "lucide-react-native";
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";

export type BizumContact = {
  alias: string;
  id: string;
  initials: string;
  phone: string;
};

export type BizumActionPayload = {
  amount: number;
  concept: string;
  contact: BizumContact;
};

export type BizumSheetMode = "request" | "send";

type BizumActionSheetProps = {
  isSubmitting: boolean;
  mode: BizumSheetMode;
  onClose: () => void;
  onSubmit: (payload: BizumActionPayload) => void;
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

export function BizumActionSheet({ isSubmitting, mode, onClose, onSubmit, visible }: BizumActionSheetProps) {
  const { resolvedThemeName, theme } = useAppTheme();
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isConceptFocused, setIsConceptFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  useEffect(() => {
    const showEvent = process.env.EXPO_OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = process.env.EXPO_OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(Math.max(0, event.endCoordinates.height - insets.bottom));
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [insets.bottom]);

  useEffect(() => {
    if (!visible && !isSubmitting) {
      setAmount("");
      setConcept("");
      setIsComboboxOpen(false);
      setIsAmountFocused(false);
      setIsConceptFocused(false);
      setKeyboardHeight(0);
      setSelectedContactId(null);
    }
  }, [isSubmitting, visible]);

  const selectedContact = useMemo(
    () => bizumContacts.find((contact) => contact.id === selectedContactId) ?? null,
    [selectedContactId],
  );

  const isFormValid = Boolean(selectedContact) && Number(amount.replace(",", ".")) > 0;
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
      amount: Number(amount.replace(",", ".")),
      concept: concept.trim(),
      contact: selectedContact,
    });
  };

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

        <View
          style={[
            styles.sheetHost,
            {
              paddingBottom: keyboardHeight,
            },
          ]}
        >
          <Animated.View
            entering={SlideInDown.duration(320).easing(Easing.out(Easing.cubic))}
            exiting={SlideOutDown.duration(220).easing(Easing.in(Easing.cubic))}
            style={[
              styles.sheet,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                maxHeight:
                  keyboardHeight > 0
                    ? Math.max(320, windowHeight - keyboardHeight - insets.top - 16)
                    : Math.min(windowHeight * 0.88, 760),
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
                  {copy.title}
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
                  {copy.loadingTitle}
                </Text>
                <Text className="mt-3 text-center text-[14px] leading-6" style={{ color: theme.mutedText }}>
                  {copy.loadingDescription}
                </Text>
              </View>
            ) : (
              <>
                <ScrollView
                  bounces={false}
                  contentContainerStyle={{ gap: 14, paddingTop: 18, paddingBottom: 12 }}
                  keyboardDismissMode="interactive"
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  style={styles.formScroll}
                >
                  <View className="gap-3">
                    <Text className="text-[13px] font-black uppercase tracking-[2px]" style={{ color: theme.mutedText }}>
                      {copy.contactLabel}
                    </Text>
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
                              <Text className="text-[14px] font-black tracking-[1px]" style={{ color: theme.primary }}>
                                {selectedContact.initials}
                              </Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-[15px] font-black" style={{ color: theme.text }}>
                                {selectedContact.alias}
                              </Text>
                              <Text className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>
                                {selectedContact.phone}
                              </Text>
                            </View>
                          </>
                        ) : (
                          <View className="flex-1">
                            <Text className="text-[15px] font-black" style={{ color: theme.text }}>
                              Elige un contacto
                            </Text>
                            <Text className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>
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
                              className="flex-row items-center px-4 py-3.5"
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
                                className="mr-3 h-10 w-10 items-center justify-center rounded-full"
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
                                <Text className="text-[14px] font-black" style={{ color: theme.text }}>
                                  {contact.alias}
                                </Text>
                                <Text className="mt-1 text-[12px]" style={{ color: theme.mutedText }}>
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
                          setAmount(sanitizedValue);
                        }}
                        onFocus={() => setIsAmountFocused(true)}
                        placeholder="0,00"
                        placeholderTextColor={theme.mutedText}
                        selectionColor={theme.primary}
                        style={{
                          color: theme.text,
                          fontSize: 21,
                          fontWeight: "900",
                          lineHeight: 26,
                          minHeight: 28,
                          paddingVertical: 0,
                        }}
                        value={amount}
                      />
                      <Text className="mt-1.5 text-[12px]" style={{ color: theme.mutedText }}>
                        Vista previa: {formatAmountPreview(amount)}
                      </Text>
                    </View>
                  </View>

                  <View className="gap-3">
                    <Text className="text-[13px] font-black uppercase tracking-[2px]" style={{ color: theme.mutedText }}>
                      Concepto
                    </Text>
                    <View
                      className="rounded-[20px] border px-4 py-3"
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
                </ScrollView>

                <View className="border-t pt-3" style={{ borderColor: theme.border }}>
                  <View className="flex-row gap-3">
                    <Pressable
                      accessibilityLabel="Cancelar operacion de Bizum"
                      accessibilityRole="button"
                      className="flex-1 items-center justify-center rounded-[22px] py-3.5"
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
                      <Text
                        className="ml-2 text-[15px] font-black"
                        style={{ color: isFormValid ? theme.textOnPrimary : theme.mutedText }}
                      >
                        {copy.buttonLabel}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetHost: {
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
  },
  formScroll: {
    flexShrink: 1,
  },
});
