import { prisma } from "@repo/database";

type AuditAction =
  | "ADMIN_LIST"
  | "ADMIN_CREATE"
  | "ADMIN_DELETE"
  | "AUTH_LOGIN"
  | "AUTH_REGISTER"
  | "BIZUM_REQUEST_CREATE"
  | "BIZUM_TRANSFER_SEND"
  | "CARD_CREATE"
  | "PASSWORD_CHANGE"
  | "PASSWORD_RESET"
  | "TWO_FACTOR_ENABLE";

type RegisterAuditInput = {
  action: AuditAction;
  status: "SUCCESS" | "FAILED";
  table: string;
  endpoint?: string | null;
  errorMensaje?: string | null;
  ipAddress?: string | null;
  newvaluePayload?: unknown;
  sessionId?: string | null;
  source?: string | null;
  targetUserId?: string | null;
  userAgent?: string | null;
  userId?: string | null;
  userName?: string | null;
  userRol?: string | null;
};

export function extractAuditRequestMeta(request: Request, source = "api") {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const userAgent = request.headers.get("user-agent")?.trim();
  const endpoint = new URL(request.url).pathname;

  return {
    endpoint,
    ipAddress: forwardedFor || realIp || null,
    source,
    userAgent: userAgent || null,
  };
}

export async function registerAudit(input: RegisterAuditInput) {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Auditoria"
      ("id", "userId", "userName", "userRol", "action", "table", "newvaluePayload", "ipAddress", "userAgent", "status", "errorMensaje", "targetUserId", "sessionId", "endpoint", "source")
      VALUES
      ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14, $15)`,
      crypto.randomUUID(),
      input.userId ?? null,
      input.userName ?? null,
      input.userRol ?? null,
      input.action,
      input.table,
      input.newvaluePayload ? JSON.stringify(input.newvaluePayload) : null,
      input.ipAddress ?? null,
      input.userAgent ?? null,
      input.status,
      input.errorMensaje ?? null,
      input.targetUserId ?? null,
      input.sessionId ?? null,
      input.endpoint ?? null,
      input.source ?? null,
    );
  } catch (error) {
    console.error("[audit] no se pudo registrar el evento", error);
  }
}
