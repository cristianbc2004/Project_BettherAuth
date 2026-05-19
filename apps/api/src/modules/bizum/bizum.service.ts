import { z } from "zod";

import { HttpError } from "../../lib/http-error";
import { getAuthenticatedUser } from "../auth/session.service";

const createBizumSchema = z.object({
  action: z.enum(["request", "send"]),
  amount: z.number().finite().positive(),
  concept: z.string().trim().max(80).optional(),
  contactUserId: z.string().trim().min(1),
});

export async function getBizumSummary(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new HttpError(401, "No autorizado.");
  }

  return {
    message: "Ruta Bizum preparada para migrar la logica desde apps/server.",
    user,
  };
}

export async function createBizum(request: Request, input: unknown) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new HttpError(401, "No autorizado.");
  }

  const result = createBizumSchema.safeParse(input);

  if (!result.success) {
    throw new HttpError(400, "Datos invalidos.", result.error.flatten());
  }

  return {
    message: "POST /api/bizum listo para recibir la migracion de negocio.",
    payload: result.data,
  };
}
