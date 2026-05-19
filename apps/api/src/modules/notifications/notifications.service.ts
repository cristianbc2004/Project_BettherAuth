import { HttpError } from "../../lib/http-error";
import { getAuthenticatedUser } from "../auth/session.service";

export async function getNotifications(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new HttpError(401, "No autorizado.");
  }

  return {
    items: [],
    message: "Ruta de notificaciones preparada para mover la logica del server actual.",
  };
}
