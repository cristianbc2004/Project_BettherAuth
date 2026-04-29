import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { Bitcoin, Landmark, PiggyBank, TrendingUp } from "lucide-react-native";

import { FinanceScreenShell } from "@/features/finance/components/finance-screen-shell";
import { authClient } from "@/features/auth/services/auth-client";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

const assetCards = [
  {
    amount: "2.840 EUR",
    icon: PiggyBank,
    label: "Ahorro",
    meta: "+8,2% este mes",
  },
  {
    amount: "1.120 EUR",
    icon: Bitcoin,
    label: "Cripto",
    meta: "BTC y ETH",
  },
  {
    amount: "3.421 EUR",
    icon: Landmark,
    label: "Depositos",
    meta: "Rendimiento fijo",
  },
];

export default function AssetsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <FinanceScreenShell
      activeTab="assets"
      eyebrow="Activos"
      subtitle="Una vista visual para ahorro, inversiones y posicion global. El contenido fino lo ajustamos despues."
      title="Patrimonio"
    >
      <View className="rounded-[34px] border p-6" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="text-[12px] font-black uppercase tracking-[2px]" style={{ color: theme.mutedText }}>
              Total invertido
            </Text>
            <Text className="mt-3 text-[40px] font-black" style={{ color: theme.text }}>
              7.381 EUR
            </Text>
          </View>
          <View className="rounded-full px-3 py-2" style={{ backgroundColor: theme.primarySoft }}>
            <Text className="text-[12px] font-black" style={{ color: theme.primary }}>
              +12,4%
            </Text>
          </View>
        </View>

        <View className="mt-6 h-28 flex-row items-end gap-2">
          {[42, 68, 54, 82, 64, 92, 78].map((height, index) => (
            <View className="flex-1 justify-end" key={`${height}-${index}`}>
              <View
                className="rounded-t-[12px]"
                style={{ backgroundColor: index === 5 ? theme.primary : theme.backgroundMuted, height }}
              />
            </View>
          ))}
        </View>
      </View>

      <View>
        {assetCards.map((asset, index) => {
          const Icon = asset.icon;

          return (
            <View key={asset.label}>
              <Animated.View
                className="flex-row items-center px-1 py-4"
                entering={FadeInDown.duration(450)
                  .delay(index * 100)
                  .easing(Easing.out(Easing.quad))}
              >
                <View className="mr-4 h-14 w-14 items-center justify-center rounded-[20px]" style={{ backgroundColor: theme.backgroundMuted }}>
                  <Icon color={theme.text} size={24} strokeWidth={2.4} />
                </View>
                <View className="flex-1">
                  <Text className="text-[17px] font-black" style={{ color: theme.text }}>
                    {asset.label}
                  </Text>
                  <Text className="mt-1 text-[13px]" style={{ color: theme.mutedText }}>
                    {asset.meta}
                  </Text>
                </View>
                <Text className="text-[16px] font-black" style={{ color: theme.text }}>
                  {asset.amount}
                </Text>
              </Animated.View>
              {index < assetCards.length - 1 ? (
                <View className="ml-[73px] h-px" style={{ backgroundColor: theme.border }} />
              ) : null}
            </View>
          );
        })}
      </View>

      <View className="px-1 py-2">
        <View className="flex-row items-center">
          <TrendingUp color={theme.primary} size={24} strokeWidth={2.5} />
          <Text className="ml-3 text-[17px] font-black" style={{ color: theme.text }}>
            Proyeccion semanal
          </Text>
        </View>
        <Text className="mt-3 text-[14px] leading-6" style={{ color: theme.mutedText }}>
          Tu balance mantiene una tendencia positiva. Esta tarjeta queda como espacio visual para insights futuros.
        </Text>
      </View>
    </FinanceScreenShell>
  );
}
