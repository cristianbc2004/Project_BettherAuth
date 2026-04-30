import { Redirect } from "expo-router";
import { Text, useWindowDimensions, View } from "react-native";
import { CreditCard, Eye, LockKeyhole, Plus } from "lucide-react-native";

import { FinanceScreenShell } from "@/features/finance/components/finance-screen-shell";
import { WalletCardPreview } from "@/features/finance/components/finance-card";
import { walletCards } from "@/features/finance/services/finance-mock";
import { authClient } from "@/features/auth/services/auth-client";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

const cardActions = [
  { icon: Eye, label: "Ver PIN" },
  { icon: LockKeyhole, label: "Bloquear" },
  { icon: Plus, label: "Nueva" },
];

export default function CardsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 40, 360);

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <FinanceScreenShell
      eyebrow="Wallet"
      subtitle="Tarjetas fisicas y digitales con estados claros, acciones rapidas y diseno premium."
      title="Tarjetas"
    >
      <View className="gap-4">
        {walletCards.map((card) => (
          <View key={card.id}>
            <WalletCardPreview card={card} width={cardWidth} />
          </View>
        ))}
      </View>

      <View className="flex-row gap-3">
        {cardActions.map((action) => {
          const Icon = action.icon;

          return (
            <View
              className="flex-1 items-center rounded-[24px] px-3 py-5"
              key={action.label}
              style={{ backgroundColor: theme.card }}
            >
              <View className="h-12 w-12 items-center justify-center rounded-[18px]" style={{ backgroundColor: theme.backgroundMuted }}>
                <Icon color={theme.text} size={22} strokeWidth={2.4} />
              </View>
              <Text className="mt-3 text-[13px] font-black" numberOfLines={1} style={{ color: theme.text }}>
                {action.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="rounded-[30px] border p-5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <View className="flex-row items-center">
          <View className="mr-4 h-12 w-12 items-center justify-center rounded-[18px]" style={{ backgroundColor: theme.primarySoft }}>
            <CreditCard color={theme.primary} size={23} strokeWidth={2.4} />
          </View>
          <View className="flex-1">
            <Text className="text-[17px] font-black" style={{ color: theme.text }}>
              Limite mensual
            </Text>
            <Text className="mt-1 text-[13px]" style={{ color: theme.mutedText }}>
              2.150 EUR disponibles de 3.000 EUR
            </Text>
          </View>
        </View>
        <View className="mt-5 h-2 overflow-hidden rounded-full" style={{ backgroundColor: theme.backgroundMuted }}>
          <View className="h-full w-[72%] rounded-full" style={{ backgroundColor: theme.primary }} />
        </View>
      </View>
    </FinanceScreenShell>
  );
}
