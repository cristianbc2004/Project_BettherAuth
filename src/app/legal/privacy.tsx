import { Redirect } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

const privacySections = [
  {
    body: "Los datos de cuenta se usan para identificar al usuario, mantener la sesion y aplicar permisos como usuario o administrador.",
    title: "Datos de cuenta",
  },
  {
    body: "La informacion financiera y de trabajadores mostrada aqui funciona como contenido de demostracion para navegar la experiencia.",
    title: "Datos de demo",
  },
  {
    body: "Las acciones sensibles deben pasar por autenticacion, validacion de sesion y controles de rol antes de llegar a servicios reales.",
    title: "Seguridad",
  },
];

export default function PrivacyPolicyScreen() {
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
        <AppScreenHeader fallbackHref="/home" title="Privacidad" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="pb-5">
          <Text className="text-[18px] font-bold leading-6" style={{ color: theme.text }}>
            Una base clara para proteger la cuenta
          </Text>
          <Text className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>
            Este contenido es estatico y sirve como placeholder realista para una futura revision legal.
          </Text>
        </View>

        {privacySections.map((section) => (
          <View
            className="border-t py-5"
            key={section.title}
            style={{ borderColor: theme.border }}
          >
            <Text className="text-[16px] font-bold" style={{ color: theme.text }}>
              {section.title}
            </Text>
            <Text className="mt-2 text-[15px] leading-6" style={{ color: theme.mutedText }}>
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
