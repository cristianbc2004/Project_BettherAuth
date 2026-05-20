import { z } from "zod";

import { prisma } from "@repo/database";

import { HttpError } from "../../lib/http-error";
import { extractAuditRequestMeta, registerAudit } from "../audit/audit.service";
import { getAuthenticatedUserWithSession } from "../auth/session.service";

const targetTypes = ["VISA", "MASTERCARD", "CHASBACK", "ORO"] as const;

const createTargetSchema = z.object({
  cvc: z.string().trim().regex(/^\d{3,4}$/, "The CVC must have 3 or 4 digits."),
  initialBalanceCents: z
    .number()
    .int()
    .min(0, "The initial balance cannot be negative.")
    .max(1_000_000_000)
    .optional()
    .default(0),
  name: z.string().trim().min(2, "Enter the card name."),
  numberTarget: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(
      z
        .string()
        .min(12, "The card number must have at least 12 digits.")
        .max(19, "The card number cannot exceed 19 digits."),
    ),
  type: z.enum(targetTypes),
});

const updateTargetSchema = z.object({
  block: z.boolean(),
});

export async function getTargets(request: Request) {
  const user = await getAuthenticatedUserWithSession(request);

  if (!user) {
    throw new HttpError(401, "Unauthorized.");
  }

  const targets = await prisma.target.findMany({
    orderBy: {
      createdAt: "desc",
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
    where: {
      userId: user.id,
    },
  });

  return {
    targets,
  };
}

export async function createTarget(request: Request, input: unknown) {
  const auditMeta = extractAuditRequestMeta(request);
  const user = await getAuthenticatedUserWithSession(request);

  if (!user) {
    throw new HttpError(401, "No autorizado.");
  }

  const result = createTargetSchema.safeParse(input);

  if (!result.success) {
    await registerAudit({
      ...auditMeta,
      action: "CARD_CREATE",
      errorMensaje: result.error.issues[0]?.message ?? "Invalid data.",
      sessionId: user.sessionId,
      status: "FAILED",
      table: "targets",
      userId: user.id,
      userName: user.name,
      userRol: user.role,
    });
    throw new HttpError(400, result.error.issues[0]?.message ?? "Invalid data.", result.error.flatten());
  }

  try {
    const target = await prisma.target.create({
      data: {
        balanceCents: result.data.initialBalanceCents,
        cvc: result.data.cvc,
        name: result.data.name,
        numberTarget: result.data.numberTarget,
        type: result.data.type,
        userId: user.id,
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

    await registerAudit({
      ...auditMeta,
      action: "CARD_CREATE",
      newvaluePayload: {
        balanceCents: target.balanceCents,
        targetId: target.id,
        type: target.type,
      },
      sessionId: user.sessionId,
      status: "SUCCESS",
      table: "targets",
      userId: user.id,
      userName: user.name,
      userRol: user.role,
    });

    return {
      target,
    };
  } catch {
    await registerAudit({
      ...auditMeta,
      action: "CARD_CREATE",
      errorMensaje: "A card with that number already exists.",
      sessionId: user.sessionId,
      status: "FAILED",
      table: "targets",
      userId: user.id,
      userName: user.name,
      userRol: user.role,
    });

    throw new HttpError(409, "A card with that number already exists.");
  };
}

export async function updateTarget(request: Request, id: string, input: unknown) {
  const user = await getAuthenticatedUserWithSession(request);

  if (!user) {
    throw new HttpError(401, "Unauthorized.");
  }

  if (!id) {
    throw new HttpError(400, "Missing target id.");
  }

  const result = updateTargetSchema.safeParse(input);

  if (!result.success) {
    throw new HttpError(400, "Invalid data.", result.error.flatten());
  }

  const existingTarget = await prisma.target.findFirst({
    select: {
      id: true,
    },
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existingTarget) {
    throw new HttpError(404, "Target not found.");
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
    where: {
      id,
    },
  });

  return {
    target,
  };
}
