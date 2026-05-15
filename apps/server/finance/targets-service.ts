import { z } from "zod";

import { auth } from "@repo/server/auth/auth";
import { extractAuditRequestMeta, registrarAuditoria } from "@repo/server/audit/auditoria";
import { prisma } from "@repo/database";

const targetTypes = ["VISA", "MASTERCARD", "CHASBACK", "ORO"] as const;

const targetSchema = z.object({
  cvc: z.string().trim().regex(/^\d{3,4}$/, "El CVC debe tener 3 o 4 numeros."),
  initialBalanceCents: z.number().int().min(0, "El saldo inicial no puede ser negativo.").max(1_000_000_000).optional().default(0),
  name: z.string().trim().min(2, "Introduce el nombre del target."),
  numberTarget: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(z.string().min(12, "El numero debe tener al menos 12 digitos.").max(19, "El numero no puede superar 19 digitos.")),
  type: z.enum(targetTypes),
});

async function getAuthenticatedUser(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    select: {
      id: true,
      name: true,
      role: true,
    },
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    role: user.role,
    sessionId: session.session.id,
  };
}

export async function GET(request: Request) {
  const authenticatedUser = await getAuthenticatedUser(request);

  if (!authenticatedUser) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const targets = await prisma.target.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      balanceCents: true,
      block: true,
      cvc: true,
      id: true,
      name: true,
      numberTarget: true,
      type: true,
    },
    where: { userId: authenticatedUser.id },
  });

  return Response.json({ targets });
}

export async function POST(request: Request) {
  const auditMeta = extractAuditRequestMeta(request);
  const authenticatedUser = await getAuthenticatedUser(request);

  if (!authenticatedUser) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const result = targetSchema.safeParse(await request.json().catch(() => null));

  if (!result.success) {
    await registrarAuditoria({
      ...auditMeta,
      action: "CARD_CREATE",
      errorMensaje: result.error.issues[0]?.message ?? "Datos invalidos.",
      status: "FAILED",
      table: "targets",
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    return Response.json({ error: result.error.issues[0]?.message ?? "Datos invalidos." }, { status: 400 });
  }

  try {
    const target = await prisma.target.create({
      data: {
        balanceCents: result.data.initialBalanceCents,
        cvc: result.data.cvc,
        name: result.data.name,
        numberTarget: result.data.numberTarget,
        type: result.data.type,
        userId: authenticatedUser.id,
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
    });

    await registrarAuditoria({
      ...auditMeta,
      action: "CARD_CREATE",
      newvaluePayload: {
        balanceCents: target.balanceCents,
        targetId: target.id,
        type: target.type,
      },
      sessionId: authenticatedUser.sessionId,
      status: "SUCCESS",
      table: "targets",
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });

    return Response.json({ target }, { status: 201 });
  } catch {
    await registrarAuditoria({
      ...auditMeta,
      action: "CARD_CREATE",
      errorMensaje: "Ya existe un target con ese numero.",
      status: "FAILED",
      table: "targets",
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    return Response.json({ error: "Ya existe un target con ese numero." }, { status: 409 });
  }
}
