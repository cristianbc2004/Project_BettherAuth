import { useMemo } from "react";
import { Pressable } from "react-native";
import { Redirect } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { BizumActionForm } from "@/features/finance/components/bizum-action-form";
import { BizumActionSkeleton } from "@/features/finance/components/bizum-skeletons";
import type { BizumActionMode } from "@/features/finance/lib/bizum-api";
import { useBizumActionFlow } from "@/features/finance/lib/use-bizum-action-flow";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

type BizumActionScreenProps = {
  mode: BizumActionMode;
};

export function BizumActionScreen({ mode }: BizumActionScreenProps) {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const {
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
  } = useBizumActionFlow(mode, session?.user.id);

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
            onSubmit={submitBizumAction}
            onViewMovements={viewMovements}
          />
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
