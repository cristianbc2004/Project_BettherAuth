import { z } from "zod";

import { HttpError } from "../../lib/http-error";
import { getAuthenticatedUser } from "../auth/session.service";

const createTargetSchema = z.object({
  alias: z.string().trim().min(1).max(50),
});

const updateTargetSchema = z.object({
  alias: z.string().trim().min(1).max(50).optional(),
  block: z.boolean().optional(),
});

export async function getTargets(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new HttpError(401, "No autorizado.");
  }

  return {
    items: [],
    message: "Ruta de tarjetas/targets preparada para migrar la logica.",
  };
}

export async function createTarget(request: Request, input: unknown) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new HttpError(401, "No autorizado.");
  }

  const result = createTargetSchema.safeParse(input);

  if (!result.success) {
    throw new HttpError(400, "Datos invalidos.", result.error.flatten());
  }

  return {
    message: "POST /api/targets listo para implementar persistencia real.",
    payload: result.data,
  };
}

export async function updateTarget(request: Request, id: string, input: unknown) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new HttpError(401, "No autorizado.");
  }

  if (!id) {
    throw new HttpError(400, "Falta el id del target.");
  }

  const result = updateTargetSchema.safeParse(input);

  if (!result.success) {
    throw new HttpError(400, "Datos invalidos.", result.error.flatten());
  }

  return {
    id,
    message: "PATCH /api/targets/:id listo para migrar la logica real.",
    payload: result.data,
  };
}
