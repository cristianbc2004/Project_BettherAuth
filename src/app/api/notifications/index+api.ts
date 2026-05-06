import { auth } from "@/features/auth/services/auth";
import { prisma } from "@/shared/lib/prisma";

function formatNotificationDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(date);
}

export async function GET(request: Request) {
  // Endpoint protegido: solo devuelve notificaciones del usuario autenticado.
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user.id) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  // Ordena por fecha descendente para mostrar primero la actividad mas reciente.
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
      userDestinationId: session.user.id,
    },
  });

  return Response.json({
    // Respuesta adaptada al formato que consume la pantalla de notificaciones.
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
      transferId: notification.transferId,
      title: notification.title,
      type: notification.type,
    })),
  });
}
