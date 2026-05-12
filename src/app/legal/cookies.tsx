import { Redirect } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { AppText } from "@/shared/components/ui/app-text";

const cookieSections = [
  {
    body: "Usamos cookies tecnicas y almacenamiento seguro para mantener tu sesion activa, recordar preferencias basicas y proteger el acceso a la cuenta.",
    title: "Uso esencial",
  },
  {
    body: "Las preferencias de idioma, tema y navegacion pueden guardarse en el dispositivo para que la experiencia sea consistente al volver a abrir la app.",
    title: "Preferencias",
  },
  {
    body: "No vendemos informacion personal ni usamos cookies publicitarias en esta version demo. Los datos mostrados son estaticos o de prueba.",
    title: "Publicidad",
  },
];

export default function CookiePolicyScreen() {
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="px-5 pt-5">
        <AppScreenHeader fallbackHref="/home" title="Cookies" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="pb-5">
          <AppText className="text-[18px] font-bold leading-6" style={{ color: theme.text }}>
            Transparencia sobre datos locales
          </AppText>
          <AppText className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>
            Esta pantalla es informativa y ayuda a que la app se sienta mas completa antes de conectar textos legales reales.
          </AppText>
        </View>

        {cookieSections.map((section) => (
          <View
            className="border-t py-5"
            key={section.title}
            style={{ borderColor: theme.border }}
          >
            <AppText className="text-[16px] font-bold" style={{ color: theme.text }}>
              {section.title}
            </AppText>
            <AppText className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>
              {section.body}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
