import { prisma } from "@repo/database";

import { HttpError } from "../../lib/http-error";
import { getAuthenticatedUser } from "../auth/session.service";

function formatNotificationDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(date);
}

export async function getNotifications(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new HttpError(401, "No autorizado.");
  }

  const notifications = await prisma.notification.findMany({
    include: {
      userEmisor: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 60,
    where: {
      userDestinationId: user.id,
    },
  });

  return {
    notifications: notifications.map((notification) => ({
      actionPayload: notification.actionPayload,
      actionRoute: notification.actionRoute,
      bizumRequestId: notification.bizumRequestId,
      body: notification.body,
      createdAt: notification.createdAt.toISOString(),
      emisorName: notification.userEmisor?.name ?? null,
      id: notification.id,
      isUnread: notification.status === "UNREAD",
      timestamp: formatNotificationDate(notification.createdAt),
      title: notification.title,
      transferId: notification.transferId,
      type: notification.type,
    })),
  };
}
