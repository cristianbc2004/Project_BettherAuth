import { auth } from "@/features/auth/services/auth";
import { extractAuditRequestMeta, registrarAuditoria } from "@/shared/lib/auditoria";
import { prisma } from "@/shared/lib/prisma";

const handler = auth.handler;

function resolveAuditAction(pathname: string) {
  if (pathname.includes("/admin/list-users")) return "ADMIN_LIST" as const;
  if (pathname.includes("/admin/create-user")) return "ADMIN_CREATE" as const;
  if (pathname.includes("/admin/remove-user")) return "ADMIN_DELETE" as const;
  if (pathname.includes("/sign-in/email")) return "AUTH_LOGIN" as const;
  if (pathname.includes("/sign-up/email")) return "AUTH_REGISTER" as const;
  if (pathname.includes("/two-factor/enable")) return "TWO_FACTOR_ENABLE" as const;
  if (pathname.includes("/change-password")) return "PASSWORD_CHANGE" as const;
  if (pathname.includes("/reset-password")) return "PASSWORD_RESET" as const;
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

async function trackAuthAudit(
  request: Request,
  response: Response,
  bodyData: Record<string, unknown> | null,
  userBeforeRequest: Awaited<ReturnType<typeof getAuditUserFromRequest>>,
) {
  const pathname = new URL(request.url).pathname;
  const action = resolveAuditAction(pathname);

  if (!action) {
    return;
  }

  const auditMeta = extractAuditRequestMeta(request, "auth");
  const authenticatedUser = (await getAuditUserFromRequest(request)) ?? userBeforeRequest;
  const bodyEmail = typeof bodyData?.email === "string" ? bodyData.email.trim().toLowerCase() : null;
  const bodyUser =
    !authenticatedUser && bodyEmail
      ? await prisma.user.findUnique({
          select: {
            id: true,
            name: true,
            role: true,
          },
          where: {
            email: bodyEmail,
          },
        })
      : null;
  const targetUserId =
    action === "ADMIN_DELETE" && typeof bodyData?.userId === "string" ? bodyData.userId : null;

  await registrarAuditoria({
    ...auditMeta,
    action,
    errorMensaje: response.ok ? null : `HTTP ${response.status}`,
    sessionId: authenticatedUser?.sessionId ?? null,
    status: response.ok ? "SUCCESS" : "FAILED",
    table: "auth",
    targetUserId,
    userId: authenticatedUser?.id ?? bodyUser?.id ?? null,
    userName: authenticatedUser?.name ?? bodyUser?.name ?? null,
    userRol: authenticatedUser?.role ?? bodyUser?.role ?? null,
  });
}

async function handleAuthRequest(request: Request) {
  const userBeforeRequest = await getAuditUserFromRequest(request);
  const bodyData =
    request.method === "POST"
      ? ((await request
          .clone()
          .json()
          .catch(() => null)) as Record<string, unknown> | null)
      : null;
  const response = await handler(request);
  await trackAuthAudit(request, response, bodyData, userBeforeRequest);
  return response;
}

export async function GET(request: Request) {
  return handleAuthRequest(request);
}

export async function POST(request: Request) {
  return handleAuthRequest(request);
}
