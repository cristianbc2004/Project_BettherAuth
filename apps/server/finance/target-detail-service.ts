import { z } from "zod";

import { auth } from "@repo/server/auth/auth";
import { prisma } from "@repo/database";

const updateTargetSchema = z.object({
  block: z.boolean(),
});

async function getAuthenticatedUserId(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user.id ?? null;
}

export async function PATCH(request: Request, { id }: { id: string }) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const result = updateTargetSchema.safeParse(await request.json().catch(() => null));

  if (!result.success) {
    return Response.json({ error: "Datos invalidos." }, { status: 400 });
  }

  const existingTarget = await prisma.target.findFirst({
    select: { id: true },
    where: {
      id,
      userId,
    },
  });

  if (!existingTarget) {
    return Response.json({ error: "Target no encontrado." }, { status: 404 });
  }

  const target = await prisma.target.update({
    data: {
      block: result.data.block,
    },
    select: {
      balanceCents: true,
      block: true,
      cvc: true,
      id: true,
      name: true,
      numberTarget: true,
      type: true,
    },
    where: { id },
  });

  return Response.json({ target });
}
