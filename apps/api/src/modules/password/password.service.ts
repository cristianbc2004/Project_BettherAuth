import { hashPassword } from "better-auth/crypto";
import { z } from "zod";

import { prisma } from "@repo/database";

import { HttpError } from "../../lib/http-error";
import { extractAuditRequestMeta, registerAudit } from "../audit/audit.service";

const checkEmailSchema = z.object({
  email: z.email(),
});

const resetDirectSchema = z.object({
  email: z.email(),
  newPassword: z.string().min(8),
});

export async function checkEmail(input: unknown) {
  const result = checkEmailSchema.safeParse(input);

  if (!result.success) {
    throw new HttpError(400, "Invalid data.", result.error.flatten());
  }

  const normalizedEmail = result.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    select: {
      id: true,
    },
    where: {
      email: normalizedEmail,
    },
  });

  return {
    exists: Boolean(user),
  };
}

export async function resetPasswordDirect(input: unknown, request?: Request) {
  const auditMeta = request ? extractAuditRequestMeta(request) : {};
  const result = resetDirectSchema.safeParse(input);

  if (!result.success) {
    await registerAudit({
      ...auditMeta,
      action: "PASSWORD_RESET",
      errorMensaje: "Email and new password are required.",
      newvaluePayload: input ?? null,
      status: "FAILED",
      table: "accounts",
    });
    throw new HttpError(400, "Invalid data.", result.error.flatten());
  }

  const email = result.data.email.trim().toLowerCase();
  const newPassword = result.data.newPassword.trim();

  if (newPassword.length < 8) {
    await registerAudit({
      ...auditMeta,
      action: "PASSWORD_RESET",
      errorMensaje: "Password must be at least 8 characters.",
      newvaluePayload: {
        email,
      },
      status: "FAILED",
      table: "accounts",
    });
    throw new HttpError(400, "Password must be at least 8 characters.");
  }

  const user = await prisma.user.findUnique({
    select: {
      email: true,
      id: true,
      name: true,
      role: true,
    },
    where: {
      email,
    },
  });

  if (!user) {
    await registerAudit({
      ...auditMeta,
      action: "PASSWORD_RESET",
      errorMensaje: "No account was found for that email.",
      newvaluePayload: {
        email,
      },
      status: "FAILED",
      table: "accounts",
    });
    throw new HttpError(404, "No account was found for that email.");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.account.updateMany({
    data: {
      password: passwordHash,
    },
    where: {
      providerId: "credential",
      userId: user.id,
    },
  });

  await registerAudit({
    ...auditMeta,
    action: "PASSWORD_RESET",
    status: "SUCCESS",
    table: "accounts",
    userId: user.id,
    userName: user.name,
    userRol: user.role,
  });

  return {
    success: true,
  };
}
