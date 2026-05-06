import { hashPassword } from "better-auth/crypto";

import { extractAuditRequestMeta, registrarAuditoria } from "@/shared/lib/auditoria";
import { prisma } from "@/shared/lib/prisma";

export async function POST(request: Request) {
  const auditMeta = extractAuditRequestMeta(request);
  try {
    const body = (await request.json()) as { email?: string; newPassword?: string };
    const email = body.email?.trim().toLowerCase();
    const newPassword = body.newPassword?.trim();

    if (!email || !newPassword) {
      await registrarAuditoria({
        ...auditMeta,
        action: "PASSWORD_RESET",
        errorMensaje: "Email and new password are required.",
        newvaluePayload: {
          email: email ?? null,
        },
        status: "FAILED",
        table: "accounts",
      });
      return Response.json({ error: "Email and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      await registrarAuditoria({
        ...auditMeta,
        action: "PASSWORD_RESET",
        errorMensaje: "Password must be at least 8 characters.",
        newvaluePayload: {
          email,
        },
        status: "FAILED",
        table: "accounts",
      });
      return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      await registrarAuditoria({
        ...auditMeta,
        action: "PASSWORD_RESET",
        errorMensaje: "No account was found for that email.",
        newvaluePayload: {
          email,
        },
        status: "FAILED",
        table: "accounts",
      });
      return Response.json({ error: "No account was found for that email." }, { status: 404 });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.account.updateMany({
      where: {
        userId: user.id,
        providerId: "credential",
      },
      data: {
        password: passwordHash,
      },
    });

    console.log(`Password for user ${user.email} has been reset.`);

    await registrarAuditoria({
      ...auditMeta,
      action: "PASSWORD_RESET",
      status: "SUCCESS",
      table: "accounts",
      userId: user.id,
      userName: user.name,
      userRol: user.role,
    });

    return Response.json({ success: true });
  } catch {
    await registrarAuditoria({
      ...auditMeta,
      action: "PASSWORD_RESET",
      errorMensaje: "Could not reset the password.",
      status: "FAILED",
      table: "accounts",
    });
    return Response.json({ error: "Could not reset the password." }, { status: 500 });
  }
}
