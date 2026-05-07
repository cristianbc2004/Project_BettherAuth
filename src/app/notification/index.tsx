import { useCallback, type ComponentType, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { ArrowDownLeft, ArrowRightLeft, Bell, CircleAlert, Send, Wallet } from "lucide-react-native";
import Animated, { Easing, FadeInDown, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { appConfig } from "@/shared/lib/app-config";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";

type NotificationActionPayload = {
  bizumRequestId?: string;
};

type NotificationItem = {
  accent: string;
  actionPayload?: NotificationActionPayload | null;
  bizumRequestId?: string | null;
  body?: string | null;
  icon: ComponentType<any>;
  iconAccent: string;
  id: string;
  title: string;
  timestamp: string;
  type: NotificationType;
  unread: boolean;
};

type NotificationType = "TRANSFER" | "BIZUM_REQUEST" | "BIZUM_SENT" | "BIZUM_RECEIVED" | "ALERT";

type NotificationsGetResponse = {
  notifications: Array<{
    actionPayload?: NotificationActionPayload | null;
    bizumRequestId?: string | null;
    body?: string | null;
    createdAt: string;
    emisorName?: string | null;
    id: string;
    isUnread: boolean;
    timestamp: string;
    title: string;
    type: NotificationType;
  }>;
};

function getAuthCookie() {
  return (authClient as typeof authClient & { getCookie?: () => string }).getCookie?.() ?? "";
}

async function fetchNotifications() {
  // Consulta al endpoint real de notificaciones (no usa mock local).
  return fetch(`${appConfig.authApiUrl}/api/notifications`, {
    headers: {
      "Content-Type": "application/json",
      cookie: getAuthCookie(),
    },
  });
}

function mapNotificationToItem(notification: NotificationsGetResponse["notifications"][number]): NotificationItem {
  // Mapea el tipo de notificacion a icono y paleta visual consistente.
  const accentByType: Record<NotificationType, { accent: string; icon: ComponentType<any>; iconAccent: string }> = {
    ALERT: { accent: "#3f2b1b", icon: CircleAlert, iconAccent: "#f0b245" },
    BIZUM_RECEIVED: { accent: "#203946", icon: Wallet, iconAccent: "#4dc4ff" },
    BIZUM_REQUEST: { accent: "#2e2950", icon: ArrowDownLeft, iconAccent: "#8d7cff" },
    BIZUM_SENT: { accent: "#1f3640", icon: Send, iconAccent: "#67dbc8" },
    TRANSFER: { accent: "#1f3640", icon: ArrowRightLeft, iconAccent: "#67dbc8" },
  };

  const accents = accentByType[notification.type] ?? accentByType.ALERT;

  return {
    accent: accents.accent,
    actionPayload: notification.actionPayload,
    bizumRequestId: notification.bizumRequestId,
    body: notification.body,
    icon: accents.icon,
    iconAccent: accents.iconAccent,
    id: notification.id,
    timestamp: notification.timestamp,
    title: notification.title,
    type: notification.type,
    unread: notification.isUnread,
  };
}

function resolveBizumRequestId(item: NotificationItem) {
  if (item.bizumRequestId) {
    return item.bizumRequestId;
  }

  return item.actionPayload?.bizumRequestId ?? null;
}

function NotificationRow({
  accent,
  body,
  icon,
  iconAccent,
  onPress,
  timestamp,
  title,
  unread,
}: NotificationItem & { onPress?: () => void }) {
  const { theme } = useAppTheme();
  const Icon = icon;

  return (
    <Pressable className="flex-row items-center px-2 py-5" disabled={!onPress} onPress={onPress}>
      <View className="mr-4 h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: accent }}>
        <Icon color={iconAccent} size={22} strokeWidth={2.4} />
      </View>

      <View className="flex-1">
        <Text className="text-[17px] font-semibold" style={{ color: theme.text }}>
          {title}
        </Text>
        {body ? (
          <Text className="mt-1 text-[13px] leading-5" numberOfLines={2} style={{ color: theme.mutedText }}>
            {body}
          </Text>
        ) : null}
        <Text className="mt-1 text-sm" style={{ color: theme.mutedText }}>
          {timestamp}
        </Text>
      </View>

      {unread ? <View className="ml-3 h-3 w-3 rounded-full" style={{ backgroundColor: theme.primary }} /> : null}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const showSessionLoading = useSessionLoadingDelay(isPending);
  const { theme } = useAppTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetchNotifications();
      if (!response.ok) {
        setErrorMessage("No se pudieron cargar las notificaciones.");
        return;
      }

      const payload = (await response.json()) as NotificationsGetResponse;
      // Adapta la respuesta del backend al shape usado por la UI.
      setNotifications((payload.notifications ?? []).map(mapNotificationToItem));
    } catch {
      setErrorMessage("No se pudieron cargar las notificaciones.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!session?.user.id) {
        return;
      }

      // Carga inicial y recarga al volver de la modal de pago.
      void loadNotifications();
    }, [loadNotifications, session?.user.id]),
  );

  if (showSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session?.user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="absolute inset-0">
        <View className="absolute inset-0" style={{ backgroundColor: theme.background }} />
      </View>

      <ScrollView
        bounces={false}
        contentContainerClassName="px-5 pb-10 pt-6"
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        <AppScreenHeader fallbackHref={"/home" as never} title="Notificaciones" />

        <Text className="mb-4 px-1 text-xs font-medium uppercase tracking-[1.5px]" style={{ color: theme.mutedText }}>
          Ultima actividad
        </Text>

        {isLoading ? (
          // Estado de carga mientras se resuelve la peticion.
          <Animated.View entering={FadeInDown.duration(260)} exiting={FadeOut.duration(180)}>
            <Text className="px-2 text-sm" style={{ color: theme.mutedText }}>
              Cargando notificaciones...
            </Text>
          </Animated.View>
        ) : null}

        {errorMessage ? (
          // Estado de error para fallos de red o respuesta no exitosa.
          <Animated.View
            entering={FadeInDown.duration(260).easing(Easing.out(Easing.quad))}
            className="mb-3 rounded-[18px] border px-3 py-2.5"
            style={{ backgroundColor: theme.primarySoft, borderColor: theme.border }}
          >
            <Text className="text-[13px] font-black" style={{ color: theme.text }}>
              {errorMessage}
            </Text>
          </Animated.View>
        ) : null}

        {!isLoading && notifications.length === 0 && !errorMessage ? (
          // Estado vacio cuando no existe actividad en Notification.
          <View className="rounded-[20px] border px-4 py-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <Bell color={theme.mutedText} size={20} strokeWidth={2.4} />
            <Text className="mt-3 text-[15px] font-black" style={{ color: theme.text }}>
              No tienes notificaciones
            </Text>
            <Text className="mt-1 text-[13px] leading-5" style={{ color: theme.mutedText }}>
              Cuando alguien te mande una solicitud de Bizum, aparecera aqui.
            </Text>
          </View>
        ) : null}

        {notifications.length > 0 ? (
          <View>
            {notifications.map((item, index) => {
              const requestId = item.type === "BIZUM_REQUEST" ? resolveBizumRequestId(item) : null;
              const rowOnPress =
                requestId && item.type === "BIZUM_REQUEST"
                  ? () => {
                      selectionHaptic();
                      router.push({
                        pathname: "/notification/pay-request",
                        params: { requestId },
                      } as never);
                    }
                  : undefined;

              return (
                <Animated.View
                  entering={FadeInDown.duration(460)
                    .delay(index * 120)
                    .easing(Easing.out(Easing.quad))}
                  key={item.id}
                >
                  <NotificationRow {...item} onPress={rowOnPress} />
                  {index < notifications.length - 1 ? <View className="mx-2 h-px" style={{ backgroundColor: theme.border }} /> : null}
                </Animated.View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
