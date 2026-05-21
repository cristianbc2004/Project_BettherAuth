import { useCallback, type ComponentType, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Redirect, router, useFocusEffect } from "expo-router";
import { ArrowDownLeft, ArrowRightLeft, Bell, CircleAlert, Send, Wallet } from "lucide-react-native";
import Animated, { Easing, FadeInDown, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/features/auth/services/auth-client";
import {
  notificationsGetResponseSchema,
  type NotificationActionPayload,
  type NotificationResponseItem,
  type NotificationType,
} from "@/features/notifications/lib/notifications-api";
import { getAuthCookie } from "@/shared/lib/auth-api";
import { AppScreenHeader } from "@/shared/components/ui/app-screen-header";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";
import { appConfig } from "@repo/config";
import { selectionHaptic } from "@/shared/lib/haptics";
import { useAppTheme } from "@/shared/lib/theme-context";
import { useSessionLoadingDelay } from "@/shared/lib/use-session-loading-delay";
import { AppText } from "@/shared/components/ui/app-text";
import { parseApiError } from "@/shared/lib/api-schemas";

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

async function fetchNotifications() {
  // Queries the real notifications endpoint instead of a local mock.
  return fetch(`${appConfig.authApiUrl}/api/notifications`, {
    headers: {
      "Content-Type": "application/json",
      cookie: getAuthCookie(),
    },
  });
}

function mapNotificationToItem(notification: NotificationResponseItem): NotificationItem {
  // Maps each notification type to a consistent icon and visual palette.
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

function hexToRgba(hexColor: string, alpha: number) {
  const hex = hexColor.replace("#", "");
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
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
  const { resolvedThemeName, theme } = useAppTheme();
  const Icon = icon;
  const iconBackgroundColor =
    resolvedThemeName === "light" ? hexToRgba(iconAccent, 0.16) : accent;
  const iconBorderColor =
    resolvedThemeName === "light" ? hexToRgba(iconAccent, 0.28) : "transparent";

  return (
    <Pressable className="flex-row items-center px-2 py-5" disabled={!onPress} onPress={onPress}>
      <View
        className="mr-4 h-14 w-14 items-center justify-center rounded-full border"
        style={{ backgroundColor: iconBackgroundColor, borderColor: iconBorderColor }}
      >
        <Icon color={iconAccent} size={22} strokeWidth={2.4} />
      </View>

      <View className="flex-1">
        <AppText className="text-[17px] font-semibold" style={{ color: theme.text }}>
          {title}
        </AppText>
        {body ? (
          <AppText className="mt-1 text-[13px] leading-5" numberOfLines={2} style={{ color: theme.mutedText }}>
            {body}
          </AppText>
        ) : null}
        <AppText className="mt-1 text-sm" style={{ color: theme.mutedText }}>
          {timestamp}
        </AppText>
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
        const payload = await parseApiError(response);
        setErrorMessage(payload?.error ?? "Could not load notifications.");
        return;
      }

      const payload = notificationsGetResponseSchema.parse(await response.json());
      // Adapts the backend response to the shape used by the UI.
      setNotifications((payload.notifications ?? []).map(mapNotificationToItem));
    } catch {
      setErrorMessage("Could not load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!session?.user.id) {
        return;
      }

      // Initial load and refresh when returning from the payment modal.
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

      <View className="px-5 pt-6">
        <AppScreenHeader fallbackHref={"/home" as never} title="Notifications" />
      </View>

      <ScrollView
        bounces={false}
        contentContainerClassName="px-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <AppText className="mb-4 px-1 text-xs font-medium uppercase tracking-[1.5px]" style={{ color: theme.mutedText }}>
          Latest activity
        </AppText>

        {isLoading ? (
          // Loading state while the request resolves.
          <Animated.View entering={FadeInDown.duration(260)} exiting={FadeOut.duration(180)}>
            <AppText className="px-2 text-sm" style={{ color: theme.mutedText }}>
              Loading notifications...
            </AppText>
          </Animated.View>
        ) : null}

        {errorMessage ? (
          // Error state for network failures or unsuccessful responses.
          <Animated.View
            entering={FadeInDown.duration(260).easing(Easing.out(Easing.quad))}
            className="mb-3 rounded-[18px] border px-3 py-2.5"
            style={{ backgroundColor: theme.primarySoft, borderColor: theme.border }}
          >
            <AppText className="text-[13px] font-black" style={{ color: theme.text }}>
              {errorMessage}
            </AppText>
          </Animated.View>
        ) : null}

        {!isLoading && notifications.length === 0 && !errorMessage ? (
          // Empty state when there is no Notification activity.
          <View className="rounded-[20px] border px-4 py-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <Bell color={theme.mutedText} size={20} strokeWidth={2.4} />
            <AppText className="mt-3 text-[15px] font-black" style={{ color: theme.text }}>
              You have no notifications
            </AppText>
            <AppText className="mt-1 text-[13px] leading-5" style={{ color: theme.mutedText }}>
              When someone sends you a Bizum request, it will appear here.
            </AppText>
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
