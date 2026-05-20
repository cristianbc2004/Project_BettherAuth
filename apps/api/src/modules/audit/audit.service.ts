import { prisma } from "@repo/database";

type HeadersLike = Headers | Record<string, string | string[] | undefined> | undefined;

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
  oldvaluePayload?: unknown;
  newvaluePayload?: unknown;
  sessionId?: string | null;
  source?: string | null;
  targetUserId?: string | null;
  userAgent?: string | null;
  userId?: string | null;
  userName?: string | null;
  userRol?: string | null;
};

function getHeaderValue(headers: HeadersLike, key: string) {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    const value = headers.get(key);
    return value?.trim() || null;
  }

  const raw = headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()];

  if (Array.isArray(raw)) {
    return raw[0]?.trim() || null;
  }

  if (typeof raw === "string") {
    return raw.trim() || null;
  }

  return null;
}

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

export function extractAuditMetaFromHeaders(headers: HeadersLike, fallbackEndpoint: string, source = "auth") {
  const forwardedFor = getHeaderValue(headers, "x-forwarded-for");
  const realIp = getHeaderValue(headers, "x-real-ip");
  const userAgent = getHeaderValue(headers, "user-agent");

  return {
    endpoint: fallbackEndpoint,
    ipAddress: (forwardedFor?.split(",")[0]?.trim() || realIp) ?? null,
    source,
    userAgent: userAgent || null,
  };
}

export async function registerAudit(input: RegisterAuditInput) {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Auditoria"
      ("id", "userId", "userName", "userRol", "action", "table", "oldvaluePayload", "newvaluePayload", "ipAddress", "userAgent", "status", "errorMensaje", "targetUserId", "sessionId", "endpoint", "source")
      VALUES
      ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, $11, $12, $13, $14, $15, $16)`,
      crypto.randomUUID(),
      input.userId ?? null,
      input.userName ?? null,
      input.userRol ?? null,
      input.action,
      input.table,
      input.oldvaluePayload ? JSON.stringify(input.oldvaluePayload) : null,
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
