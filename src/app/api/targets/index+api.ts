import { z } from "zod";

import { auth } from "@/features/auth/services/auth";
import { prisma } from "@/shared/lib/prisma";

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

async function getAuthenticatedUserId(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user.id ?? null;
}

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
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
    where: { userId },
  });

  return Response.json({ targets });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const result = targetSchema.safeParse(await request.json().catch(() => null));

  if (!result.success) {
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
        userId,
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

    return Response.json({ target }, { status: 201 });
  } catch {
    return Response.json({ error: "Ya existe un target con ese numero." }, { status: 409 });
  }
}
