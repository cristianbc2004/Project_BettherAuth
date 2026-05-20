import { prisma } from "@repo/database";

import { extractAuditRequestMeta, registerAudit } from "../audit/audit.service";
import { auth } from "./auth";

function resolveAuditAction(pathname: string) {
  if (pathname.includes("/sign-in/email")) return "AUTH_LOGIN" as const;
  if (pathname.includes("/sign-up/email")) return "AUTH_REGISTER" as const;
  if (pathname.includes("/two-factor/enable")) return "TWO_FACTOR_ENABLE" as const;
  if (pathname.includes("/change-password")) return "PASSWORD_CHANGE" as const;
  if (pathname.includes("/reset-password")) return "PASSWORD_RESET" as const;
  if (pathname.includes("/admin/create-user")) return "ADMIN_CREATE" as const;
  if (pathname.includes("/admin/list-users")) return "ADMIN_LIST" as const;
  if (pathname.includes("/admin/remove-user")) return "ADMIN_DELETE" as const;

  return null;
}

async function getAuditUserFromRequest(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
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

  return {
    id: user?.id ?? session.user.id,
    name: user?.name ?? session.user.name ?? null,
    role: user?.role ?? null,
    sessionId: session.session.id,
  };
}

export async function handleAuthRequest(request: Request) {
  const userBeforeRequest = await getAuditUserFromRequest(request);
  const bodyData =
    request.method === "POST"
      ? ((await request.clone().json().catch(() => null)) as Record<string, unknown> | null)
      : null;

  const response = await auth.handler(request);
  const pathname = new URL(request.url).pathname;
  const action = resolveAuditAction(pathname);

  if (!action) {
    return response;
  }

  const auditMeta = extractAuditRequestMeta(request, "auth");
  const authenticatedUser = (await getAuditUserFromRequest(request)) ?? userBeforeRequest;

  await registerAudit({
    ...auditMeta,
    action,
    errorMensaje: response.ok ? null : `HTTP ${response.status}`,
    newvaluePayload: bodyData,
    sessionId: authenticatedUser?.sessionId ?? null,
    status: response.ok ? "SUCCESS" : "FAILED",
    table: "auth",
    userId: authenticatedUser?.id ?? null,
    userName: authenticatedUser?.name ?? null,
    userRol: authenticatedUser?.role ?? null,
  });

  return response;
}
